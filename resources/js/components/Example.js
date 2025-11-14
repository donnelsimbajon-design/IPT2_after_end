import React, { useEffect, useState } from "react";
import axios from 'axios'; // ensure axios is imported
import { FiCheck, FiX, FiEdit2, FiTrash2 } from 'react-icons/fi';

export default function Example() {
    const [fname, setFirstname] = useState("");
    const [lname, setLastname] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [address, setAddress] = useState("");
    const [city, setCity] = useState("");
    const [state, setState] = useState("");
    const [zip, setZip] = useState("");
    const [country, setCountry] = useState("");
    const [profiles, setProfiles] = useState([]);
    const [errors, setErrors] = useState({});
    const [message, setMessage] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [editingData, setEditingData] = useState({});
    const [originalEditingData, setOriginalEditingData] = useState({});

    // clear notifications automatically
    useEffect(() => {
        if (!message) return;
        const t = setTimeout(() => setMessage(null), 3500);
        return () => clearTimeout(t);
    }, [message]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setErrors({});
            setMessage(null);
            // <-- changed endpoint to /api/profiles
            const response = await axios.post("/api/profiles", {
                fname,
                lname,
                email,
                phone,
                address,
                city,
                state,
                zip,
                country
            });
            setMessage('Profile created!');
            // clear fields
            setFirstname("");
            setLastname("");
            setEmail("");
            setPhone("");
            setAddress("");
            setCity("");
            setState("");
            setZip("");
            setCountry("");

            // update profiles list from server / or prepend newly created profile
            if (response.data && response.data.profile) {
                setProfiles((p) => [response.data.profile, ...p]);
            } else {
                fetchProfiles();
            }
        } catch (error) {
            // handle validation errors from Laravel (422) and other errors
            if (error.response && error.response.status === 422) {
                const respErrors = error.response.data.errors || error.response.data;
                setErrors(respErrors);
            } else {
                console.error('Error creating profile:', error);
                const serverMsg = error.response && error.response.data && (error.response.data.message || error.response.data.error);
                setMessage(serverMsg || 'Error creating profile.');
            }
        }
    };


    const fetchProfiles = async () => {
        try {
            const response = await axios.get("/api/profiles"); // Use the correct endpoint
            setProfiles(response.data); // Set all profiles to state
        } catch (error) {
            console.error("Error fetching profiles:", error);
        }
    };

    const startEdit = (profile) => {
        setEditingId(profile.id);
        setEditingData({ ...profile });
        setOriginalEditingData({ ...profile });
        setErrors({});
        setMessage(null);
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditingData({});
        setOriginalEditingData({});
    }

    const submitEdit = async (e) => {
        e.preventDefault();
        try {
            // prefer PATCH for partial update; fall back to PUT if server requires it
            let resp;
            try {
                resp = await axios.patch(`/api/profiles/${editingId}`, editingData);
            } catch (patchErr) {
                // if patch not allowed, try PUT
                resp = await axios.put(`/api/profiles/${editingId}`, editingData);
            }

            // update local list
            setProfiles((list) => list.map(p => p.id === editingId ? resp.data.profile : p));
            setMessage('Profile updated');
            cancelEdit();
        } catch (err) {
            if (err.response && err.response.status === 422) {
                setErrors(err.response.data.errors || {});
            } else {
                console.error('Update error', err);
                setMessage('Error updating profile');
            }
        }
    };

    const deleteProfile = async (id) => {
        // Only remove locally — do not send DELETE to server
        if (!confirm('Delete this profile?')) return;
        // remove from local state
        setProfiles((list) => list.filter(p => p.id !== id));
        if (editingId === id) cancelEdit();
        setMessage('Profile removed from view (not deleted on server)');
    }


    useEffect(() => {
        fetchProfiles();
    }, []);


    const isEditingDirty = () => {
        return JSON.stringify(editingData) !== JSON.stringify(originalEditingData);
    };

    return (
        <div className="home">
            <div className="container">
                <form onSubmit={handleSubmit} className="profile-form" aria-label="Create profile form">
                    {message && <div className="message success" role="status">{message}</div>}
                    {Object.keys(errors).length > 0 && (
                        <div className="message error" role="alert">
                            {Object.entries(errors).map(([k, v]) => (
                                <div key={k}>{Array.isArray(v) ? v.join(' ') : v}</div>
                            ))}
                        </div>
                    )}
                    <div className="form-grid">
                      <input
                          type="text"
                          placeholder="Firstname"
                          value={fname}
                          onChange={(e) => setFirstname(e.target.value)}
                          aria-label="Firstname"
                      />
                      <input
                          type="text"
                          placeholder="Lastname"
                          value={lname}
                          onChange={(e) => setLastname(e.target.value)}
                          aria-label="Lastname"
                      />
                      <input
                          type="email"
                          placeholder="Email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          aria-label="Email"
                      />
                      <input
                          type="text"
                          placeholder="Phone"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          aria-label="Phone"
                      />
                      <input
                          type="text"
                          placeholder="Address"
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          aria-label="Address"
                      />
                      <input
                          type="text"
                          placeholder="City"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          aria-label="City"
                      />
                      <input
                          type="text"
                          placeholder="State"
                          value={state}
                          onChange={(e) => setState(e.target.value)}
                          aria-label="State"
                      />
                      <input
                          type="text"
                          placeholder="Zip"
                          value={zip}
                          onChange={(e) => setZip(e.target.value)}
                          aria-label="Zip"
                      />
                      <input
                          type="text"
                          placeholder="Country"
                          value={country}
                          onChange={(e) => setCountry(e.target.value)}
                          aria-label="Country"
                      />
                    </div>
                    <div className="form-actions">
                      <button className="btn primary" type="submit">Submit</button>
                    </div>
                </form>

                <div className="table-wrapper" role="region" aria-label="Profiles list">
                  <table>
                    <thead>
                        <tr>
                            <th>Firstname</th>
                            <th>Lastname</th>
                            <th>Email</th>
                            <th>Phone</th>
                            <th>Address</th>
                            <th>City</th>
                            <th>State</th>
                            <th>Zip</th>
                            <th>Country</th>
                            <th className="actions-head">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {profiles.map((profile) => (
                            <tr key={profile.id} className={editingId === profile.id ? 'editing' : ''}>
                                <td>
                                    {editingId === profile.id ? (
                                        <div className="cell-input"><input value={editingData.fname || ''} onChange={e => setEditingData(d => ({ ...d, fname: e.target.value }))} aria-label="Edit firstname" /></div>
                                    ) : profile.fname}
                                </td>
                                <td>
                                    {editingId === profile.id ? (
                                        <div className="cell-input"><input value={editingData.lname || ''} onChange={e => setEditingData(d => ({ ...d, lname: e.target.value }))} aria-label="Edit lastname" /></div>
                                    ) : profile.lname}
                                </td>
                                <td>
                                    {editingId === profile.id ? (
                                        <div className="cell-input"><input value={editingData.email || ''} onChange={e => setEditingData(d => ({ ...d, email: e.target.value }))} aria-label="Edit email" /></div>
                                    ) : profile.email}
                                </td>
                                <td>
                                    {editingId === profile.id ? (
                                        <div className="cell-input"><input value={editingData.phone || ''} onChange={e => setEditingData(d => ({ ...d, phone: e.target.value }))} aria-label="Edit phone" /></div>
                                    ) : profile.phone}
                                </td>
                                <td>
                                    {editingId === profile.id ? (
                                        <div className="cell-input"><input value={editingData.address || ''} onChange={e => setEditingData(d => ({ ...d, address: e.target.value }))} aria-label="Edit address" /></div>
                                    ) : profile.address}
                                </td>
                                <td>
                                    {editingId === profile.id ? (
                                        <div className="cell-input"><input value={editingData.city || ''} onChange={e => setEditingData(d => ({ ...d, city: e.target.value }))} aria-label="Edit city" /></div>
                                    ) : profile.city}
                                </td>
                                <td>
                                    {editingId === profile.id ? (
                                        <div className="cell-input"><input value={editingData.state || ''} onChange={e => setEditingData(d => ({ ...d, state: e.target.value }))} aria-label="Edit state" /></div>
                                    ) : profile.state}
                                </td>
                                <td>
                                    {editingId === profile.id ? (
                                        <div className="cell-input"><input value={editingData.zip || ''} onChange={e => setEditingData(d => ({ ...d, zip: e.target.value }))} aria-label="Edit zip" /></div>
                                    ) : profile.zip}
                                </td>
                                <td>
                                    {editingId === profile.id ? (
                                        <div className="cell-input"><input value={editingData.country || ''} onChange={e => setEditingData(d => ({ ...d, country: e.target.value }))} aria-label="Edit country" /></div>
                                    ) : profile.country}
                                </td>
                                <td className="actions">
                                    {editingId === profile.id ? (
                                        <>
                                            <button
                                              type="button"
                                              className="btn btn-save"
                                              onClick={(e) => submitEdit(e)}
                                              aria-label="Save changes"
                                              disabled={!isEditingDirty()}
                                            >
                                              <FiCheck />
                                              <span className="visually-hidden">Save</span>
                                            </button>
                                            <button type="button" className="btn btn-cancel" onClick={cancelEdit} aria-label="Cancel edit">
                                              <FiX />
                                              <span className="visually-hidden">Cancel</span>
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button type="button" className="btn btn-edit" onClick={() => startEdit(profile)} aria-label={`Edit ${profile.fname || 'profile'}`}>
                                              <FiEdit2 />
                                              <span className="visually-hidden">Edit</span>
                                            </button>
                                            <button type="button" className="btn btn-delete" onClick={() => deleteProfile(profile.id)} aria-label={`Delete ${profile.fname || 'profile'}`}>
                                              <FiTrash2 />
                                              <span className="visually-hidden">Delete</span>
                                            </button>
                                        </>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
            </div>
        </div>
    );
}
