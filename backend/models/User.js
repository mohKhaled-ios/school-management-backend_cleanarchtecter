// const mongoose = require('mongoose');

// const userSchema = new mongoose.Schema({
//   name: {
//     type: String,
//     required: true
//   },
//   email: {
//     type: String,
//     required: true,
//     unique: true
//   },
//   password: {
//     type: String,
//     required: true
//   },
//   role: {
//     type: String,
//     enum: ['admin', 'teacher', 'student', 'parent'],
//     required: true
//   },
//   phone: String,
//   address: String,
//   dateOfBirth: Date,
//   gender: {
//     type: String,
//     enum: ['male', 'female']
//   },
//   profileImage: String,
//   isActive: {
//     type: Boolean,
//     default: true
//   },
//   // For students
//   parentId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User'
//   },
//   classId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Class'
//   },
//   // For teachers
//   subjects: [{
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Subject'
//   }]
// }, {
//   timestamps: true
// });

// module.exports = mongoose.model('User', userSchema);

// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true,
    select: false
  },
  role: {
    type: String,
    enum: ['admin', 'teacher', 'student', 'parent'],
    required: true
  },
  phone: String,
  address: String,
  dateOfBirth: Date,
  gender: {
    type: String,
    enum: ['male', 'female']
  },
  profileImage: String,
  isActive: {
    type: Boolean,
    default: true
  },
  // For students
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class'
  },
  // For teachers
  subjects: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject'
  }],
  // ✅ Online Status
  isOnline: {
    type: Boolean,
    default: false
  },
  lastSeen: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);