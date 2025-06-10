const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TaskSchema = new Schema({
  title: {
    type: String,
    required: [true, 'Task title is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  dueDate: {
    type: Date
  },
  status: {
    type: String,
    enum: ['in-progress', 'done', 'not-started'],
    default: 'not-started'
  },
  priority: {
    type: String,
    enum: ['high', 'medium', 'low'],
    default: 'medium'
  },
  project: {
    type: Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  rank: {
    type: Number,
    default: 0
},
lastPrioritized: {
    type: Date,
    default: null
},
}, {
  timestamps: true
});


module.exports = mongoose.models.Task || mongoose.model('Task', TaskSchema);