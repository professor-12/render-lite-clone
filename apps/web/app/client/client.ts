import axios from 'axios';

const api = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  withCredentials: true,
});

api.interceptors.response.use(
  (r) => r,
  (error) => {
    if (error?.response?.status === 401) {
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  },
);

export default api;
