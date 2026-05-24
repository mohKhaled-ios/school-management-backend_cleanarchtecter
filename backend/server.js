
//  const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');
// const socketIo = require('socket.io');
// const http = require('http');
// // require('dotenv').config();
// require('dotenv').config({ path: __dirname + '/.env' });


// const app = express();
// const server = http.createServer(app);
// const io = socketIo(server, {
//   cors: { origin: "*", methods: ["GET", "POST"] }
// });

// // Middleware
// app.use(cors());
// app.use(express.json());
// app.use('/uploads', express.static('uploads'));

// // Routes
//  app.use('/api/auth', require('./routes/auth'));
// app.use('/api/users', require('./routes/users'));
// app.use('/api/classes', require('./routes/classes'));
// app.use('/api/subjects', require('./routes/subjects'));
// app.use('/api/attendance', require('./routes/attendance'));

// app.use('/api/exams', require('./routes/exams'));
// app.use('/api/payments', require('./routes/payments'));
// app.use('/api/materials', require('./routes/materials'));
// app.use('/api/grades', require('./routes/grades'));
// app.use('/api/notifications', require('./routes/notifications'));

//  app.use('/api/chat', require('./routes/chat'));
// // Socket.io
// io.on('connection', (socket) => {
//   console.log('User connected:', socket.id);

//   socket.on('join-room', (room) => socket.join(room));

//   socket.on('send-message', (data) => {
//     io.to(data.room).emit('receive-message', data);
//   });

//   socket.on('disconnect', () => console.log('User disconnected:', socket.id));
// });

// // Database connection
// mongoose.connect(process.env.MONGODB_URI)
//   .then(() => console.log('Connected to MongoDB'))
//   .catch(err => console.log('MongoDB connection error:', err));

// const PORT = process.env.PORT || 50000;
// server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
   
// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const socketIo = require('socket.io');
const http = require('http');
require('dotenv').config({ path: __dirname + '/.env' });

const User = require('./models/User'); // ✅ مطلوب لتحديث isOnline

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: { origin: "*", methods: ["GET", "POST"] }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/classes', require('./routes/classes'));
app.use('/api/subjects', require('./routes/subjects'));
app.use('/api/attendance', require('./routes/attendance'));
app.use('/api/exams', require('./routes/exams'));
app.use('/api/grades', require('./routes/grades'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/materials', require('./routes/materials'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/notifications', require('./routes/notifications'));

// ✅ API للحصول على حالة مستخدم معين
const authMiddleware = require('./middleware/authMiddleware');
app.get('/api/users/online-status/:userId', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .select('isOnline lastSeen name');
    if (!user) return res.status(404).json({ message: 'المستخدم غير موجود' });
    res.json(user);
  } catch (e) {
    res.status(500).json({ message: 'خطأ في الخادم' });
  }
});

// ✅ Socket.io - Online Status + Real-time Chat
const onlineUsers = new Map(); // userId -> socketId

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // المستخدم يسجل نفسه أونلاين
  socket.on('user-online', async (userId) => {
    onlineUsers.set(userId, socket.id);
    socket.userId = userId;

    // تحديث في DB
    try {
      await User.findByIdAndUpdate(userId, {
        isOnline: true,
        lastSeen: new Date()
      });
    } catch (e) {
      console.error('Error updating online status:', e);
    }

    // إبلاغ الكل بأن المستخدم أونلاين
    io.emit('user-status-changed', { userId, isOnline: true });
    console.log(`User ${userId} is now online`);
  });

  // الانضمام لغرفة
  socket.on('join-room', (room) => {
    socket.join(room);
    console.log(`Socket ${socket.id} joined room: ${room}`);
  });

  // إرسال رسالة real-time
  socket.on('send-message', (data) => {
    // إرسال للمستلم مباشرة لو أونلاين
    const receiverSocketId = onlineUsers.get(data.receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('receive-message', data);
    }
    // إرسال للغرفة لو موجودة
    if (data.room) {
      io.to(data.room).emit('receive-message', data);
    }
  });

  // مؤشر الكتابة
  socket.on('typing', (data) => {
    const receiverSocketId = onlineUsers.get(data.receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('user-typing', {
        senderId: data.senderId,
        isTyping: data.isTyping
      });
    }
  });

  // قطع الاتصال
  socket.on('disconnect', async () => {
    if (socket.userId) {
      onlineUsers.delete(socket.userId);
      const lastSeen = new Date();

      try {
        await User.findByIdAndUpdate(socket.userId, {
          isOnline: false,
          lastSeen
        });
      } catch (e) {
        console.error('Error updating offline status:', e);
      }

      // إبلاغ الكل بأن المستخدم أوفلاين
      io.emit('user-status-changed', {
        userId: socket.userId,
        isOnline: false,
        lastSeen
      });

      console.log(`User ${socket.userId} is now offline`);
    }
    console.log('Socket disconnected:', socket.id);
  });
});

// Database connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.log('MongoDB connection error:', err));

const PORT = process.env.PORT || 50000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));