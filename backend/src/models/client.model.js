// backend/src/models/client.model.js
const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
  businessName: {
    type: String,
    required: true,
    trim: true
  },
  phoneNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  apiToken: {
    type: String,
    unique: true
  },
  webhookUrl: {
    type: String,
    trim: true
  },
  isConnected: {
    type: Boolean,
    default: false
  },
  sessionId: {
    type: String,
    unique: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'inactive'],
    default: 'pending'
  }
}, {
  timestamps: true
});

const Client = mongoose.model('Client', clientSchema);

module.exports = Client;