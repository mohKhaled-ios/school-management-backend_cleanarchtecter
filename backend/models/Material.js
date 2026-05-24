const mongoose = require('mongoose');

const materialSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: String,
  subjectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true
  },
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: true
  },
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  fileType: {
    type: String,
    enum: ['pdf', 'video', 'image', 'document'],
    required: true
  },
  fileUrl: {
    type: String,
    required: true
  },
  fileName: String,
  fileSize: Number
}, {
  timestamps: true
});

module.exports = mongoose.model('Material', materialSchema);