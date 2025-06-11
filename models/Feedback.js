import mongoose from 'mongoose'

const feedbackSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['suggestion', 'issue', 'other'],
    required: true
  },
  name: {
    type: String
  },
  message: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
})

export default mongoose.models.Feedback || mongoose.model('Feedback', feedbackSchema)