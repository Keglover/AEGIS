import React from 'react';
import { Typography, Button, Card } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';

const { Title, Paragraph } = Typography;

function Need2FASetupPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email;

    const handleSetup = () => {
        navigate('/enable-2fa', { state: { email } });
    };

    return (
        <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>
            <Card style={{ maxWidth: 500, width: '100%', textAlign: 'center', padding: '24px 32px' }}>
                <Title level={3}>Two-Factor Authentication Required</Title>
                <Paragraph>
                    Your account requires two-factor authentication before you can sign in.
                </Paragraph>
                <Button type="primary" onClick={handleSetup}>
                    Set Up 2FA Now
                </Button>
            </Card>
        </div>
    );
}

export default Need2FASetupPage;
