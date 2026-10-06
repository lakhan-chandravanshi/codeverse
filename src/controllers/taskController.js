const Task = require('../models/Task');

const createTask = async (req, res) => {
  try {
    const taskData = {
      ...req.body,
      user: req.user.id
    };

    const task = await Task.create(taskData);

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: task
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error creating task'
    });
  }
};

const getTasks = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = { user: req.user.id };

    if (req.query.status) {
      filter.status = req.query.status;
    }

    if (req.query.search) {
      filter.title = { $regex: req.query.search, $options: 'i' };
    }

    const tasks = await Task.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Task.countDocuments(filter);

    res.status(200).json({
      success: true,
      message: 'Tasks retrieved successfully',
      data: {
        tasks,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error retrieving tasks'
    });
  }
};

const getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    if (task.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this task'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Task retrieved successfully',
      data: task
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error retrieving task'
    });
  }
};

const updateTask = async (req, res) => {
  try {
    let task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    if (task.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this task'
      });
    }

    task = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      data: task
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error updating task'
    });
  }
};

const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    if (task.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this task'
      });
    }

    await task.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully',
      data: { id: req.params.id }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error deleting task'
    });
  }
};

module.exports = { createTask, getTasks, getTaskById, updateTask, deleteTask };
