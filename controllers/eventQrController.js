// controllers/eventQrController.js
// Manage Event QR tokens (admin can create tokens). Also used by attendance scanner to validate token.
const EventQr = require('../models/EventQr');
const Event = require('../models/Event');
const Point = require('../models/Point');
const User = require('../models/User');
const { v4: uuidv4 } = require('uuid');

module.exports = {
  // admin creates a new QR token for an event
  async createToken(req, res) {
    try {
      if (!req.user || req.user.role !== 'admin') return res.status(403).json({ ok:false, message: 'forbidden' });
      const { eventId, expiresAt, maxUses } = req.body;
      const event = await Event.findById(eventId);
      if (!event) return res.status(404).json({ ok:false, message: 'event not found' });

      const token = uuidv4();
      const qr = await EventQr.create({
        event: eventId,
        token,
        createdBy: req.user.id,
        expiresAt,
        maxUses
      });

      // frontend can generate an image from the token or use qrUrl if you produce it server-side
      return res.json({ ok:true, qr });
    } catch (err) {
      console.error('createToken', err);
      return res.status(500).json({ ok:false, message: 'server error' });
    }
  },

  // list tokens for an event (admin)
  async listForEvent(req, res) {
    try {
      if (!req.user || req.user.role !== 'admin') return res.status(403).json({ ok:false, message: 'forbidden' });
      const { eventId } = req.params;
      const qrs = await EventQr.find({ event: eventId }).sort({ createdAt: -1 }).lean();
      return res.json({ ok:true, qrs });
    } catch (err) {
      console.error('listForEvent', err);
      return res.status(500).json({ ok:false, message: 'server error' });
    }
  },

  // scanner endpoint (called by frontend after scanning QR or by in-site camera)
  // payload: { token } and authenticated user (req.user). For guest scanning (public view), token could map to a member personal token handled in userController.publicViewByToken
  async scanAttendance(req, res) {
    try {
      const { token } = req.body;
      if (!token) return res.status(400).json({ ok:false, message: 'missing token' });
      // require authenticated user (the member who attends)
      if (!req.user) return res.status(401).json({ ok:false, message: 'auth required' });

      const eventQr = await EventQr.findOne({ token }).populate('event');
      if (!eventQr) return res.status(404).json({ ok:false, message: 'qr token invalid' });

      if (!eventQr.isUsable()) return res.status(400).json({ ok:false, message: 'qr not usable (expired or maxed)' });

      const event = eventQr.event;
      if (!event) return res.status(404).json({ ok:false, message: 'linked event not found' });

      // prevent double check-in: check if user already has a point for this event (policy: one attendance per event)
      const existing = await Point.findOne({ user: req.user.id, event: event._id, activityType: 'event_attendance' });
      if (existing) return res.status(409).json({ ok:false, message: 'already checked-in' });

      // create point record
      const p = await Point.create({
        user: req.user.id,
        activityType: 'event_attendance',
        points: event.pointsForAttendance || 10,
        description: `Attendance for event ${event.title}`,
        event: event._id,
        createdBy: req.user.id
      });

      // increment usedCount safely
      eventQr.usedCount = (eventQr.usedCount || 0) + 1;
      await eventQr.save();

      return res.json({ ok:true, point: p });
    } catch (err) {
      console.error('scanAttendance', err);
      return res.status(500).json({ ok:false, message: 'server error' });
    }
  },

  async invalidate(req, res) {
    try {
      if (!req.user || req.user.role !== 'admin') return res.status(403).json({ ok:false, message: 'forbidden' });
      const { id } = req.params;
      const qr = await EventQr.findByIdAndUpdate(id, { expiresAt: new Date() }, { new: true }).lean();
      if (!qr) return res.status(404).json({ ok:false, message: 'not found' });
      return res.json({ ok:true, qr });
    } catch (err) {
      console.error('invalidate qr', err);
      return res.status(500).json({ ok:false, message: 'server error' });
    }
  }
};
