// Lista de endpoints de la API externa
export const endpoints = [
  {
    id: "send",
    method: "POST",
    path: "/api/external/send",
    description: "Envía un mensaje de texto a través de WhatsApp",
    parameters: [
      {
        name: "to",
        type: "string",
        required: true,
        description: "Número de teléfono del destinatario (incluye código de país)",
        example: "5212345678900"
      },
      {
        name: "text",
        type: "string",
        required: true,
        description: "Contenido del mensaje de texto",
        example: "Hola, este es un mensaje de prueba"
      },
    ],
    responses: {
      200: {
        description: "Mensaje enviado correctamente",
        schema: {
          success: true,
          messageId: "string",
          clientId: "string",
          to: "string",
          text: "string",
          timestamp: "date",
        },
      },
      400: {
        description: "Error en la solicitud",
      },
      401: {
        description: "Token de API inválido o no proporcionado",
      },
    },
    example: {
      to: "5212345678900",
      text: "Hola, este es un mensaje de prueba",
    },
  },
  {
    id: "send-media",
    method: "POST",
    path: "/api/external/send-media",
    description: "Envía un mensaje multimedia (imagen, documento, etc.)",
    parameters: [
      {
        name: "to",
        type: "string",
        required: true,
        description: "Número de teléfono del destinatario (incluye código de país)",
        example: "5212345678900"
      },
      {
        name: "mediaUrl",
        type: "string",
        required: true,
        description: "URL pública del archivo multimedia a enviar",
        example: "https://example.com/image.jpg"
      },
      {
        name: "caption",
        type: "string",
        required: false,
        description: "Texto que acompaña al archivo multimedia",
        example: "Imagen de ejemplo"
      },
      {
        name: "type",
        type: "string",
        required: true,
        description: "Tipo de archivo multimedia (image, document, video, audio)",
        enum: ["image", "document", "video", "audio"],
        example: "image"
      },
    ],
    responses: {
      200: {
        description: "Mensaje multimedia enviado correctamente",
        schema: {
          success: true,
          messageId: "string",
          clientId: "string",
          to: "string",
          mediaType: "string",
          mediaUrl: "string",
          caption: "string",
          timestamp: "date",
        },
      },
    },
    example: {
      to: "5212345678900",
      mediaUrl: "https://example.com/image.jpg",
      caption: "Imagen de ejemplo",
      type: "image",
    },
  },
  {
    id: "status",
    method: "GET",
    path: "/api/external/status",
    description: "Obtiene el estado actual del cliente de WhatsApp",
    parameters: [],
    responses: {
      200: {
        description: "Estado del cliente obtenido correctamente",
        schema: {
          success: true,
          clientId: "string",
          businessName: "string",
          phoneNumber: "string",
          isConnected: "boolean",
          status: "string",
        },
      },
    },
  },
  {
    id: "messages",
    method: "GET",
    path: "/api/external/messages",
    description: "Obtiene los mensajes recientes del cliente",
    parameters: [
      {
        name: "limit",
        type: "number",
        required: false,
        description: "Número máximo de mensajes a retornar (default: 50)",
        example: "50"
      },
      {
        name: "offset",
        type: "number",
        required: false,
        description: "Número de mensajes a saltar (para paginación)",
        example: "0"
      },
      {
        name: "phoneNumber",
        type: "string",
        required: false,
        description: "Filtrar mensajes por número de teléfono",
        example: "5212345678900"
      },
    ],
    responses: {
      200: {
        description: "Mensajes obtenidos correctamente",
        schema: {
          success: true,
          clientId: "string",
          messages: "array",
          pagination: {
            total: "number",
            limit: "number",
            offset: "number",
          },
        },
      },
    },
  },
  {
    id: "check-number",
    method: "POST",
    path: "/api/external/check-number",
    description: "Verifica si un número existe en WhatsApp",
    parameters: [
      {
        name: "phoneNumber",
        type: "string",
        required: true,
        description: "Número de teléfono a verificar (incluye código de país)",
        example: "5212345678900"
      },
    ],
    responses: {
      200: {
        description: "Verificación realizada correctamente",
        schema: {
          success: true,
          phoneNumber: "string",
          exists: "boolean",
          clientId: "string",
        },
      },
    },
    example: {
      phoneNumber: "5212345678900",
    },
  },
  {
    id: "setup-webhook",
    method: "POST",
    path: "/api/external/setup-webhook",
    description: "Configura un webhook para recibir notificaciones en tiempo real",
    parameters: [
      {
        name: "webhookUrl",
        type: "string",
        required: true,
        description: "URL del webhook donde se enviarán las notificaciones",
        example: "https://mi-servidor.com/webhook"
      },
    ],
    responses: {
      200: {
        description: "Webhook configurado correctamente",
        schema: {
          success: true,
          message: "string",
          clientId: "string",
          webhookUrl: "string",
        },
      },
    },
    example: {
      webhookUrl: "https://mi-servidor.com/webhook",
    },
  },
];