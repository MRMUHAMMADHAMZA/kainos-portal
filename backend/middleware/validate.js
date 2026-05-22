const { body, validationResult } = require('express-validator');

const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const fieldErrors = {};
    errors.array().forEach((err) => {
      if (!fieldErrors[err.path]) fieldErrors[err.path] = err.msg;
    });
    return res.status(400).json({
      success: false, message: 'Validation failed', errors: fieldErrors,
    });
  }
  next();
};

const strongPassword = [
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .isLength({ max: 128 }).withMessage('Password cannot exceed 128 characters')
    .matches(/[A-Z]/).withMessage('Password must contain an uppercase letter')
    .matches(/[a-z]/).withMessage('Password must contain a lowercase letter')
    .matches(/[0-9]/).withMessage('Password must contain a number')
    .matches(/[!@#$%^&*(),.?":{}|<>_\-+=/\\[\];'`~]/).withMessage('Password must contain a special character'),
];

const registerValidator = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please enter a valid email address')
    .isLength({ max: 254 }).withMessage('Email address is too long')
    .normalizeEmail(),
  ...strongPassword,
  handleValidation,
];

const loginValidator = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please enter a valid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ max: 128 }).withMessage('Password cannot exceed 128 characters'),
  handleValidation,
];

const forgotPasswordValidator = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please enter a valid email address')
    .normalizeEmail(),
  handleValidation,
];

const verifyOtpValidator = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please enter a valid email address')
    .normalizeEmail(),
  body('otp')
    .trim()
    .notEmpty().withMessage('OTP is required')
    .isLength({ min: 6, max: 6 }).withMessage('OTP must be exactly 6 digits')
    .isNumeric().withMessage('OTP must contain only numbers'),
  handleValidation,
];

const resetPasswordValidator = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please enter a valid email address')
    .normalizeEmail(),
  body('resetToken')
    .trim()
    .notEmpty().withMessage('Reset session is required')
    .isLength({ max: 256 }).withMessage('Invalid reset token'),
  ...strongPassword,
  handleValidation,
];

const employeeValidator = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be 2–100 characters')
    .matches(/^[a-zA-Z\s'\-.]+$/).withMessage('Name can only contain letters, spaces, hyphens, apostrophes, and periods')
    .escape(),
  body('address.street')
    .trim()
    .notEmpty().withMessage('Street address is required')
    .isLength({ min: 3, max: 200 }).withMessage('Street address must be 3–200 characters')
    .escape(),
  body('address.city')
    .trim()
    .notEmpty().withMessage('City is required')
    .isLength({ min: 2, max: 100 }).withMessage('City must be 2–100 characters')
    .matches(/^[a-zA-Z\s'\-]+$/).withMessage('City name can only contain letters')
    .escape(),
  body('address.postcode')
    .trim()
    .notEmpty().withMessage('Postcode is required')
    .matches(/^[A-Z]{1,2}[0-9][0-9A-Z]?\s?[0-9][A-Z]{2}$/i).withMessage('Enter a valid UK postcode (e.g. BT1 1AA)')
    .toUpperCase(),
  body('salary')
    .notEmpty().withMessage('Salary is required')
    .isFloat({ min: 0, max: 10000000 }).withMessage('Salary must be between £0 and £10,000,000'),
  body('role')
    .trim()
    .notEmpty().withMessage('Role is required')
    .isLength({ min: 2, max: 100 }).withMessage('Role must be 2–100 characters')
    .escape(),
  handleValidation,
];

const jobRoleValidator = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be 2–100 characters')
    .escape(),
  body('level')
    .trim()
    .notEmpty().withMessage('Level is required')
    .escape(),
  body('capability')
    .trim()
    .notEmpty().withMessage('Capability is required')
    .escape(),
  body('description')
    .trim()
    .notEmpty().withMessage('Description is required')
    .isLength({ min: 10, max: 2000 }).withMessage('Description must be 10–2000 characters'),
  handleValidation,
];

module.exports = {
  registerValidator,
  loginValidator,
  forgotPasswordValidator,
  verifyOtpValidator,
  resetPasswordValidator,
  jobRoleValidator,
  employeeValidator,
};
