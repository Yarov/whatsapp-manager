// frontend/src/pages/auth/Register.jsx
import { useState } from "react";
import { toast } from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import RegisterForm from "../../components/forms/RegisterForm";

export default function Register() {
  const { register: registerUser } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleRegister = async (data) => {
    const { name, email, password, confirmPassword } = data;

    if (password !== confirmPassword) {
      toast.error("Las contraseñas no coinciden");
      return;
    }

    setLoading(true);

    try {
      const result = await registerUser(name, email, password);

      if (!result.success) {
        toast.error(result.message || "Error al registrarse");
        return;
      }

      toast.success("¡Registro exitoso!");
    } catch (error) {
      console.error("Error al registrarse:", error);
      toast.error("Error al registrarse. Inténtelo de nuevo");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-blue-700"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
            </svg>
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Crear cuenta
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Registra tus datos para acceder a WtX
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <RegisterForm onSubmit={handleRegister} loading={loading} />
        </div>
      </div>

      <div className="mt-8 text-center">
        <p className="text-xs text-gray-500">
          © {new Date().getFullYear()} WtX. Todos los derechos reservados.
        </p>
      </div>
    </div>
  );
}
