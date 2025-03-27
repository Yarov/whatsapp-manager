// En AdminLayout.jsx
import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  HomeIcon,
  UserGroupIcon,
  DevicePhoneMobileIcon,
  BellIcon,
  Bars3Icon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

const navigation = [
  { name: "Usuarios", href: "/admin/users", icon: UserGroupIcon },
  { name: "Clientes", href: "/admin/clients", icon: DevicePhoneMobileIcon },
  { name: "Mi Dashboard", href: "/dashboard", icon: HomeIcon },
];

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function AdminLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Agregar un efecto que se ejecute cuando cambie la ruta
  useEffect(() => {
    // Cerrar el sidebar cuando cambia la ruta
    setSidebarOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Primera letra del nombre de usuario para el avatar
  const userInitial = user?.name?.charAt(0).toUpperCase() || "A";

  // Función para cerrar el menú al hacer clic fuera de él
  const handleOutsideClick = () => {
    if (sidebarOpen) {
      setSidebarOpen(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Mobile sidebar overlay */}
      <div
        className={`fixed inset-0 bg-gray-600 bg-opacity-75 z-40 transition-opacity lg:hidden ${
          sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={handleOutsideClick}
      />

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 transition duration-300 transform bg-blue-800 lg:relative lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex justify-end p-2 lg:hidden">
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-2 text-white rounded-md hover:bg-blue-900"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>
        <div className="flex flex-col h-full">
          {/* Enlaces de navegación */}
          <div className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={classNames(
                  location.pathname === item.href ||
                    (item.href !== "/dashboard" &&
                      location.pathname.startsWith(item.href))
                    ? "bg-blue-700 text-white"
                    : "text-white hover:bg-blue-700",
                  "flex items-center px-4 py-2 rounded-md"
                )}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className="w-6 h-6 mr-3" />
                <span>{item.name}</span>
              </Link>
            ))}
          </div>

          {/* Perfil de usuario */}
          <div className="p-4 border-t border-blue-800">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-blue-900 flex items-center justify-center text-white font-medium">
                  {userInitial}
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-white">{user?.name}</p>
                <p className="text-xs text-indigo-200">Administrador</p>
                <button
                  onClick={() => {
                    handleLogout();
                    setSidebarOpen(false);
                  }}
                  className="text-xs text-indigo-200 hover:text-white"
                >
                  Cerrar sesión
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Barra superior */}
        <div className="sticky top-0 z-10 flex items-center justify-between h-16 px-6 bg-white border-b border-gray-200">
          {/* Título de la página */}
          <div className="flex items-center">
            {/* Botón de menú móvil */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 mr-4 text-gray-500 rounded-md lg:hidden hover:text-gray-900 focus:outline-none"
            >
              <Bars3Icon className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-semibold text-gray-900">
              Dashboard Administrador
            </h1>
          </div>

          {/* Enlaces y notificaciones */}
          <div className="flex items-center space-x-4">
            <button className="text-gray-500 hover:text-gray-700">
              <BellIcon className="w-6 h-6" />
            </button>
            <Link
              to="/dashboard"
              className="text-sm text-blue-700 hover:text-blue-800"
            >
              Vista normal
            </Link>
          </div>
        </div>

        {/* Contenido de la página */}
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div className="py-6 px-4 sm:px-6 lg:px-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
