// backend/src/routes/external-api.routes.js
const express = require('express');
const { check } = require('express-validator');
const externalApiController = require('../controllers/external-api.controller');

const router = express.Router();

/**
 * @route POST /api/external/send
 * @desc Enviar mensaje de texto
 * @access Privado (requiere token de API)
 */
router.post(
  '/send',
  [
    check('to', 'Número de destinatario requerido').not().isEmpty(),
    check('text', 'Mensaje de texto requerido').not().isEmpty()
  ],
  externalApiController.sendMessage
);

/**
 * @route POST /api/external/send-media
 * @desc Enviar mensaje multimedia (imagen, documento, etc.)
 * @access Privado (requiere token de API)
 */
router.post(
  '/send-media',
  [
    check('to', 'Número de destinatario requerido').not().isEmpty(),
    check('mediaUrl', 'URL del medio requerida').not().isEmpty(),
    check('type', 'Tipo de medio requerido').not().isEmpty()
      .isIn(['image', 'document', 'video', 'audio'])
  ],
  externalApiController.sendMediaMessage
);

/**
 * @route GET /api/external/status
 * @desc Obtener estado del cliente
 * @access Privado (requiere token de API)
 */
router.get('/status', externalApiController.getStatus);

/**
 * @route GET /api/external/messages
 * @desc Obtener mensajes recientes
 * @access Privado (requiere token de API)
 */
router.get('/messages', externalApiController.getMessages);

/**
 * @route POST /api/external/check-number
 * @desc Verificar si un número existe en WhatsApp
 * @access Privado (requiere token de API)
 */
router.post(
  '/check-number',
  [
    check('phoneNumber', 'Número de teléfono requerido').not().isEmpty()
  ],
  externalApiController.checkNumber
);

/**
 * @route POST /api/external/setup-webhook
 * @desc Configurar webhook para recibir notificaciones
 * @access Privado (requiere token de API)
 */
router.post(
  '/setup-webhook',
  [
    check('webhookUrl', 'URL de webhook válida requerida').isURL()
  ],
  externalApiController.setupWebhook
);

module.exports = router;