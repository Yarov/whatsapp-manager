import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import axios from "axios";
import ClientSelector from "./components/ClientSelector";
import EndpointList from "./components/EndpointList";
import IntegrationInfo from "./components/IntegrationInfo";
import { endpoints } from "./data/apiEndpoints";

export default function ApiExplorer() {
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [testParams, setTestParams] = useState({
    send: { to: "", text: "" },
    "send-media": { to: "", mediaUrl: "", caption: "", type: "image" },
    status: {},
    messages: { limit: "50", offset: "0" },
    "check-number": { phoneNumber: "" },
    "setup-webhook": { webhookUrl: "" },
  });
  const [testResults, setTestResults] = useState({});
  const [executing, setExecuting] = useState(false);

  // Cargar clientes
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await axios.get("/api/clients");
        setClients(response.data.clients || []);

        // Si hay clientes, seleccionar el primero por defecto
        if (response.data.clients && response.data.clients.length > 0) {
          setSelectedClient(response.data.clients[0]);
        }
      } catch (error) {
        console.error("Error al cargar clientes:", error);
        toast.error("Error al cargar clientes");
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, []);

  // Manejar cambio en los parámetros de prueba
  const handleParamChange = (endpointId, paramName, value) => {
    setTestParams((prev) => ({
      ...prev,
      [endpointId]: {
        ...prev[endpointId],
        [paramName]: value,
      },
    }));
  };

  // Ejecutar prueba
  const executeTest = async (endpointId) => {
    if (!selectedClient || !selectedClient.apiToken) {
      toast.error("Por favor seleccione un cliente con un token de API válido");
      return;
    }

    setExecuting(true);
    setTestResults((prev) => ({ ...prev, [endpointId]: null }));

    try {
      const endpoint = endpoints.find((e) => e.id === endpointId);
      const params = testParams[endpointId];

      // Configurar headers con el token de API
      const config = {
        headers: {
          "Content-Type": "application/json",
          "x-api-token": selectedClient.apiToken,
        },
      };

      let response;
      if (endpoint.method === "GET") {
        response = await axios.get(endpoint.path, {
          ...config,
          params,
        });
      } else {
        response = await axios.post(endpoint.path, params, config);
      }

      setTestResults((prev) => ({
        ...prev,
        [endpointId]: {
          status: response.status,
          data: response.data,
        },
      }));

      toast.success("Solicitud ejecutada correctamente");
    } catch (error) {
      console.error(`Error al ejecutar solicitud ${endpointId}:`, error);
      setTestResults((prev) => ({
        ...prev,
        [endpointId]: {
          status: error.response?.status || 500,
          error: error.response?.data || { message: error.message },
        },
      }));
      toast.error(`Error: ${error.response?.data?.message || error.message}`);
    } finally {
      setExecuting(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-base font-semibold leading-6 text-gray-900">
          API Explorer
        </h1>
        <p className="mt-2 text-sm text-gray-700">
          Documenta y prueba los endpoints de nuestra API de WhatsApp para
          integraciones externas
        </p>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Documentación de la API Externa
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Prueba los endpoints de la API de WhatsApp para integraciones con
            plataformas externas como n8n
          </p>
        </div>

        {/* Selección de cliente */}
        <ClientSelector
          clients={clients}
          selectedClient={selectedClient}
          setSelectedClient={setSelectedClient}
          loading={loading}
        />

        {/* Lista de endpoints */}
        <EndpointList
          endpoints={endpoints}
          testParams={testParams}
          handleParamChange={handleParamChange}
          executeTest={executeTest}
          testResults={testResults}
          executing={executing}
          selectedClient={selectedClient}
        />
      </div>

      {/* Información de integración con n8n */}
      <IntegrationInfo />
    </div>
  );
}
