import axios from 'axios';

const apiBase = import.meta.env.VITE_API_URL || 'https://flower-shop-server-u3av.onrender.com';
const cleanBase = apiBase.endsWith('/') ? apiBase.slice(0, -1) : apiBase;

// Create Axios Instance
const API = axios.create({
  baseURL: `${cleanBase}/api`
});

// Request Interceptor to attach Authorization Header
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default API;
