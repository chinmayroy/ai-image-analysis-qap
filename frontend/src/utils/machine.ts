import axios from 'axios';
import Cookies from 'js-cookie';

const machine = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL + '/machine/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to inject the token
machine.interceptors.request.use((config) => {
  const token = Cookies.get('token');
  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }
  return config;
});

export default machine;