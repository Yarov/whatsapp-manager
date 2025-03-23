// frontend/src/api/admin.js
import apiClient from './index';

// API para funciones de administrador
export const adminApi = {
  // Obtener todos los usuarios
  getUsers: () => {
    return apiClient.get('/admin/users');
  },

  // Obtener detalles de un usuario específico
  getUserDetails: (userId) => {
    return apiClient.get(`/admin/users/${userId}`);
  },

  // Obtener los clientes de un usuario específico
  getUserClients: (userId) => {
    return apiClient.get(`/admin/users/${userId}/clients`);
  },

  // Cambiar el estado de un usuario (activar/desactivar)
  toggleUserStatus: (userId) => {
    return apiClient.put(`/admin/users/${userId}/status`);
  },

  // Cambiar el rol de un usuario
  changeUserRole: (userId, role) => {
    return apiClient.put(`/admin/users/${userId}/role`, { role });
  },

  // Obtener estadísticas generales del sistema
  getSystemStats: () => {
    return apiClient.get('/admin/stats');
  }
};

export default adminApi;