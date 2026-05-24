const mongoose = require('mongoose');

const examSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
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
  date: {
    type: Date,
    required: true
  },
  duration: Number, // in minutes
  totalMarks: Number,
  questions: [{
    question: String,
    options: [String],
    correctAnswer: String,
    marks: Number
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Exam', examSchema);