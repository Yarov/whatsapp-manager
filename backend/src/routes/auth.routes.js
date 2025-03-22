// backend/src/routes/auth.routes.js
const express = require('express');
const { check } = require('express-validator');
const authController = require('../controllers/auth.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

const router = express.Router();

// Ruta para registro
router.post(
  '/register',
  [
    check('email', 'Por favor, incluya un correo electrónico válido').isEmail(),
    check('password', 'La contraseña debe tener al menos 6 caracteres').isLength({ min: 6 }),
    check('name', 'El nombre es requerido').not().isEmpty()
  ],
  authController.register
);

// Ruta para inicio de sesión
router.post(
  '/login',
  [
    check('email', 'Por favor, incluya un correo electrónico válido').isEmail(),
    check('password', 'La contraseña es requerida').exists()
  ],
  authController.login
);

// Ruta para obtener perfil
router.get('/profile', verifyToken, authController.getProfile);

module.exports = router;