// backend/src/app.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const mongoose = require('mongoose');

// Import routes
const authRoutes = require('./routes/auth.routes');
const clientRoutes = require('./routes/client.routes');
const whatsappRoutes = require('./routes/whatsapp.routes');
const externalApiRoutes = require('./routes/external-api.routes');
const dashboardRoutes = require('./routes/dashboard.routes');


// Configuración de la aplicación
const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Conexión a MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Conectado a MongoDB'))
  .catch(err => console.error('Error de conexión a MongoDB:', err));

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/whatsapp', whatsappRoutes);
app.use('/api/external', externalApiRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ message: 'API de WhatsApp funcionando correctamente' });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});