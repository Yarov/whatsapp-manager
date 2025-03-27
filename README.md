# WtX Platform

Una plataforma completa para manejar múltiples clientes de WhatsApp con panel administrativo y APIs para integración con herramientas como n8n.

## Características

- 🔐 Autenticación y gestión de usuarios
- 👥 Administración de múltiples clientes de WhatsApp
- 📱 Escaneo de código QR para conexión de WhatsApp
- 💾 Persistencia de sesiones
- 📨 Envío y recepción de mensajes
- 🔄 Webhooks para integración con n8n
- 📊 Historial de mensajes
- 🐳 Despliegue con Docker y Portainer

## Requisitos previos

- Node.js (16.x o superior)
- MongoDB
- Docker y Docker Compose (para despliegue)
- GitLab (para CI/CD)
- Portainer (para gestión de contenedores)

## Estructura del proyecto

```
whatsapp-api-platform/
├── backend/          # Servidor Express
├── frontend/         # Aplicación Vite/React
├── nginx/            # Configuración de Nginx
├── .env.example      # Ejemplo de variables de entorno
├── .gitlab-ci.yml    # Configuración de CI/CD para GitLab
├── docker-compose.yml # Configuración de Docker Compose
├── Dockerfile.backend # Dockerfile para el backend
├── Dockerfile.frontend # Dockerfile para el frontend
└── package.json      # Scripts para ejecutar ambos servicios
```

## Configuración inicial

1. Clona este repositorio:
   ```bash
   git clone https://gitlab.com/tuusuario/whatsapp-api-platform.git
   cd whatsapp-api-platform
   ```

2. Crea el archivo de variables de entorno:
   ```bash
   cp .env.example .env
   ```

3. Edita el archivo `.env` con tus configuraciones.

## Desarrollo local

Para instalar todas las dependencias:
```bash
npm run install:all
```

Para iniciar el desarrollo (frontend y backend):
```bash
npm run start
```

Para iniciar solo el backend:
```bash
npm run server
```

Para iniciar solo el frontend:
```bash
npm run client
```

## Despliegue con Docker

1. Asegúrate de tener Docker y Docker Compose instalados

2. Construye y despliega los servicios:
   ```bash
   docker-compose up -d
   ```

3. Para detener los servicios:
   ```bash
   docker-compose down
   ```

## Despliegue con GitLab CI/CD y Portainer

1. Configura tu repositorio GitLab

2. Agrega las siguientes variables de entorno en la configuración CI/CD de GitLab:
   - `CI_REGISTRY_USER`: Usuario de GitLab Registry
   - `CI_REGISTRY_PASSWORD`: Contraseña de GitLab Registry
   - `PORTAINER_WEBHOOK_URL`: URL del webhook de Portainer para despliegue

3. Haz push a la rama `main` para desencadenar el pipeline de CI/CD

4. Confirma el despliegue manualmente en la etapa de deploy

## API Rest

La API del backend está disponible en `/api` y proporciona los siguientes endpoints:

### Autenticación
- `POST /api/auth/register` - Registrar nuevo usuario
- `POST /api/auth/login` - Iniciar sesión
- `GET /api/auth/profile` - Obtener perfil del usuario

### Clientes
- `GET /api/clients` - Listar clientes
- `POST /api/clients` - Crear cliente
- `GET /api/clients/:id` - Obtener cliente
- `PUT /api/clients/:id` - Actualizar cliente
- `DELETE /api/clients/:id` - Eliminar cliente
- `POST /api/clients/:id/regenerate-token` - Regenerar token API

### WhatsApp
- `POST /api/whatsapp/client/:id/initialize` - Inicializar cliente
- `GET /api/whatsapp/client/:id/qr` - Obtener código QR
- `GET /api/whatsapp/client/:id/status` - Verificar estado
- `POST /api/whatsapp/client/:id/disconnect` - Desconectar cliente
- `POST /api/whatsapp/client/:id/restart` - Reiniciar cliente
- `POST /api/whatsapp/client/:id/send` - Enviar mensaje
- `GET /api/whatsapp/client/:id/messages` - Obtener mensajes

### API Externa (para n8n)
- `POST /api/external/send` - Enviar mensaje
- `POST /api/external/send-media` - Enviar mensaje multimedia
- `GET /api/external/status` - Obtener estado del cliente
- `GET /api/external/messages` - Obtener mensajes
- `POST /api/external/check-number` - Verificar número de WhatsApp
- `POST /api/external/setup-webhook` - Configurar webhook

## Integración con n8n

Para integrar con n8n:

1. Obtén el token API de un cliente desde el panel de administración
2. Utiliza los endpoints `/api/external/*` con el encabezado `x-api-token`
3. Configura un webhook para recibir mensajes entrantes

## Licencia

Este proyecto está licenciado bajo [MIT License](LICENSE).