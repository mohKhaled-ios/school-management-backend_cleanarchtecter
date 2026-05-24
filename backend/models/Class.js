const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  grade: {
    type: String,
    required: true
  },
  section: String,
  capacity: Number,
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  subjects: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject'
  }],
  schedule: [{
    day: String,
    periods: [{
      time: String,
      subjectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subject'
      },
      teacherId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    }]
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Class', classSchema);