const axios = require('axios');
const Client = require('../../models/client.model');

class WebhookService {
  constructor() {
    this.webhookSubscriptions = new Map();
    this.webhookQueue = [];
    this.isProcessing = false;
    this.MAX_RETRIES = 3;

    // Iniciar procesamiento de cola
    setInterval(() => this.processQueue(), 5000);
  }

  // Agregar a cola de webhook
  addToQueue(url, data, clientId, apiToken, retries = 0) {
    this.webhookQueue.push({
      url,
      data,
      clientId,
      apiToken,
      retries,
      timestamp: Date.now()
    });

    // Si no está procesando, iniciar
    if (!this.isProcessing) {
      this.processQueue();
    }
  }

  // Procesar cola de webhooks
  async processQueue() {
    if (this.isProcessing || this.webhookQueue.length === 0) {
      return;
    }

    this.isProcessing = true;

    try {
      const item = this.webhookQueue.shift();

      try {
        // Incluir el token de API en el encabezado para autenticación
        await axios.post(item.url, item.data, {
          headers: {
            'Content-Type': 'application/json',
            'x-api-token': item.apiToken, // Token de API del cliente para autenticación
            'x-client-id': item.clientId  // ID del cliente para referencia
          },
          timeout: 10000 // 10 segundos timeout
        });

        console.log(`Webhook enviado correctamente a ${item.url} para cliente ${item.clientId}`);
      } catch (error) {
        console.error(`Error al enviar webhook a ${item.url} para cliente ${item.clientId}:`, error.message);

        // Reintentar si no se alcanzó el límite de reintentos
        if (item.retries < this.MAX_RETRIES) {
          console.log(`Reintentando webhook (${item.retries + 1}/${this.MAX_RETRIES})...`);
          this.addToQueue(item.url, item.data, item.clientId, item.apiToken, item.retries + 1);
        } else {
          console.error(`Se alcanzó el límite de reintentos para webhook a ${item.url}`);
        }
      }
    } finally {
      this.isProcessing = false;

      // Si hay más elementos en la cola, seguir procesando
      if (this.webhookQueue.length > 0) {
        setTimeout(() => this.processQueue(), 1000); // Esperar 1 segundo entre envíos
      }
    }
  }

  // Suscribir a eventos
  async subscribe(clientId, url) {
    if (!url) return false;

    try {
      // Obtener el token de API del cliente
      const client = await Client.findById(clientId);
      if (!client) {
        console.error(`Cliente ${clientId} no encontrado al suscribir webhook`);
        return false;
      }

      this.webhookSubscriptions.set(clientId, {
        url,
        apiToken: client.apiToken
      });

      console.log(`Cliente ${clientId} suscrito a webhook: ${url}`);
      return true;
    } catch (error) {
      console.error(`Error al suscribir cliente ${clientId} a webhook:`, error);
      return false;
    }
  }

  // Cancelar suscripción
  unsubscribe(clientId) {
    if (this.webhookSubscriptions.has(clientId)) {
      this.webhookSubscriptions.delete(clientId);
      console.log(`Suscripción de webhook cancelada para cliente ${clientId}`);
      return true;
    }
    return false;
  }

  // Enviar notificación a webhook
  async sendNotification(clientId, event, data) {
    const subscription = this.webhookSubscriptions.get(clientId);

    if (!subscription) {
      // Si no hay suscripción en memoria, intentar obtenerla de la base de datos
      try {
        const client = await Client.findById(clientId);
        if (client && client.webhookUrl) {
          // Crear suscripción si hay URL de webhook
          await this.subscribe(clientId, client.webhookUrl);
          subscription = this.webhookSubscriptions.get(clientId);
        } else {
          return false;
        }
      } catch (error) {
        console.error(`Error al obtener cliente ${clientId} para enviar notificación:`, error);
        return false;
      }
    }

    if (!subscription) {
      return false;
    }

    const payload = {
      event,
      data,
      timestamp: new Date().toISOString(),
      clientId
    };

    this.addToQueue(subscription.url, payload, clientId, subscription.apiToken);
    return true;
  }
}

// Singleton
const webhookService = new WebhookService();

module.exports = webhookService;