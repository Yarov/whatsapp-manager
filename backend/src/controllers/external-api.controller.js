// backend/src/controllers/external-api.controller.js
const Client = require('../models/client.model');
const Message = require('../models/message.model');
const whatsappService = require('../services/whatsapp/whatsapp.service');
const { validationResult } = require('express-validator');

/**
 * Controlador para la API externa utilizada con herramientas de integración como n8n
 */
class ExternalApiController {
  /**
   * Envía un mensaje de texto a través de WhatsApp
   */
  async sendMessage(req, res) {
    try {
      // Validar token de API
      const apiToken = req.headers['x-api-token'];
      if (!apiToken) {
        return res.status(401).json({ success: false, message: 'Token de API no proporcionado' });
      }

      // Buscar cliente por token
      const client = await Client.findOne({ apiToken });
      if (!client) {
        return res.status(401).json({ success: false, message: 'Token de API inválido' });
      }

      // Validar cuerpo de la solicitud
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { to, text } = req.body;

      // Verificar que el cliente está conectado
      const status = await whatsappService.getClientStatus(client._id.toString());
      if (!status.isConnected) {
        return res.status(400).json({
          success: false,
          message: 'El cliente de WhatsApp no está conectado',
          clientId: client._id.toString()
        });
      }

      // Enviar mensaje
      const result = await whatsappService.sendTextMessage(
        client._id.toString(),
        to,
        text
      );

      if (!result.success) {
        return res.status(500).json({
          success: false,
          message: result.message
        });
      }

      res.json({
        success: true,
        messageId: result.messageId,
        clientId: client._id.toString(),
        to: to,
        text: text,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Error en API externa (sendMessage):', error);
      res.status(500).json({
        success: false,
        message: 'Error al procesar solicitud',
        error: error.message
      });
    }
  }

  /**
   * Envía un mensaje multimedia (imagen, documento, etc.)
   */
  async sendMediaMessage(req, res) {
    try {
      // Validar token de API
      const apiToken = req.headers['x-api-token'];
      if (!apiToken) {
        return res.status(401).json({ success: false, message: 'Token de API no proporcionado' });
      }

      // Buscar cliente por token
      const client = await Client.findOne({ apiToken });
      if (!client) {
        return res.status(401).json({ success: false, message: 'Token de API inválido' });
      }

      // Validar cuerpo de la solicitud
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { to, mediaUrl, caption, type } = req.body;

      // Verificar tipo válido
      const validTypes = ['image', 'document', 'video', 'audio'];
      if (!validTypes.includes(type)) {
        return res.status(400).json({
          success: false,
          message: `Tipo de medio no válido. Debe ser uno de: ${validTypes.join(', ')}`
        });
      }

      // Verificar que el cliente está conectado
      const status = await whatsappService.getClientStatus(client._id.toString());
      if (!status.isConnected) {
        return res.status(400).json({
          success: false,
          message: 'El cliente de WhatsApp no está conectado',
          clientId: client._id.toString()
        });
      }

      // Enviar mensaje multimedia
      const result = await whatsappService.sendMediaMessage(
        client._id.toString(),
        to,
        mediaUrl,
        caption || '',
        type
      );

      if (!result.success) {
        return res.status(500).json({
          success: false,
          message: result.message
        });
      }

      res.json({
        success: true,
        messageId: result.messageId,
        clientId: client._id.toString(),
        to: to,
        mediaType: type,
        mediaUrl: mediaUrl,
        caption: caption || '',
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Error en API externa (sendMediaMessage):', error);
      res.status(500).json({
        success: false,
        message: 'Error al procesar solicitud',
        error: error.message
      });
    }
  }

  /**
   * Obtiene el estado del cliente
   */
  async getStatus(req, res) {
    try {
      // Validar token de API
      const apiToken = req.headers['x-api-token'];
      if (!apiToken) {
        return res.status(401).json({ success: false, message: 'Token de API no proporcionado' });
      }

      // Buscar cliente por token
      const client = await Client.findOne({ apiToken });
      if (!client) {
        return res.status(401).json({ success: false, message: 'Token de API inválido' });
      }

      // Obtener estado del cliente
      const status = await whatsappService.getClientStatus(client._id.toString());

      res.json({
        success: true,
        clientId: client._id.toString(),
        businessName: client.businessName,
        phoneNumber: client.phoneNumber,
        isConnected: status.isConnected,
        status: client.status
      });
    } catch (error) {
      console.error('Error en API externa (getStatus):', error);
      res.status(500).json({
        success: false,
        message: 'Error al procesar solicitud',
        error: error.message
      });
    }
  }

  /**
   * Obtiene los mensajes recientes
   */
  async getMessages(req, res) {
    try {
      // Validar token de API
      const apiToken = req.headers['x-api-token'];
      if (!apiToken) {
        return res.status(401).json({ success: false, message: 'Token de API no proporcionado' });
      }

      // Buscar cliente por token
      const client = await Client.findOne({ apiToken });
      if (!client) {
        return res.status(401).json({ success: false, message: 'Token de API inválido' });
      }

      // Parámetros de consulta
      const {
        limit = 50,
        offset = 0,
        phoneNumber,
        direction,
        startDate,
        endDate
      } = req.query;

      // Construir filtros
      const filters = {};
      if (phoneNumber) filters.phoneNumber = phoneNumber;
      if (direction && ['inbound', 'outbound'].includes(direction)) {
        filters.direction = direction;
      }
      if (startDate && endDate) {
        filters.startDate = new Date(startDate);
        filters.endDate = new Date(endDate);
      }

      // Obtener mensajes con servicio de WhatsApp
      const result = await whatsappService.getMessages(
        client._id.toString(),
        filters,
        { limit: parseInt(limit), offset: parseInt(offset) }
      );

      if (!result.success) {
        return res.status(500).json({
          success: false,
          message: result.message
        });
      }

      res.json({
        success: true,
        clientId: client._id.toString(),
        messages: result.messages,
        pagination: result.pagination
      });
    } catch (error) {
      console.error('Error en API externa (getMessages):', error);
      res.status(500).json({
        success: false,
        message: 'Error al procesar solicitud',
        error: error.message
      });
    }
  }

  /**
   * Verifica si un número existe en WhatsApp
   */
  async checkNumber(req, res) {
    try {
      // Validar token de API
      const apiToken = req.headers['x-api-token'];
      if (!apiToken) {
        return res.status(401).json({ success: false, message: 'Token de API no proporcionado' });
      }

      // Buscar cliente por token
      const client = await Client.findOne({ apiToken });
      if (!client) {
        return res.status(401).json({ success: false, message: 'Token de API inválido' });
      }

      // Validar cuerpo de la solicitud
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { phoneNumber } = req.body;

      // Verificar que el cliente está conectado
      const status = await whatsappService.getClientStatus(client._id.toString());
      if (!status.isConnected) {
        return res.status(400).json({
          success: false,
          message: 'El cliente de WhatsApp no está conectado',
          clientId: client._id.toString()
        });
      }

      // Verificar número
      const result = await whatsappService.checkNumberExists(
        client._id.toString(),
        phoneNumber
      );

      if (!result.success) {
        return res.status(500).json({
          success: false,
          message: result.message
        });
      }

      res.json({
        success: true,
        phoneNumber: result.phoneNumber,
        exists: result.exists,
        clientId: client._id.toString()
      });
    } catch (error) {
      console.error('Error en API externa (checkNumber):', error);
      res.status(500).json({
        success: false,
        message: 'Error al procesar solicitud',
        error: error.message
      });
    }
  }

  /**
   * Webhook para recibir notificaciones de mensajes en tiempo real
   */
  async setupWebhook(req, res) {
    try {
      // Validar token de API
      const apiToken = req.headers['x-api-token'];
      if (!apiToken) {
        return res.status(401).json({ success: false, message: 'Token de API no proporcionado' });
      }

      // Buscar cliente por token
      const client = await Client.findOne({ apiToken });
      if (!client) {
        return res.status(401).json({ success: false, message: 'Token de API inválido' });
      }

      // Validar cuerpo de la solicitud
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { webhookUrl } = req.body;

      // Actualizar URL del webhook
      client.webhookUrl = webhookUrl;
      await client.save();

      // Configurar un evento de mensaje para este cliente
      whatsappService.subscribeToEvents(client._id.toString(), async (data) => {
        // Esta función se ejecutará cada vez que llegue un mensaje
        // y enviará una petición al webhook configurado
        try {
          if (client.webhookUrl) {
            // Usar axios u otra biblioteca para hacer una solicitud HTTP
            const axios = require('axios');
            await axios.post(client.webhookUrl, {
              event: 'message',
              data: data
            });
          }
        } catch (webhookError) {
          console.error(`Error al enviar webhook para ${client._id}:`, webhookError);
        }
      });

      res.json({
        success: true,
        message: 'Webhook configurado correctamente',
        clientId: client._id.toString(),
        webhookUrl: webhookUrl
      });
    } catch (error) {
      console.error('Error en API externa (setupWebhook):', error);
      res.status(500).json({
        success: false,
        message: 'Error al procesar solicitud',
        error: error.message
      });
    }
  }
}

module.exports = new ExternalApiController();