import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    Typography,
    Input,
    Button,
    Card,
    Space,
    message,
    Spin
} from 'antd';
import { QRCodeCanvas } from 'qrcode.react';

const { Title, Paragraph, Text } = Typography;

function Enable2FAPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const email = location.state?.email;

    const [qrUrl, setQrUrl] = useState('');
    const [secret, setSecret] = useState('');
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [verifying, setVerifying] = useState(false);

    useEffect(() => {
        if (!email) {
            message.error('No email provided. Redirecting to login.');
            navigate('/login');
            return;
        }

        const fetchQRCode = async () => {
            setLoading(true);
            try {
                const res = await fetch('http://localhost:8080/auth/generate_2FA', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email }),
                });
                const result = await res.json();
                if (result.code === 200) {
                    const decodedUrl = decodeURIComponent(result.data);
                    setQrUrl(decodedUrl);

                    const match = decodedUrl.match(/secret=([A-Z0-9]+)/);
                    if (match) setSecret(match[1]);
                } else {
                    message.error(result.msg || 'Failed to generate 2FA QR.');
                }
            } catch (e) {
                message.error('Error while fetching 2FA setup.');
            } finally {
                setLoading(false);
            }
        };

        fetchQRCode();
    }, [email, navigate]);

    const handleVerifyCode = async () => {
        if (!code) {
            message.warning('Please enter the code from your Authenticator app.');
            return;
        }

        setVerifying(true);
        try {
            const res = await fetch('http://localhost:8080/auth/verify_2FA', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, code }),
            });
            const result = await res.json();
            if (result.code === 200) {
                const enableRes = await fetch('http://localhost:8080/auth/enable_2FA', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email }),
                });
                localStorage.setItem('userId', result.data.userId);
                localStorage.setItem('email', email);
                localStorage.setItem('user_name', result.data.userName)
                const enableResult = await enableRes.json();

                if (enableResult.code === 200) {
                    message.success('2FA successfully enabled!');
                    setTimeout(() => navigate('/home'), 1500);
                } else {
                    message.error(enableResult.msg || '2FA verification succeeded, but enabling failed.');
                }
            } else {
                message.error(result.msg || 'Invalid code. Please try again.');
            }
        } catch (e) {
            message.error('Server error while verifying code.');
        } finally {
            setVerifying(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Card style={{ width: 500 }}>
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                    <Title level={3}>Enable Two-Factor Authentication</Title>

                    <Paragraph>
                        Your Email:
                    </Paragraph>
                    <Input value={email} disabled />

                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '2rem' }}>
                            <Spin tip="Loading QR Code..." />
                        </div>
                    ) : qrUrl ? (
                        <>
                            <Paragraph>
                                Scan this QR code using your <Text strong>Google Authenticator</Text> app:
                            </Paragraph>
                            <div style={{ textAlign: 'center' }}>
                                <QRCodeCanvas value={qrUrl} size={200} />
                            </div>

                            <Paragraph>
                                If you can't scan it, manually enter this secret:
                                <br />
                                <Text copyable code>{secret}</Text>
                            </Paragraph>

                            <Paragraph>After adding, enter the 6-digit code below:</Paragraph>
                            <Input
                                placeholder="Enter 6-digit code"
                                maxLength={6}
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                            />

                            <Button type="primary" block onClick={handleVerifyCode} loading={verifying}>
                                Verify & Enable 2FA
                            </Button>
                        </>
                    ) : (
                        <Text type="danger">Failed to load QR code.</Text>
                    )}

                </Space>
            </Card>
        </div>
    );
}

export default Enable2FAPage;
