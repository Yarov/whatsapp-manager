// frontend/src/components/modals/DeleteClientModal.jsx
import { useState } from "react";
import {
  XMarkIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import axios from "axios";
import { toast } from "react-hot-toast";

export default function DeleteClientModal({
  isOpen,
  onClose,
  client,
  onDeleted,
}) {
  const [confirmationWord, setConfirmationWord] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (confirmationWord !== "ELIMINAR") {
      setError("Por favor escriba 'ELIMINAR' para confirmar.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await axios.delete(`/api/clients/${client.id}/secure`, {
        data: { confirmationWord },
      });

      if (response.data.success) {
        toast.success("Cliente eliminado correctamente");
        onDeleted();
        onClose();
      } else {
        setError(response.data.message || "Error al eliminar cliente");
      }
    } catch (error) {
      console.error("Error al eliminar cliente:", error);
      setError(error.response?.data?.message || "Error al eliminar cliente");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed z-50 inset-0 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Overlay oscuro */}
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        ></div>

        {/* Modal */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="absolute top-0 right-0 pt-4 pr-4">
            <button
              type="button"
              onClick={onClose}
              className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
            >
              <span className="sr-only">Cerrar</span>
              <XMarkIcon className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>

          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                <ExclamationTriangleIcon
                  className="h-6 w-6 text-red-600"
                  aria-hidden="true"
                />
              </div>
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Eliminar cliente
                </h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    Está a punto de eliminar el cliente{" "}
                    <strong>{client?.businessName}</strong>. Esta acción no se
                    puede deshacer. Todos los datos asociados, incluyendo
                    mensajes e historial de conexiones, serán eliminados
                    permanentemente.
                  </p>
                </div>
              </div>
            </div>

            {/* Campo de confirmación - Claramente visible */}
            <div className="mt-4 border-t border-gray-200 pt-4">
              <label
                htmlFor="confirmationWord"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Escriba <span className="font-bold text-red-600">ELIMINAR</span>{" "}
                para confirmar:
              </label>
              <input
                type="text"
                id="confirmationWord"
                name="confirmationWord"
                value={confirmationWord}
                onChange={(e) => setConfirmationWord(e.target.value)}
                className="shadow-sm focus:ring-red-500 focus:border-red-500 block w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="ELIMINAR"
                autoComplete="off"
                autoFocus
              />
              {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
            </div>
          </div>

          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm disabled:bg-red-300"
            >
              {loading ? "Eliminando..." : "Eliminar"}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-700 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
