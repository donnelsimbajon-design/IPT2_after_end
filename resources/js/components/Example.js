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
                </form>
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
                            <tr key={profile.id}>
                                <td>{profile.fname}</td>
                                <td>{profile.lname}</td>
                                <td>{profile.email}</td>
                                <td>{profile.phone}</td>
                                <td>{profile.address}</td>
                                <td>{profile.city}</td>
                                <td>{profile.state}</td>
                                <td>{profile.zip}</td>
                                <td>{profile.country}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
