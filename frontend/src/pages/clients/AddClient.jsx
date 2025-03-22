// frontend/src/pages/clients/AddClient.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function AddClient() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    businessName: '',
    phoneNumber: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.businessName || !formData.phoneNumber) {
      toast.error('Por favor complete todos los campos');
      return;
    }

    // Validar formato de número de teléfono (básico)
    if (!/^\d+$/.test(formData.phoneNumber.replace(/\D/g, ''))) {
      toast.error('El número de teléfono debe contener solo dígitos');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post('/api/clients', formData);

      toast.success('Cliente creado correctamente');
      navigate(`/clients/${response.data.client.id}`);
    } catch (error) {
      console.error('Error al crear cliente:', error);
      toast.error(error.response?.data?.message || 'Error al crear cliente');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <Link
          to="/clients"
          className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700"
        >
          <ArrowLeftIcon className="mr-1 h-4 w-4" />
          Volver a clientes
        </Link>
      </div>

      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-base font-semibold leading-6 text-gray-900">Agregar nuevo cliente</h3>
          <div className="mt-2 max-w-xl text-sm text-gray-500">
            <p>Ingrese los datos básicos para registrar un nuevo cliente.</p>
          </div>
          <form className="mt-5 sm:flex sm:flex-col sm:max-w-lg" onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="businessName" className="block text-sm font-medium text-gray-700">
                Nombre del negocio
              </label>
              <input
                type="text"
                name="businessName"
                id="businessName"
                value={formData.businessName}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                placeholder="Ej. Mi Tienda"
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
                Número de WhatsApp
              </label>
              <input
                type="text"
                name="phoneNumber"
                id="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                placeholder="Ej. 5212345678900"
                required
              />
              <p className="mt-1 text-xs text-gray-500">
                Ingrese el número completo con código de país (ej. 521 para México)
              </p>
            </div>
            <div className="mt-4 flex">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400"
              >
                {loading ? 'Guardando...' : 'Guardar cliente'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/clients')}
                className="ml-3 inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}