import React, { useEffect, useState } from 'react';
import axios from 'axios';

// Department options are loaded from the API to keep in sync with Settings → Departments

export default function FacultyForm({ initialData, onSaved, onCancel }) {
    const [formData, setFormData] = useState({
        faculty_id: '',
        first_name: '',
        last_name: '',
        middle_name: '',
        email: '',
        phone: '',
        date_of_birth: '',
        gender: '',
        address: '',
        city: '',
        state: '',
        zip_code: '',
        country: 'Philippines',
        department: '',
        position: '',
        specialization: '',
        hire_date: '',
        employment_type: 'Full-time',
        semester_id: '',
        school_year_id: '',
        status: 'Active'
    });
    const [deptOptions, setDeptOptions] = useState([]);
    const [semesters, setSemesters] = useState([]);
    const [schoolYears, setSchoolYears] = useState([]);
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState(null);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (initialData) {
            // Get the first school year from the relationship, or use school_year_id if available
            const schoolYearId = initialData.school_years && initialData.school_years.length > 0
                ? initialData.school_years[0].id
                : (initialData.school_year_id || '');
            
            setFormData(prev => ({ 
                ...prev, 
                ...initialData,
                school_year_id: schoolYearId 
            }));
            if (initialData.avatar_path) {
                setAvatarPreview(initialData.avatar_path.startsWith('http') ? initialData.avatar_path : `/${initialData.avatar_path}`);
            }
        }
    }, [initialData]);

    useEffect(() => {
        let mounted = true;
        const loadDepartments = async () => {
            try {
                const res = await axios.get('/api/departments');
                const arr = Array.isArray(res.data) ? res.data : (res.data?.departments || []);
                if (mounted) setDeptOptions(arr.map(d => ({ code: d.code, name: d.name })));
            } catch {
                if (mounted) setDeptOptions([]);
            }
        };
        const loadSchoolYears = async () => {
            try {
                const res = await axios.get('/api/school-years');
                const arr = Array.isArray(res.data) ? res.data : [];
                if (mounted) setSchoolYears(arr);
            } catch {
                if (mounted) setSchoolYears([]);
            }
        };
        const loadSemesters = async () => {
            try {
                const res = await axios.get('/api/semesters');
                const arr = Array.isArray(res.data) ? res.data : [];
                console.log('Semesters loaded:', arr);
                if (mounted) setSemesters(arr);
            } catch (error) {
                console.error('Error loading semesters:', error);
                if (mounted) setSemesters([]);
            }
        };
        loadDepartments();
        loadSchoolYears();
        loadSemesters();
        return () => { mounted = false; };
    }, []);

    useEffect(() => {
        if (message) {
            const t = setTimeout(() => setMessage(null), 3000);
            return () => clearTimeout(t);
        }
    }, [message]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        if (errors && errors[name]) {
            const next = { ...errors };
            delete next[name];
            setErrors(next);
        }
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
        setSaving(true);
        try {
            let saved;
            if (formData && formData.id) {
                const res = await axios.put(`/api/faculties/${formData.id}`, formData);
                saved = res.data.faculty ?? res.data;
            } else {
                const res = await axios.post('/api/faculties', formData);
                saved = res.data.faculty ?? res.data;
            }

            if (avatarFile && saved?.id) {
                const fd = new FormData();
                fd.append('avatar', avatarFile);
                await axios.post(`/api/faculties/${saved.id}/avatar`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
            }

            setSaving(false);
            if (onSaved) onSaved(saved);
        } catch (error) {
            console.error('Error saving faculty:', error);
            if (error?.response?.status === 422) {
                setErrors(error.response.data?.errors || {});
                setMessage('Please correct the highlighted fields.');
            } else {
                setMessage(error.response?.data?.message || 'Error saving faculty');
            }
            setSaving(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="module-form student-add-form">
            {message && <div className="alert alert-error">{message}</div>}

            <div className="form-row top-row">
                <div className="avatar-input">
                    <div className="avatar-preview">
                        {avatarPreview ? (
                            <img src={avatarPreview} alt="Faculty avatar preview" />
                        ) : (
                            <div className="placeholder">{(formData.first_name || formData.last_name || 'F').toString().charAt(0).toUpperCase()}</div>
                        )}
                    </div>
                    <label className="btn btn-secondary" style={{marginTop: '8px'}}>
                        Upload Photo
                        <input type="file" accept="image/*" onChange={handleAvatarChange} style={{display:'none'}} />
                    </label>
                </div>
                <div className="top-right">
                    <select name="department" value={formData.department} onChange={handleChange}>
                        <option value="">SELECT DEPARTMENT</option>
                        {deptOptions.map(d => (
                            <option key={d.code} value={d.code}>{d.code} - {d.name}</option>
                        ))}
                    </select>
                    <select name="employment_type" value={formData.employment_type} onChange={handleChange}>
                        <option value="Full-time">FULL-TIME</option>
                        <option value="Part-time">PART-TIME</option>
                        <option value="Contract">CONTRACT</option>
                    </select>
                    <select name="school_year_id" value={formData.school_year_id} onChange={handleChange}>
                        <option value="">SELECT SCHOOL YEAR</option>
                        {schoolYears.map(sy => (
                            <option key={sy.id} value={sy.id}>{sy.label}</option>
                        ))}
                    </select>
                    <select name="semester_id" value={formData.semester_id} onChange={handleChange}>
                        <option value="">SELECT SEMESTER</option>
                        {semesters
                            .filter(sem => !formData.school_year_id || sem.school_year_id == formData.school_year_id)
                            .map(sem => (
                                <option key={sem.id} value={sem.id}>
                                    {sem.name}
                                </option>
                            ))}
                    </select>
                </div>
            </div>

            <div className="form-row cols-1">
                <div>
                    <input name="faculty_id" placeholder="FACULTY ID (AUTO)" value={formData.faculty_id} onChange={handleChange} className={errors.faculty_id ? 'is-invalid' : ''} />
                    {errors.faculty_id && <div className="error-text">{Array.isArray(errors.faculty_id) ? errors.faculty_id[0] : String(errors.faculty_id)}</div>}
                </div>
            </div>

            <div className="form-row cols-2">
                <div>
                    <input name="first_name" placeholder="FIRST NAME" value={formData.first_name} onChange={handleChange} required className={errors.first_name ? 'is-invalid' : ''} />
                    {errors.first_name && <div className="error-text">{Array.isArray(errors.first_name) ? errors.first_name[0] : String(errors.first_name)}</div>}
                </div>
                <div>
                    <input name="last_name" placeholder="LAST NAME" value={formData.last_name} onChange={handleChange} required className={errors.last_name ? 'is-invalid' : ''} />
                    {errors.last_name && <div className="error-text">{Array.isArray(errors.last_name) ? errors.last_name[0] : String(errors.last_name)}</div>}
                </div>
            </div>

            <div className="form-row cols-2">
                <div>
                    <input name="middle_name" placeholder="MIDDLE NAME" value={formData.middle_name} onChange={handleChange} />
                </div>
                <div>
                    <input name="phone" placeholder="PHONE" value={formData.phone} onChange={handleChange} />
                </div>
            </div>

            <div className="form-row cols-2">
                <div>
                    <input name="email" type="email" placeholder="EMAIL" value={formData.email} onChange={handleChange} required className={errors.email ? 'is-invalid' : ''} />
                    {errors.email && <div className="error-text">{Array.isArray(errors.email) ? errors.email[0] : String(errors.email)}</div>}
                </div>
                <div>
                    <input name="date_of_birth" type="date" placeholder="mm/dd/yyyy" value={formData.date_of_birth} onChange={handleChange} />
                </div>
            </div>

            <div className="form-row cols-3">
                <select name="gender" value={formData.gender} onChange={handleChange}>
                    <option value="">SELECT GENDER</option>
                    <option value="Male">MALE</option>
                    <option value="Female">FEMALE</option>
                    <option value="Other">OTHER</option>
                </select>
                <select name="status" value={formData.status} onChange={handleChange}>
                    <option value="Active">ACTIVE</option>
                    <option value="Inactive">INACTIVE</option>
                    <option value="On Leave">ON LEAVE</option>
                    <option value="Archived">ARCHIVED</option>
                </select>
                <input name="position" placeholder="POSITION" value={formData.position} onChange={handleChange} />
            </div>

            <div className="form-row cols-1">
                <input name="specialization" placeholder="SPECIALIZATION" value={formData.specialization} onChange={handleChange} />
            </div>

            <div className="form-row cols-1">
                <input name="address" placeholder="ADDRESS" value={formData.address} onChange={handleChange} />
            </div>

            <div className="form-row cols-1">
                <input name="city" placeholder="CITY" value={formData.city} onChange={handleChange} />
            </div>

            <div className="form-row cols-2-split">
                <input name="country" placeholder="PHILIPPINES" value={formData.country} onChange={handleChange} />
                <input name="zip_code" placeholder="Zip Code" value={formData.zip_code} onChange={handleChange} />
            </div>

            <div className="form-actions with-date">
                <input name="hire_date" type="date" value={formData.hire_date} onChange={handleChange} />
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : (formData && formData.id ? 'Update' : 'Create') + ' FACULTY'}</button>
                <button type="button" className="btn btn-secondary" onClick={onCancel}>CANCEL</button>
            </div>
        </form>
    );
}
