const { body } = require('express-validator');

const registerValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 255 })
    .withMessage('Name must be between 2 and 255 characters'),

  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),

  body('phone')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required')
    .matches(/^\+?[\d\s\-().]{7,20}$/)
    .withMessage('Please provide a valid phone number'),

  body('business_type')
    .trim()
    .notEmpty()
    .withMessage('Business type is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Business type must be between 2 and 100 characters'),
];

const verifyValidation = [
  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn(['approved', 'rejected'])
    .withMessage('Status must be "approved" or "rejected"'),

  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes must not exceed 500 characters'),
];

module.exports = { registerValidation, verifyValidation };
