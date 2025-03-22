# Documentación de Webhooks

## Introducción

Los webhooks permiten que tu aplicación reciba notificaciones en tiempo real cuando ocurren eventos en WhatsApp, como la recepción de nuevos mensajes. Esto es fundamental para crear chatbots y automatizaciones que respondan instantáneamente a los mensajes de tus clientes.

## Configuración de Webhook

Hay dos formas de configurar el webhook para recibir notificaciones:

### 1. Desde la interfaz de usuario (Recomendado)

1. Inicia sesión en la aplicación
2. Ve a la sección de detalle del cliente
3. En el campo "URL de Webhook", haz clic en "Configurar" o "Editar"
4. Introduce la URL completa de tu webhook (debe comenzar con http:// o https://)
5. Haz clic en "Guardar"

### 2. Mediante la API

También puedes configurar el webhook programáticamente a través de la API:

```http
PUT /api/clients/{client_id}
Authorization: Bearer {token_jwt}
Content-Type: application/json

{
    "webhookUrl": "https://tu-webhook.com/endpoint"
}
```

O a través de la API externa:

```http
POST /api/external/setup-webhook
x-api-token: {api_token}
Content-Type: application/json

{
    "webhookUrl": "https://tu-webhook.com/endpoint"
}
```

## Formato de las notificaciones

Cuando se recibe un mensaje de WhatsApp, el sistema enviará una solicitud POST a la URL de webhook configurada con el siguiente formato:

```json
{
  "event": "message",
  "data": {
    "clientId": "67defxxxxx",
    "message": {
      "_id": "5f8a7b9c1d2e3f4a5b6c7d8e",
      "clientId": "67defxxxxx",
      "messageId": "true_1234567890@c.us_ABCDEFGH12345",
      "from": "521234567890@c.us",
      "to": "521234567890",
      "body": "Hola, este es un mensaje de prueba",
      "type": "text",
      "timestamp": "2023-01-01T12:00:00.000Z",
      "direction": "inbound",
      "status": "sent",
      "metadata": {}
    }
  }
}
```

## Integración con n8n

Para integrar con n8n, usa la siguiente configuración:

1. Crea un nuevo flujo de trabajo en n8n
2. Añade un nodo Webhook (webhook node)
3. Configúralo como "Webhook Receive"
4. Establece el método como "POST"
5. Copia la URL generada por n8n
6. Configura esta URL como webhook en la aplicación
7. Cada vez que llegue un mensaje de WhatsApp, se activará el flujo de trabajo en n8n

## Ejemplo de respuesta automática con n8n

Una vez que hayas configurado el webhook, puedes añadir un nodo HTTP Request para responder automáticamente:

1. Añade un nodo HTTP Request después del nodo Webhook
2. Configúralo como método POST
3. URL: https://tu-api.com/api/external/send (o la URL de tu servidor)
4. Headers:
   - x-api-token: tu-token-de-api
   - Content-Type: application/json
5. Body:
```json
{
  "to": "{{$json.data.message.from}}",
  "text": "Gracias por tu mensaje. Lo hemos recibido y pronto te responderemos."
}
```

## Recomendaciones de seguridad

- Utiliza HTTPS para tus endpoints de webhook
- Considera añadir autenticación adicional a tu webhook
- Valida que los mensajes recibidos tengan la estructura esperada
- Implementa un timeout adecuado en tus respuestas para evitar problemas de rendimiento

## Solución de problemas

Si no estás recibiendo notificaciones en tu webhook, verifica:

1. Que la URL del webhook sea accesible públicamente
2. Que no haya firewalls o reglas de seguridad bloqueando las solicitudes
3. Que el servidor donde está alojado el webhook esté funcionando correctamente
4. Los logs del servidor para detectar posibles errores al enviar las notificaciones