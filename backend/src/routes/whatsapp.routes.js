// backend/src/routes/whatsapp.routes.js
const express = require('express');
const { check } = require('express-validator');
const whatsappController = require('../controllers/whatsapp.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

const router = express.Router();

// Rutas que requieren autenticación
router.use('/client', verifyToken);

// Inicializar cliente
router.post('/client/:id/initialize', whatsappController.initializeClient);

// Obtener QR code
router.get('/client/:id/qr', whatsappController.getQR);

// Obtener estado del cliente
router.get('/client/:id/status', whatsappController.getStatus);

// Desconectar cliente
router.post('/client/:id/disconnect', whatsappController.disconnectClient);

// Reiniciar cliente
router.post('/client/:id/restart', whatsappController.restartClient);

// Enviar mensaje
router.post(
  '/client/:id/send',
  [
    check('to', 'Número de destinatario requerido').not().isEmpty(),
    check('text', 'Mensaje de texto requerido').not().isEmpty()
  ],
  whatsappController.sendMessage
);

// Obtener mensajes
router.get('/client/:id/messages', whatsappController.getMessages);

// Rutas API externas (para uso con webhooks)
router.post(
  '/api/send',
  [
    check('to', 'Número de destinatario requerido').not().isEmpty(),
    check('text', 'Mensaje de texto requerido').not().isEmpty()
  ],
  whatsappController.apiSendMessage
);

module.exports = router;