// frontend/src/pages/admin/ClientsList.jsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import axios from "axios";
import {
  DevicePhoneMobileIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";

export default function ClientsList() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState({}); // Mapa de usuarios por ID

  // Cargar clientes y usuarios
  useEffect(() => {
    fetchData();
  }, []);

  // Función para cargar datos
  const fetchData = async () => {
    try {
      setLoading(true);

      // Cargar usuarios primero
      const usersResponse = await axios.get("/api/admin/users");
      const usersMap = {};
      usersResponse.data.users.forEach((user) => {
        usersMap[user._id] = user;
      });
      setUsers(usersMap);

      // Cargar todos los clientes
      const clientsResponse = await axios.get("/api/admin/stats");

      // Obtener los clientes recientes de la respuesta
      // Para una lista completa, necesitaríamos un endpoint específico que devuelva todos los clientes
      // Por ahora, mostraremos los clientes recientes que devuelve la API de estadísticas
      if (
        clientsResponse.data.success &&
        clientsResponse.data.recentData.clients
      ) {
        const clientsWithOwners = clientsResponse.data.recentData.clients.map(
          (client) => ({
            ...client,
            ownerDetails: client.owner ? usersMap[client.owner] : null,
          })
        );
        setClients(clientsWithOwners);
      }
    } catch (error) {
      console.error("Error al cargar datos:", error);
      toast.error("Error al cargar la lista de clientes");
    } finally {
      setLoading(false);
    }
  };

  // Función para obtener todos los clientes de la plataforma
  const fetchAllClients = async () => {
    try {
      setLoading(true);

      // Esta función necesita un endpoint en el backend que devuelva todos los clientes
      // Por ahora, implementamos una solución que recorre todos los usuarios y obtiene sus clientes
      const allClients = [];

      for (const userId of Object.keys(users)) {
        const response = await axios.get(`/api/admin/users/${userId}/clients`);
        if (response.data.success && response.data.clients) {
          const clientsWithOwner = response.data.clients.map((client) => ({
            ...client,
            ownerDetails: users[userId],
          }));
          allClients.push(...clientsWithOwner);
        }
      }

      // Ordenar clientes por fecha de creación (más recientes primero)
      allClients.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      setClients(allClients);
    } catch (error) {
      console.error("Error al cargar todos los clientes:", error);
      toast.error("Error al cargar todos los clientes");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
          <p className="mt-1 text-sm text-gray-500">
            Lista de todos los clientes registrados en la plataforma
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            onClick={fetchAllClients}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            <ArrowPathIcon
              className="-ml-1 mr-2 h-5 w-5 text-gray-500"
              aria-hidden="true"
            />
            Cargar todos
          </button>
        </div>
      </div>

      <div className="mt-8 overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
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
              <th
                scope="col"
                className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
              >
                Registro
              </th>
              <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                <span className="sr-only">Acciones</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {loading ? (
              // Placeholders durante la carga
              Array.from({ length: 5 }).map((_, index) => (
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
                  <td className="whitespace-nowrap px-3 py-4 text-sm">
                    <div className="h-4 w-24 animate-pulse bg-gray-200 rounded"></div>
                  </td>
                  <td className="whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                    <div className="h-4 w-12 animate-pulse bg-gray-200 rounded"></div>
                  </td>
                </tr>
              ))
            ) : clients.length > 0 ? (
              clients.map((client) => (
                <tr key={client._id || client.id}>
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                    <div className="flex items-center">
                      <div className="h-8 w-8 flex-shrink-0 rounded-full bg-green-100 flex items-center justify-center">
                        <DevicePhoneMobileIcon className="h-5 w-5 text-blue-700" />
                      </div>
                      <div className="ml-4">
                        <div className="font-medium text-gray-900">
                          {client.businessName}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {client.phoneNumber}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {client.ownerDetails ? (
                      <Link
                        to={`/admin/users/${client.owner}`}
                        className="text-blue-700 hover:text-blue-700"
                      >
                        {client.ownerDetails.name}
                      </Link>
                    ) : client.owner ? (
                      "Usuario no encontrado"
                    ) : (
                      "N/A"
                    )}
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
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {new Date(client.createdAt).toLocaleDateString()}
                  </td>
                  <td className="whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                    <div className="flex justify-end space-x-3">
                      <Link
                        to={`/admin/clients/${client._id || client.id}`}
                        className="text-blue-700 hover:text-blue-900"
                        title="Ver detalles"
                      >
                        Ver
                      </Link>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={6}
                  className="py-8 text-center text-sm text-gray-500"
                >
                  No hay clientes registrados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
