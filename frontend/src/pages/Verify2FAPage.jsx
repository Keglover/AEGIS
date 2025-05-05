import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { verify2FA } from '../api/auth';

function Verify2FAPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');

    useEffect(() => {
        const passedEmail = location.state?.email;
        if (passedEmail) {
            setEmail(passedEmail);
        } else {
            alert('Missing email, redirecting to login');
            navigate('/login');
        }
    }, [location.state, navigate]);

    const handleVerify = async () => {
        const res = await verify2FA({ email, code });
        if (res.code === 200) {
            alert('2FA verified successfully');
            navigate('/home'); // 🔁 可替换为你自己的主页路径
        } else {
            alert(res.msg || '2FA verification failed');
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: 'auto', padding: '2rem' }}>
            <h2>Two-Factor Authentication</h2>
            <p><strong>Account:</strong> {email}</p>

            <input
                type="text"
                placeholder="Enter 6-digit code"
                value={code}
                onChange={e => setCode(e.target.value)}
                maxLength={6}
                style={{ width: '100%', padding: '0.5rem', marginTop: '1rem' }}
            />

            <button
                onClick={handleVerify}
                style={{ width: '100%', padding: '0.6rem', marginTop: '1rem' }}
            >
                Verify
            </button>
        </div>
    );
}

export default Verify2FAPage;
