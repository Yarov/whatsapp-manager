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
  LinkIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import MessagesDashboard from "../../components/dashboard/MessagesDashboard";
import DeleteClientModal from "../../components/modals/DeleteClientModal";
import QRCodeSection from "../../components/client/QRCodeSection";
import ClientInfoSection from "../../components/client/ClientInfoSection";

export default function ClientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [qrCode, setQrCode] = useState(null);
  const [showQR, setShowQR] = useState(false);
  const [actionLoading, setActionLoading] = useState("");
  const [loading, setLoading] = useState(true);
  const [webhookForm, setWebhookForm] = useState({
    webhookUrl: "",
  });
  const [showWebhookForm, setShowWebhookForm] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

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
    } catch (error) {
      console.error("Error al cargar datos del cliente:", error);
      toast.error("Error al cargar la información del cliente");
    } finally {
      setLoading(false);
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
      // Utilizar el endpoint específico para webhooks
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

  // Abrir modal de eliminación
  const handleOpenDeleteModal = () => {
    setShowDeleteModal(true);
  };

  // Manejar eliminación exitosa
  const handleClientDeleted = () => {
    navigate("/clients");
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
          {/* Dashboard de mensajes - Solo mostrar si está conectado */}
          {client.isConnected && <MessagesDashboard clientId={id} />}

          {/* Información del cliente */}
          <ClientInfoSection
            client={client}
            onDelete={handleOpenDeleteModal}
            onCopyToken={handleCopyToken}
            onRegenerateToken={handleRegenerateToken}
            onWebhookChange={handleWebhookFormChange}
            onSaveWebhook={handleSaveWebhook}
            webhookForm={webhookForm}
            showWebhookForm={showWebhookForm}
            setShowWebhookForm={setShowWebhookForm}
            actionLoading={actionLoading}
            onInitialize={handleInitialize}
            onDisconnect={handleDisconnect}
            onRestart={handleRestart}
          />

          {/* QR Code - Solo mostrar si showQR es true y el cliente no está conectado */}
          {showQR && !client.isConnected && (
            <QRCodeSection qrCode={qrCode} onReloadQR={fetchQRCode} />
          )}

          {/* Modal de eliminación */}
          <DeleteClientModal
            isOpen={showDeleteModal}
            onClose={() => setShowDeleteModal(false)}
            client={client}
            onDeleted={handleClientDeleted}
          />
        </>
      )}
    </div>
  );
}
