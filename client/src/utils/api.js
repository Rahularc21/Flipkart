import axios from 'axios';

// Create a configured Axios instancer
const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Outgoing request interceptor to append authorization header
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('fk_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to format errors seamlessly
api.interceptors.response.use(
  (response) => {
    // If the response contains our envelope, return the data block directly
    if (response.data && response.data.success !== undefined) {
      return response.data;
    }
    return response;
  },
  (error) => {
    const responseError = {
      success: false,
      message: 'Failed to communicate with Flipkart servers. Please try again.',
      errors: []
    };

    if (error.response && error.response.data) {
      responseError.message = error.response.data.message || responseError.message;
      responseError.errors = error.response.data.errors || [];
    }
    
    return Promise.reject(responseError);
  }
);

export default api;
export { API_URL };
