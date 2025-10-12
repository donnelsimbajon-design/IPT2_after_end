import React, { useEffect, useState, useRef } from 'react';
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
  const [loading, setLoading] = useState(true);
  const [showDeviceDetails, setShowDeviceDetails] = useState(false);
  const [placeLabels, setPlaceLabels] = useState({ gps: '', currentIp: '', lastIp: '' });
  const [mapInfo, setMapInfo] = useState('');
  const [showIpLayers, setShowIpLayers] = useState(true);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const mapRef = useRef(null);
  const mapElRef = useRef(null);
  const markerRef = useRef(null);
  const butuanMarkerRef = useRef(null);
  const lastLoginMarkerRef = useRef(null);
  const accuracyCircleRef = useRef(null);
  const BUTUAN_CENTER = [8.9475, 125.5406];
  const currentIpMarkerRef = useRef(null);
  const COLOR_PRIMARY = '#8B1538'; // device (GPS)
  const COLOR_GOLD = '#D4AF37';    // current IP approx
  const COLOR_BLUE = '#3B82F6';    // last login IP approx
  const COLOR_GRAY = '#6B7280';    // fallback
  const COLOR_GREEN = '#22C55E';   // history item
  const geoWatchIdRef = useRef(null);
  const visHandlerRef = useRef(null);
  const historyMarkerRef = useRef(null);

  const loadLeaflet = () => new Promise((resolve, reject) => {
    if (window.L) return resolve(window.L);
    let css = document.querySelector('link[data-leaflet]');
    if (!css) {
      css = document.createElement('link');
      css.setAttribute('data-leaflet', '1');
      css.rel = 'stylesheet';
      css.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(css);
    }
    let js = document.querySelector('script[data-leaflet]');
    if (js) {
      js.addEventListener('load', () => resolve(window.L));
      return;
    }
    js = document.createElement('script');
    js.setAttribute('data-leaflet', '1');
    js.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    js.onload = () => resolve(window.L);
    js.onerror = reject;
    document.head.appendChild(js);
  });

  useEffect(() => {
    loadProfile();
  }, []);

  useEffect(() => {
    let cancelled = false;
    loadLeaflet()
      .then((L) => {
        if (cancelled) return;
      })
      .catch(() => {});
    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markerRef.current = null;
        butuanMarkerRef.current = null;
      }
      try {
        if (geoWatchIdRef.current) {
          navigator.geolocation && navigator.geolocation.clearWatch(geoWatchIdRef.current);
          geoWatchIdRef.current = null;
        }
      } catch {}
      try {
        if (visHandlerRef.current) {
          document.removeEventListener('visibilitychange', visHandlerRef.current);
          visHandlerRef.current = null;
        }
      } catch {}
    };

  const viewHistoryOnMap = async (item) => {
    if (!mapRef.current || !item) return;
    let ip = item.ip_address || null;
    if (!ip || isPrivateIp(ip)) {
      setMapInfo('History IP is private or local. No public geolocation available.');
      return;
    }
    const latlng = await geocodeIp(ip);
    if (!latlng) { setMapInfo('No location found for this IP.'); return; }
    const L = window.L;
    if (historyMarkerRef.current) {
      historyMarkerRef.current.setLatLng(latlng);
    } else {
      historyMarkerRef.current = L.circleMarker(latlng, { radius: 6, color: COLOR_GREEN, fillColor: COLOR_GREEN, fillOpacity: 0.9, weight: 2 })
        .addTo(mapRef.current)
        .bindPopup('History device (by IP)');
    }
    try {
      const label = await reverseGeocode(latlng[0], latlng[1]);
      try { historyMarkerRef.current.bindPopup(label ? `History device (by IP) — ${label}` : 'History device (by IP)'); } catch {}
    } catch {}
    mapRef.current.flyTo(latlng, 12, { duration: 0.6 });
  };
  }, []);

  useEffect(() => {
    if (loading) return;
    let cancelled = false;
    loadLeaflet().then((L) => {
      if (cancelled || !mapElRef.current) return;
      if (!mapRef.current) {
        mapRef.current = L.map(mapElRef.current).setView(BUTUAN_CENTER, 12);
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors',
        }).addTo(mapRef.current);
        if (!butuanMarkerRef.current) {
          butuanMarkerRef.current = L.marker(BUTUAN_CENTER)
            .addTo(mapRef.current)
            .bindPopup('Butuan City');
        }
        // Auto-attempt to locate the user's device once on load
        setTimeout(() => locateMe(), 300);
        // Do NOT auto-plot IP-based markers here. We'll only show them if GPS is unavailable/denied.
        // Re-locate on tab focus
        try {
          if (!visHandlerRef.current) {
            const onVis = () => { if (!document.hidden) locateMe(); };
            document.addEventListener('visibilitychange', onVis);
            visHandlerRef.current = onVis;
          }
        } catch {}
      }
    }).catch(() => {});
    return () => { cancelled = true; };
  }, [loading]);

  const loadProfile = async () => {
    setLoading(true);
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
      try { await loadHistory(); } catch {}
    } catch (e) {
      const status = e.response?.status;
      setMessage(status === 401 ? 'Please sign in to view account settings.' : 'Failed to load profile');
      setProfile({ user: { name: '', email: '' }, current_ip: null });
      setAvatarPreview(null);
      setBgPreview(null);
    } finally {
      setLoading(false);
    }
  };

  const loadHistory = async () => {
    setHistoryLoading(true);
    try {
      const { data } = await axios.get('/api/account/history');
      setHistory(Array.isArray(data.history) ? data.history : []);
    } finally {
      setHistoryLoading(false);
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

  const locateMe = () => {
    if (!navigator.geolocation || !mapRef.current) return;
    const L = window.L;
    const onSuccess = async (pos) => {
      const { latitude, longitude, accuracy } = pos.coords;
      const latlng = [latitude, longitude];
      if (markerRef.current) {
        markerRef.current.setLatLng(latlng);
      } else {
        markerRef.current = L.circleMarker(latlng, { radius: 7, color: COLOR_PRIMARY, fillColor: COLOR_PRIMARY, fillOpacity: 0.9, weight: 2 })
          .addTo(mapRef.current)
          .bindPopup('Your location');
      }
      // accuracy circle ~ meters
      if (accuracyCircleRef.current) {
        accuracyCircleRef.current.setLatLng(latlng).setRadius(accuracy || 30);
      } else {
        accuracyCircleRef.current = L.circle(latlng, { radius: accuracy || 30, color: COLOR_PRIMARY, opacity: 0.3, weight: 1, fillOpacity: 0.08 }).addTo(mapRef.current);
      }
      // Remove fallback pin if GPS is available to avoid confusion
      try { if (butuanMarkerRef.current) { mapRef.current.removeLayer(butuanMarkerRef.current); butuanMarkerRef.current = null; } } catch {}
      // Hide any IP-based markers when GPS is granted
      removeIpLayers();
      setShowIpLayers(false);
      try {
        const label = await reverseGeocode(latitude, longitude);
        setPlaceLabels((s) => ({ ...s, gps: label }));
        try { markerRef.current.bindPopup(label ? `Your location — ${label}` : 'Your location'); } catch {}
      } catch {}
      setMapInfo('Using precise device location.');
      fitBoundsToMarkers();
    };
    const onError = () => {
      setMapInfo('Using IP-based approximate location. Click Locate and allow location permission for precise results.');
      setShowIpLayers(true);
      // GPS unavailable -> ensure IP-based layers are visible
      ensureIpLayers();
    };
    navigator.geolocation.getCurrentPosition(onSuccess, onError, { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 });
    // Optional: start watch for better fixes
    try {
      if (geoWatchIdRef.current) {
        navigator.geolocation.clearWatch(geoWatchIdRef.current);
        geoWatchIdRef.current = null;
      }
      geoWatchIdRef.current = navigator.geolocation.watchPosition(onSuccess, () => {}, { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 });
    } catch {}
  };

  const removeIpLayers = () => {
    if (!mapRef.current) return;
    try { if (currentIpMarkerRef.current) { mapRef.current.removeLayer(currentIpMarkerRef.current); currentIpMarkerRef.current = null; } } catch {}
    try { if (lastLoginMarkerRef.current) { mapRef.current.removeLayer(lastLoginMarkerRef.current); lastLoginMarkerRef.current = null; } } catch {}
    try { if (historyMarkerRef.current) { mapRef.current.removeLayer(historyMarkerRef.current); historyMarkerRef.current = null; } } catch {}
  };

  const ensureIpLayers = async () => {
    try { await plotLastLoginDeviceLocation(); } catch {}
    try { await plotCurrentIpLocation(); } catch {}
  };

  const isPrivateIp = (ip) => {
    if (!ip) return true;
    return ip.startsWith('127.') || ip.startsWith('10.') || ip.startsWith('192.168.') || /^172\.(1[6-9]|2\d|3[0-1])\./.test(ip);
  };

  const geocodeIp = async (ip) => {
    try {
      const { data } = await axios.get(`https://ipapi.co/${ip}/json/`);
      if (data && typeof data.latitude === 'number' && typeof data.longitude === 'number') {
        return [data.latitude, data.longitude];
      }
    } catch {}
    return null;
  };

  const fetchPublicIp = async () => {
    try {
      const { data } = await axios.get('https://api.ipify.org?format=json');
      return data?.ip || null;
    } catch {
      return null;
    }
  };

  const reverseGeocode = async (lat, lon) => {
    try {
      const { data } = await axios.get('https://nominatim.openstreetmap.org/reverse', { params: { lat, lon, format: 'jsonv2' } });
      const name = data?.address?.city || data?.address?.town || data?.address?.village || data?.address?.municipality || data?.display_name || '';
      return name;
    } catch { return ''; }
  };

  const plotLastLoginDeviceLocation = async () => {
    if (!mapRef.current) return;
    const L = window.L;
    let ip = profile?.user?.last_login_ip || null;
    if (!ip || isPrivateIp(ip)) {
      // if last login is local/dev, try current public IP
      ip = await fetchPublicIp();
    }
    if (!ip) return;
    const latlng = await geocodeIp(ip);
    if (!latlng) return;
    if (lastLoginMarkerRef.current) {
      lastLoginMarkerRef.current.setLatLng(latlng);
    } else {
      lastLoginMarkerRef.current = L.circleMarker(latlng, { radius: 6, color: COLOR_BLUE, fillColor: COLOR_BLUE, fillOpacity: 0.9, weight: 2 })
        .addTo(mapRef.current)
        .bindPopup('Last login device (by IP)');
    }
    try {
      const label = await reverseGeocode(latlng[0], latlng[1]);
      setPlaceLabels((s) => ({ ...s, lastIp: label }));
      try { lastLoginMarkerRef.current.bindPopup(label ? `Last login device (by IP) — ${label}` : 'Last login device (by IP)'); } catch {}
    } catch {}
    fitBoundsToMarkers();
  };

  const plotCurrentIpLocation = async () => {
    if (!mapRef.current) return;
    const L = window.L;
    let ip = profile?.current_ip || null;
    if (!ip || isPrivateIp(ip)) {
      ip = await fetchPublicIp();
    }
    if (!ip) return;
    const latlng = await geocodeIp(ip);
    if (!latlng) return;
    if (currentIpMarkerRef.current) {
      currentIpMarkerRef.current.setLatLng(latlng);
    } else {
      currentIpMarkerRef.current = L.circleMarker(latlng, { radius: 6, color: COLOR_GOLD, fillColor: COLOR_GOLD, fillOpacity: 0.9, weight: 2 })
        .addTo(mapRef.current)
        .bindPopup('Current IP location (approx)');
    }
    try {
      const label = await reverseGeocode(latlng[0], latlng[1]);
      setPlaceLabels((s) => ({ ...s, currentIp: label }));
      try { currentIpMarkerRef.current.bindPopup(label ? `Current IP location (approx) — ${label}` : 'Current IP location (approx)'); } catch {}
    } catch {}
    fitBoundsToMarkers();
  };

  const fitBoundsToMarkers = () => {
    if (!mapRef.current) return;
    const L = window.L;
    const latlngs = [];
    if (butuanMarkerRef.current) latlngs.push(butuanMarkerRef.current.getLatLng());
    if (markerRef.current) latlngs.push(markerRef.current.getLatLng());
    if (showIpLayers) {
      if (currentIpMarkerRef.current) latlngs.push(currentIpMarkerRef.current.getLatLng());
      if (lastLoginMarkerRef.current) latlngs.push(lastLoginMarkerRef.current.getLatLng());
    }
    if (latlngs.length === 0) return;
    if (latlngs.length === 1) {
      mapRef.current.setView(latlngs[0], 13);
    } else {
      const bounds = L.latLngBounds(latlngs);
      mapRef.current.fitBounds(bounds.pad(0.2));
    }
  };

  const viewLocation = () => {
    if (!mapRef.current) return;
    if (markerRef.current) {
      const latlng = markerRef.current.getLatLng();
      mapRef.current.flyTo(latlng, 13, { duration: 0.6 });
      try { markerRef.current.openPopup(); } catch {}
    } else if (butuanMarkerRef.current) {
      const latlng = butuanMarkerRef.current.getLatLng();
      mapRef.current.flyTo(latlng, 12, { duration: 0.6 });
      try { butuanMarkerRef.current.openPopup(); } catch {}
    } else {
      locateMe();
    }
  };

  const toggleDeviceDetails = () => setShowDeviceDetails((v) => !v);

  if (loading) return <div className="loading">Loading account...</div>;

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
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Current Device</div>
              <div style={{ fontWeight: 600 }}>{profile.current_device?.label || 'N/A'}</div>
            </div>
            <div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Current IP</div>
              <div style={{ fontWeight: 600 }}>{profile.current_ip || 'N/A'}</div>
            </div>
            <div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Last Login Device</div>
              <div style={{ fontWeight: 600 }}>{profile.last_login_device?.label || 'N/A'}</div>
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
          <div className="security-map-wrap">
            <div className="security-map-header">
              <div>Security Map</div>
              <div className="map-actions">
                <button type="button" className="btn btn-secondary" onClick={viewLocation}>View Location</button>
                <button type="button" className="btn btn-secondary" onClick={toggleDeviceDetails}>View Device Used</button>
                <button type="button" className="btn btn-secondary" onClick={locateMe}>Locate</button>
              </div>
            </div>
            <div className="map-info-note">{mapInfo}</div>
            <div ref={mapElRef} className="security-map" />
            <div className="map-legend">
              <div className="legend-item"><span className="legend-dot" style={{background: COLOR_PRIMARY}} /> <span>Device (GPS){placeLabels.gps ? ` — ${placeLabels.gps}` : ''}</span></div>
              {showIpLayers && (
                <>
                  <div className="legend-item"><span className="legend-dot" style={{background: COLOR_GOLD}} /> <span>Current IP (approx){placeLabels.currentIp ? ` — ${placeLabels.currentIp}` : ''}</span></div>
                  <div className="legend-item"><span className="legend-dot" style={{background: COLOR_BLUE}} /> <span>Last Login IP (approx){placeLabels.lastIp ? ` — ${placeLabels.lastIp}` : ''}</span></div>
                </>
              )}
              <div className="legend-item"><span className="legend-dot" style={{background: COLOR_GREEN}} /> <span>History device (by IP)</span></div>
            </div>
          </div>
          {showDeviceDetails && (
            <div className="device-details">
              <div className="details-grid">
                <div>
                  <div className="label">Device Type</div>
                  <div className="value">{profile.current_device?.device_type || 'Unknown'}</div>
                </div>
                <div>
                  <div className="label">OS</div>
                  <div className="value">{profile.current_device?.os || 'Unknown'}</div>
                </div>
                <div>
                  <div className="label">Browser</div>
                  <div className="value">{profile.current_device?.browser || 'Unknown'}</div>
                </div>
                <div>
                  <div className="label">Current IP</div>
                  <div className="value">{profile.current_ip || 'N/A'}</div>
                </div>
                <div>
                  <div className="label">User-Agent</div>
                  <div className="value ua">{profile.current_user_agent || 'N/A'}</div>
                </div>
              </div>
            </div>
          )}
          <div className="history-panel">
            <div className="history-header">Device/Login History</div>
            <div className="history-list">
              {historyLoading && <div className="history-row">Loading history…</div>}
              {!historyLoading && history.length === 0 && <div className="history-row">No recent logins.</div>}
              {!historyLoading && history.slice(0, 10).map((h) => (
                <div key={h.id} className="history-row">
                  <div className="when">{h.created_at ? new Date(h.created_at).toLocaleString() : ''}</div>
                  <div className="device">{h.device?.label || 'Unknown'}</div>
                  <div className="ip">{h.ip_address || 'N/A'}</div>
                  <div className="actions"><button type="button" className="btn btn-secondary" onClick={() => viewHistoryOnMap(h)}>View on Map</button></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
