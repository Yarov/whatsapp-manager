// backend/src/routes/admin.routes.js
const express = require('express');
const router = express.Router();
const { verifyToken, isAdmin } = require('../middlewares/auth.middleware');
const User = require('../models/user.model');
const Client = require('../models/client.model');
const Message = require('../models/message.model');

// Aplicar middleware de autenticación y verificación de rol admin
router.use(verifyToken, isAdmin);

/**
 * @route GET /api/admin/users
 * @desc Obtener todos los usuarios
 * @access Private (Admin)
 */
router.get('/users', async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 });

    res.json({ success: true, users });
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener usuarios'
    });
  }
});

/**
 * @route GET /api/admin/users/:userId
 * @desc Obtener detalles de un usuario
 * @access Private (Admin)
 */
router.get('/users/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    res.json({ success: true, user });
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener usuario'
    });
  }
});

/**
 * @route GET /api/admin/users/:userId/clients
 * @desc Obtener clientes de un usuario específico
 * @access Private (Admin)
 */
router.get('/users/:userId/clients', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    const clients = await Client.find({ owner: req.params.userId });

    // Obtener estadísticas de mensajes para cada cliente
    const clientsWithStats = await Promise.all(
      clients.map(async (client) => {
        const messageCount = await Message.countDocuments({ clientId: client._id });
        return {
          id: client._id,
          businessName: client.businessName,
          phoneNumber: client.phoneNumber,
          isConnected: client.isConnected,
          status: client.status,
          createdAt: client.createdAt,
          messageCount
        };
      })
    );

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        active: user.active,
        createdAt: user.createdAt
      },
      clients: clientsWithStats
    });
  } catch (error) {
    console.error('Error al obtener clientes del usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener clientes del usuario'
    });
  }
});

/**
 * @route PUT /api/admin/users/:userId/status
 * @desc Activar/desactivar un usuario
 * @access Private (Admin)
 */
router.put('/users/:userId/status', async (req, res) => {
  try {
    // No permitir desactivar al propio admin
    if (req.params.userId === req.userId) {
      return res.status(400).json({
        success: false,
        message: 'No puede desactivar su propia cuenta'
      });
    }

    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // Invertir el estado actual
    user.active = !user.active;
    await user.save();

    res.json({
      success: true,
      message: `Usuario ${user.active ? 'activado' : 'desactivado'} correctamente`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        active: user.active
      }
    });
  } catch (error) {
    console.error('Error al cambiar estado del usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error al cambiar estado del usuario'
    });
  }
});

/**
 * @route PUT /api/admin/users/:userId/role
 * @desc Cambiar rol de un usuario
 * @access Private (Admin)
 */
router.put('/users/:userId/role', async (req, res) => {
  try {
    const { role } = req.body;

    if (!role || !['admin', 'user'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Rol inválido'
      });
    }

    // No permitir cambiar rol propio
    if (req.params.userId === req.userId) {
      return res.status(400).json({
        success: false,
        message: 'No puede cambiar su propio rol'
      });
    }

    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    user.role = role;
    await user.save();

    res.json({
      success: true,
      message: `Rol actualizado a ${role}`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Error al cambiar rol del usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error al cambiar rol del usuario'
    });
  }
});

/**
 * @route GET /api/admin/stats
 * @desc Obtener estadísticas generales del sistema
 * @access Private (Admin)
 */
router.get('/stats', async (req, res) => {
  try {
    // Estadísticas de usuarios
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ active: true });
    const adminUsers = await User.countDocuments({ role: 'admin' });

    // Estadísticas de clientes
    const totalClients = await Client.countDocuments();
    const connectedClients = await Client.countDocuments({ isConnected: true });
    const pendingClients = await Client.countDocuments({ status: 'pending' });

    // Estadísticas de mensajes
    const totalMessages = await Message.countDocuments();
    const inboundMessages = await Message.countDocuments({ direction: 'inbound' });
    const outboundMessages = await Message.countDocuments({ direction: 'outbound' });

    // Usuarios recientes
    const recentUsers = await User.find()
      .select('name email role active createdAt')
      .sort({ createdAt: -1 })
      .limit(5);

    // Clientes recientes
    const recentClients = await Client.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('owner', 'name email');

    res.json({
      success: true,
      stats: {
        users: {
          total: totalUsers,
          active: activeUsers,
          admin: adminUsers
        },
        clients: {
          total: totalClients,
          connected: connectedClients,
          pending: pendingClients
        },
        messages: {
          total: totalMessages,
          inbound: inboundMessages,
          outbound: outboundMessages
        }
      },
      recentData: {
        users: recentUsers,
        clients: recentClients
      }
    });
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas'
    });
  }
});

module.exports = router;