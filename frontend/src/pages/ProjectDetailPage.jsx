import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Card,
  Row,
  Col,
  Typography,
  Tag,
  Table,
  Spin,
  message,
} from 'antd';

const { Title } = Typography;

function ProjectDetailPage() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`http://localhost:8080/api/project/${id}`)
        .then((res) => res.json())
        .then((json) => {
          if (json.code === 200) {
            setProject(json.data);
          } else {
            message.error(json.msg || 'Failed to load project.');
          }
        })
        .catch(() => message.error('Server error'))
        .finally(() => setLoading(false));
  }, [id]);

  const columns = [
    {
      title: 'Package Name',
      dataIndex: 'packageName',
    },
    {
      title: 'Current Version',
      dataIndex: 'currentVersion',
    },
    {
      title: 'Latest Version',
      dataIndex: 'latestVersion',
    },
    {
      title: 'Outdated',
      dataIndex: 'outdated',
      render: (v) => (v ? <Tag color="orange">Yes</Tag> : <Tag color="green">No</Tag>),
    },
    {
      title: 'Risk Level',
      dataIndex: 'riskLevel',
      render: (v) => {
        const color = v === 'HIGH' ? 'red' : v === 'MEDIUM' ? 'gold' : 'green';
        return <Tag color={color}>{v}</Tag>;
      },
    },
    {
      title: 'Vulnerabilities',
      dataIndex: 'knownVulnerabilities',
    },
    {
      title: 'CVE Link',
      dataIndex: 'cveUrl',
      render: (url) =>
          url ? (
              <a href={url} target="_blank" rel="noopener noreferrer">
                View CVE
              </a>
          ) : (
              '-'
          ),
    },
  ];

  if (loading || !project) {
    return (
        <div
            style={{
              height: 'calc(100vh - 64px)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
        >
          <Spin size="large" tip="Loading project..." />
        </div>
    );
  }

  return (
      <div style={{ padding: 24 }}>
        <Title level={2}>Project Details</Title>

        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={12}>
            <Card title="Project Info">
              <p><strong>Name:</strong> {project.name}</p>
              <p><strong>Status:</strong> <Tag>{project.status}</Tag></p>
              <p><strong>Uploaded At:</strong> {new Date(project.uploadTime).toLocaleString()}</p>
              <p><strong>File Name:</strong> {project.fileName}</p>
            </Card>
          </Col>
          <Col span={12}>
            <Card title="Scan Summary">
              <p><strong>Total Dependencies:</strong> {project.scanResult?.totalDependencies ?? '-'}</p>
              <p><strong>High Risk:</strong> {project.scanResult?.highRiskCount ?? '-'}</p>
              <p><strong>Outdated:</strong> {project.scanResult?.outdatedCount ?? '-'}</p>
              <p><strong>Known Vulnerabilities:</strong> {project.scanResult?.knownVulnerabilityCount ?? '-'}</p>
            </Card>
          </Col>
        </Row>

        <Card title="Dependency Details">
          <Table
              rowKey="id"
              columns={columns}
              dataSource={project.dependencies}
              pagination={{ pageSize: 8 }}
          />
        </Card>
      </div>
  );
}

export default ProjectDetailPage;
