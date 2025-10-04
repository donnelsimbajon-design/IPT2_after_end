import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState(null);
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/login', { email, password });
      if (res.status === 200) {
        // server should set session cookie; now navigate to protected route
        navigate('/example', { replace: true });
      }
    } catch (err) {
      // show error
    }
  };

  return (
    <div className="home-login">
      <div className="login-card">
        <div className="brand"><h1>Nadela company </h1><p>log in na diha </p></div>
        {msg && <div className="message error">{msg}</div>}
        <form onSubmit={submit}>
          <input type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} required />
          <input type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} required />
          <div className="controls">
            <div className="remember">Remember me</div>
            <button className="btn" type="submit">Log in</button>
          </div>
        </form>
      </div>
    </div>
  );
}