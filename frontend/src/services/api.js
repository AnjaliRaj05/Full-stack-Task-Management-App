import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

// Create axios instance
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add token interceptor
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) config.headers.Authorization = `Bearer ${token}`;
        return config;
    },
    (error) => Promise.reject(error)
);

// Handle 401
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

/* ------------------ AUTH API ------------------ */
export const authAPI = {
    signup: (data) => api.post('/auth/signup', data),
    login: (data) => api.post('/auth/login', data),
    getCurrentUser: () => api.get('/auth/me'),
    logout: () => api.post('/auth/logout'),
};

/* ------------------ USERS API ------------------ */
export const usersAPI = {
    getUsers: () => api.get('/users'),
    getUserById: (id) => api.get(`/users/${id}`),
    updateUser: (id, data) => api.put(`/users/${id}`, data),
    deleteUser: (id) => api.delete(`/users/${id}`),
};

/* ------------------ TASK API ------------------ */
export const tasksAPI = {
    createTask: (data) => api.post('/tasks', data),
   getTasks: (page = 1, limit = 10, filter) =>
  api.get(`/tasks?page=${page}&limit=${limit}&filter=${filter}`),
    getTaskById: (id) => api.get(`/tasks/${id}`),
    updateTask: (id, data) => api.put(`/tasks/${id}`, data),
    deleteTask: (id) => api.delete(`/tasks/${id}`),
};

export default api;
