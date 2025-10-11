import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';

const DEPARTMENTS = [
  { code: 'CSP', name: 'Computer Science Program' },
  { code: 'AP', name: 'Accountancy Program' },
  { code: 'BAP', name: 'Business Administration Program' },
  { code: 'NP', name: 'Nursing Program' },
  { code: 'ICJ', name: 'Criminology Program' },
  { code: 'TEP', name: 'Teacher Education Program' },
  { code: 'ETP', name: 'Engineering Program' },
];

const YEAR_LEVELS = ['1st-Year', '2nd-Year', '3rd-Year', '4th-Year'];

const MINDANAO_REGIONS = {
  'Region IX – Zamboanga Peninsula': {
    provinces: ['Zamboanga del Norte', 'Zamboanga del Sur', 'Zamboanga Sibugay'],
    cities: ['Zamboanga City', 'Isabela City', 'Pagadian City', 'Dipolog City', 'Dapitan City']
  },
  'Region X – Northern Mindanao': {
    provinces: ['Bukidnon', 'Camiguin', 'Lanao del Norte', 'Misamis Occidental', 'Misamis Oriental'],
    cities: ['Cagayan de Oro City', 'Iligan City', 'Ozamiz City', 'Oroquieta City', 'Tangub City', 'Gingoog City', 'Valencia City', 'El Salvador City']
  },
  'Region XI – Davao Region': {
    provinces: ['Davao del Norte', 'Davao del Sur', 'Davao Oriental', 'Davao de Oro', 'Davao Occidental'],
    cities: ['Davao City', 'Panabo City', 'Tagum City', 'Samal (Island Garden City of Samal)', 'Digos City', 'Mati City']
  },
  'Region XII – SOCCSKSARGEN': {
    provinces: ['Cotabato (North Cotabato)', 'South Cotabato', 'Sultan Kudarat', 'Sarangani'],
    cities: ['General Santos City', 'Koronadal City', 'Kidapawan City', 'Tacurong City']
  },
  'Region XIII – Caraga': {
    provinces: ['Agusan del Norte', 'Agusan del Sur', 'Dinagat Islands', 'Surigao del Norte', 'Surigao del Sur'],
    cities: ['Butuan City', 'Surigao City', 'Tandag City', 'Bayugan City', 'Bislig City', 'Cabadbaran City']
  },
  'Bangsamoro Autonomous Region in Muslim Mindanao (BARMM)': {
    provinces: ['Basilan', 'Lanao del Sur', 'Maguindanao del Norte', 'Maguindanao del Sur', 'Sulu', 'Tawi-Tawi'],
    cities: ['Cotabato City', 'Marawi City', 'Lamitan City']
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
    year_level: '',
    status: 'Active'
  });
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
          <option value="">Select Gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>
        <input name="enrollment_date" type="date" placeholder="Enrollment Date" value={formData.enrollment_date} onChange={handleChange} />
      </div>
      <div className="form-row">
        <select name="department" value={formData.department} onChange={handleChange}>
          <option value="">Select Department</option>
          {DEPARTMENTS.map(d => (
            <option key={d.code} value={d.code}>{d.code} - {d.name}</option>
          ))}
        </select>
        <select name="year_level" value={formData.year_level} onChange={handleChange}>
          <option value="">Select Year Level</option>
          {YEAR_LEVELS.map(y => (<option key={y} value={y}>{y}</option>))}
        </select>
        <select name="status" value={formData.status} onChange={handleChange}>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
          <option value="Graduated">Graduated</option>
          <option value="Suspended">Suspended</option>
        </select>
      </div>
      <div className="form-row">
        <select name="region" value={formData.region} onChange={handleRegionChange}>
          <option value="">Select Region</option>
          {Object.keys(MINDANAO_REGIONS).map(r => (<option key={r} value={r}>{r}</option>))}
        </select>
        <select name="province" value={formData.province} onChange={handleChange}>
          <option value="">Select Province</option>
          {(MINDANAO_REGIONS[formData.region]?.provinces || []).map(p => (<option key={p} value={p}>{p}</option>))}
        </select>
        <select name="city" value={formData.city} onChange={handleChange}>
          <option value="">Select City</option>
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
        <button type="submit" className="btn btn-primary">{editingId ? 'Update' : 'Create'} Student</button>
        <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}
