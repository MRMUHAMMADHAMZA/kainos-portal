const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../utils/jsonDb');
const { sendOtpEmail } = require('../utils/sendEmail');

const MAX_OTP_ATTEMPTS = 5;
const OTP_TTL_MIN = 10;
const RESET_TOKEN_TTL_MIN = 15;

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

const sha256 = (s) => crypto.createHash('sha256').update(s).digest('hex');

const sanitize = (user) => {
  const { password, resetOtp, resetOtpExpiry, resetOtpAttempts, resetToken, resetTokenExpiry, ...safe } = user;
  return safe;
};

// POST /api/auth/check-email
exports.checkEmail = (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) return res.json({ success: true, exists: false });
    const exists = !!db.findOne('users', (u) => u.email === email.toLowerCase().trim());
    res.json({ success: true, exists });
  } catch {
    res.json({ success: true, exists: false });
  }
};

// POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { email, password } = req.body;
    const existing = db.findOne('users', (u) => u.email === email.toLowerCase().trim());
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists',
        errors: { email: 'An account with this email already exists' },
      });
    }
    const hashed = await bcrypt.hash(password, 12);
    const user = db.create('users', { email: email.toLowerCase().trim(), password: hashed, role: 'user' });
    const token = signToken(user._id);
    res.cookie('token', token, cookieOptions);
    res.status(201).json({
      success: true, message: 'Account created successfully',
      user: { id: user._id, email: user.email, role: user.role }, token,
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ success: false, message: 'Registration failed' });
  }
};

// POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = db.findOne('users', (u) => u.email === email.toLowerCase().trim());
    const valid = user && await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
    db.updateById('users', user._id, { lastLoginAt: new Date().toISOString() });
    const token = signToken(user._id);
    res.cookie('token', token, cookieOptions);
    res.json({
      success: true, message: 'Logged in successfully',
      user: { id: user._id, email: user.email, role: user.role }, token,
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Login failed' });
  }
};

// POST /api/auth/logout
exports.logout = (req, res) => {
  res.clearCookie('token');
  res.json({ success: true, message: 'Logged out' });
};

// GET /api/auth/me
exports.me = (req, res) => {
  res.json({
    success: true,
    user: { id: req.user._id, email: req.user.email, role: req.user.role },
  });
};

// POST /api/auth/forgot-password
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = db.findOne('users', (u) => u.email === email.toLowerCase().trim());
    if (!user) {
      return res.status(404).json({
        success: false, message: 'No account found with this email',
        errors: { email: 'No account found with this email' },
      });
    }

    const otp = crypto.randomInt(100000, 1000000).toString();
    const otpHash = await bcrypt.hash(otp, 10);

    db.updateById('users', user._id, {
      resetOtp: otpHash,
      resetOtpExpiry: new Date(Date.now() + OTP_TTL_MIN * 60 * 1000).toISOString(),
      resetOtpAttempts: 0,
      resetToken: null,
      resetTokenExpiry: null,
    });

    try {
      await sendOtpEmail(user.email, otp);
    } catch (emailErr) {
      console.error('Email send failed:', emailErr?.message || emailErr);
      db.updateById('users', user._id, { resetOtp: null, resetOtpExpiry: null });
      const devHint = process.env.NODE_ENV !== 'production'
        ? ` (${emailErr?.message || 'check server console'})`
        : '';
      return res.status(500).json({
        success: false,
        message: `Failed to send OTP email${devHint}`,
      });
    }

    res.json({
      success: true,
      message: `An OTP has been sent to ${user.email}. It expires in ${OTP_TTL_MIN} minutes.`,
      expiresInMin: OTP_TTL_MIN,
    });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ success: false, message: 'Something went wrong' });
  }
};

// POST /api/auth/verify-otp
exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = db.findOne('users', (u) => u.email === email.toLowerCase().trim());

    if (!user || !user.resetOtp || !user.resetOtpExpiry) {
      return res.status(400).json({
        success: false, message: 'No active OTP. Please request a new one.',
        errors: { otp: 'No active OTP. Please request a new one.' },
      });
    }

    if (new Date(user.resetOtpExpiry) < new Date()) {
      db.updateById('users', user._id, { resetOtp: null, resetOtpExpiry: null, resetOtpAttempts: 0 });
      return res.status(400).json({
        success: false, message: 'OTP has expired. Please request a new one.',
        errors: { otp: 'OTP has expired. Please request a new one.' },
      });
    }

    if ((user.resetOtpAttempts || 0) >= MAX_OTP_ATTEMPTS) {
      db.updateById('users', user._id, { resetOtp: null, resetOtpExpiry: null, resetOtpAttempts: 0 });
      return res.status(429).json({
        success: false, message: 'Too many failed attempts. Please request a new OTP.',
        errors: { otp: 'Too many failed attempts. Please request a new OTP.' },
      });
    }

    const isMatch = await bcrypt.compare(otp, user.resetOtp);
    if (!isMatch) {
      const attempts = (user.resetOtpAttempts || 0) + 1;
      const remaining = MAX_OTP_ATTEMPTS - attempts;
      db.updateById('users', user._id, { resetOtpAttempts: attempts });

      if (remaining <= 0) {
        db.updateById('users', user._id, { resetOtp: null, resetOtpExpiry: null, resetOtpAttempts: 0 });
        return res.status(429).json({
          success: false, message: 'Too many failed attempts. Please request a new OTP.',
          errors: { otp: 'Too many failed attempts. Please request a new OTP.' },
        });
      }

      return res.status(400).json({
        success: false,
        message: `Invalid OTP. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.`,
        errors: { otp: `Invalid OTP. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.` },
        attemptsRemaining: remaining,
      });
    }

    const rawToken = crypto.randomBytes(32).toString('hex');
    db.updateById('users', user._id, {
      resetToken: sha256(rawToken),
      resetTokenExpiry: new Date(Date.now() + RESET_TOKEN_TTL_MIN * 60 * 1000).toISOString(),
      resetOtp: null,
      resetOtpExpiry: null,
      resetOtpAttempts: 0,
    });

    res.json({ success: true, message: 'OTP verified successfully.', resetToken: rawToken });
  } catch (err) {
    console.error('Verify OTP error:', err);
    res.status(500).json({ success: false, message: 'Failed to verify OTP' });
  }
};

// POST /api/auth/reset-password
exports.resetPassword = async (req, res) => {
  try {
    const { email, resetToken, password } = req.body;
    const user = db.findOne('users', (u) => u.email === email.toLowerCase().trim());

    if (!user || !user.resetToken || !user.resetTokenExpiry) {
      return res.status(400).json({ success: false, message: 'Invalid or expired reset session. Please start again.' });
    }
    if (new Date(user.resetTokenExpiry) < new Date()) {
      db.updateById('users', user._id, { resetToken: null, resetTokenExpiry: null });
      return res.status(400).json({ success: false, message: 'Reset session expired. Please start again.' });
    }
    if (sha256(resetToken) !== user.resetToken) {
      return res.status(400).json({ success: false, message: 'Invalid reset session. Please start again.' });
    }

    const hashed = await bcrypt.hash(password, 12);
    db.updateById('users', user._id, { password: hashed, resetToken: null, resetTokenExpiry: null });

    res.json({ success: true, message: 'Password reset successfully. You can now log in.' });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ success: false, message: 'Failed to reset password' });
  }
};
