import { toast } from "react-hot-toast";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  PlayIcon,
  ClipboardDocumentIcon,
} from "@heroicons/react/24/outline";

export default function EndpointItem({
  endpoint,
  isActive,
  setActive,
  testParams,
  handleParamChange,
  executeTest,
  testResult,
  executing,
  selectedClient,
}) {
  // Copiar código de ejemplo
  const copyExample = () => {
    if (endpoint && endpoint.example) {
      navigator.clipboard.writeText(JSON.stringify(endpoint.example, null, 2));
      toast.success("Ejemplo copiado al portapapeles");
    }
  };

  // Función para copiar el código curl
  const copyCurlCommand = () => {
    if (!endpoint || !selectedClient || !selectedClient.apiToken) return;

    let curlCmd = `curl -X ${endpoint.method} "${window.location.origin}${endpoint.path}"`;

    // Agregar headers
    curlCmd += ` -H "Content-Type: application/json" -H "x-api-token: ${selectedClient.apiToken}"`;

    // Agregar data para POST
    if (endpoint.method === "POST") {
      const data = JSON.stringify(testParams);
      curlCmd += ` -d '${data}'`;
    }
    // Agregar query params para GET
    else if (
      endpoint.method === "GET" &&
      Object.keys(testParams || {}).length > 0
    ) {
      const queryParams = new URLSearchParams(testParams).toString();
      curlCmd += ` "${window.location.origin}${endpoint.path}?${queryParams}"`;
    }

    navigator.clipboard.writeText(curlCmd);
    toast.success("Comando curl copiado al portapapeles");
  };

  // Determinar las clases para la tarjeta de respuesta
  const getResponseCardClasses = () => {
    if (!testResult) return "bg-gray-50";

    const status = testResult.status;
    if (status >= 200 && status < 300) {
      return "bg-green-50 border-green-200";
    } else if (status >= 400 && status < 500) {
      return "bg-yellow-50 border-yellow-200";
    } else if (status >= 500) {
      return "bg-red-50 border-red-200";
    }

    return "bg-gray-50";
  };

  return (
    <li className="px-4 py-4 hover:bg-gray-50">
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={setActive}
      >
        <div className="flex items-center">
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium ${
              endpoint.method === "GET"
                ? "bg-blue-100 text-blue-700"
                : "bg-green-100 text-green-800"
            }`}
          >
            {endpoint.method}
          </span>
          <span className="ml-3 text-gray-900 font-medium">
            {endpoint.path}
          </span>
        </div>
        <div className="flex items-center">
          {isActive ? (
            <ChevronUpIcon className="h-5 w-5 text-gray-500" />
          ) : (
            <ChevronDownIcon className="h-5 w-5 text-gray-500" />
          )}
        </div>
      </div>

      {isActive && (
        <div className="mt-4">
          <div className="text-sm text-gray-700 mb-4 bg-blue-50 p-3 rounded-md border border-blue-100">
            {endpoint.description}
          </div>

          {/* Parámetros */}
          {endpoint.parameters && endpoint.parameters.length > 0 && (
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-700 mb-3">
                Parámetros:
              </h4>
              <div className="space-y-4 bg-gray-50 p-4 rounded-md border border-gray-200">
                {endpoint.parameters.map((param) => (
                  <div
                    key={param.name}
                    className="flex flex-col sm:flex-row sm:items-start"
                  >
                    <div className="sm:w-1/3 mb-2 sm:mb-0">
                      <label
                        htmlFor={`param-${endpoint.id}-${param.name}`}
                        className="block text-sm font-medium text-gray-700"
                      >
                        {param.name}
                        {param.required && (
                          <span className="text-red-500 ml-1">*</span>
                        )}
                      </label>
                      <p className="mt-1 text-xs text-gray-500">
                        {param.description}
                      </p>
                    </div>
                    <div className="sm:w-2/3">
                      {param.enum ? (
                        <select
                          id={`param-${endpoint.id}-${param.name}`}
                          name={param.name}
                          value={testParams?.[param.name] || ""}
                          onChange={(e) =>
                            handleParamChange(param.name, e.target.value)
                          }
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-700 focus:border-blue-700 sm:text-sm"
                        >
                          {param.enum.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      ) : param.type === "boolean" ? (
                        <select
                          id={`param-${endpoint.id}-${param.name}`}
                          name={param.name}
                          value={testParams?.[param.name] || ""}
                          onChange={(e) =>
                            handleParamChange(
                              param.name,
                              e.target.value === "true"
                            )
                          }
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-700 focus:border-blue-700 sm:text-sm"
                        >
                          <option value="">Seleccionar...</option>
                          <option value="true">Verdadero</option>
                          <option value="false">Falso</option>
                        </select>
                      ) : (
                        <input
                          type={param.type === "number" ? "number" : "text"}
                          id={`param-${endpoint.id}-${param.name}`}
                          name={param.name}
                          value={testParams?.[param.name] || ""}
                          onChange={(e) =>
                            handleParamChange(param.name, e.target.value)
                          }
                          placeholder={
                            param.example ||
                            (param.required ? "Requerido" : "Opcional")
                          }
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-700 focus:border-blue-700 sm:text-sm"
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Ejemplos */}
          {endpoint.example && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-gray-700">Ejemplo:</h4>
                <button
                  type="button"
                  onClick={copyExample}
                  className="inline-flex items-center px-2 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
                >
                  <ClipboardDocumentIcon className="h-3 w-3 mr-1" />
                  Copiar
                </button>
              </div>
              <pre className="bg-gray-50 p-3 rounded-md text-xs overflow-x-auto border border-gray-200">
                {JSON.stringify(endpoint.example, null, 2)}
              </pre>
            </div>
          )}

          {/* Botones de acción */}
          <div className="flex items-center justify-between mt-6">
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={executeTest}
                disabled={executing || !selectedClient}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-700 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                <PlayIcon className="h-4 w-4 mr-2" />
                {executing ? "Ejecutando..." : "Ejecutar"}
              </button>
              <button
                type="button"
                onClick={copyCurlCommand}
                disabled={!selectedClient}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-700 transition-colors disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
              >
                <ClipboardDocumentIcon className="h-4 w-4 mr-2" />
                Copiar curl
              </button>
            </div>
          </div>

          {/* Resultados */}
          {testResult && (
            <div
              className={`mt-6 border rounded-md p-4 ${getResponseCardClasses()}`}
            >
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                Respuesta: {testResult.status}{" "}
                {testResult.status >= 200 && testResult.status < 300 && (
                  <span className="text-blue-700">Éxito</span>
                )}
                {testResult.status >= 400 && testResult.status < 500 && (
                  <span className="text-yellow-600">Error de cliente</span>
                )}
                {testResult.status >= 500 && (
                  <span className="text-red-600">Error de servidor</span>
                )}
              </h4>
              <pre className="bg-white p-3 rounded-md text-xs overflow-x-auto border">
                {JSON.stringify(testResult.data || testResult.error, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </li>
  );
}
