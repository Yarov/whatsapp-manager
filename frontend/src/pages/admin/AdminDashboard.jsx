// frontend/src/pages/admin/AdminDashboard.jsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  UserGroupIcon,
  DevicePhoneMobileIcon,
  EnvelopeIcon,
  ShieldCheckIcon,
  UserIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import { adminApi } from "../../api/admin";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    users: { total: 0, active: 0, admin: 0 },
    clients: { total: 0, connected: 0, pending: 0 },
    messages: { total: 0, inbound: 0, outbound: 0 },
  });
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentClients, setRecentClients] = useState([]);
  const [loading, setLoading] = useState(true);

  // Cargar estadísticas y datos recientes
  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        setLoading(true);
        const response = await adminApi.getSystemStats();
        const { stats, recentData } = response.data;

        setStats(stats);
        setRecentUsers(recentData.users || []);
        setRecentClients(recentData.clients || []);
      } catch (error) {
        console.error("Error al cargar datos de administrador:", error);
        toast.error("Error al cargar datos de administración");
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Dashboard Administrador
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Vista general del sistema y estadísticas
        </p>
      </div>

      {/* Estadísticas principales */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {/* Tarjeta: Usuarios */}
        <div className="overflow-hidden rounded-lg bg-white shadow">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UserGroupIcon
                  className="h-6 w-6 text-indigo-600"
                  aria-hidden="true"
                />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="truncate text-sm font-medium text-gray-500">
                    Usuarios
                  </dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">
                      {loading ? (
                        <div className="h-6 w-10 animate-pulse bg-gray-200 rounded"></div>
                      ) : (
                        stats.users.total
                      )}
                    </div>
                    <div className="mt-1 flex justify-between text-sm text-gray-500">
                      <span>{stats.users.active} activos</span>
                      <span>{stats.users.admin} administradores</span>
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <Link
                to="/admin/users"
                className="font-medium text-indigo-600 hover:text-indigo-500"
              >
                Ver todos los usuarios
              </Link>
            </div>
          </div>
        </div>

        {/* Tarjeta: Clientes */}
        <div className="overflow-hidden rounded-lg bg-white shadow">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DevicePhoneMobileIcon
                  className="h-6 w-6 text-green-600"
                  aria-hidden="true"
                />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="truncate text-sm font-medium text-gray-500">
                    Clientes
                  </dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">
                      {loading ? (
                        <div className="h-6 w-10 animate-pulse bg-gray-200 rounded"></div>
                      ) : (
                        stats.clients.total
                      )}
                    </div>
                    <div className="mt-1 flex justify-between text-sm text-gray-500">
                      <span>{stats.clients.connected} conectados</span>
                      <span>{stats.clients.pending} pendientes</span>
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <Link
                to="/admin/clients"
                className="font-medium text-green-600 hover:text-green-500"
              >
                Ver todos los clientes
              </Link>
            </div>
          </div>
        </div>

        {/* Tarjeta: Mensajes */}
        <div className="overflow-hidden rounded-lg bg-white shadow">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <EnvelopeIcon
                  className="h-6 w-6 text-blue-600"
                  aria-hidden="true"
                />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="truncate text-sm font-medium text-gray-500">
                    Mensajes
                  </dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">
                      {loading ? (
                        <div className="h-6 w-10 animate-pulse bg-gray-200 rounded"></div>
                      ) : (
                        stats.messages.total
                      )}
                    </div>
                    <div className="mt-1 flex justify-between text-sm text-gray-500">
                      <span>{stats.messages.inbound} entrantes</span>
                      <span>{stats.messages.outbound} salientes</span>
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <span className="font-medium text-blue-600">
                Actividad de mensajería
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Usuarios recientes */}
      <div className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-gray-900">
            Usuarios recientes
          </h2>
          <Link
            to="/admin/users"
            className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
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
                  Email
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                >
                  Rol
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
                      <div className="h-4 w-40 animate-pulse bg-gray-200 rounded"></div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm">
                      <div className="h-4 w-16 animate-pulse bg-gray-200 rounded"></div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm">
                      <div className="h-4 w-16 animate-pulse bg-gray-200 rounded"></div>
                    </td>
                    <td className="whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                      <div className="h-4 w-12 animate-pulse bg-gray-200 rounded"></div>
                    </td>
                  </tr>
                ))
              ) : recentUsers.length > 0 ? (
                recentUsers.map((user) => (
                  <tr key={user._id}>
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                      {user.name}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {user.email}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm">
                      <span
                        className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                          user.role === "admin"
                            ? "bg-purple-100 text-purple-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {user.role === "admin" ? "Administrador" : "Usuario"}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm">
                      <span
                        className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                          user.active
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {user.active ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                      <Link
                        to={`/admin/users/${user._id}`}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Ver<span className="sr-only">, {user.name}</span>
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="py-4 text-center text-sm text-gray-500"
                  >
                    No hay usuarios registrados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Clientes recientes */}
      <div className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-gray-900">
            Clientes recientes
          </h2>
          <Link
            to="/admin/clients"
            className="text-sm font-medium text-green-600 hover:text-green-500"
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
                  Negocio
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                >
                  Teléfono
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                >
                  Propietario
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
                      <div className="h-4 w-28 animate-pulse bg-gray-200 rounded"></div>
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
                  <tr key={client._id}>
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                      {client.businessName}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {client.phoneNumber}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {client.owner ? client.owner.name : "N/A"}
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
                        to={`/admin/clients/${client._id}`}
                        className="text-green-600 hover:text-green-900"
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
                    colSpan={5}
                    className="py-4 text-center text-sm text-gray-500"
                  >
                    No hay clientes registrados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
