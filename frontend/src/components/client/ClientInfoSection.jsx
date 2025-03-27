// frontend/src/components/client/ClientInfoSection.jsx
import {
  XCircleIcon,
  ArrowPathIcon,
  ClipboardDocumentIcon,
  LinkIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";

export default function ClientInfoSection({
  client,
  onDelete,
  onCopyToken,
  onRegenerateToken,
  onWebhookChange,
  onSaveWebhook,
  webhookForm,
  showWebhookForm,
  setShowWebhookForm,
  actionLoading,
  onInitialize,
  onDisconnect,
  onRestart,
}) {
  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
      <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
        <div>
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            {client.businessName}
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Detalles del cliente y configuración de WhatsApp
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <span
            className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${
              client.isConnected
                ? "bg-green-100 text-green-800"
                : client.status === "pending"
                ? "bg-yellow-100 text-yellow-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {client.isConnected
              ? "Conectado"
              : client.status === "pending"
              ? "Pendiente"
              : "Desconectado"}
          </span>
          {/* Botón de eliminar */}
          <button
            onClick={onDelete}
            className="inline-flex items-center p-1.5 border border-transparent rounded-full shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            title="Eliminar cliente"
          >
            <TrashIcon className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>
      <div className="border-t border-gray-200">
        <dl>
          <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">
              Nombre del negocio
            </dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              {client.businessName}
            </dd>
          </div>
          <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">
              Número de teléfono
            </dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              {client.phoneNumber}
            </dd>
          </div>
          <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Token de API</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 flex items-center">
              <code className="px-2 py-1 bg-gray-100 rounded text-xs mr-2 overflow-x-auto max-w-xs">
                {client.apiToken}
              </code>
              <button
                type="button"
                onClick={onCopyToken}
                className="inline-flex items-center p-1 border border-transparent rounded-full shadow-sm text-white bg-blue-700 hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <ClipboardDocumentIcon className="h-4 w-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={onRegenerateToken}
                disabled={actionLoading === "token"}
                className="ml-2 inline-flex items-center px-2 py-1 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                {actionLoading === "token" ? "Regenerando..." : "Regenerar"}
              </button>
            </dd>
          </div>
          <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">
              URL de Webhook
            </dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              {showWebhookForm ? (
                <form
                  onSubmit={onSaveWebhook}
                  className="flex items-center space-x-2"
                >
                  <input
                    type="url"
                    name="webhookUrl"
                    value={webhookForm.webhookUrl}
                    onChange={onWebhookChange}
                    placeholder="https://tu-webhook.com/endpoint"
                    className="shadow-sm focus:ring-green-500 focus:border-green-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                  <button
                    type="submit"
                    disabled={actionLoading === "webhook"}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-blue-700 hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400"
                  >
                    {actionLoading === "webhook" ? "Guardando..." : "Guardar"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowWebhookForm(false)}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    Cancelar
                  </button>
                </form>
              ) : (
                <div className="flex items-center">
                  <span className="mr-2">
                    {client.webhookUrl || "No configurado"}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setShowWebhookForm(true);
                    }}
                    className="inline-flex items-center px-2 py-1 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    <LinkIcon
                      className="-ml-0.5 mr-1 h-4 w-4"
                      aria-hidden="true"
                    />
                    {client.webhookUrl ? "Editar" : "Configurar"}
                  </button>
                </div>
              )}
              {!showWebhookForm && (
                <p className="mt-1 text-xs text-gray-500">
                  Configura una URL de webhook para recibir notificaciones de
                  mensajes en tiempo real. Útil para integrar con n8n u otras
                  herramientas.
                </p>
              )}
            </dd>
          </div>
          <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">
              Fecha de registro
            </dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              {new Date(client.createdAt).toLocaleString()}
            </dd>
          </div>
          <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">
              Acciones de WhatsApp
            </dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              <div className="flex space-x-3">
                {!client.isConnected && (
                  <button
                    type="button"
                    onClick={onInitialize}
                    disabled={actionLoading === "initialize"}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-blue-700 hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400"
                  >
                    {actionLoading === "initialize"
                      ? "Inicializando..."
                      : "Inicializar WhatsApp"}
                  </button>
                )}
                {client.isConnected && (
                  <>
                    <button
                      type="button"
                      onClick={onDisconnect}
                      disabled={actionLoading === "disconnect"}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:bg-gray-400"
                    >
                      <XCircleIcon
                        className="-ml-0.5 mr-2 h-4 w-4"
                        aria-hidden="true"
                      />
                      {actionLoading === "disconnect"
                        ? "Desconectando..."
                        : "Desconectar"}
                    </button>
                    <button
                      type="button"
                      onClick={onRestart}
                      disabled={actionLoading === "restart"}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:bg-gray-400"
                    >
                      <ArrowPathIcon
                        className="-ml-0.5 mr-2 h-4 w-4"
                        aria-hidden="true"
                      />
                      {actionLoading === "restart"
                        ? "Reiniciando..."
                        : "Reiniciar"}
                    </button>
                  </>
                )}
              </div>
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}