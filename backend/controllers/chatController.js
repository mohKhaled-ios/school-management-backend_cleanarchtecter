

const { Message, ChatRoom } = require('../models/Chat');
const User = require('../models/User');

const chatController = {
  sendMessage: async (req, res) => {
    try {
      const { receiverId, message, messageType, fileUrl } = req.body;

      let chatRoom = await ChatRoom.findOne({
        participants: { $all: [req.userId, receiverId] },
        roomType: 'private'
      });

      if (!chatRoom) {
        chatRoom = new ChatRoom({
          participants: [req.userId, receiverId],
          roomType: 'private'
        });
        await chatRoom.save();
      }

      const newMessage = new Message({
        senderId: req.userId,
        receiverId,
        message,
        messageType,
        fileUrl
      });

      await newMessage.save();

      chatRoom.lastMessage = newMessage._id;
      await chatRoom.save();

      const populatedMessage = await Message.findById(newMessage._id)
        .populate('senderId', 'name profileImage')
        .populate('receiverId', 'name profileImage');

      res.status(201).json(populatedMessage);
    } catch (error) {
      console.error('sendMessage error:', error);
      res.status(500).json({ message: 'خطأ في إرسال الرسالة' });
    }
  },

  getChats: async (req, res) => {
    try {
      const chatRooms = await ChatRoom.find({ participants: req.userId })
        .populate('participants', 'name profileImage role')
        .populate('lastMessage')
        .sort({ updatedAt: -1 });

      res.json(chatRooms);
    } catch (error) {
      console.error('getChats error:', error);
      res.status(500).json({ message: 'خطأ في الخادم' });
    }
  },

  getMessages: async (req, res) => {
    try {
      const { receiverId } = req.query;

      const messages = await Message.find({
        $or: [
          { senderId: req.userId, receiverId },
          { senderId: receiverId, receiverId: req.userId }
        ]
      })
        .populate('senderId', 'name profileImage')
        .populate('receiverId', 'name profileImage')
        .sort({ createdAt: 1 });

      res.json(messages);
    } catch (error) {
      console.error('getMessages error:', error);
      res.status(500).json({ message: 'خطأ في الخادم' });
    }
  },

  markAsRead: async (req, res) => {
    try {
      const { senderId } = req.body;

      await Message.updateMany(
        { senderId, receiverId: req.userId, isRead: false },
        { isRead: true }
      );

      res.json({ message: 'تم وضع علامة مقروء على الرسائل' });
    } catch (error) {
      console.error('markAsRead error:', error);
      res.status(500).json({ message: 'خطأ في الخادم' });
    }
  }
};

module.exports = chatController; // ✅ هذا Controller
