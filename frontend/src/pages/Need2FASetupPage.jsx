import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

function Need2FASetupPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email || '';

    return (
        <div style={{ maxWidth: '600px', margin: 'auto', padding: '2rem', textAlign: 'center' }}>
            <h2>Two-Factor Authentication Required</h2>
            <p>Your account requires two-factor authentication before you can sign in.</p>
            <button
                onClick={() => navigate('/enable-2fa', { state: { email } })}
                style={{ padding: '0.6rem 1.2rem', fontSize: '1rem' }}
            >
                Set Up 2FA Now
            </button>
        </div>
    );
}

export default Need2FASetupPage;
