// models/Event.js
// Event: details about an event; attendance points can be linked via EventQr or Points
const mongoose = require('mongoose');
const { Schema } = mongoose;

const EventSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String },
  location: { type: String },
  startAt: { type: Date },
  endAt: { type: Date },
  pointsForAttendance: { type: Number, default: 10 },
  organizer: { type: String }
}, { timestamps: true });

EventSchema.virtual('qrs', {
  ref: 'EventQr',
  localField: '_id',
  foreignField: 'event',
  justOne: false
});

module.exports = mongoose.model('Event', EventSchema);
