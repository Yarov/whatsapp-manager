// frontend/src/pages/clients/ClientList.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import {
  UserPlusIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

export default function ClientList() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await axios.get('/api/clients');
        setClients(response.data.clients || []);
      } catch (error) {
        console.error('Error al cargar clientes:', error);
        toast.error('Error al cargar la lista de clientes');
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, []);

  return (
    <div>
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-base font-semibold leading-6 text-gray-900">Clientes</h1>
          <p className="mt-2 text-sm text-gray-700">
            Lista de todos los clientes registrados en la plataforma.
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link
            to="/clients/add"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            <UserPlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            Agregar cliente
          </Link>
        </div>
      </div>

      <div className="mt-8 overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                Nombre del negocio
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                Número de teléfono
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                Estado
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                Fecha de registro
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
                <tr key={client.id}>
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                    {client.businessName}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {client.phoneNumber}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm">
                    <span
                      className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${client.isConnected
                          ? 'bg-green-100 text-green-800'
                          : client.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                    >
                      {client.isConnected ? 'Conectado' : client.status === 'pending' ? 'Pendiente' : 'Desconectado'}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {new Date(client.createdAt).toLocaleDateString()}
                  </td>
                  <td className="whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                    <Link
                      to={`/clients/${client.id}`}
                      className="text-green-600 hover:text-green-900"
                    >
                      Ver<span className="sr-only">, {client.businessName}</span>
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="py-8 text-center text-sm text-gray-500">
                  No hay clientes registrados.{' '}
                  <Link to="/clients/add" className="text-green-600 hover:text-green-900">
                    Agregar un cliente
                  </Link>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}