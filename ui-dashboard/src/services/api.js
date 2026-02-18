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
      console.error('No response received:', error.request);
      toast.error('Cannot connect to server. Please check if the API is running.');
    } else {
      console.error('Request error:', error.message);
      toast.error('Request failed: ' + error.message);
    }
    
    return Promise.reject(error);
  }
);

// Export functions
export const exportToCSV = (data, filename) => {
  if (!data || data.length === 0) {
    toast.error('No data to export');
    return;
  }

  const headers = Object.keys(data[0]).join(',');
  const rows = data.map(item => Object.values(item).join(',')).join('\n');
  const csv = `${headers}\n${rows}`;
  
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  window.URL.revokeObjectURL(url);
  toast.success(`Exported ${data.length} records to CSV`);
};

export const exportToJSON = (data, filename) => {
  if (!data) {
    toast.error('No data to export');
    return;
  }

  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}_${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  window.URL.revokeObjectURL(url);
  toast.success(`Exported data to JSON`);
};

export const handleApiError = (error) => {
  console.error('API Error:', error);
};

export default api;