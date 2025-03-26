// frontend/src/components/client/QRCodeSection.jsx

export default function QRCodeSection({ qrCode, onReloadQR }) {
  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Código QR de WhatsApp
        </h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          Escanee este código con su teléfono para conectar WhatsApp
        </p>
      </div>
      <div className="border-t border-gray-200 px-4 py-5 sm:p-6 flex flex-col items-center">
        {qrCode ? (
          <img
            src={qrCode}
            alt="QR Code para WhatsApp"
            className="max-w-xs"
            onError={(e) => {
              console.error("Error al cargar la imagen QR");
              setTimeout(onReloadQR, 2000);
            }}
          />
        ) : (
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mb-4"></div>
            <p className="text-sm text-gray-500">Generando código QR...</p>
          </div>
        )}
        <button
          onClick={onReloadQR}
          className="mt-4 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        >
          Recargar QR
        </button>
      </div>
      <div className="px-4 py-3 bg-gray-50 text-sm text-gray-500 border-t border-gray-200">
        <p>1. Abra WhatsApp en su teléfono</p>
        <p>
          2. Toque en Menú o Configuración y seleccione Dispositivos vinculados
        </p>
        <p>3. Escanee el código QR</p>
        <p>4. Espere a que se complete la conexión automáticamente</p>
      </div>
    </div>
  );
}
