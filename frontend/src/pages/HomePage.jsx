import React, { useEffect, useState } from 'react';
import { Table, Card, Row, Col, Tag, Button, Typography, Avatar, Dropdown, Menu, Layout } from 'antd';
import { PlusCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
//import mockProjects from '../mock/projects';
const { Header, Content } = Layout;
const { Title } = Typography;

function HomePage() {
    const [projects, setProjects] = useState([]);
    const navigate = useNavigate();
    const email = localStorage.getItem('email') || 'User';
    const namePart = email.split('@')[0] || 'U';


    useEffect(() => {
        fetch('http://localhost:8080/api/project/list')
            .then(res => res.json())
            .then(json => {
                if (json.code === 200) {
                    setProjects(json.data);
                }
            });
        //setProjects(mockProjects);
    }, []);

    const menu = (
        <Menu>
            <Menu.Item key="logout">
                <Button type="primary" danger block onClick={() => {
                    localStorage.removeItem('userId');
                    localStorage.removeItem('email');
                    navigate('/login');
                }}>
                    Logout
                </Button>
            </Menu.Item>
        </Menu>
    );

    const countByStatus = (status) =>
        projects.filter((p) => p.status === status).length;

    const columns = [
        {
            title: 'Project Name',
            dataIndex: 'name',
        },
        {
            title: 'Status',
            dataIndex: 'status',
            render: (status) => {
                const colorMap = {
                    PENDING: 'default',
                    SCANNING: 'processing',
                    COMPLETED: 'success',
                    FAILED: 'error',
                };
                return <Tag color={colorMap[status]}>{status}</Tag>;
            },
        },
        {
            title: 'High Risk',
            dataIndex: ['scanResult', 'highRiskCount'],
            render: (count) => count ?? '-',
        },
        {
            title: 'Dependencies',
            dataIndex: ['scanResult', 'totalDependencies'],
            render: (count) => count ?? '-',
        },
        {
            title: 'Uploaded At',
            dataIndex: 'uploadTime',
            render: (v) => new Date(v).toLocaleString(),
        },
        {
            title: 'Action',
            render: (_, record) => (
                <Button
                    size="small"
                    type="link"
                    onClick={() => navigate(`/projects/${record.id}`)}
                >
                    View
                </Button>
            ),
        },
    ];

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Header style={{ background: '#001529', padding: '0 24px' }}>
                <Row justify="space-between" align="middle">
                    <div style={{ color: 'white', fontSize: '20px' }}>
                        🛡️ Aegis Dependency Scanner
                    </div>
                    <Dropdown overlay={menu} placement="bottomRight">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                            <Avatar style={{ backgroundColor: '#1890ff' }}>
                                {namePart[0].toUpperCase()}
                            </Avatar>
                            <span style={{ color: 'white' }}>{namePart}</span>
                        </div>
                    </Dropdown>
                </Row>
            </Header>


            <Content style={{padding: '24px', background: '#f5f5f5'}}>
                <div style={{padding: '24px'}}>
                    <Row justify="space-between" align="middle">
                        <Title level={2}>Dependency Risk Dashboard</Title>
                        <Button
                            type="primary"
                            icon={<PlusCircleOutlined/>}
                            onClick={() => navigate('/upload')}
                        >
                            Upload New Project
                        </Button>
                    </Row>

                    <Row gutter={16} style={{marginBottom: 24}}>
                        <Col span={6}>
                            <Card title="Total Projects" bordered={false} style={{background: '#fff'}}>
                                <div style={{fontSize: '24px', fontWeight: 600}}>
                                    {projects.length}
                                </div>
                            </Card>
                        </Col>
                        <Col span={6}>
                            <Card title="Completed" bordered={false} style={{background: '#fff'}}>
                                <div style={{fontSize: '24px', fontWeight: 600}}>
                                    {countByStatus('COMPLETED')}
                                </div>
                            </Card>
                        </Col>
                        <Col span={6}>
                            <Card title="Scanning" bordered={false} style={{background: '#fff'}}>
                                <div style={{fontSize: '24px', fontWeight: 600}}>
                                    {countByStatus('SCANNING')}
                                </div>
                            </Card>
                        </Col>
                        <Col span={6}>
                            <Card title="Failed" bordered={false} style={{background: '#fff'}}>
                                <div style={{fontSize: '24px', fontWeight: 600}}>
                                    {countByStatus('FAILED')}
                                </div>
                            </Card>
                        </Col>
                    </Row>

                    <Card title="Project List" bodyStyle={{ padding: 0 }}>
                        <Table
                            rowKey="id"
                            columns={columns}
                            dataSource={projects}
                            pagination={{
                                pageSize: 5,
                                position: ['bottomCenter'],
                                className: 'custom-pagination',
                            }}
                        />

                    </Card>

                </div>
            </Content>
        </Layout>

    );
}

export default HomePage;
