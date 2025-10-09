import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

export default function AccountSettings() {
  const { checkAuth } = useAuth();
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({ name: '', email: '' });
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [message, setMessage] = useState(null);
  const [appearance, setAppearance] = useState({ theme_mode: 'light', theme_color: '#8B1538' });
  const [bgPreview, setBgPreview] = useState(null);
  const [bgFile, setBgFile] = useState(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const { data } = await axios.get('/api/account/profile');
      setProfile(data);
      setForm({ name: data.user?.name || '', email: data.user?.email || '' });
      setAvatarPreview(data.avatar_url || null);
      setAppearance({
        theme_mode: data.theme_mode || 'light',
        theme_color: data.theme_color || '#8B1538',
      });
      setBgPreview(data.bg_image_url || null);
    } catch (e) {
      setMessage('Failed to load profile');
    }
  };

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSave = async (e) => {
    e.preventDefault();
    try {
      await axios.put('/api/account/profile', form);
      setMessage('Profile updated');
      loadProfile();
      try { await checkAuth(); } catch {}
    } catch (e) {
      setMessage(e.response?.data?.message || 'Failed to update profile');
    }
  };

  const onAvatarChange = (e) => {
    const file = e.target.files?.[0];
    setAvatarFile(file || null);
    if (file) setAvatarPreview(URL.createObjectURL(file));
  };

  const onUploadAvatar = async () => {
    if (!avatarFile) return;
    const fd = new FormData();
    fd.append('avatar', avatarFile);
    try {
      const { data } = await axios.post('/api/account/avatar', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setMessage('Avatar uploaded');
      setAvatarPreview(data.avatar_url);
      loadProfile();
      try { await checkAuth(); } catch {}
    } catch (e) {
      setMessage(e.response?.data?.message || 'Failed to upload avatar');
    }
  };

  // Appearance
  const onAppearanceChange = (e) => {
    const { name, value } = e.target;
    setAppearance(prev => ({ ...prev, [name]: value }));
  };

  const onSaveAppearance = async () => {
    try {
      await axios.put('/api/account/appearance', appearance);
      setMessage('Appearance saved');
      await loadProfile();
      try { await checkAuth(); } catch {}
    } catch (e) {
      setMessage(e.response?.data?.message || 'Failed to save appearance');
    }
  };

  const onBgChange = (e) => {
    const file = e.target.files?.[0];
    setBgFile(file || null);
    if (file) setBgPreview(URL.createObjectURL(file));
  };

  const onUploadBackground = async () => {
    if (!bgFile) return;
    const fd = new FormData();
    fd.append('bg_image', bgFile);
    try {
      const { data } = await axios.post('/api/account/background', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setMessage('Background updated');
      setBgPreview(data.bg_image_url);
      await loadProfile();
      try { await checkAuth(); } catch {}
    } catch (e) {
      setMessage(e.response?.data?.message || 'Failed to upload background');
    }
  };

  const onClearBackground = async () => {
    try {
      await axios.put('/api/account/appearance', { clear_bg: true });
      setBgPreview(null);
      setMessage('Background cleared');
      await loadProfile();
      try { await checkAuth(); } catch {}
    } catch (e) {
      setMessage(e.response?.data?.message || 'Failed to clear background');
    }
  };

  if (!profile) return <div className="loading">Loading account...</div>;

  return (
    <div className="account-page">
      <div className="module-page">
        <div className="page-header">
          <h1>Account Settings</h1>
        </div>

        {message && <div className="alert alert-info">{message}</div>}

        <div className="form-card">
          <h2>Profile</h2>
          <form onSubmit={onSave} className="module-form">
            <div className="form-row avatar-row">
              <div className="avatar-box">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span>{(profile.user?.name || profile.user?.email || 'U').toString().charAt(0).toUpperCase()}</span>
                )}
              </div>
              <div>
                <input type="file" accept="image/*" onChange={onAvatarChange} />
                <div style={{ marginTop: 8 }}>
                  <button type="button" className="btn btn-secondary" onClick={onUploadAvatar} disabled={!avatarFile}>Upload Avatar</button>
                </div>
              </div>
            </div>

            <div className="form-row">
              <input name="name" placeholder="Full name" value={form.name} onChange={onChange} />
              <input name="email" placeholder="Email" value={form.email} onChange={onChange} />
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary">Save Changes</button>
            </div>
          </form>
        </div>

        <div className="form-card">
          <h2>Appearance</h2>
          <div className="module-form">
            <div className="form-row" style={{gridTemplateColumns:'repeat(auto-fit, minmax(220px, 1fr))'}}>
              <div>
                <label style={{display:'block', fontSize:'0.85rem', color:'var(--text-secondary)'}}>Theme Mode</label>
                <select name="theme_mode" value={appearance.theme_mode} onChange={onAppearanceChange}>
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                </select>
              </div>
              <div>
                <label style={{display:'block', fontSize:'0.85rem', color:'var(--text-secondary)'}}>Theme Color</label>
                <input type="color" name="theme_color" value={appearance.theme_color} onChange={onAppearanceChange} style={{width: 56, height: 36, padding: 0, border: '1px solid var(--border-color)', borderRadius: 8}} />
              </div>
            </div>

            <div className="form-actions" style={{marginTop: 12}}>
              <button type="button" className="btn btn-primary" onClick={onSaveAppearance}>Save Appearance</button>
            </div>
          </div>
        </div>

        <div className="form-card">
          <h2>Background</h2>
          <div className="module-form">
            <div className="form-row" style={{alignItems:'center'}}>
              <div style={{minHeight:80}}>
                <div style={{width: '100%', maxWidth: 320, height: 120, border: '1px dashed var(--border-color)', borderRadius: 8, overflow:'hidden', background:'var(--bg-secondary)', display:'flex', alignItems:'center', justifyContent:'center'}}>
                  {bgPreview ? (
                    <img src={bgPreview} alt="Background" style={{width:'100%', height:'100%', objectFit:'cover'}} />
                  ) : (
                    <span style={{color:'var(--text-secondary)'}}>No background selected</span>
                  )}
                </div>
              </div>
              <div>
                <input type="file" accept="image/*" onChange={onBgChange} />
                <div style={{ marginTop: 8, display:'flex', gap:8 }}>
                  <button type="button" className="btn btn-secondary" onClick={onUploadBackground} disabled={!bgFile}>Upload Background</button>
                  <button type="button" className="btn btn-secondary" onClick={onClearBackground}>Clear Background</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="form-card">
          <h2>Security</h2>
          <div className="form-row" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
            <div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Current IP</div>
              <div style={{ fontWeight: 600 }}>{profile.current_ip || 'N/A'}</div>
            </div>
            <div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Last Login IP</div>
              <div style={{ fontWeight: 600 }}>{profile.user?.last_login_ip || 'N/A'}</div>
            </div>
            <div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Last Login At</div>
              <div style={{ fontWeight: 600 }}>{profile.user?.last_login_at ? new Date(profile.user.last_login_at).toLocaleString() : 'N/A'}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
