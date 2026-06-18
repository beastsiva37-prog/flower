import axios from 'axios';

// Create Axios Instance
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://flower-shop-server-u3av.onrender.com/api'
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

export default API; // Axios client configuration for M.K. Muthusamy Flower Shop

