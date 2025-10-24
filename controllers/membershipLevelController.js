// controllers/membershipLevelController.js
// Manage membership levels (CRUD)
import MembershipLevel from '../models/MemberShipLevel.js';

export default {
  async create(req, res) {
    try {
      const payload = req.body;
      const level = await MembershipLevel.create(payload);
      return res.json({ ok:true, level });
    } catch (err) {
      console.error('create level', err);
      return res.status(500).json({ ok:false, message: 'server error' });
    }
  },

  async list(req, res) {
    try {
      const levels = await MembershipLevel.find().sort({ minPoints: 1 }).lean();
      return res.json({ ok:true, levels });
    } catch (err) {
      console.error('list levels', err);
      return res.status(500).json({ ok:false, message: 'server error' });
    }
  },

  async update(req, res) {
    try {
      const { id } = req.params;
      const updated = await MembershipLevel.findByIdAndUpdate(id, req.body, { new: true }).lean();
      if (!updated) return res.status(404).json({ ok:false, message: 'not found' });
      return res.json({ ok:true, level: updated });
    } catch (err) {
      console.error('update level', err);
      return res.status(500).json({ ok:false, message: 'server error' });
    }
  },

  async remove(req, res) {
    try {
      const { id } = req.params;
      await MembershipLevel.findByIdAndDelete(id);
      return res.json({ ok:true, message: 'deleted' });
    } catch (err) {
      console.error('remove level', err);
      return res.status(500).json({ ok:false, message: 'server error' });
    }
  }
};
