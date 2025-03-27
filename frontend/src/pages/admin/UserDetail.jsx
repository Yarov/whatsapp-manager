// frontend/src/pages/admin/UserDetail.jsx
import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  UserIcon,
  ShieldCheckIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  XCircleIcon,
  DevicePhoneMobileIcon,
  EnvelopeIcon,
  CalendarIcon,
} from "@heroicons/react/24/outline";
import { adminApi } from "../../api/admin";

export default function UserDetail() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionInProgress, setActionInProgress] = useState(false);

  // Cargar datos del usuario y sus clientes
  useEffect(() => {
    fetchUserData();
  }, [userId]);

  // Función para cargar datos del usuario
  const fetchUserData = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getUserClients(userId);

      if (response.data.success) {
        setUser(response.data.user);
        setClients(response.data.clients || []);
      } else {
        toast.error("Error al cargar datos del usuario");
        navigate("/admin/users");
      }
    } catch (error) {
      console.error("Error al cargar datos del usuario:", error);
      toast.error("Error al cargar datos del usuario");
      navigate("/admin/users");
    } finally {
      setLoading(false);
    }
  };

  // Cambiar estado de un usuario (activar/desactivar)
  const handleToggleStatus = async () => {
    // No permitir que el admin se desactive a sí mismo
    if (userId === localStorage.getItem("userId")) {
      toast.error("No puedes cambiar tu propio estado");
      return;
    }

    try {
      setActionInProgress(true);
      const response = await adminApi.toggleUserStatus(userId);

      if (response.data.success) {
        setUser({
          ...user,
          active: !user.active,
        });

        toast.success(
          `Usuario ${user.active ? "desactivado" : "activado"} correctamente`
        );
      } else {
        toast.error(
          response.data.message || "Error al cambiar estado del usuario"
        );
      }
    } catch (error) {
      console.error("Error al cambiar estado del usuario:", error);
      toast.error("Error al cambiar estado del usuario");
    } finally {
      setActionInProgress(false);
    }
  };

  // Cambiar rol de un usuario
  const handleChangeRole = async () => {
    // No permitir que el admin cambie su propio rol
    if (userId === localStorage.getItem("userId")) {
      toast.error("No puedes cambiar tu propio rol");
      return;
    }

    const newRole = user.role === "admin" ? "user" : "admin";

    try {
      setActionInProgress(true);
      const response = await adminApi.changeUserRole(userId, newRole);

      if (response.data.success) {
        setUser({
          ...user,
          role: newRole,
        });

        toast.success(`Rol cambiado a ${newRole} correctamente`);
      } else {
        toast.error(
          response.data.message || "Error al cambiar rol del usuario"
        );
      }
    } catch (error) {
      console.error("Error al cambiar rol del usuario:", error);
      toast.error("Error al cambiar rol del usuario");
    } finally {
      setActionInProgress(false);
    }
  };

  // Renderizar estado de carga
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-700"></div>
      </div>
    );
  }

  // Renderizar mensaje si el usuario no existe
  if (!user) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-800">
          Usuario no encontrado
        </h2>
        <div className="mt-4">
          <Link
            to="/admin/users"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-700 hover:bg-blue-700"
          >
            Volver a usuarios
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <Link
          to="/admin/users"
          className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700"
        >
          <ArrowLeftIcon className="mr-1 h-4 w-4" />
          Volver a usuarios
        </Link>
      </div>

      {/* Información del usuario */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <div className="flex items-center">
            <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center">
              <UserIcon className="h-6 w-6 text-blue-700" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                {user.name}
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                {user.email}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <span
              className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${
                user.role === "admin"
                  ? "bg-purple-100 text-purple-800"
                  : "bg-blue-100 text-blue-700"
              }`}
            >
              {user.role === "admin" ? "Administrador" : "Usuario"}
            </span>
            <span
              className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${
                user.active
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {user.active ? "Activo" : "Inactivo"}
            </span>
          </div>
        </div>
        <div className="border-t border-gray-200">
          <dl>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">
                Nombre completo
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {user.name}
              </dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">
                Correo electrónico
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {user.email}
              </dd>
            </div>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Rol</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 flex items-center">
                {user.role === "admin" ? "Administrador" : "Usuario"}

                {/* Botón para cambiar rol (solo si no es el usuario actual) */}
                {userId !== localStorage.getItem("userId") && (
                  <button
                    onClick={handleChangeRole}
                    disabled={actionInProgress}
                    className="ml-3 inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-700"
                  >
                    <ShieldCheckIcon
                      className="-ml-0.5 mr-1 h-4 w-4"
                      aria-hidden="true"
                    />
                    Cambiar a{" "}
                    {user.role === "admin" ? "Usuario" : "Administrador"}
                  </button>
                )}
              </dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Estado</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 flex items-center">
                {user.active ? "Activo" : "Inactivo"}

                {/* Botón para cambiar estado (solo si no es el usuario actual) */}
                {userId !== localStorage.getItem("userId") && (
                  <button
                    onClick={handleToggleStatus}
                    disabled={actionInProgress}
                    className={`ml-3 inline-flex items-center px-2.5 py-1.5 border shadow-sm text-xs font-medium rounded focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                      user.active
                        ? "border-red-300 text-red-700 bg-white hover:bg-red-50 focus:ring-red-500"
                        : "border-green-300 text-blue-800 bg-white hover:bg-green-50 focus:ring-green-500"
                    }`}
                  >
                    {user.active ? (
                      <>
                        <XCircleIcon
                          className="-ml-0.5 mr-1 h-4 w-4"
                          aria-hidden="true"
                        />
                        Desactivar
                      </>
                    ) : (
                      <>
                        <CheckCircleIcon
                          className="-ml-0.5 mr-1 h-4 w-4"
                          aria-hidden="true"
                        />
                        Activar
                      </>
                    )}
                  </button>
                )}
              </dd>
            </div>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">
                Fecha de registro
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {new Date(user.createdAt).toLocaleString()}
              </dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">
                Total de clientes
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {clients.length}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Lista de clientes del usuario */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Clientes de {user.name}
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Listado de clientes asociados a este usuario
          </p>
        </div>

        {clients.length > 0 ? (
          <div className="border-t border-gray-200">
            <div className="overflow-hidden">
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
                      Estado
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Mensajes
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Creado
                    </th>
                    <th
                      scope="col"
                      className="relative py-3.5 pl-3 pr-4 sm:pr-6"
                    >
                      <span className="sr-only">Acciones</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {clients.map((client) => (
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
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {client.messageCount || 0}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {new Date(client.createdAt).toLocaleDateString()}
                      </td>
                      <td className="whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <Link
                          to={`/admin/clients/${client.id}`}
                          className="text-blue-700 hover:text-blue-900"
                        >
                          Ver
                          <span className="sr-only">
                            , {client.businessName}
                          </span>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="border-t border-gray-200 px-4 py-6 text-center text-sm text-gray-500">
            <DevicePhoneMobileIcon className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-4">Este usuario no tiene clientes registrados.</p>
          </div>
        )}
      </div>
    </div>
  );
}
