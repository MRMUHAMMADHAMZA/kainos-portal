import { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../utils/api';
import OtpInput from '../components/OtpInput';
import { validateOtp } from '../utils/validators';
import '../styles/auth.css';

const RESEND_COOLDOWN = 60; // seconds

const VerifyOtp = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN);
  const [resending, setResending] = useState(false);

  // No email = user landed here directly. Send them back.
  useEffect(() => {
    if (!email) navigate('/forgot-password', { replace: true });
  }, [email, navigate]);

  // Resend cooldown countdown
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown((c) => (c > 0 ? c - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  const handleOtpChange = (v) => {
    setOtp(v);
    if (error) setError('');
    if (info) setInfo('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setInfo('');

    const err = validateOtp(otp);
    if (err) { setError(err); return; }

    setLoading(true);
    try {
      const { data } = await api.post('/auth/verify-otp', { email, otp });
      navigate('/reset-password', {
        state: { email, resetToken: data.resetToken },
        replace: true,
      });
    } catch (err) {
      const res = err.response?.data;
      setError(res?.errors?.otp || res?.message || 'Verification failed.');
      // Clear OTP on failure so user re-enters
      setOtp('');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || resending) return;
    setError('');
    setInfo('');
    setResending(true);
    try {
      const { data } = await api.post('/auth/forgot-password', { email });
      setInfo(data.message || 'A new OTP has been sent.');
      setOtp('');
      setCooldown(RESEND_COOLDOWN);
    } catch (err) {
      const res = err.response?.data;
      setError(res?.message || 'Could not resend OTP. Try again later.');
    } finally {
      setResending(false);
    }
  };

  const maskedEmail = email
    ? email.replace(/(.{2}).+(@.+)/, (_, a, b) => `${a}•••${b}`)
    : '';

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Verify your email</h1>
        <p className="subtitle">
          Enter the 6-digit code we sent to <strong>{maskedEmail}</strong>.
        </p>

        {error && <div className="alert alert-error" role="alert">{error}</div>}
        {info && <div className="alert alert-success" role="status">{info}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="otp-label">OTP code</label>
            <OtpInput
              value={otp}
              onChange={handleOtpChange}
              hasError={!!error}
              autoFocus
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={loading || otp.length !== 6}
          >
            {loading ? 'Verifying...' : 'Verify OTP'}
          </button>
        </form>

        <div className="resend-row">
          <span>Didn't receive the code?</span>
          {cooldown > 0 ? (
            <span className="resend-disabled">Resend in {cooldown}s</span>
          ) : (
            <button
              type="button"
              className="resend-btn"
              onClick={handleResend}
              disabled={resending}
            >
              {resending ? 'Resending...' : 'Resend OTP'}
            </button>
          )}
        </div>

        <p className="auth-footer">
          Wrong email? <Link to="/forgot-password">Start over</Link>
        </p>
      </div>
    </div>
  );
};

export default VerifyOtp;