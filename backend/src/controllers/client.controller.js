// backend/src/controllers/client.controller.js
const { v4: uuidv4 } = require('uuid');
const { validationResult } = require('express-validator');
const Client = require('../models/client.model');
const whatsappService = require('../services/whatsapp/whatsapp.service');
const Message = require('../models/message.model');

exports.createClient = async (req, res) => {
  try {
    // Validar entrada
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { businessName, phoneNumber } = req.body;

    // Verificar si el cliente ya existe
    const existingClient = await Client.findOne({ phoneNumber });
    if (existingClient) {
      return res.status(400).json({ message: 'El número de teléfono ya está registrado' });
    }

    // Generar token de API único
    const apiToken = uuidv4();

    // Generar ID de sesión
    const sessionId = uuidv4();

    // Crear nuevo cliente
    const client = new Client({
      businessName,
      phoneNumber,
      apiToken,
      sessionId,
      owner: req.userId
    });

    await client.save();

    res.status(201).json({
      message: 'Cliente creado correctamente',
      client: {
        id: client._id,
        businessName: client.businessName,
        phoneNumber: client.phoneNumber,
        apiToken: client.apiToken,
        sessionId: client.sessionId,
        status: client.status
      }
    });
  } catch (error) {
    console.error('Error al crear cliente:', error);
    res.status(500).json({ message: 'Error al crear cliente' });
  }
};

exports.getClients = async (req, res) => {
  try {
    const clients = await Client.find({ owner: req.userId });

    res.json({
      clients: clients.map(client => ({
        id: client._id,
        businessName: client.businessName,
        phoneNumber: client.phoneNumber,
        status: client.status,
        isConnected: client.isConnected,
        createdAt: client.createdAt
      }))
    });
  } catch (error) {
    console.error('Error al obtener clientes:', error);
    res.status(500).json({ message: 'Error al obtener clientes' });
  }
};

exports.getClient = async (req, res) => {
  try {
    const client = await Client.findOne({
      _id: req.params.id,
      owner: req.userId
    });

    if (!client) {
      return res.status(404).json({ message: 'Cliente no encontrado' });
    }

    // Obtener estado actual del cliente en WhatsApp
    const status = await whatsappService.getClientStatus(client._id.toString());

    res.json({
      client: {
        id: client._id,
        businessName: client.businessName,
        phoneNumber: client.phoneNumber,
        apiToken: client.apiToken,
        webhookUrl: client.webhookUrl,
        isConnected: status.isConnected || client.isConnected,
        status: client.status,
        createdAt: client.createdAt,
        updatedAt: client.updatedAt
      }
    });
  } catch (error) {
    console.error('Error al obtener cliente:', error);
    res.status(500).json({ message: 'Error al obtener cliente' });
  }
};

exports.updateClient = async (req, res) => {
  try {
    // Validar entrada
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { businessName, webhookUrl } = req.body;

    const client = await Client.findOne({
      _id: req.params.id,
      owner: req.userId
    });

    if (!client) {
      return res.status(404).json({ message: 'Cliente no encontrado' });
    }

    // Actualizar cliente
    client.businessName = businessName || client.businessName;
    client.webhookUrl = webhookUrl || client.webhookUrl;

    await client.save();

    res.json({
      message: 'Cliente actualizado correctamente',
      client: {
        id: client._id,
        businessName: client.businessName,
        phoneNumber: client.phoneNumber,
        webhookUrl: client.webhookUrl,
        status: client.status
      }
    });
  } catch (error) {
    console.error('Error al actualizar cliente:', error);
    res.status(500).json({ message: 'Error al actualizar cliente' });
  }
};

/**
 * Actualiza solo la URL del webhook de un cliente
 */
exports.updateWebhook = async (req, res) => {
  try {
    // Validar entrada
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { webhookUrl } = req.body;

    const client = await Client.findOne({
      _id: req.params.id,
      owner: req.userId
    });

    if (!client) {
      return res.status(404).json({ message: 'Cliente no encontrado' });
    }

    // Actualizar solo la URL del webhook
    client.webhookUrl = webhookUrl;
    await client.save();

    // Configurar webhook en el servicio de WhatsApp si el cliente está conectado
    if (client.isConnected) {
      try {
        await whatsappService.subscribeToEvents(client._id.toString(), async (data) => {
          try {
            if (client.webhookUrl) {
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
      } catch (subscribeError) {
        console.error(`Error al suscribir a eventos de webhook: ${subscribeError.message}`);
        // No interrumpir la actualización por un error de suscripción
      }
    }

    res.json({
      message: 'URL de webhook actualizada correctamente',
      client: {
        id: client._id,
        businessName: client.businessName,
        phoneNumber: client.phoneNumber,
        webhookUrl: client.webhookUrl
      }
    });
  } catch (error) {
    console.error('Error al actualizar webhook:', error);
    res.status(500).json({ message: 'Error al actualizar webhook' });
  }
};

exports.deleteClient = async (req, res) => {
  try {
    const client = await Client.findOne({
      _id: req.params.id,
      owner: req.userId
    });

    if (!client) {
      return res.status(404).json({ message: 'Cliente no encontrado' });
    }

    // Desconectar cliente de WhatsApp si está conectado
    if (client.isConnected) {
      await whatsappService.disconnectClient(client._id.toString());
    }

    // Eliminar cliente
    await client.remove();

    res.json({
      message: 'Cliente eliminado correctamente'
    });
  } catch (error) {
    console.error('Error al eliminar cliente:', error);
    res.status(500).json({ message: 'Error al eliminar cliente' });
  }
};
/**
 * Eliminar un cliente de manera segura con palabra de confirmación
 */
exports.secureDeleteClient = async (req, res) => {
  try {
    const { confirmationWord } = req.body;

    // Verificar que se proporcionó la palabra de confirmación
    if (!confirmationWord || confirmationWord !== 'ELIMINAR') {
      return res.status(400).json({
        success: false,
        message: 'Palabra de confirmación incorrecta. Debe ingresar "ELIMINAR"'
      });
    }

    const client = await Client.findOne({
      _id: req.params.id,
      owner: req.userId
    });

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Cliente no encontrado'
      });
    }

    // Desconectar cliente de WhatsApp si está conectado
    if (client.isConnected) {
      try {
        await whatsappService.disconnectClient(client._id.toString());
      } catch (disconnectError) {
        console.error(`Error al desconectar cliente ${client._id}:`, disconnectError);
        // Continuamos con la eliminación aunque falle la desconexión
      }
    }

    // Eliminar todos los mensajes asociados al cliente
    await Message.deleteMany({ clientId: client._id });

    // Eliminar cliente
    await Client.deleteOne({ _id: client._id });

    res.json({
      success: true,
      message: 'Cliente eliminado correctamente'
    });
  } catch (error) {
    console.error('Error al eliminar cliente:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar cliente'
    });
  }
};

exports.regenerateToken = async (req, res) => {
  try {
    const client = await Client.findOne({
      _id: req.params.id,
      owner: req.userId
    });

    if (!client) {
      return res.status(404).json({ message: 'Cliente no encontrado' });
    }

    // Generar nuevo token
    client.apiToken = uuidv4();
    await client.save();

    res.json({
      message: 'Token regenerado correctamente',
      token: client.apiToken
    });
  } catch (error) {
    console.error('Error al regenerar token:', error);
    res.status(500).json({ message: 'Error al regenerar token' });
  }
};