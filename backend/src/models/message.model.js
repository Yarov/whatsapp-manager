// backend/src/models/message.model.js - Versión actualizada
const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: true
  },
  messageId: {
    type: String,
    required: true
  },
  from: {
    type: String,
    required: true
  },
  to: {
    type: String,
    required: true
  },
  body: {
    type: String,
    default: '[Sin contenido de texto]' // Valor predeterminado para mensajes sin texto
  },
  type: {
    type: String,
    enum: ['text', 'image', 'video', 'audio', 'document', 'location', 'contact', 'unknown'],
    default: 'text'
  },
  mediaUrl: {
    type: String
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  direction: {
    type: String,
    enum: ['inbound', 'outbound'],
    required: true
  },
  status: {
    type: String,
    enum: ['sent', 'delivered', 'read', 'failed'],
    default: 'sent'
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed, // Para almacenar datos adicionales según el tipo de mensaje
    default: {}
  }
}, {
  timestamps: true
});

// Índices para optimizar búsquedas frecuentes
messageSchema.index({ clientId: 1, timestamp: -1 });
messageSchema.index({ messageId: 1 });
messageSchema.index({ from: 1, to: 1 });

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;