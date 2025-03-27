
import { Link, useNavigate } from "react-router-dom";

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Navbar */}
        <nav className="relative z-10 bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 text-blue-700"
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
                <div className="ml-2 font-bold text-xl text-gray-900">
                  WtX
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-blue-700 hover:text-indigo-800"
                >
                  Iniciar sesión
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-700 rounded-md shadow-sm hover:bg-blue-700"
                >
                  Registrarse
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Content */}
        <div className="pt-10 pb-16 sm:pt-16 sm:pb-20 lg:pt-20 lg:pb-28">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="lg:grid lg:grid-cols-12 lg:gap-8">
              <div className="sm:text-center md:max-w-3xl md:mx-auto lg:col-span-6 lg:text-left">
                <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
                  <span className="block">Automatiza tu</span>
                  <span className="block text-blue-700">
                  WhatsApp
                  </span>
                </h1>
                <p className="mt-6 text-xl text-gray-500">
                  Conecta tu WhatsApp a cualquier sistema, automatiza mensajes y
                  gestiona múltiples conversaciones sin complicaciones.
                </p>
                <div className="mt-10">
                  <Link
                    to="/register"
                    className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-700 shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-700"
                  >
                    Probar gratis
                  </Link>
                  <p className="mt-3 text-sm text-gray-500">
                    Comienza tu prueba gratuita hoy. Sin compromiso, sin tarjeta
                    de crédito.
                  </p>
                </div>
              </div>
              <div className="mt-12 lg:mt-0 lg:col-span-6 flex justify-center">

              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-gray-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Características principales
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
              Todo lo que necesitas para integrar WhatsApp en tus procesos de
              negocio
            </p>
          </div>

          <div className="mt-16">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {/* Feature 1 */}
              <div className="pt-6">
                <div className="flow-root bg-white rounded-lg px-6 pb-8">
                  <div className="-mt-6">
                    <div>
                      <span className="inline-flex items-center justify-center p-3 bg-blue-700 rounded-md shadow-lg">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-6 w-6 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01"
                          />
                        </svg>
                      </span>
                    </div>
                    <h3 className="mt-8 text-lg font-medium text-gray-900">
                      Múltiples conexiones
                    </h3>
                    <p className="mt-5 text-base text-gray-500">
                      Administra varios números de WhatsApp desde un único panel
                      de control, ideal para equipos y empresas.
                    </p>
                  </div>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="pt-6">
                <div className="flow-root bg-white rounded-lg px-6 pb-8">
                  <div className="-mt-6">
                    <div>
                      <span className="inline-flex items-center justify-center p-3 bg-blue-700 rounded-md shadow-lg">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-6 w-6 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                          />
                        </svg>
                      </span>
                    </div>
                    <h3 className="mt-8 text-lg font-medium text-gray-900">
                      Integración con n8n
                    </h3>
                    <p className="mt-5 text-base text-gray-500">
                      Conecta WhatsApp con tus herramientas favoritas usando n8n
                      y crea flujos de trabajo personalizados.
                    </p>
                  </div>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="pt-6">
                <div className="flow-root bg-white rounded-lg px-6 pb-8">
                  <div className="-mt-6">
                    <div>
                      <span className="inline-flex items-center justify-center p-3 bg-blue-700 rounded-md shadow-lg">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-6 w-6 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                          />
                        </svg>
                      </span>
                    </div>
                    <h3 className="mt-8 text-lg font-medium text-gray-900">
                      Notificaciones y webhooks
                    </h3>
                    <p className="mt-5 text-base text-gray-500">
                      Recibe alertas en tiempo real y envía datos a tus sistemas
                      cuando lleguen nuevos mensajes.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Cómo funciona
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
              En tres sencillos pasos estarás automatizando tu WhatsApp
            </p>
          </div>

          <div className="mt-16">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {/* Step 1 */}
              <div className="bg-white">
                <div className="text-center">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-700 text-white mx-auto">
                    <span className="text-lg font-bold">1</span>
                  </div>
                  <h3 className="mt-6 text-lg font-medium text-gray-900">
                    Regístrate
                  </h3>
                  <p className="mt-2 text-base text-gray-500 px-6">
                    Crea tu cuenta gratuita y configura tu perfil en nuestra
                    plataforma segura.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="bg-white">
                <div className="text-center">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-700 text-white mx-auto">
                    <span className="text-lg font-bold">2</span>
                  </div>
                  <h3 className="mt-6 text-lg font-medium text-gray-900">
                    Conecta WhatsApp
                  </h3>
                  <p className="mt-2 text-base text-gray-500 px-6">
                    Escanea el código QR con tu teléfono para sincronizar
                    WhatsApp con nuestra API.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="bg-white">
                <div className="text-center">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-700 text-white mx-auto">
                    <span className="text-lg font-bold">3</span>
                  </div>
                  <h3 className="mt-6 text-lg font-medium text-gray-900">
                    Comienza a automatizar
                  </h3>
                  <p className="mt-2 text-base text-gray-500 px-6">
                    Utiliza nuestra API o conecta con n8n para automatizar
                    mensajes y flujos de trabajo.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-700">
        <div className="max-w-2xl mx-auto text-center py-16 px-4 sm:py-20 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            <span className="block">Listo para empezar?</span>
            <span className="block">Prueba gratis ahora</span>
          </h2>
          <p className="mt-4 text-lg leading-6 text-indigo-200">
            Comienza tu prueba gratuita hoy mismo y descubre cómo WtX
            puede transformar tu negocio.
          </p>
          <Link
            to="/register"
            className="mt-8 w-full inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-blue-700 bg-white hover:bg-indigo-50 sm:w-auto"
          >
            Registrarse gratis
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 md:flex md:items-center md:justify-between lg:px-8">
            <p className="text-center text-base text-gray-400">
              &copy; {new Date().getFullYear()} WtX. Todos los derechos
              reservados.
            </p>
        </div>
      </footer>
    </div>
  );
}
