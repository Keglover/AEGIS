import React, { useState, useEffect } from 'react';
import { Upload, Button, Form, Input, Typography, message, Card } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;

function UploadPage() {
    const [file, setFile] = useState(null);
    const [fileList, setFileList] = useState([]);
    const [uploading, setUploading] = useState(false);
    const navigate = useNavigate();
    const [form] = Form.useForm();

    useEffect(() => {
        const email = localStorage.getItem('email');
        if (email) {
            form.setFieldsValue({ email });
        }
    }, [form]);

    const handleFileChange = ({ file, fileList }) => {
        setFileList(fileList);
        if (file.status !== 'removed') {
            setFile(file.originFileObj);
            // 手动设置表单字段值
            form.setFieldsValue({ file: file.originFileObj });
        } else {
            setFile(null);
            form.setFieldsValue({ file: null });
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
        formData.append('email', localStorage.getItem('email'));

        setUploading(true);
        try {
            const res = await fetch('http://localhost:8080/api/project/upload', {
                method: 'POST',
                body: formData,
                credentials: 'include'
            });

            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }

            const result = await res.json();

            if (result.code === 200) {
                message.success('Project uploaded and scan started!');
                navigate('/');
            } else {
                message.error(result.msg || 'Upload failed');
            }
        } catch (err) {
            console.error('Upload error:', err);
            message.error('Upload failed: ' + err.message);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div style={{ padding: 24, display: 'flex', justifyContent: 'center' }}>
            <Card style={{ width: 500 }}>
                <Title level={3} style={{ textAlign: 'center' }}>Upload New Project</Title>
                <Form
                    layout="vertical"
                    onFinish={handleFinish}
                    form={form}
                    onFinishFailed={({ errorFields }) => {
                        errorFields.forEach(field => {
                            message.error(field.errors[0]);
                        });
                    }}
                >
                    <Form.Item
                        label="Project Name"
                        name="name"
                        rules={[{ required: true, message: 'Please enter project name' }]}
                    >
                        <Input placeholder="e.g. my-react-app" />
                    </Form.Item>

                    <Form.Item
                        label="Dependency File"
                        name="file"
                        rules={[{
                            required: true,
                            message: 'Please upload a dependency file'
                        }]}
                        valuePropName="fileList"
                        getValueFromEvent={(e) => {
                            if (Array.isArray(e)) {
                                return e;
                            }
                            return e && e.fileList;
                        }}
                    >
                        <Upload
                            beforeUpload={() => false}
                            maxCount={1}
                            fileList={fileList}
                            onChange={handleFileChange}
                            accept=".json"
                        >
                            <Button icon={<UploadOutlined />}>Select File</Button>
                        </Upload>
                    </Form.Item>

                    <Form.Item name="email" hidden>
                        <Input />
                    </Form.Item>

                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            block
                            loading={uploading}
                            disabled={uploading}
                        >
                            Upload & Scan
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
}

export default UploadPage;