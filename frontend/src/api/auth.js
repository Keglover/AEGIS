import { API_ENDPOINTS } from '../config';

export async function login(data) {
    const res = await fetch(API_ENDPOINTS.AUTH.LOGIN, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    return res.json();
}

export async function register(data) {
    const res = await fetch(API_ENDPOINTS.AUTH.REGISTER, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    return res.json();
}

export async function verify2FA(data) {
    const res = await fetch(API_ENDPOINTS.AUTH.VERIFY_2FA, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    return res.json();
}


export async function verifyEmail(data) {
    const res = await fetch(API_ENDPOINTS.AUTH.VERIFY_EMAIL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    return res.json();
}

export async function sendEmailVerifyCode(data) {
    const res = await fetch(API_ENDPOINTS.AUTH.SEND_VERIFY_EMAIL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    return res.json();
}