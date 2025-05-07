const getBaseUrl = () => {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        return 'http://localhost:8080';
    }
    return '';
};

export const API_BASE_URL = getBaseUrl();

export const API_ENDPOINTS = {
    AUTH: {
        LOGIN: `${API_BASE_URL}/api/auth/login`,
        REGISTER: `${API_BASE_URL}/api/auth/register`,
        VERIFY_2FA: `${API_BASE_URL}/api/auth/verify_2FA`,
        GENERATE_2FA: `${API_BASE_URL}/api/auth/generate_2FA`,
        ENABLE_2FA: `${API_BASE_URL}/api/auth/enable_2FA`,
        SEND_VERIFY_EMAIL: `${API_BASE_URL}/api/auth/send_verify_email`,
        VERIFY_EMAIL: `${API_BASE_URL}/api/auth/verify_email`,
    },
    PROJECT: {
        LIST: `${API_BASE_URL}/api/project/list`,
        DETAIL: (id) => `${API_BASE_URL}/api/project/${id}`,
        UPLOAD: `${API_BASE_URL}/api/project/upload`,
    }
}; 