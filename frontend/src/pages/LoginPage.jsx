import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, Typography, message } from 'antd';
import { login } from '../api/auth';

const { Title } = Typography;

function LoginPage() {
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const handleLogin = async (values) => {
        setLoading(true);
        try {
            const res = await login(values);

            if (res.code === 200) {
                navigate('/verify2fa', { state: { email: values.email } });
            } else if (res.code === 400 && res.msg === 'Need to enable 2FA before sign in') {
                navigate('/need-2fa', { state: { email: values.email } });
            } else {
                message.error(res.msg || 'Login failed');
            }
        } catch (error) {
            message.error('Network error or server not responding');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', minHeight: '100vh', alignItems: 'center' }}>
            <div style={{ width: 400, padding: 24, background: '#fff', boxShadow: '0 0 10px rgba(0,0,0,0.1)' }}>
                <Title level={3} style={{ textAlign: 'center' }}>Login</Title>

                <Form form={form} layout="vertical" onFinish={handleLogin}>
                    <Form.Item
                        label="Email"
                        name="email"
                        rules={[{ required: true, message: 'Please input your email!' }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        label="Password"
                        name="password"
                        rules={[{ required: true, message: 'Please input your password!' }]}
                    >
                        <Input.Password />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" loading={loading} block>
                            Login
                        </Button>
                    </Form.Item>
                </Form>

                <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                    Don't have an account?{' '}
                    <Button type="link" onClick={() => navigate('/register')}>
                        Register
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;
