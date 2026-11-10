import axios from 'axios';

const api = axios.create({
    baseURL: 'https://store-app-okoc.onrender.com/api/v1',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

// هذا هو الجزء الأهم: إضافة الـ Token تلقائياً مع كل طلب Request
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;