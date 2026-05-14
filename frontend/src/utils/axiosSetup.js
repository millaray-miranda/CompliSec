import axios from 'axios';

// En desarrollo apunta al BFF. En Docker/producción usa rutas relativas
// VITE_BFF_URL se define en .env o docker-compose como variable de entorno
axios.defaults.baseURL = import.meta.env.VITE_BFF_URL || 'http://localhost:4000';

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
