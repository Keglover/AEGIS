import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

function Enable2FAPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [qrCodeUrl, setQrCodeUrl] = useState('');
    const [code, setCode] = useState('');
    const [enabled, setEnabled] = useState(false);

    // 页面加载时从上一个页面获取 email 并生成二维码
    useEffect(() => {
        const passedEmail = location.state?.email;
        if (!passedEmail) {
            alert('Missing email. Redirecting to login.');
            navigate('/login');
        } else {
            setEmail(passedEmail);
            generateQRCode(passedEmail);
        }
    }, [location.state, navigate]);

    // 向后端请求二维码图片 URL
    const generateQRCode = async (email) => {
        const res = await fetch('http://localhost:8080/auth/generate_2FA', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),
        });

        const result = await res.json();
        if (result.code === 200 && result.data) {
            setQrCodeUrl(result.data); // 后端返回的二维码图像 URL
        } else {
            alert(result.msg || 'Failed to get QR code');
        }
    };

    // 用户输入 6 位验证码后提交验证
    const handleVerify = async () => {
        const res = await fetch('http://localhost:8080/auth/verify_2FA', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, code }),
        });

        const result = await res.json();
        if (result.code === 200) {
            setEnabled(true);
            setTimeout(() => navigate('/login'), 1500); // 成功后跳转登录页
        } else {
            alert(result.msg || 'Verification failed');
        }
    };

    return (
        <div style={{ maxWidth: '500px', margin: 'auto', padding: '2rem' }}>
            <h2>Enable Two-Factor Authentication</h2>
            <p><strong>Account:</strong> {email}</p>

            {qrCodeUrl && (
                <div style={{ textAlign: 'center', margin: '1rem 0' }}>
                    <img
                        src={qrCodeUrl}
                        alt="2FA QR Code"
                        style={{ width: '200px', height: '200px' }}
                    />
                </div>
            )}

            <h4>Enter the 6-digit code from your Authenticator app:</h4>
            <input
                type="text"
                placeholder="123456"
                value={code}
                onChange={e => setCode(e.target.value)}
                maxLength={6}
                style={{ width: '100%', padding: '0.5rem', marginBottom: '1rem' }}
            />
            <button onClick={handleVerify} style={{ width: '100%', padding: '0.6rem' }}>
                Confirm and Enable
            </button>

            {enabled && (
                <p style={{ marginTop: '1rem', color: 'green' }}>
                    ✅ 2FA setup complete! Redirecting to login...
                </p>
            )}
        </div>
    );
}

export default Enable2FAPage;
