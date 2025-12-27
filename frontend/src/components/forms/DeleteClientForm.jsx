// frontend/src/components/forms/DeleteClientForm.jsx
import { useForm } from "react-hook-form";

export default function DeleteClientForm({ onSubmit, loading = false }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      confirmationWord: "",
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="mt-4 border-t border-gray-200 pt-4">
        <label
          htmlFor="confirmationWord"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Escriba <span className="font-bold text-red-600">ELIMINAR</span> para
          confirmar:
        </label>
        <input
          type="text"
          id="confirmationWord"
          {...register("confirmationWord", {
            required: "Debe escribir la palabra de confirmación",
            validate: (value) =>
              value === "ELIMINAR" ||
              'Debe escribir exactamente "ELIMINAR" para confirmar',
          })}
          className={`shadow-sm focus:ring-red-500 focus:border-red-500 block w-full px-3 py-2 border ${
            errors.confirmationWord ? "border-red-300" : "border-gray-300"
          } rounded-md`}
          placeholder="ELIMINAR"
          autoComplete="off"
          autoFocus
        />
        {errors.confirmationWord && (
          <p className="mt-2 text-sm text-red-600">
            {errors.confirmationWord.message}
          </p>
        )}
      </div>

      <div className="mt-4">
        <button
          type="submit"
          disabled={loading}
          className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm disabled:bg-red-300"
        >
          {loading ? "Eliminando..." : "Eliminar"}
        </button>
      </div>
    </form>
  );
}
