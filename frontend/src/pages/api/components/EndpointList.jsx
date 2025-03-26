import { useState } from "react";
import { DocumentTextIcon } from "@heroicons/react/24/outline";
import EndpointItem from "./EndpointItem";

export default function EndpointList({
  endpoints,
  testParams,
  handleParamChange,
  executeTest,
  testResults,
  executing,
  selectedClient,
}) {
  const [activeEndpoint, setActiveEndpoint] = useState(null);

  return (
    <div>
      <div className="border-t border-gray-200 px-4 py-3 sm:px-6 bg-gray-50">
        <div className="flex items-center">
          <DocumentTextIcon className="h-5 w-5 text-gray-400 mr-2" />
          <span className="text-sm font-medium text-gray-700">
            Endpoints disponibles:
          </span>
        </div>
      </div>

      <div className="border-t border-gray-200">
        <ul className="divide-y divide-gray-200">
          {endpoints.map((endpoint) => (
            <EndpointItem
              key={endpoint.id}
              endpoint={endpoint}
              isActive={activeEndpoint === endpoint.id}
              setActive={() =>
                setActiveEndpoint(
                  activeEndpoint === endpoint.id ? null : endpoint.id
                )
              }
              testParams={testParams[endpoint.id]}
              handleParamChange={(paramName, value) =>
                handleParamChange(endpoint.id, paramName, value)
              }
              executeTest={() => executeTest(endpoint.id)}
              testResult={testResults[endpoint.id]}
              executing={executing}
              selectedClient={selectedClient}
            />
          ))}
        </ul>
      </div>
    </div>
  );
}
