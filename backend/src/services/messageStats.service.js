// backend/src/services/messageStats.service.js
const Message = require('../models/message.model');

class MessageStatsService {
  /**
   * Obtener estadísticas de mensajes para un cliente específico
   * @param {String} clientId - ID del cliente
   * @returns {Promise<Object>} - Estadísticas de mensajes
   */
  async getMessageStats(clientId) {
    try {
      // Verificar que el cliente existe
      const totalMessages = await Message.countDocuments({ clientId });
      if (totalMessages === 0) {
        return {
          success: true,
          stats: {
            overview: {
              total: 0,
              inbound: 0,
              outbound: 0
            },
            timeDistribution: {
              daily: [],
              weekly: [],
              monthly: []
            },
            topContacts: []
          }
        };
      }

      // Estadísticas generales
      const inboundMessages = await Message.countDocuments({
        clientId,
        direction: 'inbound'
      });
      const outboundMessages = await Message.countDocuments({
        clientId,
        direction: 'outbound'
      });

      // Obtener distribución por tiempo (últimos 30 días)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const messagesLast30Days = await Message.find({
        clientId,
        timestamp: { $gte: thirtyDaysAgo }
      }).sort({ timestamp: 1 });

      // Procesar datos para distribución diaria/semanal/mensual
      const daily = {};
      const weekly = {};
      const monthly = {};
      const contactFrequency = {};

      messagesLast30Days.forEach(message => {
        const date = new Date(message.timestamp);

        // Formato diario YYYY-MM-DD
        const dayKey = date.toISOString().split('T')[0];
        if (!daily[dayKey]) daily[dayKey] = { inbound: 0, outbound: 0, total: 0 };
        daily[dayKey][message.direction]++;
        daily[dayKey].total++;

        // Formato semanal YYYY-WW
        const weekNumber = this.getWeekNumber(date);
        const weekKey = `${date.getFullYear()}-W${weekNumber}`;
        if (!weekly[weekKey]) weekly[weekKey] = { inbound: 0, outbound: 0, total: 0 };
        weekly[weekKey][message.direction]++;
        weekly[weekKey].total++;

        // Formato mensual YYYY-MM
        const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
        if (!monthly[monthKey]) monthly[monthKey] = { inbound: 0, outbound: 0, total: 0 };
        monthly[monthKey][message.direction]++;
        monthly[monthKey].total++;

        // Contar frecuencia de contacto
        const contactKey = message.direction === 'inbound' ? message.from : message.to;
        if (!contactFrequency[contactKey]) {
          contactFrequency[contactKey] = {
            phone: contactKey,
            inbound: 0,
            outbound: 0,
            total: 0,
            lastMessage: date
          };
        }
        contactFrequency[contactKey][message.direction]++;
        contactFrequency[contactKey].total++;
        if (date > contactFrequency[contactKey].lastMessage) {
          contactFrequency[contactKey].lastMessage = date;
        }
      });

      // Convertir datos a arrays para resultado final
      const dailyData = Object.keys(daily).map(key => ({
        date: key,
        inbound: daily[key].inbound,
        outbound: daily[key].outbound,
        total: daily[key].total
      })).sort((a, b) => a.date.localeCompare(b.date));

      const weeklyData = Object.keys(weekly).map(key => ({
        week: key,
        inbound: weekly[key].inbound,
        outbound: weekly[key].outbound,
        total: weekly[key].total
      })).sort((a, b) => a.week.localeCompare(b.week));

      const monthlyData = Object.keys(monthly).map(key => ({
        month: key,
        inbound: monthly[key].inbound,
        outbound: monthly[key].outbound,
        total: monthly[key].total
      })).sort((a, b) => a.month.localeCompare(b.month));

      // Obtener top 10 contactos por volumen de mensajes
      const topContacts = Object.values(contactFrequency)
        .sort((a, b) => b.total - a.total)
        .slice(0, 10)
        .map(contact => ({
          phone: contact.phone,
          inbound: contact.inbound,
          outbound: contact.outbound,
          total: contact.total,
          lastMessage: contact.lastMessage
        }));

      return {
        success: true,
        stats: {
          overview: {
            total: totalMessages,
            inbound: inboundMessages,
            outbound: outboundMessages
          },
          timeDistribution: {
            daily: dailyData,
            weekly: weeklyData,
            monthly: monthlyData
          },
          topContacts
        }
      };
    } catch (error) {
      console.error('Error al obtener estadísticas de mensajes:', error);
      return {
        success: false,
        message: `Error al obtener estadísticas: ${error.message}`
      };
    }
  }

  /**
   * Obtener el número de semana del año para una fecha
   * @param {Date} date - Fecha
   * @returns {Number} - Número de semana
   */
  getWeekNumber(date) {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  }
}

module.exports = new MessageStatsService();