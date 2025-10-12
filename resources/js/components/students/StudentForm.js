import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';

const DEPARTMENTS = [
  { code: 'CSP', name: 'COMPUTER SCIENCE PROGRAM' },
  { code: 'AP', name: 'ACCOUNTANCY PROGRAM' },
  { code: 'BAP', name: 'BUSINESS ADMINISTRATION PROGRAM' },
  { code: 'NP', name: 'NURSING PROGRAM' },
  { code: 'ICJ', name: 'CRIMINOLOGY PROGRAM' },
  { code: 'TEP', name: 'TEACHER ADMINISTRATION PROGRAM' },
  { code: 'ETP', name: 'ENGINEERING PROGRAM' },
];

const YEAR_LEVELS = ['1st-Year', '2nd-Year', '3rd-Year', '4th-Year'];

const MINDANAO_REGIONS = {
  'REGION IX – ZAMBOANGA PENINSULA': {
    provinces: ['ZAMBOANGA DEL NORTE', 'ZAMBOANGA DEL SUR', 'ZAMBOANGA SIBUGAY'],
    cities: ['ZAMBOANGA CITY', 'ISABELA CITY', 'PAGADIAN CITY', 'DIPOLOG CITY', 'DAPITAN CITY']
  },
  'REGION X – NORTHERN MINDANAO': {
    provinces: ['BUKIDNON', 'CAMIGUIN', 'LANAO DEL NORTE', 'MISAMIS OCCIDENTAL', 'MISAMIS ORIENTAL'],
    cities: ['CAGAYAN DE ORO CITY', 'ILIGAN CITY', 'OZAMIZ CITY', 'OROQUIETA CITY', 'TANGUB CITY', 'GINGOOG CITY', 'VALENCIA CITY', 'EL SALVADOR CITY']
  },
  'REGION XI – DAVAO REGION': {
    provinces: ['DAVAO DEL NORTE', 'DAVAO DEL SUR', 'DAVAO ORIENTAL', 'DAVAO DE ORO', 'DAVAO OCCIDENTAL'],
    cities: ['DAVAO CITY', 'PANABO CITY', 'TAGUM CITY', 'SAMAL (ISLAND GARDEN CITY OF SAMAL)', 'DIGOS CITY', 'MATI CITY']
  },
  'REGION XII – SOCCSKSARGEN': {
    provinces: ['COTABATO (NORTH COTABATO)', 'SOUTH COTABATO', 'SULTAN KUDARAT', 'SARANGANI'],
    cities: ['GENERAL SANTOS CITY', 'KORONADAL CITY', 'KIDAPAWAN CITY', 'TACURONG CITY']
  },
  'REGION XIII – CARAGA': {
    provinces: ['AGUSAN DEL NORTE', 'AGUSAN DEL SUR', 'DINAGAT ISLANDS', 'SURIGAO DEL NORTE', 'SURIGAO DEL SUR'],
    cities: ['BUTUAN CITY', 'SURIGAO CITY', 'TANDAG CITY', 'BAYUGAN CITY', 'BISLIG CITY', 'CABADBARAN CITY']
  },
  'BANGSAMORO AUTONOMOUS REGION IN MUSLIM MINDANAO (BARMM)': {
    provinces: ['BASILAN', 'LANAO DEL SUR', 'MAGUINDANAO DEL NORTE', 'MAGUINDANAO DEL SUR', 'SULU', 'TAWI-TAWI'],
    cities: ['COTABATO CITY', 'MARAWI CITY', 'LAMITAN CITY']
  }
};

export default function StudentForm({ initialData, onSaved, onCancel }) {
  const [formData, setFormData] = useState({
    student_id: '',
    first_name: '',
    last_name: '',
    middle_name: '',
    email: '',
    phone: '',
    date_of_birth: '',
    gender: '',
    address: '',
    region: '',
    province: '',
    city: '',
    state: '',
    zip_code: '',
    country: 'Philippines',
    enrollment_date: new Date().toISOString().slice(0,10),
    program: '',
    department: '',
    course: '',
    year_level: '',
    status: 'Active'
  });
  const [courses, setCourses] = useState([]);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const editingId = initialData?.id || null;
  const UPPERCASE_FIELDS = useMemo(() => new Set(['first_name','last_name','middle_name','address','state','country']), []);

  useEffect(() => {
    if (initialData) {
      setFormData({
        student_id: initialData.student_id || '',
        first_name: initialData.first_name || '',
        last_name: initialData.last_name || '',
        middle_name: initialData.middle_name || '',
        email: initialData.email || '',
        phone: initialData.phone || '',
        date_of_birth: initialData.date_of_birth || '',
        gender: initialData.gender || '',
        address: initialData.address || '',
        region: initialData.region || '',
        province: initialData.province || '',
        city: initialData.city || '',
        state: initialData.state || '',
        zip_code: initialData.zip_code || '',
        country: initialData.country || 'Philippines',
        enrollment_date: initialData.enrollment_date || new Date().toISOString().slice(0,10),
        program: initialData.program || '',
        department: initialData.department || '',
        course: initialData.course || '',
        year_level: initialData.year_level || '',
        status: initialData.status || 'Active'
      });
      if (initialData.avatar_path) {
        setAvatarPreview(initialData.avatar_path.startsWith('http') ? initialData.avatar_path : `/${initialData.avatar_path}`);
      } else {
        setAvatarPreview(null);
      }
    }
  }, [initialData]);

  useEffect(() => {
    let mounted = true;
    const loadCourses = async () => {
      try {
        const { data } = await axios.get('/api/settings/key/courses');
        const arr = (() => { try { const j = JSON.parse(data?.setting_value || '[]'); return Array.isArray(j) ? j : []; } catch { return []; } })();
        if (mounted) setCourses(arr);
      } catch { if (mounted) setCourses([]); }
    };
    loadCourses();
    return () => { mounted = false; };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newValue = UPPERCASE_FIELDS.has(name) ? (value || '').toUpperCase() : value;
    setFormData({ ...formData, [name]: newValue });
  };

  const handleRegionChange = (e) => {
    const value = e.target.value;
    setFormData({ ...formData, region: value, province: '', city: '' });
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      setAvatarFile(file);
      try { setAvatarPreview(URL.createObjectURL(file)); } catch { setAvatarPreview(null); }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let saved;
      if (editingId) {
        const res = await axios.put(`/api/students/${editingId}`, formData);
        saved = res.data.student ?? res.data;
      } else {
        const res = await axios.post('/api/students', formData);
        saved = res.data.student ?? res.data;
      }
      if (avatarFile && saved?.id) {
        const fd = new FormData();
        fd.append('avatar', avatarFile);
        await axios.post(`/api/students/${saved.id}/avatar`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      }
      if (onSaved) onSaved(saved);
    } catch (error) {
      console.error('Error saving student:', error);
      alert(error.response?.data?.message || 'Error saving student');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="module-form">
      <div className="form-row">
        <div className="avatar-input">
          <div className="avatar-preview">
            {avatarPreview ? (
              <img src={avatarPreview} alt="Student avatar preview" />
            ) : (
              <div className="placeholder">{(formData.first_name || formData.last_name || 'S').toString().charAt(0).toUpperCase()}</div>
            )}
          </div>
          <label className="btn btn-secondary" style={{marginTop: '8px'}}>
            Upload Photo
            <input type="file" accept="image/*" onChange={handleAvatarChange} style={{display:'none'}} />
          </label>
        </div>
        <input data-uppercase="true" name="first_name" placeholder="First Name *" value={formData.first_name} onChange={handleChange} required />
        <input data-uppercase="true" name="last_name" placeholder="Last Name *" value={formData.last_name} onChange={handleChange} required />
      </div>
      <div className="form-row">
        <input data-uppercase="true" name="middle_name" placeholder="Middle Name" value={formData.middle_name} onChange={handleChange} />
        <input name="email" type="email" placeholder="Email *" value={formData.email} onChange={handleChange} required />
        <input name="phone" placeholder="Phone" value={formData.phone} onChange={handleChange} />
      </div>
      <div className="form-row">
        <input name="date_of_birth" type="date" placeholder="Date of Birth" value={formData.date_of_birth} onChange={handleChange} />
        <select name="gender" value={formData.gender} onChange={handleChange}>
          <option value="">SELECT GENDER</option>
          <option value="Male">MALE</option>
          <option value="Female">FEMALE</option>
          <option value="Other">OTHER</option>
        </select>
        <input name="enrollment_date" type="date" placeholder="Enrollment Date" value={formData.enrollment_date} onChange={handleChange} />
      </div>
      <div className="form-row">
        <select name="department" value={formData.department} onChange={handleChange}>
          <option value="">SELECT DEPARTMENT</option>
          {DEPARTMENTS.map(d => (
            <option key={d.code} value={d.code}>{d.code} - {d.name}</option>
          ))}
        </select>
        <select name="year_level" value={formData.year_level} onChange={handleChange}>
          <option value="">SELECT YEAR LEVEL</option>
          {YEAR_LEVELS.map(y => (<option key={y} value={y}>{y}</option>))}
        </select>
        <select name="status" value={formData.status} onChange={handleChange}>
          <option value="Active">ACTIVE</option>
          <option value="Inactive">INACTIVE</option>
          <option value="Graduated">GRADUATED</option>
          <option value="Suspended">SUSPENDED</option>
        </select>
      </div>
      <div className="form-row">
        <select name="course" value={formData.course} onChange={handleChange}>
          <option value="">SELECT COURSE</option>
          {courses.map(c => (<option key={c} value={c}>{c}</option>))}
        </select>
      </div>
      <div className="form-row">
        <select name="region" value={formData.region} onChange={handleRegionChange}>
          <option value="">SELECT REGION</option>
          {Object.keys(MINDANAO_REGIONS).map(r => (<option key={r} value={r}>{r}</option>))}
        </select>
        <select name="province" value={formData.province} onChange={handleChange}>
          <option value="">SELECT PROVINCE</option>
          {(MINDANAO_REGIONS[formData.region]?.provinces || []).map(p => (<option key={p} value={p}>{p}</option>))}
        </select>
        <select name="city" value={formData.city} onChange={handleChange}>
          <option value="">SELECT CITY</option>
          {(MINDANAO_REGIONS[formData.region]?.cities || []).map(c => (<option key={c} value={c}>{c}</option>))}
        </select>
      </div>
      <div className="form-row">
        <input data-uppercase="true" name="address" placeholder="Address" value={formData.address} onChange={handleChange} />
      </div>
      <div className="form-row">
        <input data-uppercase="true" name="state" placeholder="State" value={formData.state} onChange={handleChange} />
        <input name="zip_code" placeholder="Zip Code" value={formData.zip_code} onChange={handleChange} />
        <input data-uppercase="true" name="country" placeholder="Country" value={formData.country} onChange={handleChange} />
      </div>
      <div className="form-actions">
        <button type="submit" className="btn btn-primary">{editingId ? 'Update' : 'Create'} STUDENT</button>
        <button type="button" className="btn btn-secondary" onClick={onCancel}>CANCEL</button>
      </div>
    </form>
  );
}
