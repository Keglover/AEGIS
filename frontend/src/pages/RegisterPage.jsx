import React, { useState } from 'react';
import { Form, Input, Button, Typography, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { API_ENDPOINTS } from '../config'; // ✅ 使用你的 config
const { Title } = Typography;

function RegisterPage() {
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const [emailVerified, setEmailVerified] = useState(false);
    const [loadingSend, setLoadingSend] = useState(false);
    const [loadingVerify, setLoadingVerify] = useState(false);
    const [countdown, setCountdown] = useState(0);

    const handleSendCode = async () => {
        const email = form.getFieldValue('email');
        if (!email) {
            message.warning('Please enter your email.');
            return;
        }

        setLoadingSend(true);
        try {
            const res = await fetch(API_ENDPOINTS.AUTH.SEND_VERIFY_EMAIL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            const result = await res.json();
            if (result.code === 200) {
                message.success('Verification code sent to email.');
                setCountdown(60);
                const timer = setInterval(() => {
                    setCountdown(prev => {
                        if (prev <= 1) {
                            clearInterval(timer);
                            return 0;
                        }
                        return prev - 1;
                    });
                }, 1000);
            } else {
                message.error(result.msg || 'Failed to send code.');
            }
        } catch {
            message.error('Error sending code.');
        } finally {
            setLoadingSend(false);
        }
    };

    const handleVerifyEmail = async () => {
        const { email, verifyCode } = form.getFieldsValue(['email', 'verifyCode']);
        if (!email || !verifyCode) {
            message.warning('Enter both email and verification code.');
            return;
        }

        setLoadingVerify(true);
        try {
            const res = await fetch(API_ENDPOINTS.AUTH.VERIFY_EMAIL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, code: verifyCode }),
            });
            const result = await res.json();
            if (result.code === 200) {
                setEmailVerified(true);
                message.success('Email verified successfully!');
            } else {
                message.error(result.msg || 'Verification failed.');
            }
        } catch {
            message.error('Error verifying email.');
        } finally {
            setLoadingVerify(false);
        }
    };

    const handleFinish = async (values) => {
        if (!emailVerified) {
            message.warning('Please verify your email before registering.');
            return;
        }

        if (values.password1 !== values.password2) {
            message.error('Passwords do not match.');
            return;
        }

        try {
            const res = await fetch(API_ENDPOINTS.AUTH.REGISTER, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: values.email,
                    userName: values.userName,
                    password1: values.password1,
                    password2: values.password2,
                    role: 'USER'
                }),
            });
            const result = await res.json();
            if (result.code === 200) {
                message.success('Registration successful!');
                navigate('/login');
            } else {
                message.error(result.msg || 'Registration failed.');
            }
        } catch {
            message.error('Server error during registration.');
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', minHeight: '100vh', alignItems: 'center' }}>
            <div style={{ width: 400, padding: 24, background: '#fff', boxShadow: '0 0 10px rgba(0,0,0,0.1)' }}>
                <Title level={3} style={{ textAlign: 'center' }}>Register</Title>
                <Form form={form} layout="vertical" onFinish={handleFinish}>
                    <Form.Item label="Email" name="email" rules={[{ required: true, message: 'Please input your email!' }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item>
                        <Button
                            block
                            onClick={handleSendCode}
                            loading={loadingSend}
                            disabled={countdown > 0}
                        >
                            {countdown > 0 ? `Resend (${countdown}s)` : 'Send Verification Code'}
                        </Button>
                    </Form.Item>
                    <Form.Item label="Verification Code" name="verifyCode">
                        <Input />
                    </Form.Item>
                    <Form.Item>
                        <Button block type="primary" onClick={handleVerifyEmail} loading={loadingVerify}>Verify Email</Button>
                    </Form.Item>
                    {emailVerified && (
                        <Form.Item>
                            <div style={{ color: 'green' }}>✅ Email verified</div>
                        </Form.Item>
                    )}
                    <Form.Item label="Username" name="userName" rules={[{ required: true, message: 'Please input username!' }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item label="Password" name="password1" rules={[{ required: true, message: 'Please input password!' }]}>
                        <Input.Password />
                    </Form.Item>
                    <Form.Item label="Confirm Password" name="password2" rules={[{ required: true, message: 'Please confirm password!' }]}>
                        <Input.Password />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" block>Register</Button>
                    </Form.Item>
                </Form>
            </div>
        </div>
    );
}

export default RegisterPage;
