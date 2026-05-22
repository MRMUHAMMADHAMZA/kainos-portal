const express = require('express');
const rateLimit = require('express-rate-limit');
const {
  register, login, logout, me,
  forgotPassword, verifyOtp, resetPassword, checkEmail,
} = require('../controllers/authController');
const {
  registerValidator, loginValidator,
  forgotPasswordValidator, verifyOtpValidator, resetPasswordValidator,
} = require('../middleware/validate');
const { protect } = require('../middleware/auth');

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, max: 20,
  message: { success: false, message: 'Too many attempts. Try again later.' },
});

const otpLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, max: 5,
  message: { success: false, message: 'Too many OTP requests. Try again later.' },
});

const verifyOtpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, max: 15,
  message: { success: false, message: 'Too many OTP attempts. Try again later.' },
});

const checkLimiter = rateLimit({ windowMs: 60 * 1000, max: 30 });

router.post('/check-email', checkLimiter, checkEmail);
router.post('/register', authLimiter, registerValidator, register);
router.post('/login', authLimiter, loginValidator, login);
router.post('/logout', logout);
router.get('/me', protect, me);
router.post('/forgot-password', otpLimiter, forgotPasswordValidator, forgotPassword);
router.post('/verify-otp', verifyOtpLimiter, verifyOtpValidator, verifyOtp);
router.post('/reset-password', authLimiter, resetPasswordValidator, resetPassword);

module.exports = router;