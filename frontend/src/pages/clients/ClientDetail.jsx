// frontend/src/pages/clients/ClientDetail.jsx
import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  ClipboardDocumentIcon,
  PaperAirplaneIcon,
  LinkIcon,
} from "@heroicons/react/24/outline";

export default function ClientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [qrCode, setQrCode] = useState(null);
  const [showQR, setShowQR] = useState(false);
  const [messages, setMessages] = useState([]);
  const [actionLoading, setActionLoading] = useState("");
  const [loading, setLoading] = useState(true);
  const [sendMessageForm, setSendMessageForm] = useState({
    to: "",
    text: "",
  });
  const [webhookForm, setWebhookForm] = useState({
    webhookUrl: "",
  });
  const [showWebhookForm, setShowWebhookForm] = useState(false);

  // Referencia para el intervalo de verificación
  const statusCheckIntervalRef = useRef(null);

  // Función para cargar datos del cliente
  const fetchClientData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/clients/${id}`);
      setClient(response.data.client);

      // Inicializar el formulario de webhook con el valor actual
      setWebhookForm({
        webhookUrl: response.data.client.webhookUrl || "",
      });

      // Si el cliente está conectado, ocultar el QR
      if (response.data.client.isConnected) {
        setShowQR(false);
      }

      // Cargar mensajes
      fetchMessages();
    } catch (error) {
      console.error("Error al cargar datos del cliente:", error);
      toast.error("Error al cargar la información del cliente");
    } finally {
      setLoading(false);
    }
  };

  // Función para cargar mensajes
  const fetchMessages = async () => {
    try {
      const response = await axios.get(`/api/whatsapp/client/${id}/messages`);
      setMessages(response.data.messages || []);
    } catch (error) {
      console.error("Error al cargar mensajes:", error);
    }
  };

  // Función para cargar QR code
  const fetchQRCode = async () => {
    try {
      console.log("Obteniendo código QR...");
      const timestamp = new Date().getTime(); // Añadir timestamp para evitar caché
      const response = await axios.get(
        `/api/whatsapp/client/${id}/qr?t=${timestamp}`,
        {
          responseType: "blob",
        }
      );

      if (response.status === 200) {
        // Liberar URL anterior si existe
        if (qrCode) {
          URL.revokeObjectURL(qrCode);
        }

        const imageUrl = URL.createObjectURL(response.data);
        setQrCode(imageUrl);
        console.log("Código QR obtenido correctamente");
      }
    } catch (error) {
      console.error("Error al obtener código QR:", error);

      // Si hay un error, verificar si el cliente ya está conectado
      try {
        const statusResponse = await axios.get(
          `/api/whatsapp/client/${id}/status`
        );
        if (statusResponse.data.isConnected) {
          // Si está conectado, actualizar la UI
          setShowQR(false);
          fetchClientData();
          toast.success("Cliente conectado exitosamente");
          clearCheckInterval();
        }
      } catch (statusError) {
        console.error("Error al verificar estado:", statusError);
      }
    }
  };

  // Función para verificar periódicamente el estado de conexión
  const startCheckingConnectionStatus = () => {
    // Limpiar intervalo existente si hay uno
    clearCheckInterval();

    // Establecer intervalo para verificar cada 5 segundos
    statusCheckIntervalRef.current = setInterval(async () => {
      try {
        const statusResponse = await axios.get(
          `/api/whatsapp/client/${id}/status`
        );
        console.log("Estado de conexión:", statusResponse.data);

        if (statusResponse.data.isConnected) {
          // Si está conectado, actualizar la UI
          setShowQR(false);
          fetchClientData();
          toast.success("Cliente conectado exitosamente");
          clearCheckInterval();
        }
      } catch (error) {
        console.error("Error al verificar estado de conexión:", error);
      }
    }, 5000);
  };

  // Función para limpiar el intervalo
  const clearCheckInterval = () => {
    if (statusCheckIntervalRef.current) {
      clearInterval(statusCheckIntervalRef.current);
      statusCheckIntervalRef.current = null;
    }
  };

  // Cargar datos al montar el componente
  useEffect(() => {
    fetchClientData();

    // Limpiar al desmontar
    return () => {
      clearCheckInterval();

      if (qrCode) {
        URL.revokeObjectURL(qrCode);
      }
    };
  }, [id]);

  // Inicializar cliente de WhatsApp
  const handleInitialize = async () => {
    setActionLoading("initialize");
    try {
      await axios.post(`/api/whatsapp/client/${id}/initialize`);
      toast.success(
        "Cliente inicializado. Escanee el código QR para conectar WhatsApp."
      );

      // Mostrar sección de QR
      setShowQR(true);

      // Obtener el QR después de un momento
      setTimeout(() => {
        fetchQRCode();

        // Comenzar a verificar periódicamente si el cliente se conecta
        startCheckingConnectionStatus();
      }, 2000);
    } catch (error) {
      console.error("Error al inicializar cliente:", error);
      toast.error("Error al inicializar cliente de WhatsApp");
    } finally {
      setActionLoading("");
    }
  };

  // Reiniciar cliente de WhatsApp
  const handleRestart = async () => {
    setActionLoading("restart");
    try {
      await axios.post(`/api/whatsapp/client/${id}/restart`);
      toast.success("Cliente reiniciado correctamente");

      // Mostrar sección de QR
      setShowQR(true);

      // Actualizar datos y obtener nuevo QR
      setTimeout(() => {
        fetchClientData();
        fetchQRCode();

        // Comenzar a verificar periódicamente si el cliente se conecta
        startCheckingConnectionStatus();
      }, 2000);
    } catch (error) {
      console.error("Error al reiniciar cliente:", error);
      toast.error("Error al reiniciar cliente de WhatsApp");
    } finally {
      setActionLoading("");
    }
  };

  // Desconectar cliente de WhatsApp
  const handleDisconnect = async () => {
    setActionLoading("disconnect");
    try {
      await axios.post(`/api/whatsapp/client/${id}/disconnect`);
      toast.success("Cliente desconectado correctamente");

      // Actualizar datos
      fetchClientData();
      setQrCode(null);
      setShowQR(false);
      clearCheckInterval();
    } catch (error) {
      console.error("Error al desconectar cliente:", error);
      toast.error("Error al desconectar cliente de WhatsApp");
    } finally {
      setActionLoading("");
    }
  };

  // Regenerar token de API
  const handleRegenerateToken = async () => {
    setActionLoading("token");
    try {
      await axios.post(`/api/clients/${id}/regenerate-token`);
      toast.success("Token regenerado correctamente");

      // Actualizar datos del cliente
      fetchClientData();
    } catch (error) {
      console.error("Error al regenerar token:", error);
      toast.error("Error al regenerar token de API");
    } finally {
      setActionLoading("");
    }
  };

  // Copiar token al portapapeles
  const handleCopyToken = () => {
    if (client?.apiToken) {
      navigator.clipboard.writeText(client.apiToken);
      toast.success("Token copiado al portapapeles");
    }
  };

  // Manejar cambios en el formulario de envío de mensajes
  const handleMessageFormChange = (e) => {
    const { name, value } = e.target;
    setSendMessageForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Manejar cambios en el formulario de webhook
  const handleWebhookFormChange = (e) => {
    const { name, value } = e.target;
    setWebhookForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Guardar la configuración del webhook
const handleSaveWebhook = async (e) => {
  e.preventDefault();

  setActionLoading("webhook");
  try {
    // Utilizar el nuevo endpoint específico para webhooks
    await axios.patch(`/api/clients/${id}/webhook`, {
      webhookUrl: webhookForm.webhookUrl,
    });

    toast.success("URL de Webhook actualizada correctamente");
    fetchClientData(); // Actualizar datos del cliente
    setShowWebhookForm(false);
  } catch (error) {
    console.error("Error al actualizar webhook:", error);
    toast.error(
      error.response?.data?.message || "Error al actualizar URL de Webhook"
    );
  } finally {
    setActionLoading("");
  }
};

  // Enviar mensaje
  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!sendMessageForm.to || !sendMessageForm.text) {
      toast.error("Por favor complete todos los campos");
      return;
    }

    setActionLoading("send");
    try {
      await axios.post(`/api/whatsapp/client/${id}/send`, sendMessageForm);

      toast.success("Mensaje enviado correctamente");

      // Limpiar formulario
      setSendMessageForm({
        to: "",
        text: "",
      });

      // Recargar mensajes
      fetchMessages();
    } catch (error) {
      console.error("Error al enviar mensaje:", error);
      toast.error("Error al enviar mensaje");
    } finally {
      setActionLoading("");
    }
  };

  if (loading && !client) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <Link
          to="/clients"
          className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700"
        >
          <ArrowLeftIcon className="mr-1 h-4 w-4" />
          Volver a clientes
        </Link>
      </div>

      {client && (
        <>
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
              <div>
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
                  <dt className="text-sm font-medium text-gray-500">
                    Token de API
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 flex items-center">
                    <code className="px-2 py-1 bg-gray-100 rounded text-xs mr-2 overflow-x-auto max-w-xs">
                      {client.apiToken}
                    </code>
                    <button
                      type="button"
                      onClick={handleCopyToken}
                      className="inline-flex items-center p-1 border border-transparent rounded-full shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      <ClipboardDocumentIcon
                        className="h-4 w-4"
                        aria-hidden="true"
                      />
                    </button>
                    <button
                      type="button"
                      onClick={handleRegenerateToken}
                      disabled={actionLoading === "token"}
                      className="ml-2 inline-flex items-center px-2 py-1 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      {actionLoading === "token"
                        ? "Regenerando..."
                        : "Regenerar"}
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
                        onSubmit={handleSaveWebhook}
                        className="flex items-center space-x-2"
                      >
                        <input
                          type="url"
                          name="webhookUrl"
                          value={webhookForm.webhookUrl}
                          onChange={handleWebhookFormChange}
                          placeholder="https://tu-webhook.com/endpoint"
                          className="shadow-sm focus:ring-green-500 focus:border-green-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        />
                        <button
                          type="submit"
                          disabled={actionLoading === "webhook"}
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400"
                        >
                          {actionLoading === "webhook"
                            ? "Guardando..."
                            : "Guardar"}
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
                            setWebhookForm({
                              webhookUrl: client.webhookUrl || "",
                            });
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
                        Configura una URL de webhook para recibir notificaciones
                        de mensajes en tiempo real. Útil para integrar con n8n u
                        otras herramientas.
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
                          onClick={handleInitialize}
                          disabled={actionLoading === "initialize"}
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400"
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
                            onClick={handleDisconnect}
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
                            onClick={handleRestart}
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

          {/* QR Code - Solo mostrar si showQR es true y el cliente no está conectado */}
          {showQR && !client.isConnected && (
            <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Código QR de WhatsApp
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  Escanee este código con su teléfono para conectar WhatsApp
                </p>
              </div>
              <div className="border-t border-gray-200 px-4 py-5 sm:p-6 flex flex-col items-center">
                {qrCode ? (
                  <img
                    src={qrCode}
                    alt="QR Code para WhatsApp"
                    className="max-w-xs"
                    onError={(e) => {
                      console.error("Error al cargar la imagen QR");
                      setTimeout(fetchQRCode, 2000);
                    }}
                  />
                ) : (
                  <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mb-4"></div>
                    <p className="text-sm text-gray-500">
                      Generando código QR...
                    </p>
                  </div>
                )}
                <button
                  onClick={fetchQRCode}
                  className="mt-4 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Recargar QR
                </button>
              </div>
              <div className="px-4 py-3 bg-gray-50 text-sm text-gray-500 border-t border-gray-200">
                <p>1. Abra WhatsApp en su teléfono</p>
                <p>
                  2. Toque en Menú o Configuración y seleccione Dispositivos
                  vinculados
                </p>
                <p>3. Escanee el código QR</p>
                <p>4. Espere a que se complete la conexión automáticamente</p>
              </div>
            </div>
          )}

          {/* Enviar mensaje - Solo mostrar si el cliente está conectado */}
          {client.isConnected && (
            <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Enviar mensaje
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  Pruebe enviar un mensaje usando la API
                </p>
              </div>
              <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
                <form onSubmit={handleSendMessage}>
                  <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                    <div className="sm:col-span-3">
                      <label
                        htmlFor="to"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Destinatario
                      </label>
                      <div className="mt-1">
                        <input
                          type="text"
                          name="to"
                          id="to"
                          value={sendMessageForm.to}
                          onChange={handleMessageFormChange}
                          className="shadow-sm focus:ring-green-500 focus:border-green-500 block w-full sm:text-sm border-gray-300 rounded-md"
                          placeholder="521234567890"
                          required
                        />
                      </div>
                      <p className="mt-1 text-xs text-gray-500">
                        Ingrese el número completo con código de país
                      </p>
                    </div>
                    <div className="sm:col-span-6">
                      <label
                        htmlFor="text"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Mensaje
                      </label>
                      <div className="mt-1">
                        <textarea
                          id="text"
                          name="text"
                          rows={3}
                          value={sendMessageForm.text}
                          onChange={handleMessageFormChange}
                          className="shadow-sm focus:ring-green-500 focus:border-green-500 block w-full sm:text-sm border-gray-300 rounded-md"
                          placeholder="Escriba su mensaje aquí"
                          required
                        />
                      </div>
                    </div>
                  </div>
                  <div className="mt-6">
                    <button
                      type="submit"
                      disabled={actionLoading === "send"}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400"
                    >
                      <PaperAirplaneIcon
                        className="-ml-1 mr-2 h-5 w-5"
                        aria-hidden="true"
                      />
                      {actionLoading === "send"
                        ? "Enviando..."
                        : "Enviar mensaje"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Historial de mensajes */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Historial de mensajes
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Últimos mensajes enviados y recibidos
              </p>
            </div>
            <div className="border-t border-gray-200">
              {messages.length > 0 ? (
                <ul className="divide-y divide-gray-200">
                  {messages.map((message) => (
                    <li key={message._id} className="px-4 py-4">
                      <div
                        className={`flex ${
                          message.direction === "outbound"
                            ? "justify-end"
                            : "justify-start"
                        }`}
                      >
                        <div
                          className={`rounded-lg px-4 py-2 max-w-md text-sm ${
                            message.direction === "outbound"
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          <div className="font-medium">
                            {message.direction === "outbound"
                              ? `Para: ${message.to}`
                              : `De: ${message.from}`}
                          </div>
                          <div className="mt-1">{message.body}</div>
                          <div className="mt-1 text-xs text-gray-500 text-right">
                            {new Date(message.timestamp).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="px-4 py-5 text-center text-sm text-gray-500">
                  No hay mensajes en el historial
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
