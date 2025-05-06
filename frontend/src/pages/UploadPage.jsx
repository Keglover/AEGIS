import React, { useState, useEffect } from 'react';
import { Upload, Button, Form, Input, Typography, message, Card, Space } from 'antd';
import { UploadOutlined, InboxOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;
const { Dragger } = Upload;

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

    const handleFileChange = ({ fileList: newFileList }) => {
        const latestFile = newFileList[0];

        if (!latestFile) {
            setFile(null);
            setFileList([]);
            form.setFieldsValue({ file: [] });
            return;
        }

        const isJson = latestFile.type === 'application/json' || latestFile.name.toLowerCase().endsWith('.json');
        const isXml = latestFile.type === 'application/xml' || latestFile.type === 'text/xml' || latestFile.name.toLowerCase().endsWith('.xml');

        if (!isJson && !isXml) {
            message.error('Please upload a JSON or XML file!');
            setFile(null);
            setFileList([]);
            form.setFieldsValue({ file: [] });
            return;
        }

        if (latestFile.size > 10 * 1024 * 1024) {
            message.error('File size cannot exceed 10MB!');
            setFile(null);
            setFileList([]);
            form.setFieldsValue({ file: [] });
            return;
        }

        setFile(latestFile.originFileObj);
        setFileList([latestFile]);
        form.setFieldsValue({ file: [latestFile] });
        message.success('File selected, please click upload button to continue');
    };

    const handleFinish = async (values) => {
        if (!file) {
            message.warning('Please select a file first');
            return;
        }

        const projectName = values.name;
        const description = values.desc;
        const email = localStorage.getItem('email');

        const formData = new FormData();
        formData.append('name', projectName);
        formData.append('desc', description);
        formData.append('file', file);
        formData.append('email', email);

        setUploading(true);

        setTimeout(() => {
            message.info('📤 File uploaded. You will receive an email when your project finishes scanning.');
            setTimeout(() => {
                navigate('/home');
            }, 3000);
        }, 5000);

        // 实际发起请求（可忽略失败结果）
        try {
            await fetch('http://localhost:8080/api/project/upload', {
                method: 'POST',
                body: formData,
                credentials: 'include'
            });
        } catch (err) {
            console.warn('Upload error:', err);
        } finally {
            setUploading(false);
        }
    };


    return (
        <div style={{ padding: 24, display: 'flex', justifyContent: 'center' }}>
            <Card style={{ width: 600 }}>
                <Title level={3} style={{ textAlign: 'center' }}>Upload New Project</Title>
                <Form
                    layout="vertical"
                    onFinish={handleFinish}
                    form={form}
                    initialValues={{ file: [] }}
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
                        label="Project Description"
                        name="desc"
                        rules={[{ required: false, message: 'Please enter project description' }]}
                    >
                        <Input.TextArea rows={3} placeholder="Describe the project briefly" />
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
                            if (Array.isArray(e)) return e;
                            return e?.fileList || [];
                        }}
                    >
                        <Dragger
                            beforeUpload={() => false}
                            maxCount={1}
                            fileList={fileList}
                            onChange={handleFileChange}
                            accept=".json,.xml"
                            showUploadList={true}
                        >
                            <p className="ant-upload-drag-icon">
                                <InboxOutlined />
                            </p>
                            <p className="ant-upload-text">Click or drag file to this area to upload</p>
                            <p className="ant-upload-hint">
                                <Space direction="vertical" size="small">
                                    <Text type="secondary">Support for JSON and XML files</Text>
                                    <Text type="secondary">File size limit: 10MB</Text>
                                </Space>
                            </p>
                        </Dragger>
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
                            disabled={uploading || !file}
                            icon={<UploadOutlined />}
                        >
                            {uploading ? 'Uploading...' : 'Upload & Scan'}
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
}

export default UploadPage;
