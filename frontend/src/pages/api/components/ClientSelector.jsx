import { toast } from "react-hot-toast";
import {
  ClipboardDocumentIcon,
  LockClosedIcon,
} from "@heroicons/react/24/outline";

export default function ClientSelector({
  clients,
  selectedClient,
  setSelectedClient,
  loading,
}) {
  // Función para copiar el token de API
  const copyApiToken = () => {
    if (selectedClient && selectedClient.apiToken) {
      navigator.clipboard.writeText(selectedClient.apiToken);
      toast.success("Token de API copiado al portapapeles");
    }
  };

  return (
    <div className="border-t border-gray-200 px-4 py-5 sm:px-6 bg-gray-50">
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Seleccionar cliente
        </label>
        <div className="flex flex-wrap items-center gap-4">
          <select
            className="mt-1 block w-full sm:w-64 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            value={selectedClient?.id || ""}
            disabled={loading}
            onChange={(e) => {
              const clientId = e.target.value;
              const client = clients.find((c) => c.id === clientId);
              setSelectedClient(client || null);
            }}
          >
            <option value="">Seleccione un cliente</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.businessName} ({client.phoneNumber})
              </option>
            ))}
          </select>

          {selectedClient && (
            <div className="flex items-center bg-white rounded-md border border-gray-300 p-2 flex-grow">
              <div className="flex-1 text-sm text-gray-700 mr-2 max-w-md overflow-x-auto">
                <span className="font-semibold">Token:</span>{" "}
                {selectedClient.apiToken}
              </div>
              <button
                onClick={copyApiToken}
                className="p-2 text-gray-500 hover:text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                title="Copiar token"
              >
                <ClipboardDocumentIcon className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>
        {!selectedClient && (
          <p className="mt-2 text-sm text-yellow-600 bg-yellow-50 p-2 rounded-md border border-yellow-200">
            <LockClosedIcon className="inline-block h-4 w-4 mr-1" />
            Es necesario seleccionar un cliente para probar los endpoints
          </p>
        )}
      </div>
    </div>
  );
}
