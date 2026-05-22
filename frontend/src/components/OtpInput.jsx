import { useRef, useEffect } from 'react';
import '../styles/auth.css';

const OtpInput = ({ length = 6, value = '', onChange, hasError = false, autoFocus = false, disabled = false }) => {
  const inputsRef = useRef([]);

  useEffect(() => {
    if (autoFocus) inputsRef.current[0]?.focus();
  }, [autoFocus]);

  const getDigit = (i) => value[i] || '';

  const updateDigit = (i, digit) => {
    const arr = value.split('');
    while (arr.length < length) arr.push('');
    arr[i] = digit;
    onChange(arr.join('').slice(0, length).replace(/\s/g, ''));
  };

  const handleChange = (i, e) => {
    const raw = e.target.value.replace(/\D/g, '');
    if (!raw) {
      updateDigit(i, '');
      return;
    }
    const ch = raw.slice(-1);
    updateDigit(i, ch);
    if (i < length - 1) inputsRef.current[i + 1]?.focus();
  };

  const handleKeyDown = (i, e) => {
    if (e.key === 'Backspace') {
      if (!getDigit(i) && i > 0) {
        e.preventDefault();
        updateDigit(i - 1, '');
        inputsRef.current[i - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && i > 0) {
      e.preventDefault();
      inputsRef.current[i - 1]?.focus();
    } else if (e.key === 'ArrowRight' && i < length - 1) {
      e.preventDefault();
      inputsRef.current[i + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = (e.clipboardData.getData('text') || '').replace(/\D/g, '').slice(0, length);
    if (!pasted) return;
    onChange(pasted);
    const focusIndex = Math.min(pasted.length, length - 1);
    setTimeout(() => inputsRef.current[focusIndex]?.focus(), 0);
  };

  return (
    <div className="otp-input" role="group" aria-label={`${length} digit OTP`}>
      {Array.from({ length }, (_, i) => (
        <input
          key={i}
          ref={(el) => (inputsRef.current[i] = el)}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete={i === 0 ? 'one-time-code' : 'off'}
          maxLength={1}
          value={getDigit(i)}
          onChange={(e) => handleChange(i, e)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()}
          disabled={disabled}
          aria-label={`Digit ${i + 1}`}
          aria-invalid={hasError}
          className={`otp-box ${hasError ? 'is-invalid' : ''} ${getDigit(i) ? 'filled' : ''}`}
        />
      ))}
    </div>
  );
};

export default OtpInput;