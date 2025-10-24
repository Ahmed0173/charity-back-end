// controllers/eventController.js
// CRUD for events + optionally list upcoming events
import Event from '../models/Event.js';

export default {
  async create(req, res) {
    try {
      if (!req.user || req.user.role !== 'admin') return res.status(403).json({ ok:false, message: 'forbidden' });
      const ev = await Event.create(req.body);
      return res.json({ ok:true, event: ev });
    } catch (err) {
      console.error('create event', err);
      return res.status(500).json({ ok:false, message: 'server error' });
    }
  },

  async list(req, res) {
    try {
      const { upcoming } = req.query;
      const filter = {};
      if (upcoming === '1') filter.startAt = { $gte: new Date() };
      const events = await Event.find(filter).sort({ startAt: 1 }).lean();
      return res.json({ ok:true, events });
    } catch (err) {
      console.error('list events', err);
      return res.status(500).json({ ok:false, message: 'server error' });
    }
  },

  async get(req, res) {
    try {
      const { id } = req.params;
      const ev = await Event.findById(id).lean();
      if (!ev) return res.status(404).json({ ok:false, message: 'not found' });
      return res.json({ ok:true, event: ev });
    } catch (err) {
      console.error('get event', err);
      return res.status(500).json({ ok:false, message: 'server error' });
    }
  },

  async update(req, res) {
    try {
      if (!req.user || req.user.role !== 'admin') return res.status(403).json({ ok:false, message: 'forbidden' });
      const { id } = req.params;
      const updated = await Event.findByIdAndUpdate(id, req.body, { new: true }).lean();
      if (!updated) return res.status(404).json({ ok:false, message: 'not found' });
      return res.json({ ok:true, event: updated });
    } catch (err) {
      console.error('update event', err);
      return res.status(500).json({ ok:false, message: 'server error' });
    }
  },

  async remove(req, res) {
    try {
      if (!req.user || req.user.role !== 'admin') return res.status(403).json({ ok:false, message: 'forbidden' });
      const { id } = req.params;
      await Event.findByIdAndDelete(id);
      return res.json({ ok:true, message: 'deleted' });
    } catch (err) {
      console.error('remove event', err);
      return res.status(500).json({ ok:false, message: 'server error' });
    }
  }
};
