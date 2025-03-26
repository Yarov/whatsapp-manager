// frontend/src/components/dashboard/MessagesDashboard.jsx
import { useState, useEffect } from "react";
import { Line, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import axios from "axios";
import {
  PaperAirplaneIcon,
  ArrowDownTrayIcon,
  CalendarIcon,
  PhoneIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";

// Registrar componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const timeRanges = [
  { key: "daily", label: "Diario" },
  { key: "weekly", label: "Semanal" },
  { key: "monthly", label: "Mensual" },
];

export default function MessagesDashboard({ clientId }) {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState("daily");
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMessageStats = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `/api/clients/${clientId}/message-stats`
        );
        setStats(response.data);
      } catch (error) {
        console.error("Error al cargar estadísticas:", error);
        setError(
          "No se pudieron cargar las estadísticas. Inténtelo de nuevo más tarde."
        );
      } finally {
        setLoading(false);
      }
    };

    if (clientId) {
      fetchMessageStats();
    }
  }, [clientId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-100 rounded-md p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-red-400"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 101.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!stats || !stats.overview) {
    return (
      <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
        <div className="text-center">
          <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            No hay datos
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            No hay estadísticas disponibles para este cliente.
          </p>
        </div>
      </div>
    );
  }

  // Preparar datos para los gráficos
  const getChartData = () => {
    const timeData = stats.timeDistribution[selectedTimeRange];

    if (!timeData || timeData.length === 0) {
      return {
        labels: [],
        datasets: [],
      };
    }

    let labels = [];
    if (selectedTimeRange === "daily") {
      labels = timeData.map((d) => {
        const date = new Date(d.date);
        return date.toLocaleDateString("es-ES", {
          day: "numeric",
          month: "short",
        });
      });
    } else if (selectedTimeRange === "weekly") {
      labels = timeData.map((d) => {
        const [year, week] = d.week.split("-W");
        return `Sem ${week}, ${year}`;
      });
    } else {
      // monthly
      labels = timeData.map((d) => {
        const [year, month] = d.month.split("-");
        return new Date(year, month - 1).toLocaleDateString("es-ES", {
          month: "short",
          year: "numeric",
        });
      });
    }

    return {
      labels,
      datasets: [
        {
          label: "Recibidos",
          data: timeData.map((d) => d.inbound),
          borderColor: "rgb(67, 56, 202)",
          backgroundColor: "rgba(67, 56, 202, 0.1)",
          tension: 0.3,
        },
        {
          label: "Enviados",
          data: timeData.map((d) => d.outbound),
          borderColor: "rgb(16, 185, 129)",
          backgroundColor: "rgba(16, 185, 129, 0.1)",
          tension: 0.3,
        },
      ],
    };
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      tooltip: {
        mode: "index",
        intersect: false,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0,
        },
      },
    },
    maintainAspectRatio: false,
  };

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
      <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Dashboard de Mensajes
        </h3>
      </div>

      {/* Resumen general */}
      <div className="border-t border-gray-200">
        <div className="bg-gray-50 px-4 py-5 sm:p-6">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            {/* Total de mensajes */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
                    <ChartBarIcon
                      className="h-6 w-6 text-white"
                      aria-hidden="true"
                    />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Total de mensajes
                      </dt>
                      <dd>
                        <div className="text-lg font-medium text-gray-900">
                          {stats.overview.total.toLocaleString()}
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            {/* Mensajes recibidos */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
                    <ArrowDownTrayIcon
                      className="h-6 w-6 text-white"
                      aria-hidden="true"
                    />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Mensajes recibidos
                      </dt>
                      <dd>
                        <div className="text-lg font-medium text-gray-900">
                          {stats.overview.inbound.toLocaleString()}
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            {/* Mensajes enviados */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                    <PaperAirplaneIcon
                      className="h-6 w-6 text-white"
                      aria-hidden="true"
                    />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Mensajes enviados
                      </dt>
                      <dd>
                        <div className="text-lg font-medium text-gray-900">
                          {stats.overview.outbound.toLocaleString()}
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Gráfico de mensajes en el tiempo */}
      <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
        <div className="mb-4 flex justify-between items-center">
          <h4 className="text-base font-medium text-gray-900 flex items-center">
            <CalendarIcon className="h-5 w-5 mr-2 text-gray-500" />
            Mensajes en el tiempo
          </h4>
          <div className="flex items-center space-x-2">
            {timeRanges.map((range) => (
              <button
                key={range.key}
                onClick={() => setSelectedTimeRange(range.key)}
                className={`px-3 py-1 rounded-md text-sm font-medium ${
                  selectedTimeRange === range.key
                    ? "bg-indigo-100 text-indigo-700"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>

        <div className="h-80">
          <Line data={getChartData()} options={chartOptions} />
        </div>
      </div>

      {/* Contactos más frecuentes */}
      <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
        <h4 className="text-base font-medium text-gray-900 flex items-center mb-4">
          <PhoneIcon className="h-5 w-5 mr-2 text-gray-500" />
          Contactos más frecuentes
        </h4>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Número
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Mensajes Recibidos
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Mensajes Enviados
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Total
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Último mensaje
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {stats.topContacts && stats.topContacts.length > 0 ? (
                stats.topContacts.map((contact, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {contact.phone}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {contact.inbound}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {contact.outbound}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {contact.total}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(contact.lastMessage).toLocaleString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-4 text-sm text-gray-500 text-center"
                  >
                    No hay datos de contactos disponibles
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
