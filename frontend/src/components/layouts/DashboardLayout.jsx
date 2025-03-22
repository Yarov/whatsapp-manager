// frontend/src/components/layouts/DashboardLayout.jsx
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  HomeIcon,
  UsersIcon,
  BellIcon,
  Bars3Icon,
  XMarkIcon,
  ArrowLeftOnRectangleIcon,
} from "@heroicons/react/24/outline";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: HomeIcon },
  { name: "Clientes", href: "/clients", icon: UsersIcon },
];

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function DashboardLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="h-screen flex overflow-hidden bg-gray-100">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar para móvil */}
      <div
        className={`fixed inset-y-0 left-0 flex flex-col z-50 w-64 transition duration-300 ease-in-out transform bg-gray-800 md:translate-x-0 md:static md:inset-auto ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between h-16 px-4 bg-gray-900">
          <div className="flex items-center flex-shrink-0 text-white">
            <span className="text-xl font-semibold">WhatsApp API</span>
          </div>
          <button
            className="md:hidden rounded-md p-2 text-gray-400 hover:text-white focus:outline-none"
            onClick={() => setSidebarOpen(false)}
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="flex-1 flex flex-col overflow-y-auto">
          <nav className="mt-5 flex-1 px-2 space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={classNames(
                  location.pathname === item.href
                    ? "bg-gray-900 text-white"
                    : "text-gray-300 hover:bg-gray-700 hover:text-white",
                  "group flex items-center px-2 py-2 text-base font-medium rounded-md"
                )}
              >
                <item.icon
                  className="mr-3 flex-shrink-0 h-6 w-6 text-gray-400"
                  aria-hidden="true"
                />
                {item.name}
              </Link>
            ))}
          </nav>
        </div>

        {/* User profile */}
        <div className="flex-shrink-0 p-4 bg-gray-700">
          <div className="flex items-center">
            <div>
              <div className="h-9 w-9 rounded-full bg-gray-500 flex items-center justify-center text-white font-medium">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-white truncate">
                {user?.name || "Usuario"}
              </p>
              <button
                onClick={handleLogout}
                className="flex items-center text-xs font-medium text-gray-300 hover:text-white"
              >
                <ArrowLeftOnRectangleIcon className="mr-1 h-4 w-4" />
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top navigation */}
        <header className="bg-white shadow-sm z-10">
          <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <button
              className="md:hidden -ml-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900"
              onClick={() => setSidebarOpen(true)}
            >
              <span className="sr-only">Abrir sidebar</span>
              <Bars3Icon className="h-6 w-6" aria-hidden="true" />
            </button>
            <div className="flex items-center">
              <h1 className="text-lg font-semibold text-gray-900">
                {navigation.find((item) => location.pathname === item.href)
                  ?.name || "Dashboard"}
              </h1>
            </div>
            <div className="flex items-center">
              <button className="p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none">
                <span className="sr-only">Ver notificaciones</span>
                <BellIcon className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-auto bg-gray-100">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
