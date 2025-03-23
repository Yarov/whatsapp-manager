// /mongo-init/init.js
print('Inicializando MongoDB...');

// Conexión a la base de datos admin
db = db.getSiblingDB('admin');

// Crear usuario administrador de la base de datos whatsapp_api si no existe
db = db.getSiblingDB('whatsapp_api');

try {
  db.createUser({
    user: "admin",
    pwd: "password123",
    roles: [{ role: "readWrite", db: "whatsapp_api" }]
  });
  print('Usuario admin creado correctamente');
} catch (err) {
  print('El usuario ya existe o hubo un error: ' + err);
}

// Crear colecciones principales
try {
  db.createCollection('users');
  print('Colección users creada');
} catch (err) {
  print('La colección users ya existe');
}

try {
  db.createCollection('clients');
  print('Colección clients creada');
} catch (err) {
  print('La colección clients ya existe');
}

try {
  db.createCollection('messages');
  print('Colección messages creada');
} catch (err) {
  print('La colección messages ya existe');
}

print('Inicialización de MongoDB completada');