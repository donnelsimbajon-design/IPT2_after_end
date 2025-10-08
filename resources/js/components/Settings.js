import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function Settings() {
    const [settings, setSettings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [message, setMessage] = useState(null);
    const [formData, setFormData] = useState({
        setting_key: '',
        setting_value: '',
        setting_type: 'text',
        category: '',
        description: '',
        is_public: false
    });

    useEffect(() => {
        fetchSettings();
    }, []);

    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => setMessage(null), 3500);
            return () => clearTimeout(timer);
        }
    }, [message]);

    const fetchSettings = async () => {
        try {
            const response = await axios.get('/api/settings');
            setSettings(response.data);
        } catch (error) {
            console.error('Error fetching settings:', error);
            setMessage('Error loading settings');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await axios.put(`/api/settings/${editingId}`, formData);
                setMessage('Setting updated successfully');
            } else {
                await axios.post('/api/settings', formData);
                setMessage('Setting created successfully');
            }
            fetchSettings();
            resetForm();
        } catch (error) {
            console.error('Error saving setting:', error);
            setMessage(error.response?.data?.message || 'Error saving setting');
        }
    };

    const handleEdit = (setting) => {
        setFormData(setting);
        setEditingId(setting.id);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this setting?')) return;
        try {
            await axios.delete(`/api/settings/${id}`);
            setMessage('Setting deleted successfully');
            fetchSettings();
        } catch (error) {
            console.error('Error deleting setting:', error);
            setMessage('Error deleting setting');
        }
    };

    const resetForm = () => {
        setFormData({
            setting_key: '',
            setting_value: '',
            setting_type: 'text',
            category: '',
            description: '',
            is_public: false
        });
        setEditingId(null);
        setShowForm(false);
    };

    const handleChange = (e) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setFormData({ ...formData, [e.target.name]: value });
    };

    const groupedSettings = settings.reduce((acc, setting) => {
        const category = setting.category || 'General';
        if (!acc[category]) acc[category] = [];
        acc[category].push(setting);
        return acc;
    }, {});

    if (loading) return <div className="loading">Loading settings...</div>;

    return (
        <div className="module-page">
            <div className="page-header">
                <h1>System Settings</h1>
                <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
                    {showForm ? 'Cancel' : '+ Add Setting'}
                </button>
            </div>

            {message && <div className="alert alert-info">{message}</div>}

            {showForm && (
                <div className="form-card">
                    <h2>{editingId ? 'Edit Setting' : 'Add New Setting'}</h2>
                    <form onSubmit={handleSubmit} className="module-form">
                        <div className="form-row">
                            <input 
                                name="setting_key" 
                                placeholder="Setting Key *" 
                                value={formData.setting_key} 
                                onChange={handleChange} 
                                required 
                            />
                            <input 
                                name="setting_value" 
                                placeholder="Setting Value" 
                                value={formData.setting_value} 
                                onChange={handleChange} 
                            />
                        </div>
                        <div className="form-row">
                            <select name="setting_type" value={formData.setting_type} onChange={handleChange}>
                                <option value="text">Text</option>
                                <option value="number">Number</option>
                                <option value="boolean">Boolean</option>
                                <option value="json">JSON</option>
                            </select>
                            <input 
                                name="category" 
                                placeholder="Category" 
                                value={formData.category} 
                                onChange={handleChange} 
                            />
                        </div>
                        <div className="form-row">
                            <textarea 
                                name="description" 
                                placeholder="Description" 
                                value={formData.description} 
                                onChange={handleChange}
                                rows="3"
                            />
                        </div>
                        <div className="form-row">
                            <label className="checkbox-label">
                                <input 
                                    type="checkbox" 
                                    name="is_public" 
                                    checked={formData.is_public} 
                                    onChange={handleChange} 
                                />
                                <span>Public (visible to non-admin users)</span>
                            </label>
                        </div>
                        <div className="form-actions">
                            <button type="submit" className="btn btn-primary">
                                {editingId ? 'Update' : 'Create'} Setting
                            </button>
                            <button type="button" className="btn btn-secondary" onClick={resetForm}>Cancel</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="settings-groups">
                {Object.entries(groupedSettings).map(([category, categorySettings]) => (
                    <div key={category} className="settings-group">
                        <h2>{category}</h2>
                        <div className="table-card">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Key</th>
                                        <th>Value</th>
                                        <th>Type</th>
                                        <th>Description</th>
                                        <th>Public</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {categorySettings.map(setting => (
                                        <tr key={setting.id}>
                                            <td><code>{setting.setting_key}</code></td>
                                            <td>{setting.setting_value}</td>
                                            <td>{setting.setting_type}</td>
                                            <td>{setting.description}</td>
                                            <td>{setting.is_public ? 'Yes' : 'No'}</td>
                                            <td className="actions">
                                                <button className="btn-icon btn-edit" onClick={() => handleEdit(setting)}>Edit</button>
                                                <button className="btn-icon btn-delete" onClick={() => handleDelete(setting.id)}>Delete</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
