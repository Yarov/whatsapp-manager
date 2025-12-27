// frontend/src/pages/clients/AddClient.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import AddClientForm from "../../components/forms/AddClientForm";

export default function AddClient() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data) => {
    // Validación adicional si fuera necesaria
    if (!data.businessName || !data.phoneNumber) {
      toast.error("Por favor complete todos los campos");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post("/api/clients", data);

      toast.success("Cliente creado correctamente");
      navigate(`/clients/${response.data.client.id}`);
    } catch (error) {
      console.error("Error al crear cliente:", error);
      toast.error(error.response?.data?.message || "Error al crear cliente");
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
          <h3 className="text-base font-semibold leading-6 text-gray-900">
            Agregar nuevo cliente
          </h3>
          <div className="mt-2 max-w-xl text-sm text-gray-500">
            <p>Ingrese los datos básicos para registrar un nuevo cliente.</p>
          </div>
          <AddClientForm onSubmit={handleSubmit} loading={loading} />
        </div>
      </div>
    </div>
  );
}
