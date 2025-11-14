import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function DeptPeopleListModal({ code, type, onClose }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const isStudents = String(type).toLowerCase() === 'students';

  useEffect(() => {
    let mounted = true;
    const fetchData = async () => {
      setLoading(true);
      try {
        const url = isStudents ? '/api/students' : '/api/faculties';
        const res = await axios.get(url, { params: { department: code } });
        if (!mounted) return;
        const arr = Array.isArray(res.data) ? res.data : [];
        setItems(arr);
      } catch (e) {
        if (!mounted) return;
        setItems([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchData();
    return () => { mounted = false; };
  }, [code, isStudents]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape' && onClose) onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const title = isStudents ? 'Students' : 'Faculty';

  return (
    <div className="student-view-modal" onMouseDown={(e)=>{ if (e.target === e.currentTarget && onClose) onClose(); }}>
      <div className="student-view-card" role="dialog" aria-modal="true" aria-label={`${title} in ${code}`}>
        <div className="page-header">
          <h2>{title} List</h2>
          <button className="btn btn-secondary" onClick={onClose}>Close</button>
        </div>
        <div className="people-list">
          {!loading && items.length === 0 && (
            <div className="empty">No records found.</div>
          )}
          {!loading && items.map((p) => {
            const first = (p.first_name || '').toString().trim();
            const last = (p.last_name || '').toString().trim();
            const name = [first, last].filter(Boolean).join(' ') || (p.email || 'Unknown');
            const avatar = p.avatar_path;
            const initial = (first || last || title.charAt(0)).toString().charAt(0).toUpperCase();
            const status = p.status === 'Unactive' ? 'Inactive' : (p.status || 'Active');
            const badgeClass = `badge badge-${String(status).toLowerCase().replace(' ', '-')}`;
            const sub = isStudents
              ? [p.course, p.year_level].filter(Boolean).join(' • ')
              : [p.position || p.employment_type].filter(Boolean).join(' • ');
            return (
              <div key={p.id || `${name}-${Math.random()}`} className="person-row">
                <div className="avatar">
                  {avatar ? (
                    <img src={avatar.startsWith('http') ? avatar : `/${avatar}`} alt="Avatar" />
                  ) : (
                    <span>{initial}</span>
                  )}
                </div>
                <div className="middle">
                  <div className="name" title={name}>{name}</div>
                  {sub ? (<div className="sub" title={sub}>{sub}</div>) : null}
                </div>
                <div className="right">
                  <span className={badgeClass}>{status}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
