import {
  ExclamationCircleIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";

export default function IntegrationInfo() {
  return (
    <div className="bg-white shadow rounded-lg overflow-hidden mt-6">
      <div className="px-4 py-5 sm:px-6 bg-blue-50">
        <h3 className="text-lg leading-6 font-medium text-blue-900 flex items-center">
          <InformationCircleIcon className="h-5 w-5 mr-2" />
          Guía de integración con n8n
        </h3>
        <p className="mt-1 max-w-2xl text-sm text-blue-700">
          Conecta WhatsApp a tus flujos de trabajo con n8n
        </p>
      </div>
      <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
        <h4 className="text-md font-medium text-gray-900 mb-3">
          Conceptos básicos
        </h4>
        <p className="mb-4 text-sm text-gray-700">
          Nuestra API externa permite integrar WhatsApp con plataformas de
          automatización como n8n. Para cada solicitud, necesitarás incluir el
          token de API de tu cliente en el encabezado{" "}
          <code className="px-1 py-0.5 bg-gray-100 rounded">x-api-token</code>.
        </p>

        <h4 className="text-md font-medium text-gray-900 mb-3">
          Configuración en n8n
        </h4>
        <ol className="list-decimal list-inside space-y-3 text-sm text-gray-700 mb-4">
          <li>
            <span className="font-medium">Nodo HTTP Request:</span> Configura un
            nodo HTTP Request con el método correspondiente (GET o POST).
          </li>
          <li>
            <span className="font-medium">Headers:</span> Agrega un encabezado
            con la clave
            <code className="mx-1 px-1 py-0.5 bg-gray-100 rounded">
              x-api-token
            </code>
            y el valor de tu token de API.
          </li>
          <li>
            <span className="font-medium">URL:</span> Usa la URL completa del
            endpoint (ej:{" "}
            <code className="px-1 py-0.5 bg-gray-100 rounded">
              https://tu-servidor.com/api/external/send
            </code>
            )
          </li>
          <li>
            <span className="font-medium">Cuerpo JSON:</span> Para solicitudes
            POST, configura el cuerpo como tipo JSON con los parámetros
            correspondientes.
          </li>
        </ol>

        <h4 className="text-md font-medium text-gray-900 mb-3">
          Webhooks para notificaciones
        </h4>
        <p className="mb-4 text-sm text-gray-700">
          Para recibir notificaciones cuando lleguen nuevos mensajes:
        </p>
        <ol className="list-decimal list-inside space-y-3 text-sm text-gray-700 mb-4">
          <li>
            <span className="font-medium">
              Configura un nodo Webhook en n8n
            </span>{" "}
            para recibir notificaciones.
          </li>
          <li>
            <span className="font-medium">Copia la URL del webhook</span>{" "}
            generada por n8n.
          </li>
          <li>
            <span className="font-medium">Configura tu webhook</span> usando el
            endpoint
            <code className="mx-1 px-1 py-0.5 bg-gray-100 rounded">
              /api/external/setup-webhook
            </code>
            .
          </li>
        </ol>

        <div className="bg-yellow-50 p-4 rounded-md mt-6 border border-yellow-200">
          <div className="flex">
            <div className="flex-shrink-0">
              <ExclamationCircleIcon className="h-5 w-5 text-yellow-700" />
            </div>
            <div className="ml-3">
              <h5 className="text-sm font-medium text-yellow-800">
                Importante
              </h5>
              <p className="text-sm text-yellow-700">
                Asegúrate de que tu cliente esté conectado a WhatsApp antes de
                realizar solicitudes a la API. Puedes verificar el estado del
                cliente usando el endpoint{" "}
                <code className="px-1 py-0.5 bg-gray-100 rounded">
                  /api/external/status
                </code>
                .
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200 px-4 py-5 sm:p-6 bg-gray-50">
        <h4 className="text-md font-medium text-gray-900 mb-3">
          Ejemplos de uso con n8n
        </h4>
        <div className="space-y-6">
          <div>
            <h5 className="text-sm font-medium text-gray-800 mb-2">
              Enviar un mensaje cuando se recibe un formulario:
            </h5>
            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700 pl-4">
              <li>
                Conecta un trigger de formulario (Google Forms, Typeform, etc.)
              </li>
              <li>Añade un nodo HTTP Request configurado con método POST</li>
              <li>
                Usa el endpoint{" "}
                <code className="px-1 py-0.5 bg-gray-100 rounded">
                  /api/external/send
                </code>
              </li>
              <li>Configura el cuerpo con los datos del formulario</li>
              <li>Establece el número del destinatario en el campo "to"</li>
            </ol>
          </div>

          <div>
            <h5 className="text-sm font-medium text-gray-800 mb-2">
              Respuestas automáticas a mensajes entrantes:
            </h5>
            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700 pl-4">
              <li>Configura un webhook para recibir mensajes</li>
              <li>
                Añade condiciones para diferentes tipos de mensajes recibidos
              </li>
              <li>
                Envía respuestas automáticas según el contenido utilizando el
                endpoint de envío
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
