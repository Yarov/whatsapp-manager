// backend/src/controllers/whatsapp.controller.js
const fs = require('fs');
const path = require('path');
const { validationResult } = require('express-validator');
const Client = require('../models/client.model');
const Message = require('../models/message.model');
const whatsappService = require('../services/whatsapp/whatsapp.service');
const qrcode = require('qrcode');

exports.initializeClient = async (req, res) => {
  try {
    const clientId = req.params.id;

    // Verificar que el cliente existe y pertenece al usuario
    const client = await Client.findOne({
      _id: clientId,
      owner: req.userId
    });

    if (!client) {
      return res.status(404).json({ message: 'Cliente no encontrado' });
    }

    // Inicializar cliente de WhatsApp
    const result = await whatsappService.initClient(
      clientId,
      client.phoneNumber
    );

    if (!result.success) {
      return res.status(500).json({ message: result.message });
    }

    res.json({
      message: 'Cliente inicializado correctamente',
      clientId
    });
  } catch (error) {
    console.error('Error al inicializar cliente:', error);
    res.status(500).json({ message: 'Error al inicializar cliente' });
  }
};

exports.getQR = async (req, res) => {
  try {
    const clientId = req.params.id;
    console.log("Obteniendo QR para cliente:", clientId);

    // Verificar que el cliente existe y pertenece al usuario
    const client = await Client.findOne({
      _id: clientId,
      owner: req.userId
    });

    if (!client) {
      console.log("Cliente no encontrado en DB");
      return res.status(404).json({ message: 'Cliente no encontrado' });
    }

    console.log("Cliente encontrado en DB:", client.businessName);

    // Verificar si el cliente está inicializado en el servicio de WhatsApp
    const clientExists = whatsappService.clients.has(clientId);
    console.log("Cliente en servicio WhatsApp:", clientExists ? "Sí" : "No");

    if (!clientExists) {
      // Intentar inicializar automáticamente
      console.log("Cliente no inicializado, intentando inicializar...");
      const initResult = await whatsappService.initClient(clientId, client.phoneNumber);

      if (!initResult.success) {
        console.log("Error al inicializar cliente:", initResult.message);
        return res.status(404).json({ message: 'Error al inicializar cliente. Por favor, inicialice manualmente.' });
      }

      // Esperar un momento para que se genere el QR
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    // Obtener QR code
    const result = await whatsappService.getQR(clientId);
    console.log("Resultado de getQR:", JSON.stringify({
      success: result.success,
      hasQRCode: !!result.qrCode,
      hasQRImagePath: !!result.qrImagePath
    }));

    if (!result.success) {
      console.log("Error al obtener QR:", result.message);
      return res.status(404).json({ message: result.message });
    }

    // Si el cliente solicitó formato JSON (para usar en una API de generación de QR)
    if (req.query.format === 'json' || req.headers.accept === 'application/json') {
      console.log("Devolviendo QR como JSON");
      return res.json({
        qrCode: result.qrCode
      });
    }

    // Enviar imagen QR si existe
    if (result.qrImagePath && fs.existsSync(result.qrImagePath)) {
      console.log("Devolviendo imagen QR:", result.qrImagePath);
      return res.sendFile(result.qrImagePath);
    }

    // Si no hay imagen pero hay código QR, generarla en tiempo real
    if (result.qrCode) {
      console.log("Generando imagen QR en tiempo real");
      try {
        // Crear un buffer con la imagen QR
        const qrBuffer = await qrcode.toBuffer(result.qrCode, {
          color: {
            dark: '#000000',
            light: '#ffffff'
          },
          scale: 8,
          margin: 2
        });

        // Establecer el tipo de contenido y enviar
        res.set('Content-Type', 'image/png');
        return res.send(qrBuffer);
      } catch (qrError) {
        console.error("Error al generar QR en tiempo real:", qrError);
        // Si falla la generación de imagen, devolver el texto QR como último recurso
        return res.json({
          qrCode: result.qrCode,
          message: 'Código QR disponible solo como texto'
        });
      }
    }

    // Si no hay QR, devolver un error
    return res.status(404).json({ message: 'QR Code no disponible todavía' });
  } catch (error) {
    console.error('Error al obtener QR:', error);
    res.status(500).json({ message: 'Error al obtener QR', error: error.message });
  }
};

exports.getStatus = async (req, res) => {
  try {
    const clientId = req.params.id;

    // Verificar que el cliente existe y pertenece al usuario
    const client = await Client.findOne({
      _id: clientId,
      owner: req.userId
    });

    if (!client) {
      return res.status(404).json({ message: 'Cliente no encontrado' });
    }

    // Obtener estado del cliente en WhatsApp
    const result = await whatsappService.getClientStatus(clientId);
    console.log(`Estado de cliente ${clientId}:`, result);

    // Verificar si el cliente está realmente conectado
    const isConnected = result.success && result.isConnected === true;

    // Si está conectado, actualizar el estado en la base de datos si es necesario
    if (isConnected && !client.isConnected) {
      await Client.findByIdAndUpdate(clientId, {
        isConnected: true,
        status: 'active'
      });
    }

    res.json({
      isConnected: isConnected,
      status: client.status
    });
  } catch (error) {
    console.error('Error al obtener estado:', error);
    res.status(500).json({ message: 'Error al obtener estado' });
  }
};

exports.disconnectClient = async (req, res) => {
  try {
    const clientId = req.params.id;

    // Verificar que el cliente existe y pertenece al usuario
    const client = await Client.findOne({
      _id: clientId,
      owner: req.userId
    });

    if (!client) {
      return res.status(404).json({ message: 'Cliente no encontrado' });
    }

    // Desconectar cliente
    const result = await whatsappService.disconnectClient(clientId);

    if (!result.success) {
      return res.status(500).json({ message: result.message });
    }

    res.json({
      message: 'Cliente desconectado correctamente'
    });
  } catch (error) {
    console.error('Error al desconectar cliente:', error);
    res.status(500).json({ message: 'Error al desconectar cliente' });
  }
};

exports.restartClient = async (req, res) => {
  try {
    const clientId = req.params.id;

    // Verificar que el cliente existe y pertenece al usuario
    const client = await Client.findOne({
      _id: clientId,
      owner: req.userId
    });

    if (!client) {
      return res.status(404).json({ message: 'Cliente no encontrado' });
    }

    // Reiniciar cliente
    const result = await whatsappService.restartClient(
      clientId,
      client.phoneNumber
    );

    if (!result.success) {
      return res.status(500).json({ message: result.message });
    }

    res.json({
      message: 'Cliente reiniciado correctamente'
    });
  } catch (error) {
    console.error('Error al reiniciar cliente:', error);
    res.status(500).json({ message: 'Error al reiniciar cliente' });
  }
};

exports.sendMessage = async (req, res) => {
  try {
    // Validar entrada
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const clientId = req.params.id;
    const { to, text } = req.body;

    // Verificar que el cliente existe y pertenece al usuario
    const client = await Client.findOne({
      _id: clientId,
      owner: req.userId
    });

    if (!client) {
      return res.status(404).json({ message: 'Cliente no encontrado' });
    }

    // Verificar que el cliente está conectado
    const status = await whatsappService.getClientStatus(clientId);
    if (!status.isConnected) {
      return res.status(400).json({ message: 'El cliente no está conectado' });
    }

    // Enviar mensaje
    const result = await whatsappService.sendTextMessage(
      clientId,
      to,
      text
    );

    if (!result.success) {
      return res.status(500).json({ message: result.message });
    }

    res.json({
      message: 'Mensaje enviado correctamente',
      messageId: result.messageId
    });
  } catch (error) {
    console.error('Error al enviar mensaje:', error);
    res.status(500).json({ message: 'Error al enviar mensaje' });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const clientId = req.params.id;
    const { limit = 50, offset = 0, phoneNumber } = req.query;

    // Verificar que el cliente existe y pertenece al usuario
    const client = await Client.findOne({
      _id: clientId,
      owner: req.userId
    });

    if (!client) {
      return res.status(404).json({ message: 'Cliente no encontrado' });
    }

    // Construir consulta
    const query = { clientId };

    // Filtrar por número de teléfono si se proporciona
    if (phoneNumber) {
      query.$or = [
        { from: phoneNumber },
        { to: phoneNumber }
      ];
    }

    // Obtener mensajes
    const messages = await Message.find(query)
      .sort({ timestamp: -1 })
      .skip(parseInt(offset))
      .limit(parseInt(limit));

    // Obtener total de mensajes para paginación
    const total = await Message.countDocuments(query);

    res.json({
      messages,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });
  } catch (error) {
    console.error('Error al obtener mensajes:', error);
    res.status(500).json({ message: 'Error al obtener mensajes' });
  }
};

// Controlador para API externa (usado por webhooks)
exports.apiSendMessage = async (req, res) => {
  try {
    // Validar token de API
    const apiToken = req.headers['x-api-token'];
    if (!apiToken) {
      return res.status(401).json({ message: 'Token de API no proporcionado' });
    }

    // Buscar cliente por token
    const client = await Client.findOne({ apiToken });
    if (!client) {
      return res.status(401).json({ message: 'Token de API inválido' });
    }

    const { to, text } = req.body;
    if (!to || !text) {
      return res.status(400).json({ message: 'Se requieren los campos "to" y "text"' });
    }

    // Verificar que el cliente está conectado
    const status = await whatsappService.getClientStatus(client._id.toString());
    if (!status.isConnected) {
      return res.status(400).json({ message: 'El cliente de WhatsApp no está conectado' });
    }

    // Enviar mensaje
    const result = await whatsappService.sendTextMessage(
      client._id.toString(),
      to,
      text
    );

    if (!result.success) {
      return res.status(500).json({ message: result.message });
    }

    res.json({
      success: true,
      messageId: result.messageId
    });
  } catch (error) {
    console.error('Error en API externa:', error);
    res.status(500).json({ message: 'Error al procesar solicitud' });
  }
};

// Método para manejar webhooks
exports.webhook = async (req, res) => {
  try {
    const { clientId } = req.params;

    // Verificar que el cliente existe
    const client = await Client.findById(clientId);
    if (!client) {
      return res.status(404).json({ message: 'Cliente no encontrado' });
    }

    // Si se está configurando un webhook, WebHook verifica con GET
    if (req.method === 'GET') {
      // Aquí podrías implementar la verificación del webhook si es necesario
      return res.status(200).send(req.query.challenge || 'OK');
    }

    // Procesar evento de webhook (normalmente POST)
    const eventData = req.body;
    console.log(`Webhook recibido para cliente ${clientId}:`, eventData);

    // Si el cliente tiene una URL de webhook configurada, reenviar el evento
    if (client.webhookUrl) {
      try {
        await axios.post(client.webhookUrl, {
          clientId,
          event: eventData
        });
      } catch (webhookError) {
        console.error(`Error al reenviar webhook para ${clientId}:`, webhookError);
      }
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error en webhook:', error);
    res.status(500).json({ message: 'Error al procesar webhook' });
  }
};