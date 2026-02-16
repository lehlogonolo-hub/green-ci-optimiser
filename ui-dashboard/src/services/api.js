import axios from 'axios';
import toast from 'react-hot-toast';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
const API_KEY = process.env.REACT_APP_API_KEY || 'demo-key-123';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'X-API-Key': API_KEY,
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // You can add loading state here if needed
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('API Error:', error.response.data);
      
      switch (error.response.status) {
        case 401:
          toast.error('Unauthorized: Invalid API key');
          break;
        case 403:
          toast.error('Forbidden: You don\'t have permission');
          break;
        case 404:
          toast.error('Resource not found');
          break;
        case 429:
          toast.error('Too many requests. Please try again later.');
          break;
        case 500:
          toast.error('Server error. Please try again later.');
          break;
        default:
          toast.error(error.response.data?.error || 'An error occurred');
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received:', error.request);
      toast.error('Cannot connect to server. Please check if the API is running.');
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Request error:', error.message);
      toast.error('Request failed: ' + error.message);
    }
    
    return Promise.reject(error);
  }
);

export const handleApiError = (error) => {
  // Additional error handling logic
  console.error('API Error:', error);
};

export default api;