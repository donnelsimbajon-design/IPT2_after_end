import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const mounted = useRef(true);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    return () => { mounted.current = false; };
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (mounted.current) setLoading(true);
    if (mounted.current) setMsg(null);

    try {
      await login(email, password, remember);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Invalid credentials. Please try again.';
      if (mounted.current) setMsg(errorMsg);
    } finally {
      if (mounted.current) setLoading(false);
    }
  };

  return (
    <div className="home-login">
      <div className="bg-slideshow">
        <div className="slide s1"></div>
        <div className="slide s2"></div>
        <div className="slide s3"></div>
      </div>
      <div className="login-card">
        <div className="brand">
          <img src="/images/hcc-logo.png.png" alt="The Holy Child College" className="brand-logo" />
          <h1>The Holy Child College</h1>
          <p>Please log in to continue</p>
        </div>
        {msg && <div className="message error">{msg}</div>}
        <form onSubmit={submit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            disabled={loading}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            disabled={loading}
          />
          <div className="controls">
            <label className="remember">
              <input
                type="checkbox"
                checked={remember}
                onChange={e => setRemember(e.target.checked)}
                disabled={loading}
              />
              <span>Remember me</span>
            </label>
            <button className="btn" type="submit" disabled={loading}>
              {loading ? 'Logging in...' : 'Log in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}