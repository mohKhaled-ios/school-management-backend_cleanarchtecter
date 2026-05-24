const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  code: {
    type: String,
    required: true,
    unique: true
  },
  description: String,
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Subject', subjectSchema);