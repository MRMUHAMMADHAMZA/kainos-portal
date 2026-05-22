import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { validateEmail } from '../utils/validators';
import '../styles/auth.css';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setEmail(e.target.value);
    if (errors.email) setErrors({});
    if (submitError) setSubmitError('');
  };

  const handleBlur = () => {
    const err = validateEmail(email);
    if (err) setErrors({ email: err });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    const err = validateEmail(email);
    if (err) { setErrors({ email: err }); return; }

    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email: email.trim() });
      navigate('/verify-otp', { state: { email: email.trim() } });
    } catch (err) {
      const res = err.response?.data;
      if (res?.errors) setErrors(res.errors);
      else setSubmitError(res?.message || 'Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Forgot password?</h1>
        <p className="subtitle">
          Enter the email linked to your account and we'll send a 6-digit code.
        </p>

        {submitError && <div className="alert alert-error" role="alert">{submitError}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email" name="email" type="email" autoComplete="email"
              value={email} onChange={handleChange} onBlur={handleBlur}
              placeholder="you@example.com"
              aria-invalid={!!errors.email}
              aria-describedby="email-error"
              className={`form-control ${errors.email ? 'is-invalid' : ''}`}
            />
            <span className="error-text" id="email-error" role="alert">{errors.email || ''}</span>
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Sending OTP...' : 'Send OTP'}
          </button>
        </form>

        <p className="auth-footer">
          Remembered? <Link to="/login">Back to login</Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;