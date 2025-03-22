// frontend/src/pages/NotFound.jsx
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 py-12">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-gray-900">404</h1>
        <h2 className="mt-4 text-3xl font-extrabold text-gray-900 tracking-tight sm:text-4xl">
          Página no encontrada
        </h2>
        <p className="mt-6 text-base text-gray-500">
          Lo sentimos, no pudimos encontrar la página que estás buscando.
        </p>
        <div className="mt-10">
          <Link
            to="/"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}