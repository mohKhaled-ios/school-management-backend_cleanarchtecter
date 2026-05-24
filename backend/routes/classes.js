
const express = require('express');
const classController = require('../controllers/classController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', authMiddleware, classController.createClass);
router.get('/', authMiddleware, classController.getClasses);

router.get('/:id', authMiddleware, classController.getClassById);
router.put('/:id', authMiddleware, classController.updateClass);
router.delete('/:id', authMiddleware, classController.deleteClass);
router.post('/:id/schedule', authMiddleware, classController.addSchedule);

module.exports = router;


