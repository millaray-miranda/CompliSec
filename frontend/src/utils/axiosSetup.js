import axios from 'axios';

// Sin baseURL: Vite proxy redirige /api → http://bff:4000 en Docker
// En desarrollo local sin Docker, define VITE_BFF_URL=http://localhost:4000 en un .env
if (import.meta.env.VITE_BFF_URL) {
  axios.defaults.baseURL = import.meta.env.VITE_BFF_URL;
}

// Interceptor: inyecta el JWT en cada petición autenticada
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor de respuesta: si el token expiró, cierra sesión automáticamente
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.reload();
    }
    return Promise.reject(error);
  }
);

export default axios;
