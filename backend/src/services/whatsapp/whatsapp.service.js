// backend/src/services/whatsapp/whatsapp.service.js
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode');
const fs = require('fs');
const path = require('path');
const EventEmitter = require('events');
const ClientModel = require('../../models/client.model');
const MessageModel = require('../../models/message.model');
const webhookService = require('./webhook.service');

class WhatsAppService {
  constructor() {
    this.clients = new Map();
    this.events = new EventEmitter();
    this.sessionDir = path.resolve(process.env.SESSION_PATH || './sessions');

    // Crear directorio de sesiones si no existe
    if (!fs.existsSync(this.sessionDir)) {
      fs.mkdirSync(this.sessionDir, { recursive: true });
    }
  }

  // Función para generar imagen QR de alta calidad
  async generateQRImage(qrCode, clientId) {
    try {
      const clientSessionDir = path.join(this.sessionDir, clientId);

      // Asegurar que el directorio existe
      if (!fs.existsSync(clientSessionDir)) {
        fs.mkdirSync(clientSessionDir, { recursive: true });
      }

      const qrImagePath = path.join(clientSessionDir, 'qr.png');

      await qrcode.toFile(qrImagePath, qrCode, {
        color: {
          dark: '#000000',
          light: '#ffffff'
        },
        scale: 8, // Mayor escala para mejor calidad
        margin: 2  // Margen alrededor del QR
      });

      return qrImagePath;
    } catch (error) {
      console.error(`Error al generar imagen QR para ${clientId}:`, error);
      return null;
    }
  }

  // Inicializar cliente de WhatsApp
  async initClient(clientId, phoneNumber) {
    try {
      // Verificar si el cliente ya existe
      if (this.clients.has(clientId)) {
        return { success: true, message: 'Cliente ya inicializado' };
      }

      // Crear directorio específico para este cliente
      const clientSessionDir = path.join(this.sessionDir, clientId);
      if (!fs.existsSync(clientSessionDir)) {
        fs.mkdirSync(clientSessionDir, { recursive: true });
      }

      // Crear nueva instancia de cliente WhatsApp
      const client = new Client({
        authStrategy: new LocalAuth({
          clientId: clientId,
          dataPath: this.sessionDir
        }),
        puppeteer: {
          headless: true,
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--single-process',
            '--disable-gpu'
          ]
        }
      });

      // Manejar evento de QR code
      let qrValue = null;
      client.on('qr', async (qr) => {
        qrValue = qr;
        console.log(`QR Code generado para cliente ${clientId}`);

        // Generar imagen QR y almacenarla
        const qrImagePath = await this.generateQRImage(qr, clientId);

        this.events.emit('qr', { clientId, qr, qrImagePath });

        // Actualizar información del cliente en memoria
        const clientData = this.clients.get(clientId);
        if (clientData) {
          this.clients.set(clientId, {
            ...clientData,
            qrCode: qr,
            qrImagePath
          });
        }
      });

      // Manejar evento de autenticación exitosa
      client.on('authenticated', async () => {
        console.log(`Cliente ${clientId} autenticado correctamente`);

        try {
          // Actualizar estado del cliente en la base de datos
          await ClientModel.findByIdAndUpdate(clientId, {
            isConnected: true,
            status: 'active'
          });

          this.events.emit('authenticated', { clientId });

          // Notificar webhook sobre cambio de estado
          webhookService.sendNotification(clientId, 'status_change', {
            status: 'authenticated',
            isConnected: true,
            timestamp: new Date()
          });
        } catch (error) {
          console.error(`Error al actualizar estado del cliente ${clientId}:`, error);
        }
      });

      // Manejar evento de ready
      client.on('ready', async () => {
        console.log(`Cliente ${clientId} está listo`);

        try {
          // Obtener información del cliente - método corregido
          let userPhoneNumber = phoneNumber;

          // Intentar obtener el número de teléfono de diferentes maneras según la versión
          try {
            if (client.info && client.info.wid) {
              userPhoneNumber = client.info.wid.user; // Nueva forma
            } else if (typeof client.getWid === 'function') {
              const info = await client.getWid();
              userPhoneNumber = info.user; // Forma antigua
            } else if (client.info && client.info.me) {
              userPhoneNumber = client.info.me.user; // Otra posible forma
            }
          } catch (widError) {
            console.log(`No se pudo obtener WID para ${clientId}, usando número existente:`, widError);
          }

          // Actualizar estado del cliente en la base de datos
          await ClientModel.findByIdAndUpdate(clientId, {
            isConnected: true,
            status: 'active',
            phoneNumber: userPhoneNumber
          });

          this.events.emit('ready', { clientId, phoneNumber: userPhoneNumber });

          // Notificar webhook sobre cambio de estado
          webhookService.sendNotification(clientId, 'status_change', {
            status: 'ready',
            isConnected: true,
            phoneNumber: userPhoneNumber,
            timestamp: new Date()
          });
        } catch (error) {
          console.error(`Error al manejar evento ready para ${clientId}:`, error);
        }
      });

      // Manejar evento de desconexión
      client.on('disconnected', async (reason) => {
        console.log(`Cliente ${clientId} desconectado: ${reason}`);

        try {
          // Actualizar estado del cliente en la base de datos
          await ClientModel.findByIdAndUpdate(clientId, {
            isConnected: false,
            status: 'inactive'
          });

          // Eliminar cliente de la memoria
          this.clients.delete(clientId);

          this.events.emit('disconnected', { clientId, reason });

          // Notificar webhook sobre cambio de estado
          webhookService.sendNotification(clientId, 'status_change', {
            status: 'disconnected',
            isConnected: false,
            reason: reason,
            timestamp: new Date()
          });
        } catch (error) {
          console.error(`Error al manejar desconexión del cliente ${clientId}:`, error);
        }
      });

      // Manejar evento de mensaje
      client.on('message', async (msg) => {
        console.log(`Mensaje recibido para ${clientId}: ${msg.body || '[Sin texto]'}`);

        try {
          // Determinar el tipo de mensaje y procesarlo adecuadamente
          let messageType = 'text';
          let messageBody = msg.body || '';
          let mediaUrl = null;
          let metadata = {};

          // Detectar tipo de mensaje
          if (msg.hasMedia) {
            // Si tiene media, obtener el tipo y posiblemente descargar
            messageType = msg.type;

            try {
              // Intentar obtener la información multimedia
              const media = await msg.downloadMedia();
              if (media) {
                mediaUrl = media.data;
                metadata = {
                  mimetype: media.mimetype,
                  filename: media.filename,
                  size: mediaUrl.length
                };
              }
            } catch (mediaError) {
              console.error(`Error al procesar media para mensaje en ${clientId}:`, mediaError);
            }

            // Asegurarse de que hay un cuerpo de mensaje descriptivo
            if (!messageBody) {
              switch (messageType) {
                case 'image':
                  messageBody = '[Imagen]';
                  break;
                case 'video':
                  messageBody = '[Video]';
                  break;
                case 'audio':
                  messageBody = '[Audio]';
                  break;
                case 'document':
                  messageBody = `[Documento: ${metadata.filename || 'sin nombre'}]`;
                  break;
                case 'location':
                  messageBody = '[Ubicación]';
                  break;
                case 'contact':
                  messageBody = '[Contacto]';
                  break;
                default:
                  messageBody = `[Mensaje de tipo: ${messageType}]`;
              }
            }
          } else if (msg.type !== 'text' && msg.type !== 'chat') {
            // Otro tipo de mensaje no multimedia
            messageType = msg.type || 'unknown';
            if (!messageBody) {
              messageBody = `[Mensaje de tipo: ${messageType}]`;
            }
          }

          // Guardar mensaje en la base de datos
          const savedMessage = await MessageModel.create({
            clientId,
            messageId: msg.id._serialized,
            from: msg.from,
            to: phoneNumber,
            body: messageBody,
            type: messageType,
            mediaUrl,
            timestamp: msg.timestamp * 1000, // Convertir a milisegundos
            direction: 'inbound',
            metadata
          });

          const messageData = savedMessage.toObject();

          // Emitir evento interno
          this.events.emit('message', {
            clientId,
            message: messageData
          });

          // Enviar notificación webhook
          webhookService.sendNotification(clientId, 'message', {
            message: messageData
          });
        } catch (error) {
          console.error(`Error al procesar mensaje para ${clientId}:`, error);
        }
      });

      // Inicializar cliente
      await client.initialize();

      // Guardar cliente en memoria
      this.clients.set(clientId, {
        instance: client,
        phoneNumber,
        qrCode: qrValue
      });

      // Configurar webhook si el cliente tiene uno
      try {
        const clientDoc = await ClientModel.findById(clientId);
        if (clientDoc && clientDoc.webhookUrl) {
          await webhookService.subscribe(clientId, clientDoc.webhookUrl);
        }
      } catch (error) {
        console.error(`Error al configurar webhook para ${clientId}:`, error);
      }

      return {
        success: true,
        message: 'Cliente inicializado correctamente'
      };
    } catch (error) {
      console.error(`Error al inicializar cliente ${clientId}:`, error);
      return {
        success: false,
        message: `Error al inicializar cliente: ${error.message}`
      };
    }
  }

  // Obtener QR code para un cliente
  async getQR(clientId) {
    try {
      const client = this.clients.get(clientId);
      if (!client) {
        return { success: false, message: 'Cliente no encontrado' };
      }

      if (!client.qrCode) {
        return { success: false, message: 'QR Code no disponible todavía' };
      }

      // Si no tenemos la ruta de la imagen o el archivo no existe, generarla
      if (!client.qrImagePath || !fs.existsSync(client.qrImagePath)) {
        client.qrImagePath = await this.generateQRImage(client.qrCode, clientId);

        // Actualizar la información del cliente en memoria
        this.clients.set(clientId, {
          ...client,
          qrImagePath: client.qrImagePath
        });
      }

      // Verificar si el archivo existe ahora
      if (client.qrImagePath && fs.existsSync(client.qrImagePath)) {
        return {
          success: true,
          qrCode: client.qrCode,
          qrImagePath: client.qrImagePath
        };
      } else {
        // Si no pudimos generar la imagen, devolver al menos el código QR
        return {
          success: true,
          qrCode: client.qrCode,
          qrImagePath: null
        };
      }
    } catch (error) {
      console.error(`Error al obtener QR para ${clientId}:`, error);
      return { success: false, message: `Error al obtener QR: ${error.message}` };
    }
  }

  // Enviar mensaje de texto
  async sendTextMessage(clientId, to, text) {
    try {
      const client = this.clients.get(clientId);
      if (!client) {
        return { success: false, message: 'Cliente no encontrado' };
      }

      // Formatear número de teléfono
      const formattedNumber = this.formatPhoneNumber(to);

      // Buscar si ya existe un chat con este número o uno similar
      const chats = await client.instance.getChats();
      let targetChat = null;

      for (const chat of chats) {
        if (chat.isGroup) continue; // Ignorar grupos

        // Comparar limpiando todos los caracteres no numéricos
        const chatIdClean = chat.id._serialized.replace(/\D/g, '');
        const formattedNumberClean = formattedNumber.replace(/\D/g, '');

        if (chatIdClean.includes(formattedNumberClean) ||
          formattedNumberClean.includes(chatIdClean)) {
          targetChat = chat;
          console.log(`Chat existente encontrado: ${chat.id._serialized}`);
          break;
        }
      }

      // Enviar mensaje
      let response;
      if (targetChat) {
        // Usar el ID del chat existente
        response = await client.instance.sendMessage(targetChat.id._serialized, text);
      } else {
        // Crear nuevo chat
        const chatId = `${formattedNumber}@c.us`;
        console.log(`Enviando mensaje a: ${chatId}`);
        response = await client.instance.sendMessage(chatId, text);
      }

      // Guardar mensaje en la base de datos
      const savedMessage = await MessageModel.create({
        clientId,
        messageId: response.id._serialized,
        from: client.phoneNumber,
        to: formattedNumber,
        body: text,
        type: 'text',
        timestamp: Date.now(),
        direction: 'outbound',
        status: 'sent'
      });

      const messageData = savedMessage.toObject();

      // Notificar webhook sobre mensaje enviado
      webhookService.sendNotification(clientId, 'message', {
        message: messageData
      });

      return {
        success: true,
        messageId: response.id._serialized,
        message: messageData
      };
    } catch (error) {
      console.error(`Error al enviar mensaje para ${clientId}:`, error);
      return { success: false, message: `Error al enviar mensaje: ${error.message}` };
    }
  }

  // Formatear número de teléfono
  formatPhoneNumber(phoneNumber) {
    // Eliminar todos los caracteres no numéricos (incluido el +)
    let cleaned = phoneNumber.replace(/\D/g, '');

    // Para números de México, WhatsApp Web API espera: 521 + 10 dígitos
    // El '1' después del '52' es importante para México

    // Si ya empieza con 521, conservar
    if (cleaned.startsWith('521') && cleaned.length === 13) {
      // Formato correcto (521 + 10 dígitos)
    }
    // Si empieza con 52 pero no tiene el 1, agregarlo
    else if (cleaned.startsWith('52') && cleaned.length === 12) {
      cleaned = '521' + cleaned.substring(2);
    }
    // Si no empieza con 52, agregar 521
    else if (!cleaned.startsWith('52')) {
      // Asumimos que son los 10 dígitos nacionales
      if (cleaned.length === 10) {
        cleaned = '521' + cleaned;
      } else {
        // Si es un formato desconocido, intentar con 521 de todas formas
        cleaned = '521' + cleaned;
      }
    }

    console.log(`Número formateado: ${phoneNumber} -> ${cleaned}`);
    return cleaned;
  }

  // Desconectar cliente
  async disconnectClient(clientId) {
    try {
      const client = this.clients.get(clientId);
      if (!client) {
        return { success: false, message: 'Cliente no encontrado' };
      }

      // Cerrar sesión y desconectar
      await client.instance.logout();
      this.clients.delete(clientId);

      // Actualizar estado en la base de datos
      await ClientModel.findByIdAndUpdate(clientId, {
        isConnected: false,
        status: 'inactive'
      });

      // Cancelar suscripción de webhook
      webhookService.unsubscribe(clientId);

      return { success: true, message: 'Cliente desconectado correctamente' };
    } catch (error) {
      console.error(`Error al desconectar cliente ${clientId}:`, error);
      return { success: false, message: `Error al desconectar cliente: ${error.message}` };
    }
  }

  // Reiniciar cliente
  async restartClient(clientId, phoneNumber) {
    try {
      // Primero intentar desconectar
      await this.disconnectClient(clientId);

      // Reiniciar cliente
      return await this.initClient(clientId, phoneNumber);
    } catch (error) {
      console.error(`Error al reiniciar cliente ${clientId}:`, error);
      return { success: false, message: `Error al reiniciar cliente: ${error.message}` };
    }
  }

  // Obtener estado del cliente
  async getClientStatus(clientId) {
    try {
      const client = this.clients.get(clientId);
      if (!client) {
        return { success: false, message: 'Cliente no encontrado', isConnected: false };
      }

      // Verificar que el cliente tenga una instancia de WhatsApp activa
      if (!client.instance) {
        return { success: true, isConnected: false };
      }

      // Verificar que el cliente está realmente conectado
      // 1. Debe tener una página de puppeteer activa
      if (!client.instance.pupPage) {
        return { success: true, isConnected: false };
      }

      // 2. Debe estar autenticado (no en estado QR)
      try {
        // Intentar obtener información del cliente - esto fallará si no está autenticado
        // Usamos un timeout corto para evitar demoras
        const isAuthenticated = await Promise.race([
          client.instance.getState().then(state => state === 'CONNECTED'),
          new Promise(resolve => setTimeout(() => resolve(false), 3000))
        ]);

        return {
          success: true,
          isConnected: isAuthenticated === true
        };
      } catch (error) {
        console.error(`Error al verificar autenticación del cliente ${clientId}:`, error);
        return { success: true, isConnected: false };
      }
    } catch (error) {
      console.error(`Error al obtener estado del cliente ${clientId}:`, error);
      return { success: false, message: `Error al obtener estado: ${error.message}`, isConnected: false };
    }
  }

  // Suscribirse a eventos
  async subscribeToEvents(clientId, callback) {
    try {
      // Verificar si el cliente existe
      const clientDoc = await ClientModel.findById(clientId);
      if (!clientDoc) {
        return { success: false, message: 'Cliente no encontrado' };
      }

      // Agregar evento interno
      this.events.on('message', async (data) => {
        if (data.clientId === clientId) {
          callback(data);
        }
      });

      // Configurar webhook si tiene URL
      if (clientDoc.webhookUrl) {
        await webhookService.subscribe(clientId, clientDoc.webhookUrl);
      }

      return { success: true, message: 'Suscripción exitosa' };
    } catch (error) {
      console.error(`Error al suscribirse a eventos para ${clientId}:`, error);
      return { success: false, message: `Error al suscribirse: ${error.message}` };
    }
  }

  // Enviar mensaje multimedia (imagen, documento, etc.)
  async sendMediaMessage(clientId, to, mediaUrl, caption = '', type = 'image') {
    try {
      const client = this.clients.get(clientId);
      if (!client) {
        return { success: false, message: 'Cliente no encontrado' };
      }

      // Formatear número de teléfono
      const formattedNumber = this.formatPhoneNumber(to);
      const chatId = `${formattedNumber}@c.us`;

      let response;

      // Enviar según el tipo de medio
      switch (type) {
        case 'image':
          response = await client.instance.sendMessage(chatId, {
            url: mediaUrl,
            caption: caption || undefined,
            type: 'image'
          });
          break;
        case 'document':
          response = await client.instance.sendMessage(chatId, {
            url: mediaUrl,
            caption: caption || undefined,
            type: 'document'
          });
          break;
        case 'video':
          response = await client.instance.sendMessage(chatId, {
            url: mediaUrl,
            caption: caption || undefined,
            type: 'video'
          });
          break;
        case 'audio':
          response = await client.instance.sendMessage(chatId, {
            url: mediaUrl,
            type: 'audio'
          });
          break;
        default:
          return { success: false, message: `Tipo de medio no soportado: ${type}` };
      }

      // Guardar mensaje en la base de datos
      const savedMessage = await MessageModel.create({
        clientId,
        messageId: response.id._serialized,
        from: client.phoneNumber,
        to: formattedNumber,
        body: caption || '',
        type,
        mediaUrl,
        timestamp: Date.now(),
        direction: 'outbound',
        status: 'sent'
      });

      const messageData = savedMessage.toObject();

      // Notificar webhook sobre mensaje enviado
      webhookService.sendNotification(clientId, 'message', {
        message: messageData
      });

      return {
        success: true,
        messageId: response.id._serialized,
        message: messageData
      };
    } catch (error) {
      console.error(`Error al enviar mensaje multimedia para ${clientId}:`, error);
      return { success: false, message: `Error al enviar mensaje multimedia: ${error.message}` };
    }
  }

  // Obtener mensajes
  async getMessages(clientId, filters = {}, pagination = { limit: 50, offset: 0 }) {
    try {
      const query = { clientId };

      // Aplicar filtros adicionales
      if (filters.phoneNumber) {
        query.$or = [
          { from: filters.phoneNumber },
          { to: filters.phoneNumber }
        ];
      }

      if (filters.direction && ['inbound', 'outbound'].includes(filters.direction)) {
        query.direction = filters.direction;
      }

      if (filters.startDate && filters.endDate) {
        query.timestamp = {
          $gte: new Date(filters.startDate),
          $lte: new Date(filters.endDate)
        };
      }

      // Obtener total de mensajes (para paginación)
      const total = await MessageModel.countDocuments(query);

      // Obtener mensajes con paginación
      const messages = await MessageModel.find(query)
        .sort({ timestamp: -1 })
        .skip(parseInt(pagination.offset))
        .limit(parseInt(pagination.limit));

      return {
        success: true,
        messages,
        pagination: {
          total,
          ...pagination
        }
      };
    } catch (error) {
      console.error(`Error al obtener mensajes para ${clientId}:`, error);
      return { success: false, message: `Error al obtener mensajes: ${error.message}` };
    }
  }

  // Verificar si un número existe en WhatsApp
  async checkNumberExists(clientId, phoneNumber) {
    try {
      const client = this.clients.get(clientId);
      if (!client) {
        return { success: false, message: 'Cliente no encontrado' };
      }

      // Formatear número
      const formattedNumber = this.formatPhoneNumber(phoneNumber);
      const chatId = `${formattedNumber}@c.us`;

      // Verificar número
      const isRegistered = await client.instance.isRegisteredUser(chatId);

      return {
        success: true,
        phoneNumber: formattedNumber,
        exists: isRegistered
      };
    } catch (error) {
      console.error(`Error al verificar número para ${clientId}:`, error);
      return { success: false, message: `Error al verificar número: ${error.message}` };
    }
  }

  // Limpiar sesiones antiguas
  async cleanupSessions(olderThan = 30) { // días
    try {
      const now = new Date();
      const cutoffDate = new Date(now.setDate(now.getDate() - olderThan));

      // Buscar clientes inactivos
      const inactiveClients = await ClientModel.find({
        isConnected: false,
        updatedAt: { $lt: cutoffDate }
      });

      let cleaned = 0;

      // Eliminar sesiones de clientes inactivos
      for (const client of inactiveClients) {
        const clientSessionDir = path.join(this.sessionDir, client._id.toString());

        if (fs.existsSync(clientSessionDir)) {
          fs.rmdirSync(clientSessionDir, { recursive: true });
          cleaned++;
        }
      }

      return {
        success: true,
        message: `Sesiones limpiadas: ${cleaned}`,
        cleaned
      };
    } catch (error) {
      console.error('Error al limpiar sesiones:', error);
      return { success: false, message: `Error al limpiar sesiones: ${error.message}` };
    }
  }
}

// Singleton
const whatsappService = new WhatsAppService();

module.exports = whatsappService;