import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // ✅ No trailing slash
  withCredentials: true,
});

export default api; 