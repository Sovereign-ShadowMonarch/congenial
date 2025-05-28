import axios from 'axios';

// Since we're in a browser environment connecting to a Docker container
// We need to use localhost as the host, not the Docker internal IP
// This assumes the Docker container has port 8081 forwarded to the host
const apiBaseUrl = 'http://localhost:8081/api/1';

console.log('API connecting to backend via localhost:', apiBaseUrl);

const api = axios.create({
  baseURL: apiBaseUrl,
  // Don't use withCredentials for now as it can cause CORS issues
  withCredentials: false,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for authentication
api.interceptors.request.use(
  (config) => {
    // Log requests for debugging
    console.log(`Request to: ${config.url}`);
    
    // Auth token will be handled via HTTP-only cookies
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log errors for debugging
    console.error('API Error:', error.message, error.response?.status, error.config?.url);
    
    if (error.response?.status === 401) {
      // Redirect to login on unauthorized
      window.location.href = '/auth/signin';
    }
    return Promise.reject(error);
  }
);

export default api;
