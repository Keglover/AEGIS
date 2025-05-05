import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register } from '../api/auth';

function RegisterPage() {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        email: '',
        userName: '',
        password1: '',
        password2: '',
        role: 'USER'
    });

    const handleChange = (e) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleRegister = async () => {
        if (form.password1 !== form.password2) {
            alert('Passwords do not match!');
            return;
        }
        const res = await register(form);
        if (res.code === 200) {
            alert('Register successful');
            navigate('/login');
        } else {
            alert(res.message || 'Register failed');
        }
    };

    return (
        <div>
            <h2>Register</h2>
            <input name="email" placeholder="Email" onChange={handleChange} />
            <input name="userName" placeholder="Username" onChange={handleChange} />
            <input name="password1" type="password" placeholder="Password" onChange={handleChange} />
            <input name="password2" type="password" placeholder="Confirm Password" onChange={handleChange} />
            <select name="role" value={form.role} onChange={handleChange}>
                <option value="USER">User</option>
                <option value="MANAGER">Manager</option>
                <option value="ADMIN">Admin</option>
            </select>
            <button onClick={handleRegister}>Register</button>
        </div>
    );
}

export default RegisterPage;
