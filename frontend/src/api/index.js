import axios from 'axios';

const API = axios.create({
  baseURL: '/api',
});

// Attach JWT to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Redirect to login on 401
API.interceptors.response.use(
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

// --- Auth ---
export const registerUser = (data) => API.post('/auth/register', data);
export const loginUser = (data) => API.post('/auth/login', data);

// --- Projects ---
export const getProjects = () => API.get('/projects');
export const getProject = (id) => API.get(`/projects/${id}`);
export const createProject = (data) => API.post('/projects', data);
export const deleteProject = (id) => API.delete(`/projects/${id}`);

// --- Tasks ---
export const getTasks = (projectId) => API.get(`/tasks/project/${projectId}`);
export const getTask = (id) => API.get(`/tasks/${id}`);
export const createTask = (data) => API.post('/tasks', data);
export const updateTask = (id, data) => API.put(`/tasks/${id}`, data);
export const updateTaskStatus = (id, status) => API.put(`/tasks/${id}/status`, { status });
export const deleteTask = (id) => API.delete(`/tasks/${id}`);

// --- Analytics ---
export const getStatusCounts = (projectId) => API.get(`/tasks/project/${projectId}/analytics/status`);
export const getPriorityCounts = (projectId) => API.get(`/tasks/project/${projectId}/analytics/priority`);

export default API;
