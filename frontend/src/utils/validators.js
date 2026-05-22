// Strip HTML tags to prevent stored XSS via form inputs
const stripTags = (s) => (s || '').replace(/<[^>]*>/g, '');
export const sanitize = (value) => stripTags((value || '').trim()).replace(/\s+/g, ' ');

// ── Email ────────────────────────────────────────────────────────────────────
export const validateEmail = (value) => {
  const v = (value || '').trim();
  if (!v) return 'Email is required';
  if (v.length > 254) return 'Email address is too long';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return 'Please enter a valid email address';
  if (/[<>"'`\\]/.test(v)) return 'Email contains invalid characters';
  return null;
};

// ── Password ─────────────────────────────────────────────────────────────────
export const passwordChecks = (value) => ({
  length:  (value || '').length >= 8,
  upper:   /[A-Z]/.test(value || ''),
  lower:   /[a-z]/.test(value || ''),
  number:  /[0-9]/.test(value || ''),
  special: /[!@#$%^&*(),.?":{}|<>_\-+=/\\[\];'`~]/.test(value || ''),
});

export const passwordStrength = (value) => {
  const checks = passwordChecks(value);
  const score = Object.values(checks).filter(Boolean).length;
  if (!value) return { score: 0, label: '', className: '' };
  if (score <= 2) return { score, label: 'Weak',   className: 'weak' };
  if (score === 3) return { score, label: 'Fair',   className: 'fair' };
  if (score === 4) return { score, label: 'Good',   className: 'good' };
  return             { score, label: 'Strong', className: 'strong' };
};

export const validatePassword = (value) => {
  if (!value) return 'Password is required';
  if (value.length > 128) return 'Password cannot exceed 128 characters';
  const c = passwordChecks(value);
  if (!c.length)  return 'Password must be at least 8 characters';
  if (!c.upper)   return 'Password must contain an uppercase letter';
  if (!c.lower)   return 'Password must contain a lowercase letter';
  if (!c.number)  return 'Password must contain a number';
  if (!c.special) return 'Password must contain a special character';
  return null;
};

export const validateConfirmPassword = (password, confirm) => {
  if (!confirm) return 'Please confirm your password';
  if (password !== confirm) return 'Passwords do not match';
  return null;
};

export const validateLoginPassword = (value) => {
  if (!value) return 'Password is required';
  return null;
};

// ── OTP ──────────────────────────────────────────────────────────────────────
export const validateOtp = (value) => {
  const v = (value || '').trim();
  if (!v) return 'OTP is required';
  if (!/^\d{6}$/.test(v)) return 'OTP must be exactly 6 digits';
  return null;
};

// ── Person / employee fields ──────────────────────────────────────────────────
export const validateName = (value, label = 'Name') => {
  const v = sanitize(value);
  if (!v) return `${label} is required`;
  if (v.length < 2) return `${label} must be at least 2 characters`;
  if (v.length > 100) return `${label} cannot exceed 100 characters`;
  if (/[<>"\\]/.test(v)) return `${label} contains invalid characters`;
  return null;
};

export const validateRole = (value) => {
  const v = sanitize(value);
  if (!v) return 'Role / job title is required';
  if (v.length < 2) return 'Role must be at least 2 characters';
  if (v.length > 100) return 'Role cannot exceed 100 characters';
  return null;
};

export const validateSalary = (value) => {
  if (value === '' || value === null || value === undefined) return 'Salary is required';
  const n = Number(value);
  if (isNaN(n)) return 'Salary must be a valid number';
  if (n < 0) return 'Salary cannot be negative';
  if (n > 10_000_000) return 'Salary cannot exceed £10,000,000';
  return null;
};

// ── Address ───────────────────────────────────────────────────────────────────
export const validateStreet = (value) => {
  const v = sanitize(value);
  if (!v) return 'Street address is required';
  if (v.length < 3) return 'Please enter a complete street address';
  if (v.length > 200) return 'Street address cannot exceed 200 characters';
  return null;
};

export const validateCity = (value) => {
  const v = sanitize(value);
  if (!v) return 'City is required';
  if (v.length < 2) return 'City name is too short';
  if (v.length > 100) return 'City name cannot exceed 100 characters';
  if (/\d/.test(v)) return 'City name should not contain numbers';
  return null;
};

export const validatePostcode = (value) => {
  const v = (value || '').trim();
  if (!v) return 'Postcode is required';
  if (!/^[A-Z]{1,2}[0-9][0-9A-Z]?\s?[0-9][A-Z]{2}$/i.test(v))
    return 'Enter a valid UK postcode (e.g. BT1 1AA)';
  return null;
};

// ── Job role fields ───────────────────────────────────────────────────────────
export const validateJobRoleName = (value) => {
  const v = sanitize(value);
  if (!v) return 'Role name is required';
  if (v.length < 2) return 'Role name must be at least 2 characters';
  if (v.length > 100) return 'Role name cannot exceed 100 characters';
  return null;
};

export const validateDescription = (value) => {
  const v = (value || '').trim();
  if (!v) return 'Description is required';
  if (v.length < 10) return 'Description must be at least 10 characters';
  if (v.length > 2000) return 'Description cannot exceed 2000 characters';
  return null;
};
