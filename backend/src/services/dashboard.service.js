// backend/src/services/dashboard.service.js
const Message = require('../models/message.model');
const Client = require('../models/client.model');

class DashboardService {
  /**
   * Obtener estadísticas para el dashboard
   * @param {String} userId - ID del usuario
   * @returns {Promise<Object>} - Estadísticas del dashboard
   */
  async getDashboardStats(userId) {
    try {
      // Obtener clientes del usuario
      const clients = await Client.find({ owner: userId });

      if (!clients || clients.length === 0) {
        return {
          success: true,
          stats: {
            totalClients: 0,
            connectedClients: 0,
            pendingClients: 0,
            totalMessages: 0
          }
        };
      }

      // Calcular estadísticas de clientes
      const totalClients = clients.length;
      const connectedClients = clients.filter(client => client.isConnected).length;
      const pendingClients = clients.filter(client => client.status === 'pending').length;

      // Obtener el total de mensajes para todos los clientes del usuario
      const totalMessages = await Message.countDocuments({
        clientId: { $in: clients.map(client => client._id) }
      });

      return {
        success: true,
        stats: {
          totalClients,
          connectedClients,
          pendingClients,
          totalMessages
        }
      };
    } catch (error) {
      console.error('Error al obtener estadísticas del dashboard:', error);
      return {
        success: false,
        message: `Error al obtener estadísticas: ${error.message}`
      };
    }
  }
}

module.exports = new DashboardService();