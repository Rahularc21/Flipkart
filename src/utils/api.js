import axios from 'axios';

// Instantiate Axios carrying absolute/relative routing mappings
const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Intercept outgoing communications and attach token if active
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

// Intercept incoming communications to envelope response structures
api.interceptors.response.use(
  (response) => {
    return response.data; // strip raw axios metadata, return custom JSON Envelope
  },
  (error) => {
    const customError = {
      success: false,
      message: error.response?.data?.message || 'A routing error is detected. Check network connections.',
      errors: error.response?.data?.errors || []
    };
    return Promise.resolve(customError); // resolve errors gracefully to prevent runtime crash
  }
);

export default api;
