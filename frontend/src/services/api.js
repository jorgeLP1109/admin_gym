import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://admin-gym.onrender.com/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData)
};

export const estudiantesAPI = {
  getAll: () => api.get('/estudiantes'),
  getById: (id) => api.get(`/estudiantes/${id}`),
  create: (data) => api.post('/estudiantes', data),
  update: (id, data) => api.put(`/estudiantes/${id}`, data),
  delete: (id) => api.delete(`/estudiantes/${id}`)
};

export const profesoresAPI = {
  getAll: () => api.get('/profesores'),
  create: (data) => api.post('/profesores', data),
  update: (id, data) => api.put(`/profesores/${id}`, data),
  delete: (id) => api.delete(`/profesores/${id}`)
};

export const clasesAPI = {
  getAll: () => api.get('/clases'),
  create: (data) => api.post('/clases', data),
  update: (id, data) => api.put(`/clases/${id}`, data),
  delete: (id) => api.delete(`/clases/${id}`)
};

export const inscripcionesAPI = {
  getAll: () => api.get('/inscripciones'),
  getByEstudiante: (id) => api.get(`/inscripciones/estudiante/${id}`),
  create: (data) => api.post('/inscripciones', data),
  delete: (id) => api.delete(`/inscripciones/${id}`)
};

export const pagosAPI = {
  getAll: () => api.get('/pagos'),
  getByEstudiante: (id) => api.get(`/pagos/estudiante/${id}`),
  getSolventes: () => api.get('/pagos/solventes'),
  getMorosos: () => api.get('/pagos/morosos'),
  create: (data) => api.post('/pagos', data)
};

export const contabilidadAPI = {
  getTransacciones: (params) => api.get('/contabilidad/transacciones', { params }),
  createTransaccion: (data) => api.post('/contabilidad/transacciones', data),
  deleteTransaccion: (id) => api.delete(`/contabilidad/transacciones/${id}`),
  getResumen: (params) => api.get('/contabilidad/resumen', { params })
};

export const asistenciasAPI = {
  getAll: (params) => api.get('/asistencias', { params }),
  create: (data) => api.post('/asistencias', data),
  getReporte: (params) => api.get('/asistencias/reporte', { params })
};

export default api;
