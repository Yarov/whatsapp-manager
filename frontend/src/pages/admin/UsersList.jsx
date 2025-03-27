// frontend/src/pages/admin/UsersList.jsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  UserIcon,
  ShieldCheckIcon,
  ArrowPathIcon,
  EyeIcon,
  XCircleIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import { adminApi } from "../../api/admin";

export default function UsersList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionInProgress, setActionInProgress] = useState(null);

  // Cargar usuarios
  useEffect(() => {
    fetchUsers();
  }, []);

  // Función para cargar usuarios
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getUsers();
      setUsers(response.data.users || []);
    } catch (error) {
      console.error("Error al cargar usuarios:", error);
      toast.error("Error al cargar la lista de usuarios");
    } finally {
      setLoading(false);
    }
  };

  // Cambiar estado de un usuario (activar/desactivar)
  const handleToggleStatus = async (userId, userName) => {
    try {
      setActionInProgress(userId);
      await adminApi.toggleUserStatus(userId);

      // Actualizar la lista de usuarios
      const updatedUsers = users.map((user) => {
        if (user._id === userId) {
          return { ...user, active: !user.active };
        }
        return user;
      });

      setUsers(updatedUsers);
      toast.success(`Estado de ${userName} actualizado correctamente`);
    } catch (error) {
      console.error("Error al cambiar estado del usuario:", error);
      toast.error("Error al cambiar estado del usuario");
    } finally {
      setActionInProgress(null);
    }
  };

  // Cambiar rol de un usuario
  const handleChangeRole = async (userId, userName, newRole) => {
    try {
      setActionInProgress(userId);
      await adminApi.changeUserRole(userId, newRole);

      // Actualizar la lista de usuarios
      const updatedUsers = users.map((user) => {
        if (user._id === userId) {
          return { ...user, role: newRole };
        }
        return user;
      });

      setUsers(updatedUsers);
      toast.success(`Rol de ${userName} actualizado a ${newRole}`);
    } catch (error) {
      console.error("Error al cambiar rol del usuario:", error);
      toast.error("Error al cambiar rol del usuario");
    } finally {
      setActionInProgress(null);
    }
  };

  return (
    <div>
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Usuarios</h1>
          <p className="mt-1 text-sm text-gray-500">
            Lista de todos los usuarios registrados en la plataforma
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            onClick={fetchUsers}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-700"
          >
            <ArrowPathIcon
              className="-ml-1 mr-2 h-5 w-5 text-gray-500"
              aria-hidden="true"
            />
            Actualizar
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
                    <div className="h-4 w-40 animate-pulse bg-gray-200 rounded"></div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm">
                    <div className="h-4 w-16 animate-pulse bg-gray-200 rounded"></div>
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
            ) : users.length > 0 ? (
              users.map((user) => (
                <tr key={user._id}>
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                    <div className="flex items-center">
                      <div className="h-8 w-8 flex-shrink-0 rounded-full bg-gray-200 flex items-center justify-center">
                        <UserIcon className="h-5 w-5 text-gray-500" />
                      </div>
                      <div className="ml-4">
                        <div className="font-medium text-gray-900">
                          {user.name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {user.email}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm">
                    <div className="flex items-center">
                      <span
                        className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                          user.role === "admin"
                            ? "bg-purple-100 text-purple-800"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {user.role === "admin" ? "Administrador" : "Usuario"}
                      </span>

                      {/* Menú para cambiar rol (solo mostrar si no es el usuario actual) */}
                      {user._id !== localStorage.getItem("userId") && (
                        <div className="ml-2">
                          <button
                            onClick={() =>
                              handleChangeRole(
                                user._id,
                                user.name,
                                user.role === "admin" ? "user" : "admin"
                              )
                            }
                            disabled={actionInProgress === user._id}
                            className="text-gray-500 hover:text-gray-700"
                            title={`Cambiar a ${
                              user.role === "admin"
                                ? "Usuario"
                                : "Administrador"
                            }`}
                          >
                            <ShieldCheckIcon className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm">
                    <div className="flex items-center">
                      <span
                        className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                          user.active
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {user.active ? "Activo" : "Inactivo"}
                      </span>

                      {/* Botón para activar/desactivar (solo mostrar si no es el usuario actual) */}
                      {user._id !== localStorage.getItem("userId") && (
                        <button
                          onClick={() =>
                            handleToggleStatus(user._id, user.name)
                          }
                          disabled={actionInProgress === user._id}
                          className="ml-2 text-gray-500 hover:text-gray-700"
                          title={
                            user.active
                              ? "Desactivar usuario"
                              : "Activar usuario"
                          }
                        >
                          {user.active ? (
                            <XCircleIcon className="h-4 w-4 text-red-500" />
                          ) : (
                            <CheckCircleIcon className="h-4 w-4 text-green-500" />
                          )}
                        </button>
                      )}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                    <div className="flex justify-end space-x-3">
                      <Link
                        to={`/admin/users/${user._id}`}
                        className="text-blue-700 hover:text-blue-700"
                        title="Ver detalles"
                      >
                        <EyeIcon className="h-5 w-5" />
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
                  No hay usuarios registrados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
