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

// Response Interceptor for Global Error Handling
API.interceptors.response.use(
  (response) => response,
  (error) => {
    // Intercept 401 unauthorized actions to purge the token
    if (error.response && error.response.status === 401) {
      console.warn("Unauthorized access (401) detected. Purging admin token.");
      localStorage.removeItem('adminToken');
    }

    // Log exact details of the API error for debugging app code
    console.error("API Error Logged:", {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      message: error.response?.data?.message || error.response?.data?.error || error.message
    });

    return Promise.reject(error);
  }
);

export default API;
