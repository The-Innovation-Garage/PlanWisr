const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const EntrySchema = new Schema({
  description: {
    type: String,
    required: [true, 'description is required'],
    trim: true
  },
  duration: {
    type: Number,
    required: [true, 'Duration is required'],
  },
  startTime: {
    type: Date,
    required: [true, 'start time is required']
  },
  endTime: {
    type: Date,
    required: [true, 'end time is required']
  },
  mode: {
    type: String,
    enum: ['stopwatch', 'countdown'],
    default: 'stopwatch'
  },
  projectId: {
    type: Schema.Types.ObjectId,
    ref: 'Project',
    required: [true, 'Project ID is required']
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
}, {
  timestamps: true
});

module.exports = mongoose.models.Entry || mongoose.model('Entry', EntrySchema);
