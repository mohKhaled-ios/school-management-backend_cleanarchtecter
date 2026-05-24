
const express = require('express'); // ✅ تم إضافة هذا السطر
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, userController.getUsers);
router.get('/:id', authMiddleware, userController.getUserById);
router.get(
  '/students/by-class/:classId',
  authMiddleware,
  userController.getStudentsByClass
);
router.post('/', authMiddleware, userController.createUser);
router.put('/:id', authMiddleware, userController.updateUser);
router.delete('/:id', authMiddleware, userController.deleteUser);

module.exports = router; // ✅ نصدر الـ router فقط
