const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: true
  },
  invoiceNumber: {
    type: String,
    required: true,
    unique: true
  },
  amount: {
    type: Number,
    required: true
  },
  dueDate: Date,
  status: {
    type: String,
    enum: ['pending', 'paid', 'overdue'],
    default: 'pending'
  },
  items: [{
    description: String,
    amount: Number
  }],
  paymentMethod: String,
  paymentDate: Date,
  transactionId: String
}, {
  timestamps: true
});

module.exports = mongoose.model('Invoice', invoiceSchema);