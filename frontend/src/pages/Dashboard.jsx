// frontend/src/pages/Dashboard.jsx (actualizado para usar el nuevo endpoint)
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";
import {
  UserPlusIcon,
  PhoneIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalClients: 0,
    connectedClients: 0,
    pendingClients: 0,
    totalMessages: 0,
  });
  const [recentClients, setRecentClients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Obtener estadísticas del dashboard
        const statsResponse = await axios.get("/api/dashboard/stats");
        setStats(statsResponse.data);

        // Obtener clientes
        const clientsResponse = await axios.get("/api/clients");
        const clients = clientsResponse.data.clients || [];

        // Obtener clientes recientes (ordenados por fecha de creación)
        const sortedClients = [...clients]
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 5); // Mostrar solo los 5 más recientes

        setRecentClients(sortedClients);
      } catch (error) {
        console.error("Error al cargar datos del dashboard:", error);
        toast.error("Error al cargar datos del dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Tarjeta: Total de clientes */}
        <div className="overflow-hidden rounded-lg bg-white shadow">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UserPlusIcon
                  className="h-6 w-6 text-gray-400"
                  aria-hidden="true"
                />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="truncate text-sm font-medium text-gray-500">
                    Total de clientes
                  </dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">
                      {loading ? (
                        <div className="h-6 w-10 animate-pulse bg-gray-200 rounded"></div>
                      ) : (
                        stats.totalClients
                      )}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Tarjeta: Clientes conectados */}
        <div className="overflow-hidden rounded-lg bg-white shadow">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircleIcon
                  className="h-6 w-6 text-green-400"
                  aria-hidden="true"
                />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="truncate text-sm font-medium text-gray-500">
                    Clientes conectados
                  </dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">
                      {loading ? (
                        <div className="h-6 w-10 animate-pulse bg-gray-200 rounded"></div>
                      ) : (
                        stats.connectedClients
                      )}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Tarjeta: Clientes pendientes */}
        <div className="overflow-hidden rounded-lg bg-white shadow">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <XCircleIcon
                  className="h-6 w-6 text-yellow-400"
                  aria-hidden="true"
                />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="truncate text-sm font-medium text-gray-500">
                    Clientes pendientes
                  </dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">
                      {loading ? (
                        <div className="h-6 w-10 animate-pulse bg-gray-200 rounded"></div>
                      ) : (
                        stats.pendingClients
                      )}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Tarjeta: Total de mensajes */}
        <div className="overflow-hidden rounded-lg bg-white shadow">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <PhoneIcon
                  className="h-6 w-6 text-blue-400"
                  aria-hidden="true"
                />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="truncate text-sm font-medium text-gray-500">
                    Total de mensajes
                  </dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">
                      {loading ? (
                        <div className="h-6 w-10 animate-pulse bg-gray-200 rounded"></div>
                      ) : (
                        stats.totalMessages
                      )}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Clientes recientes */}
      <div className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-gray-900">
            Clientes recientes
          </h2>
          <Link
            to="/clients"
            className="text-sm font-medium text-blue-700 hover:text-blue-900"
          >
            Ver todos
          </Link>
        </div>
        <div className="mt-4 overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                >
                  Nombre
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                >
                  Número de teléfono
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                >
                  Estado
                </th>
                <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                  <span className="sr-only">Acciones</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {loading ? (
                // Placeholders durante la carga
                Array.from({ length: 3 }).map((_, index) => (
                  <tr key={index}>
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                      <div className="h-4 w-32 animate-pulse bg-gray-200 rounded"></div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm">
                      <div className="h-4 w-24 animate-pulse bg-gray-200 rounded"></div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm">
                      <div className="h-4 w-16 animate-pulse bg-gray-200 rounded"></div>
                    </td>
                    <td className="whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                      <div className="h-4 w-12 animate-pulse bg-gray-200 rounded"></div>
                    </td>
                  </tr>
                ))
              ) : recentClients.length > 0 ? (
                recentClients.map((client) => (
                  <tr key={client.id}>
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                      {client.businessName}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {client.phoneNumber}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm">
                      <span
                        className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
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
                    </td>
                    <td className="whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                      <Link
                        to={`/clients/${client.id}`}
                        className="text-blue-700 hover:text-blue-900"
                      >
                        Ver
                        <span className="sr-only">, {client.businessName}</span>
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={4}
                    className="py-4 text-center text-sm text-gray-500"
                  >
                    No hay clientes registrados.{" "}
                    <Link
                      to="/clients/add"
                      className="text-blue-700 hover:text-blue-900"
                    >
                      Agregar un cliente
                    </Link>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Botón para agregar nuevo cliente */}
      <div className="mt-8 mb-6">
        <Link
          to="/clients/add"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-700 hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        >
          <UserPlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
          Agregar nuevo cliente
        </Link>
      </div>
    </div>
  );
}
