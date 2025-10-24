// controllers/pointController.js
// Points ledger: admin can add/remove points; users can view their point history
const Point = require('../models/Point');
const User = require('../models/User');

module.exports = {
  // get points for a user (self or admin)
  async listForUser(req, res) {
    try {
      const { userId } = req.params; // if admin fetch any user; else use req.user.id
      const target = userId || req.user.id;
      const points = await Point.find({ user: target }).sort({ createdAt: -1 }).lean();
      return res.json({ ok:true, points });
    } catch (err) {
      console.error('listForUser', err);
      return res.status(500).json({ ok:false, message: 'server error' });
    }
  },

  // admin: add manual points (award)
  async award(req, res) {
    try {
      if (!req.user || req.user.role !== 'admin') return res.status(403).json({ ok:false, message: 'forbidden' });
      const { userId, points, activityType = 'manual', description } = req.body;
      if (!userId || !points) return res.status(400).json({ ok:false, message: 'missing fields' });

      const p = await Point.create({
        user: userId,
        activityType,
        points,
        description,
        createdBy: req.user.id
      });

      return res.json({ ok:true, point: p });
    } catch (err) {
      console.error('award points', err);
      return res.status(500).json({ ok:false, message: 'server error' });
    }
  },

  // admin: remove point record (and hook will recalc totals)
  async remove(req, res) {
    try {
      if (!req.user || req.user.role !== 'admin') return res.status(403).json({ ok:false, message: 'forbidden' });
      const { id } = req.params;
      const point = await Point.findById(id);
      if (!point) return res.status(404).json({ ok:false, message: 'not found' });
      await point.remove();
      return res.json({ ok:true, message: 'deleted' });
    } catch (err) {
      console.error('remove point', err);
      return res.status(500).json({ ok:false, message: 'server error' });
    }
  }
};
