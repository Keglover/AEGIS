import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../api/auth';
import InputField from '../components/InputField';

function LoginPage() {
    const [form, setForm] = useState({ email: '', password: '' });
    const navigate = useNavigate();

    const handleChange = (e) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleLogin = async () => {
        try {
            const res = await login(form);

            if (res.code === 200) {
                navigate('/verify2fa', {state: {email: form.email}});
            } else if (res.code === 400 && res.msg === 'Need to enable 2FA before sign in') {
                navigate('/need-2fa', { state: { email: form.email } });
            } else {
                alert(res.msg || 'Login failed');
            }
        } catch (error) {
            alert('Network error or server not responding');
            console.error(error);
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: 'auto', padding: '2rem' }}>
            <h2 style={{ textAlign: 'center' }}>Login</h2>
            <InputField
                label="Email"
                name="email"
                value={form.email}
                onChange={handleChange}
            />
            <InputField
                label="Password"
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
            />
            <button onClick={handleLogin} style={{ width: '100%', padding: '0.5rem' }}>
                Login
            </button>
            <p style={{ marginTop: '1rem', textAlign: 'center' }}>
                Don't have an account?{' '}
                <button
                    onClick={() => navigate('/register')}
                    style={{ background: 'none', border: 'none', color: 'blue', cursor: 'pointer' }}
                >
                    Register
                </button>
            </p>
        </div>
    );
}

export default LoginPage;
