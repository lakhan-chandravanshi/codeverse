const Joi = require('joi');

const taskSchema = Joi.object({
  title: Joi.string()
    .trim()
    .min(1)
    .max(100)
    .required()
    .messages({
      'string.empty': 'Title is required',
      'string.min': 'Title cannot be empty',
      'string.max': 'Title cannot exceed 100 characters'
    }),
  description: Joi.string()
    .trim()
    .max(500)
    .allow('')
    .optional()
    .messages({
      'string.max': 'Description cannot exceed 500 characters'
    }),
  priority: Joi.string()
    .valid('low', 'medium', 'high')
    .optional()
    .messages({
      'any.only': 'Priority must be low, medium, or high'
    }),
  status: Joi.string()
    .valid('pending', 'in-progress', 'completed')
    .optional()
    .messages({
      'any.only': 'Status must be pending, in-progress, or completed'
    }),
  dueDate: Joi.date()
    .iso()
    .optional()
    .allow(null)
    .messages({
      'date.format': 'Due date must be a valid ISO date'
    })
});

const validateTask = (req, res, next) => {
  const { error } = taskSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message
    });
  }
  next();
};

const validateTaskUpdate = (req, res, next) => {
  const updateSchema = Joi.object({
    title: Joi.string()
      .trim()
      .min(1)
      .max(100)
      .optional()
      .messages({
        'string.min': 'Title cannot be empty',
        'string.max': 'Title cannot exceed 100 characters'
      }),
    description: Joi.string()
      .trim()
      .max(500)
      .allow('')
      .optional()
      .messages({
        'string.max': 'Description cannot exceed 500 characters'
      }),
    priority: Joi.string()
      .valid('low', 'medium', 'high')
      .optional()
      .messages({
        'any.only': 'Priority must be low, medium, or high'
      }),
    status: Joi.string()
      .valid('pending', 'in-progress', 'completed')
      .optional()
      .messages({
        'any.only': 'Status must be pending, in-progress, or completed'
      }),
    dueDate: Joi.date()
      .iso()
      .optional()
      .allow(null)
      .messages({
        'date.format': 'Due date must be a valid ISO date'
      })
  }).min(1);

  const { error } = updateSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message
    });
  }
  next();
};

module.exports = { validateTask, validateTaskUpdate };
