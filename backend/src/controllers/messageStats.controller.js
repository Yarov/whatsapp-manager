// backend/src/controllers/messageStats.controller.js
const messageStatsService = require('../services/messageStats.service');

/**
 * Controlador para las estadísticas de mensajes
 */
class MessageStatsController {
  /**
   * Obtener estadísticas de mensajes para un cliente específico
   * @param {Object} req - Objeto de solicitud HTTP
   * @param {Object} res - Objeto de respuesta HTTP
   */
  async getClientMessageStats(req, res) {
    try {
      const clientId = req.params.id;
      const userId = req.userId; // Obtenido del middleware de autenticación

      // Verificar que el cliente pertenece al usuario
      // Esta validación la haríamos idealmente en un middleware
      const Client = require('../models/client.model');
      const client = await Client.findOne({ _id: clientId, owner: userId });
      if (!client) {
        return res.status(404).json({ message: 'Cliente no encontrado' });
      }

      const result = await messageStatsService.getMessageStats(clientId);

      if (!result.success) {
        return res.status(500).json({ message: result.message });
      }

      res.json(result.stats);
    } catch (error) {
      console.error('Error al obtener estadísticas de mensajes:', error);
      res.status(500).json({ message: 'Error al obtener estadísticas de mensajes' });
    }
  }
}

module.exports = new MessageStatsController();