// frontend/src/pages/auth/Login.jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
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

    if (!formData.email || !formData.password) {
      toast.error('Por favor complete todos los campos');
      return;
    }

    setLoading(true);

    try {
      const result = await login(formData.email, formData.password);

      if (!result.success) {
        toast.error(result.message || 'Error al iniciar sesión');
        return;
      }

      toast.success('¡Bienvenido!');
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      toast.error('Error al iniciar sesión. Inténtelo de nuevo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-1 flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
          Iniciar sesión
        </h2>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900">
              Correo electrónico
            </label>
            <div className="mt-2">
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-green-600 sm:text-sm sm:leading-6"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-900">
                Contraseña
              </label>
            </div>
            <div className="mt-2">
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={formData.password}
                onChange={handleChange}
                className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-green-600 sm:text-sm sm:leading-6"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="flex w-full justify-center rounded-md bg-green-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600 disabled:bg-green-400"
            >
              {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
            </button>
          </div>
        </form>

        <p className="mt-10 text-center text-sm text-gray-500">
          ¿No tienes una cuenta?{' '}
          <Link to="/register" className="font-semibold leading-6 text-green-600 hover:text-green-500">
            Regístrate
          </Link>
        </p>
      </div>
    </div>
  );
}