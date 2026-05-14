import axios from 'axios';

// Configurar URL base si se desea (opcional, pero útil)
axios.defaults.baseURL = 'http://localhost:4000';

// Interceptor de peticiones para inyectar el JWT en el header de Autorización
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axios;
