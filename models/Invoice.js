import mongoose from 'mongoose';

const InvoiceSchema = new mongoose.Schema({
  invoiceId: {
    type: String,
    required: true,
    unique: true
  },
  invoiceDate: {
    type: Date,
    required: true
  },
  dueDate: {
    type: Date,
    required: true
  },
  sender: {
    name: String,
    email: String,
    phone: String,
    logo: String
  },
  client: {
    name: {
      type: String,
      required: true
    },
    email: String,
    company: String,
    address: String
  },
  items: [{
    feature: String,
    description: String,
    hours: {
      type: Number,
      required: true,
      min: 0
    },
    rate: {
      type: Number,
      required: true,
      min: 0
    },
    total: {
      type: Number,
      required: true
    }
  }],
  subtotal: {
    type: Number,
    required: true,
    default: 0
  },
  tax: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  discount: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  total: {
    type: Number,
    required: true
  },
  notes: String,
  terms: {
    type: String,
    default: "Net 30"
  },
  status: {
    type: String,
    enum: ['draft', 'sent', 'paid', 'overdue'],
    default: 'draft'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  }
}, {
  timestamps: true
});



export default mongoose.models.Invoice || mongoose.model('Invoice', InvoiceSchema);