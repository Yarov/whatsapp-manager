// backend/src/middlewares/auth.middleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

exports.verifyToken = async (req, res, next) => {
  try {
    // Obtener token del encabezado
    const token = req.headers['x-access-token'] || req.headers['authorization'];

    if (!token) {
      return res.status(401).json({ message: 'Token no proporcionado' });
    }

    // Verificar token
    const decoded = jwt.verify(
      token.replace('Bearer ', ''),
      process.env.JWT_SECRET
    );

    // Verificar si el usuario existe
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: 'Usuario no encontrado' });
    }

    // Agregar userId a la solicitud para uso posterior
    req.userId = decoded.id;

    next();
  } catch (error) {
    console.error('Error en verificación de token:', error);
    return res.status(401).json({ message: 'Token inválido' });
  }
};

exports.isAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);

    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Requiere rol de administrador' });
    }

    next();
  } catch (error) {
    console.error('Error en verificación de rol:', error);
    return res.status(500).json({ message: 'Error en verificación de rol' });
  }
};