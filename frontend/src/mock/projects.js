// src/mock/projects.js

const mockProjects = [
    {
        id: 1,
        name: 'ecommerce-api',
        status: 'COMPLETED',
        uploadTime: '2025-05-06T10:23:00',
        scanResult: {
            totalDependencies: 134,
            highRiskCount: 12,
            outdatedCount: 37,
            knownVulnerabilityCount: 26,
        },
    },
    {
        id: 2,
        name: 'react-dashboard',
        status: 'SCANNING',
        uploadTime: '2025-05-07T14:40:00',
        scanResult: null,
    },
    {
        id: 3,
        name: 'spring-backend',
        status: 'FAILED',
        uploadTime: '2025-05-05T09:15:00',
        scanResult: null,
    },
    {
        id: 4,
        name: 'mobile-app-ui',
        status: 'COMPLETED',
        uploadTime: '2025-05-01T16:00:00',
        scanResult: {
            totalDependencies: 88,
            highRiskCount: 2,
            outdatedCount: 10,
            knownVulnerabilityCount: 3,
        },
    },
];

export default mockProjects;
