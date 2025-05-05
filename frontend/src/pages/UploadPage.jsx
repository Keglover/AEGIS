import React, { useState } from 'react';
import { Upload, Button, Form, Input, Typography, message, Card } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;

function UploadPage() {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const navigate = useNavigate();

    const handleFileChange = (info) => {
        if (info.file.status === 'removed') {
            setFile(null);
        } else {
            setFile(info.file.originFileObj);
        }
    };

    const handleFinish = async (values) => {
        if (!file) {
            message.warning('Please upload a file.');
            return;
        }

        const formData = new FormData();
        formData.append('name', values.name);
        formData.append('file', file);
        formData.append('email', values.email)

        setUploading(true);
        try {
            const res = await fetch('http://localhost:8080/api/project/upload', {
                method: 'POST',
                body: formData,
            });

            const result = await res.json();

            if (result.code === 200) {
                message.success('Project uploaded and scan started!');
                navigate('/');
            } else {
                message.error(result.msg || 'Upload failed');
            }
        } catch (err) {
            message.error('Server error.');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div style={{ padding: 24, display: 'flex', justifyContent: 'center' }}>
            <Card style={{ width: 500 }}>
                <Title level={3} style={{ textAlign: 'center' }}>Upload New Project</Title>
                <Form layout="vertical" onFinish={handleFinish}>
                    <Form.Item
                        label="Project Name"
                        name="name"
                        rules={[{ required: true, message: 'Please enter project name' }]}
                    >
                        <Input placeholder="e.g. my-react-app" />
                    </Form.Item>

                    <Form.Item label="Dependency File">
                        <Upload
                            beforeUpload={() => false}
                            maxCount={1}
                            onChange={handleFileChange}
                            accept=".json,.xml"
                        >
                            <Button icon={<UploadOutlined />}>Select File</Button>
                        </Upload>
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" block loading={uploading}>
                            Upload & Scan
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
}

export default UploadPage;
