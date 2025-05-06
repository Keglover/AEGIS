import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout, Button, Card, Flex, Typography } from 'antd';

const { Header, Content } = Layout;
const { Title, Paragraph } = Typography;

function IntroPage() {
    const navigate = useNavigate();

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Header style={{ background: '#001529', padding: '0 24px' }}>
                <Flex justify="space-between" align="center" style={{ height: '100%' }}>
                    <Title level={3} style={{ color: 'white', margin: 0 }}>
                        🛡️ Aegis Dependency Scanner
                    </Title>
                    <Button type="primary" onClick={() => navigate('/login')}>
                        Login
                    </Button>
                </Flex>
            </Header>

            <Content style={{ padding: '24px' }}>
                <Card style={{ marginBottom: 16 }}>
                    <Title level={4}>Introduction</Title>
                    <Paragraph>
                        Aegis is an OSINT-based (Open-Source Intelligence) vulnerability and threat detection platform
                        that gathers intelligence from social media, security blogs, and vulnerability databases.
                        It leverages LLMs (Large Language Models) to aggregate, categorize, and analyze security threats,
                        providing users with customized risk assessments and actionable insights based on their technology stack.
                    </Paragraph>
                </Card>

                <Card style={{ marginBottom: 16 }}>
                    <Title level={4}>Use Cases</Title>
                    <ul>
                        <li>Cyber Intelligence Specialist</li>
                        <li>White Hat Hacker / Penetration Tester</li>
                        <li>Vulnerability Assessor</li>
                    </ul>
                </Card>

                <Card>
                    <Title level={4}>Features</Title>
                    <ul>
                        <li>General Dashboard</li>
                        <li>AI Aggregation & Analysis</li>
                        <li>Detailed Vulnerability Information</li>
                        <li>Dependency Monitoring</li>
                        <li>Zero-Day Attack Monitoring (Future Feature)</li>
                    </ul>
                </Card>
            </Content>
        </Layout>
    );
}

export default IntroPage;
