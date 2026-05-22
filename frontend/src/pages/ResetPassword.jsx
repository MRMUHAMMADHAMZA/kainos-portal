import { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../utils/api';
import PasswordInput from '../components/PasswordInput';
import {
  validatePassword, validateConfirmPassword,
  passwordChecks, passwordStrength,
} from '../utils/validators';
import '../styles/auth.css';

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;
  const resetToken = location.state?.resetToken;

  const [form, setForm] = useState({ password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const checks = passwordChecks(form.password);
  const strength = passwordStrength(form.password);

  useEffect(() => {
    if (!email || !resetToken) navigate('/forgot-password', { replace: true });
  }, [email, resetToken, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name]) setErrors((errs) => ({ ...errs, [name]: '' }));
    if (submitError) setSubmitError('');
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    let err = null;
    if (name === 'password') err = validatePassword(value);
    if (name === 'confirm') err = validateConfirmPassword(form.password, value);
    if (err) setErrors((errs) => ({ ...errs, [name]: err }));
  };

  const validateAll = () => {
    const next = {
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
    setSuccess('');
    if (!validateAll()) return;

    setLoading(true);
    try {
      const { data } = await api.post('/auth/reset-password', {
        email, resetToken, password: form.password,
      });
      setSuccess(data.message || 'Password reset successfully.');
      setTimeout(() => navigate('/login', { replace: true }), 1500);
    } catch (err) {
      const res = err.response?.data;
      setSubmitError(res?.message || 'Failed to reset password.');
      if (res?.message?.toLowerCase().includes('session')) {
        setTimeout(() => navigate('/forgot-password', { replace: true }), 1800);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Set a new password</h1>
        <p className="subtitle">Choose a strong password you haven't used before.</p>

        {submitError && <div className="alert alert-error" role="alert">{submitError}</div>}
        {success && <div className="alert alert-success" role="status">{success}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="password">New password</label>
            <PasswordInput
              id="password" name="password" autoComplete="new-password"
              value={form.password} onChange={handleChange} onBlur={handleBlur}
              placeholder="Minimum 8 characters"
              hasError={!!errors.password}
              ariaDescribedBy="password-error"
            />

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
            <label htmlFor="confirm">Confirm new password</label>
            <PasswordInput
              id="confirm" name="confirm" autoComplete="new-password"
              value={form.confirm} onChange={handleChange} onBlur={handleBlur}
              placeholder="Re-enter password"
              hasError={!!errors.confirm}
              ariaDescribedBy="confirm-error"
            />
            <span className="error-text" id="confirm-error" role="alert">{errors.confirm || ''}</span>
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>

        <p className="auth-footer">
          Changed your mind? <Link to="/login">Back to login</Link>
        </p>
      </div>
    </div>
  );
};

export default ResetPassword;