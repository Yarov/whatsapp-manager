// frontend/src/api/index.js
import axios from 'axios';

// Instancia de Axios con configuración base
const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para agregar token de autenticación a las solicitudes
apiClient.interceptors.request.use(
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

// Interceptor para manejar errores de respuesta
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Manejar error de autenticación (401)
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API de autenticación
export const authApi = {
  login: (email, password) => {
    return apiClient.post('/auth/login', { email, password });
  },
  register: (name, email, password) => {
    return apiClient.post('/auth/register', { name, email, password });
  },
  getProfile: () => {
    return apiClient.get('/auth/profile');
  }
};

// API de clientes
export const clientApi = {
  getClients: () => {
    return apiClient.get('/clients');
  },
  getClient: (id) => {
    return apiClient.get(`/clients/${id}`);
  },
  createClient: (data) => {
    return apiClient.post('/clients', data);
  },
  updateClient: (id, data) => {
    return apiClient.put(`/clients/${id}`, data);
  },
  updateWebhook: (id, webhookUrl) => {
    return apiClient.patch(`/clients/${id}/webhook`, { webhookUrl });
  },
  deleteClient: (id) => {
    return apiClient.delete(`/clients/${id}`);
  },
  regenerateToken: (id) => {
    return apiClient.post(`/clients/${id}/regenerate-token`);
  }
};

// API de WhatsApp
export const whatsappApi = {
  initializeClient: (id) => {
    return apiClient.post(`/whatsapp/client/${id}/initialize`);
  },
  getQR: (id) => {
    return apiClient.get(`/whatsapp/client/${id}/qr`, {
      responseType: 'blob'
    });
  },
  getStatus: (id) => {
    return apiClient.get(`/whatsapp/client/${id}/status`);
  },
  disconnectClient: (id) => {
    return apiClient.post(`/whatsapp/client/${id}/disconnect`);
  },
  restartClient: (id) => {
    return apiClient.post(`/whatsapp/client/${id}/restart`);
  },
  sendMessage: (id, data) => {
    return apiClient.post(`/whatsapp/client/${id}/send`, data);
  },
  getMessages: (id, params = {}) => {
    return apiClient.get(`/whatsapp/client/${id}/messages`, { params });
  }
};

export default apiClient;