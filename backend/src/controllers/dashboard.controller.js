// backend/src/controllers/dashboard.controller.js
const dashboardService = require('../services/dashboard.service');

/**
 * Controlador para las funciones del dashboard
 */
class DashboardController {
  /**
   * Obtener estadísticas para el dashboard
   * @param {Object} req - Objeto de solicitud HTTP
   * @param {Object} res - Objeto de respuesta HTTP
   */
  async getStats(req, res) {
    try {
      const userId = req.userId; // Obtenido del middleware de autenticación

      const result = await dashboardService.getDashboardStats(userId);

      if (!result.success) {
        return res.status(500).json({ message: result.message });
      }

      res.json(result.stats);
    } catch (error) {
      console.error('Error al obtener estadísticas del dashboard:', error);
      res.status(500).json({ message: 'Error al obtener estadísticas del dashboard' });
    }
  }
}

module.exports = new DashboardController();