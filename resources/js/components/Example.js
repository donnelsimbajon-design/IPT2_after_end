import React, { useEffect, useState } from "react";

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


    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setErrors({});
            setMessage(null);
            const response = await axios.post("/api/register", {
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
                // Laravel returns { errors: { field: [messages] } }
                const respErrors = error.response.data.errors || error.response.data;
                setErrors(respErrors);
            } else {
                console.error('Error creating profile:', error);
                setMessage('Error creating profile.');
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
        setErrors({});
        setMessage(null);
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditingData({});
    }

    const submitEdit = async (e) => {
        e.preventDefault();
        try {
            const resp = await axios.put(`/api/profiles/${editingId}`, editingData);
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
    }

    const deleteProfile = async (id) => {
        if (!confirm('Delete this profile?')) return;
        try {
            await axios.delete(`/api/profiles/${id}`);
            setProfiles((list) => list.filter(p => p.id !== id));
            if (editingId === id) cancelEdit();
            setMessage('Profile deleted');
        } catch (err) {
            console.error('Delete error', err);
            setMessage('Error deleting profile');
        }
    }


    useEffect(() => {
        fetchProfiles();
    }, []);


    return (
        <div className="home">
            <div className="container">
                <form onSubmit={handleSubmit}>
                    {message && <div style={{ marginBottom: 8 }}>{message}</div>}
                    {Object.keys(errors).length > 0 && (
                        <div style={{ color: 'red', marginBottom: 8 }}>
                            {Object.entries(errors).map(([k, v]) => (
                                <div key={k}>{Array.isArray(v) ? v.join(' ') : v}</div>
                            ))}
                        </div>
                    )}
                    <input
                        type="text"
                        placeholder="Firstname"
                        value={fname}
                        onChange={(e) => setFirstname(e.target.value)}
                    />
                    <input
                        type="text"
                        placeholder="Lastname"
                        value={lname}
                        onChange={(e) => setLastname(e.target.value)}
                    />
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    /> 
                    <input
                        type="text"
                        placeholder="Phone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                    />      
                    <input
                        type="text"
                        placeholder="Address"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                    />      
                    <input
                        type="text"
                        placeholder="City"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                    />      
                    <input
                        type="text"
                        placeholder="State"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                    />      
                    <input
                        type="text"
                        placeholder="Zip"
                        value={zip}
                        onChange={(e) => setZip(e.target.value)}
                    />  
                    <input
                        type="text"
                        placeholder="Country"
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                    />
                    <input type="submit" />
                </form>                                <div className="table-wrapper">
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
                        </tr>
                    </thead>
                    <tbody>
                        {profiles.map((profile) => (
                            <tr key={profile.id} className={editingId === profile.id ? 'editing' : ''}>
                                <td>
                                    {editingId === profile.id ? (
                                        <input value={editingData.fname || ''} onChange={e => setEditingData(d => ({ ...d, fname: e.target.value }))} />
                                    ) : profile.fname}
                                </td>
                                <td>
                                    {editingId === profile.id ? (
                                        <input value={editingData.lname || ''} onChange={e => setEditingData(d => ({ ...d, lname: e.target.value }))} />
                                    ) : profile.lname}
                                </td>
                                <td>
                                    {editingId === profile.id ? (
                                        <input value={editingData.email || ''} onChange={e => setEditingData(d => ({ ...d, email: e.target.value }))} />
                                    ) : profile.email}
                                </td>
                                <td>
                                    {editingId === profile.id ? (
                                        <input value={editingData.phone || ''} onChange={e => setEditingData(d => ({ ...d, phone: e.target.value }))} />
                                    ) : profile.phone}
                                </td>
                                <td>
                                    {editingId === profile.id ? (
                                        <input value={editingData.address || ''} onChange={e => setEditingData(d => ({ ...d, address: e.target.value }))} />
                                    ) : profile.address}
                                </td>
                                <td>
                                    {editingId === profile.id ? (
                                        <input value={editingData.city || ''} onChange={e => setEditingData(d => ({ ...d, city: e.target.value }))} />
                                    ) : profile.city}
                                </td>
                                <td>
                                    {editingId === profile.id ? (
                                        <input value={editingData.state || ''} onChange={e => setEditingData(d => ({ ...d, state: e.target.value }))} />
                                    ) : profile.state}
                                </td>
                                <td>
                                    {editingId === profile.id ? (
                                        <input value={editingData.zip || ''} onChange={e => setEditingData(d => ({ ...d, zip: e.target.value }))} />
                                    ) : profile.zip}
                                </td>
                                <td>
                                    {editingId === profile.id ? (
                                        <input value={editingData.country || ''} onChange={e => setEditingData(d => ({ ...d, country: e.target.value }))} />
                                    ) : profile.country}
                                </td>
                                <td className="actions">
                                    {editingId === profile.id ? (
                                        <>
                                            <button type="button" className="btn btn-save" onClick={(e) => submitEdit(e)}>Save</button>
                                            <button type="button" className="btn btn-cancel" onClick={cancelEdit}>Cancel</button>
                                        </>
                                    ) : (
                                        <>
                                            <button type="button" className="btn btn-edit" onClick={() => startEdit(profile)}>Edit</button>
                                            <button type="button" className="btn btn-delete" onClick={() => deleteProfile(profile.id)}>Delete</button>
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
