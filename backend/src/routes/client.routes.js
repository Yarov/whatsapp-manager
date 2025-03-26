// backend/src/routes/client.routes.js
const express = require('express');
const { check } = require('express-validator');
const clientController = require('../controllers/client.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

const router = express.Router();

// Aplicar middleware de autenticación a todas las rutas
router.use(verifyToken);

// Ruta para crear cliente
router.post(
  '/',
  [
    check('businessName', 'El nombre del negocio es requerido').not().isEmpty(),
    check('phoneNumber', 'El número de teléfono es requerido').not().isEmpty()
  ],
  clientController.createClient
);

// Ruta para obtener todos los clientes
router.get('/', clientController.getClients);

// Ruta para obtener un cliente específico
router.get('/:id', clientController.getClient);

// Ruta para actualizar cliente
router.put(
  '/:id',
  [
    check('businessName', 'El nombre del negocio es requerido').not().isEmpty()
  ],
  clientController.updateClient
);

// Ruta para actualizar solo el webhook de un cliente
router.patch(
  '/:id/webhook',
  [
    check('webhookUrl', 'URL de webhook válida requerida').isURL()
  ],
  clientController.updateWebhook
);

// Ruta para eliminar cliente
router.delete('/:id', clientController.deleteClient);

// Ruta para regenerar token de API
router.post('/:id/regenerate-token', clientController.regenerateToken);

// Ruta para obtener estadísticas de mensajes
const messageStatsController = require('../controllers/messageStats.controller');
router.get('/:id/message-stats', messageStatsController.getClientMessageStats);

// Ruta para eliminar cliente de forma segura
router.delete('/:id/secure', clientController.secureDeleteClient);

module.exports = router;