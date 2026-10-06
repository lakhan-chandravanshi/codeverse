const express = require('express');
const router = express.Router();
const { createTask, getTasks, getTaskById, updateTask, deleteTask } = require('../controllers/taskController');
const { validateTask, validateTaskUpdate } = require('../validators/taskValidator');
const protect = require('../middlewares/auth');

router.post('/', protect, validateTask, createTask);
router.get('/', protect, getTasks);
router.get('/:id', protect, getTaskById);
router.put('/:id', protect, validateTaskUpdate, updateTask);
router.patch('/:id', protect, validateTaskUpdate, updateTask);
router.delete('/:id', protect, deleteTask);

module.exports = router;
