import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
const WORKSPACE_STORAGE_KEY = 'taskora:currentWorkspaceId';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true, // send httpOnly cookies with every request
});

// Inject X-Workspace-Id on every request (backend falls back to user's default if missing)
api.interceptors.request.use((config) => {
  const workspaceId = localStorage.getItem(WORKSPACE_STORAGE_KEY);
  if (workspaceId) {
    config.headers = config.headers || {};
    config.headers['X-Workspace-Id'] = workspaceId;
  }
  return config;
});

// On 401: try to refresh the token silently, then retry the original request
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve();
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Skip refresh logic for auth check and refresh endpoints — just let them fail quietly
    const skipRefreshUrls = ['/auth/me', '/auth/refresh', '/auth/login', '/auth/signup'];
    if (skipRefreshUrls.some((url) => originalRequest.url.includes(url))) {
      return Promise.reject(error);
    }

    // If 401 and we haven't already tried refreshing for this request
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => api(originalRequest));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await api.post('/auth/refresh');
        processQueue(null);
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError);
        // Only redirect if not already on login/register page
        const path = window.location.pathname;
        if (path !== '/login' && path !== '/register' && path !== '/') {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
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

/* ------------------ WORKSPACES API ------------------ */
export const workspacesAPI = {
  list: () => api.get('/workspaces'),
  create: (data) => api.post('/workspaces', data),
  getById: (id) => api.get(`/workspaces/${id}`),
  update: (id, data) => api.patch(`/workspaces/${id}`, data),
  listMembers: (id) => api.get(`/workspaces/${id}/members`),
};

/* ------------------ USERS API ------------------ */
export const usersAPI = {
  getUsers: () => api.get('/users/all'),
  getUserById: (id) => api.get(`/users/${id}`),
};

/* ------------------ TASK API ------------------ */
export const tasksAPI = {
  createTask: (data) => api.post('/tasks', data),
  getTasks: (page = 1, limit = 10, filter, search = '', priority = '') => {
    let url = `/tasks?page=${page}&limit=${limit}`;
    if (filter) url += `&filter=${filter}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    if (priority) url += `&priority=${priority}`;
    return api.get(url);
  },
  getTaskById: (id) => api.get(`/tasks/${id}`),
  updateTask: (id, data) => api.put(`/tasks/${id}`, data),
  deleteTask: (id) => api.delete(`/tasks/${id}`),
};

/* ------------------ COMMENTS API ------------------ */
export const commentsAPI = {
  getComments: (taskId) => api.get(`/tasks/${taskId}/comments`),
  addComment: (taskId, content) => api.post(`/tasks/${taskId}/comments`, { content }),
  getActivity: (taskId) => api.get(`/tasks/${taskId}/activity`),
};

export default api;
