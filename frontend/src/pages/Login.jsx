import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../utils/AuthContext';
import PasswordInput from '../components/PasswordInput';
import { validateEmail, validateLoginPassword } from '../utils/validators';
import '../styles/auth.css';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name]) setErrors((errs) => ({ ...errs, [name]: '' }));
    if (submitError) setSubmitError('');
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    let err = null;
    if (name === 'email') err = validateEmail(value);
    if (name === 'password') err = validateLoginPassword(value);
    if (err) setErrors((errs) => ({ ...errs, [name]: err }));
  };

  const validateAll = () => {
    const next = {
      email: validateEmail(form.email),
      password: validateLoginPassword(form.password),
    };
    Object.keys(next).forEach((k) => { if (!next[k]) delete next[k]; });
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    if (!validateAll()) return;

    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', {
        email: form.email.trim(),
        password: form.password,
      });
      login(data.user);
      navigate('/');
    } catch (err) {
      const res = err.response?.data;
      if (res?.errors) {
        setErrors(res.errors);
      } else {
        setSubmitError(res?.message || 'Invalid email or password');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Welcome back</h1>
        <p className="subtitle">Log in to access the Kainos Portal.</p>

        {submitError && <div className="alert alert-error" role="alert">{submitError}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="email">Email</label>
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
              id="password" name="password" autoComplete="current-password"
              value={form.password} onChange={handleChange} onBlur={handleBlur}
              placeholder="Enter your password"
              hasError={!!errors.password}
              ariaDescribedBy="password-error"
            />
            <span className="error-text" id="password-error" role="alert">{errors.password || ''}</span>
          </div>

          <div className="row-between">
            <span />
            <Link to="/forgot-password">Forgot password?</Link>
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="auth-footer">
          Don't have an account? <Link to="/register">Sign up</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
