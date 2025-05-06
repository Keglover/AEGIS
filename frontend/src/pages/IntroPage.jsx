import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Layout, Button, /*Row,*/ Flex, /*Space,*/ Card, } from 'antd'
//import Title from 'antd/es/skeleton/Title';
const { Header, Content } = Layout;

function IntroPage() {
    const navigate = useNavigate();
    const boxStyle = {
        width: '100%',
        height: 120,
        borderRadius: 6,
    };
    
    return (
        <Layout style={{ minHeight: '90vh' }}>
            <Header style={{ background: '#001529', justifyItems: 'right'}} >
                <Flex style={boxStyle} justify="space-between" align="flex-start">
                    <div style={{ color: 'white', fontSize: '24px' }}>
                        
                        <t>🛡️ Aegis           </t>

                        <Button
                            type="primary"
                            onClick={() => navigate('/login')}
                        >
                            Login
                        </Button>
                    </div>
                </Flex>
            </Header>
            
            <Content>
                <div>
                    <Card>
                        <h1>Introduction</h1>
                        <p>
                            Aegis is an OSINT-based (Open-Source Intelligence) 
                            vulnerability and threat detection platform that gathers 
                            intelligence from social media, security blogs, and 
                            vulnerability databases. It leverages LLMs (Large Language 
                            Models) to aggregate, categorize, and analyze security 
                            threats, providing users with customized risk assessments 
                            and actionable insights based on their technology stack.
                        </p>
                    </Card>

                    <Card>
                        <h1>User Cases</h1>
                        <p>
                            <ul>
                                <li>Cyber Intelligence Specialist</li>
                                <li>White Hat Hacker / Penetration Tester</li>
                                <li>Vulnerability Assessor</li>
                            </ul>
                        </p>
                    </Card>

                    <Card>
                        <h1>Features</h1>
                        <p>
                            <ul>
                                <li>General Dashboard</li>
                                <li>AI Aggregation & Analysis</li>
                                <li>Detailed Vulnerability Information</li>
                                <li>Dependency Monitoring</li>
                                <li>Zero-Day Attack Monitoring (Future Feature)</li>
                            </ul>
                        </p>
                    </Card>
                </div>
            </Content>
        </Layout>
    )
}

export default IntroPage