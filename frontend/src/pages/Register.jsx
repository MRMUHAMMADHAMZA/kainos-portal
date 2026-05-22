import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../utils/AuthContext';
import PasswordInput from '../components/PasswordInput';
import {
  validateEmail, validatePassword, validateConfirmPassword,
  passwordChecks, passwordStrength,
} from '../utils/validators';
import '../styles/auth.css';

const Register = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [showPwHints, setShowPwHints] = useState(false);
  const debounceRef = useRef(null);

  const checks = passwordChecks(form.password);
  const strength = passwordStrength(form.password);

  // Live email-exists check (debounced)
  const checkEmailExists = (email) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const localErr = validateEmail(email);
    if (localErr) return;
    debounceRef.current = setTimeout(async () => {
      try {
        setCheckingEmail(true);
        const { data } = await api.post('/auth/check-email', { email: email.trim() });
        if (data.exists) {
          setErrors((errs) => ({ ...errs, email: 'An account with this email already exists' }));
        }
      } catch {} finally {
        setCheckingEmail(false);
      }
    }, 500);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name]) setErrors((errs) => ({ ...errs, [name]: '' }));
    if (submitError) setSubmitError('');
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    let err = null;
    if (name === 'email') {
      err = validateEmail(value);
      if (!err) checkEmailExists(value);
    }
    if (name === 'password') err = validatePassword(value);
    if (name === 'confirm') err = validateConfirmPassword(form.password, value);
    if (err) setErrors((errs) => ({ ...errs, [name]: err }));
  };

  const validateAll = () => {
    const next = {
      email: validateEmail(form.email),
      password: validatePassword(form.password),
      confirm: validateConfirmPassword(form.password, form.confirm),
    };
    Object.keys(next).forEach((k) => { if (!next[k]) delete next[k]; });
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    if (!validateAll()) return;
    if (errors.email === 'An account with this email already exists') return;

    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', {
        email: form.email.trim(),
        password: form.password,
      });
      login(data.user);
      navigate('/');
    } catch (err) {
      const res = err.response?.data;
      if (res?.errors) setErrors(res.errors);
      else setSubmitError(res?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Create your account</h1>
        <p className="subtitle">Join the Kainos Portal in less than a minute.</p>

        {submitError && <div className="alert alert-error" role="alert">{submitError}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="email">
              Email {checkingEmail && <span className="checking">checking…</span>}
            </label>
            <input
              id="email" name="email" type="email" autoComplete="email"
              value={form.email} onChange={handleChange} onBlur={handleBlur}
              placeholder="you@example.com"
              aria-invalid={!!errors.email}
              aria-describedby="email-error"
              className={`form-control ${errors.email ? 'is-invalid' : ''}`}
            />
            <span className="error-text" id="email-error" role="alert">{errors.email || ''}</span>
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <PasswordInput
              id="password" name="password" autoComplete="new-password"
              value={form.password} onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Minimum 8 characters"
              hasError={!!errors.password}
              ariaDescribedBy="password-error"
            />
            <input type="hidden" onFocus={() => setShowPwHints(true)} />

            {form.password && (
              <>
                <div className={`strength-bar ${strength.className}`}>
                  <div className="strength-fill" style={{ width: `${(strength.score / 5) * 100}%` }} />
                </div>
                <div className={`strength-label ${strength.className}`}>
                  Password strength: <strong>{strength.label}</strong>
                </div>
              </>
            )}

            <ul className="pw-checklist" aria-label="Password requirements">
              <li className={checks.length ? 'ok' : ''}>At least 8 characters</li>
              <li className={checks.upper ? 'ok' : ''}>One uppercase letter (A–Z)</li>
              <li className={checks.lower ? 'ok' : ''}>One lowercase letter (a–z)</li>
              <li className={checks.number ? 'ok' : ''}>One number (0–9)</li>
              <li className={checks.special ? 'ok' : ''}>One special character (!@#$…)</li>
            </ul>

            <span className="error-text" id="password-error" role="alert">{errors.password || ''}</span>
          </div>

          <div className="form-group">
            <label htmlFor="confirm">Confirm password</label>
            <PasswordInput
              id="confirm" name="confirm" autoComplete="new-password"
              value={form.confirm} onChange={handleChange} onBlur={handleBlur}
              placeholder="Re-enter your password"
              hasError={!!errors.confirm}
              ariaDescribedBy="confirm-error"
            />
            <span className="error-text" id="confirm-error" role="alert">{errors.confirm || ''}</span>
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;