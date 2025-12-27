// frontend/src/components/forms/WebhookForm.jsx
import { useForm } from "react-hook-form";

export default function WebhookForm({
  initialValue = "",
  onSave,
  onCancel,
  loading = false,
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      webhookUrl: initialValue,
    },
  });

  return (
    <form
      onSubmit={handleSubmit(onSave)}
      className="flex items-center space-x-2"
    >
      <input
        type="url"
        id="webhookUrl"
        {...register("webhookUrl", {
          required: "La URL del webhook es obligatoria",
          pattern: {
            value: /^https?:\/\/.+/i,
            message: "Debe ser una URL válida",
          },
        })}
        placeholder="https://tu-webhook.com/endpoint"
        className={`shadow-sm focus:ring-blue-700 focus:border-blue-700 block w-full sm:text-sm border-gray-300 rounded-md ${
          errors.webhookUrl ? "border-red-300" : ""
        }`}
        aria-invalid={errors.webhookUrl ? "true" : "false"}
      />
      {errors.webhookUrl && (
        <span className="text-red-500 text-xs absolute -bottom-5 left-0">
          {errors.webhookUrl.message}
        </span>
      )}
      <button
        type="submit"
        disabled={loading}
        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-blue-700 hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-700 disabled:bg-gray-400"
      >
        {loading ? "Guardando..." : "Guardar"}
      </button>
      <button
        type="button"
        onClick={onCancel}
        className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-700"
      >
        Cancelar
      </button>
    </form>
  );
}
