import React, { useEffect, useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { Spin, message, Typography } from 'antd';

const { Title, Paragraph, Text } = Typography;

function Enable2FA({ email }) {
    const [qrUrl, setQrUrl] = useState('');
    const [secret, setSecret] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`http://localhost:8080/api/2fa/setup?email=${encodeURIComponent(email)}`)
            .then(res => res.json())
            .then(json => {
                if (json.code === 200) {
                    setQrUrl(json.data.otpAuthUrl);
                    setSecret(json.data.secret);
                } else {
                    message.error(json.msg || 'Failed to enable 2FA.');
                }
            })
            .catch(() => message.error('Server error'))
            .finally(() => setLoading(false));
    }, [email]);

    if (loading) return <Spin tip="Loading 2FA setup..." style={{ display: 'block', marginTop: 100 }} />;

    return (
        <div style={{ textAlign: 'center' }}>
            <Title level={3}>Enable Google Authenticator</Title>
            <Paragraph>
                Scan the QR code below using your <Text strong>Google Authenticator</Text> app.
            </Paragraph>
            {qrUrl ? (
                <>
                    <QRCodeCanvas value={qrUrl} size={256} />
                    <Paragraph style={{ marginTop: 16 }}>
                        If you can't scan the QR code, manually enter this secret:
                        <br />
                        <Text copyable code>{secret}</Text>
                    </Paragraph>
                </>
            ) : (
                <Text type="danger">Failed to load QR code.</Text>
            )}
        </div>
    );
}

export default Enable2FA;
