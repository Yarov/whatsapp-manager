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
const adminRoutes = require('./routes/admin.routes');


// Configuración de la aplicación
const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Agregar esto al inicio del archivo app.js
console.log('Iniciando aplicación...');
console.log(`MongoDB URI: ${process.env.MONGODB_URI ? 'Definido (no mostrando contraseña)' : 'INDEFINIDO'}`);

// Modificar la conexión a MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://admin:password123@mongodb:27017/whatsapp_api?authSource=admin', {
  serverSelectionTimeoutMS: 30000, // Incrementar el tiempo de espera
  heartbeatFrequencyMS: 2000, // Frecuencia de latido más alta
})
  .then(() => console.log('Conectado a MongoDB correctamente'))
  .catch(err => {
    console.error('Error de conexión a MongoDB:', err);
    // Intentar con valores por defecto si falla
    console.log('Intentando conexión alternativa...');
    return mongoose.connect('mongodb://admin:password123@mongodb:27017/whatsapp_api?authSource=admin');
  })

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/whatsapp', whatsappRoutes);
app.use('/api/external', externalApiRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/admin', adminRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ message: 'API de WhatsApp funcionando correctamente' });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});