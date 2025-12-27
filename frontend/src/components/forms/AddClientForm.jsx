// frontend/src/components/forms/AddClientForm.jsx
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

export default function AddClientForm({ onSubmit, loading }) {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      businessName: "",
      phoneNumber: "",
    },
  });

  return (
    <form
      className="mt-5 sm:flex sm:flex-col sm:max-w-lg"
      onSubmit={handleSubmit(onSubmit)}
    >
      <div className="mb-4">
        <label
          htmlFor="businessName"
          className="block text-sm font-medium text-gray-700"
        >
          Nombre del negocio
        </label>
        <input
          id="businessName"
          {...register("businessName", {
            required: "El nombre del negocio es obligatorio",
            minLength: {
              value: 2,
              message: "El nombre debe tener al menos 2 caracteres",
            },
          })}
          className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
            errors.businessName
              ? "border-red-300 focus:border-red-500 focus:ring-red-500"
              : "border-gray-300 focus:border-green-500 focus:ring-green-500"
          }`}
          placeholder="Ej. Mi Tienda"
        />
        {errors.businessName && (
          <p className="mt-1 text-sm text-red-600">
            {errors.businessName.message}
          </p>
        )}
      </div>
      <div className="mb-4">
        <label
          htmlFor="phoneNumber"
          className="block text-sm font-medium text-gray-700"
        >
          Número de WhatsApp
        </label>
        <input
          id="phoneNumber"
          {...register("phoneNumber", {
            required: "El número de WhatsApp es obligatorio",
            pattern: {
              value: /^\d+$/,
              message: "Solo debe contener dígitos",
            },
            minLength: {
              value: 10,
              message: "El número debe tener al menos 10 dígitos",
            },
          })}
          className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
            errors.phoneNumber
              ? "border-red-300 focus:border-red-500 focus:ring-red-500"
              : "border-gray-300 focus:border-green-500 focus:ring-green-500"
          }`}
          placeholder="Ej. 5212345678900"
        />
        {errors.phoneNumber && (
          <p className="mt-1 text-sm text-red-600">
            {errors.phoneNumber.message}
          </p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          Ingrese el número completo con código de país (ej. 521 para México)
        </p>
      </div>
      <div className="mt-4 flex">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-700 hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400"
        >
          {loading ? "Guardando..." : "Guardar cliente"}
        </button>
        <button
          type="button"
          onClick={() => navigate("/clients")}
          className="ml-3 inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
