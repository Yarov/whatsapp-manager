// backend/src/middlewares/auth.middleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

/**
 * Middleware para verificar el token JWT
 */
exports.verifyToken = async (req, res, next) => {
  try {
    // Verificar que el header de autorización exista
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: 'No se proporcionó token de autenticación' });
    }

    // Verificar que sea un token Bearer
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(401).json({ message: 'Formato de token inválido' });
    }

    const token = parts[1];

    // Verificar y decodificar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Verificar que el usuario exista y esté activo
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: 'Usuario no encontrado' });
    }

    if (!user.active) {
      return res.status(403).json({ message: 'Su cuenta está desactivada. Contacte al administrador.' });
    }

    // Agregar datos del usuario a la solicitud
    req.userId = decoded.id;
    req.userEmail = decoded.email;
    req.userRole = user.role;

    next();
  } catch (error) {
    console.error('Error en verificación de token:', error);
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expirado' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Token inválido' });
    }
    res.status(500).json({ message: 'Error al verificar token' });
  }
};

/**
 * Middleware para verificar si el usuario es admin
 */
exports.isAdmin = (req, res, next) => {
  if (req.userRole !== 'admin') {
    return res.status(403).json({
      message: 'Acceso denegado. Se requieren permisos de administrador.'
    });
  }
  next();
};