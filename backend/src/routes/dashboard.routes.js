// backend/src/routes/dashboard.routes.js
const express = require('express');
const dashboardController = require('../controllers/dashboard.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

const router = express.Router();

// Aplicar middleware de autenticación a todas las rutas
router.use(verifyToken);

// Ruta para obtener estadísticas del dashboard
router.get('/stats', dashboardController.getStats);

module.exports = router;