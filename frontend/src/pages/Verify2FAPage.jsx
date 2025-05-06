import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Form, Input, Button, Typography, message } from 'antd';
import { verify2FA } from '../api/auth';

const { Title } = Typography;

function Verify2FAPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();

    useEffect(() => {
        const passedEmail = location.state?.email;
        if (passedEmail) {
            setEmail(passedEmail);
        } else {
            message.error('Missing email. Redirecting to login.');
            navigate('/login');
        }
    }, [location.state, navigate]);

    const handleVerify = async (values) => {
        setLoading(true);
        try {
            const res = await verify2FA({ email, code: values.code });
            if (res.code === 200) {
                localStorage.setItem('userId', res.data.userId);
                localStorage.setItem('email', email);
                localStorage.setItem('userName', res.data.userName);
                message.success('2FA verification successful!');
                navigate('/home'); // 或你自定义的首页路径
            } else {
                message.error(res.msg || '2FA verification failed');
            }
        } catch (error) {
            message.error('Network error during 2FA verification');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', minHeight: '100vh', alignItems: 'center' }}>
            <div style={{ width: 400, padding: 24, background: '#fff', boxShadow: '0 0 10px rgba(0,0,0,0.1)' }}>
                <Title level={3} style={{ textAlign: 'center' }}>Two-Factor Verification</Title>

                <Form form={form} layout="vertical" onFinish={handleVerify}>
                    <Form.Item label="Account Email">
                        <Input value={email} disabled />
                    </Form.Item>

                    <Form.Item
                        label="Verification Code"
                        name="code"
                        rules={[{ required: true, message: 'Please enter the 6-digit code' }]}
                    >
                        <Input maxLength={6} />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" loading={loading} block>
                            Verify
                        </Button>
                    </Form.Item>
                </Form>
            </div>
        </div>
    );
}

export default Verify2FAPage;
