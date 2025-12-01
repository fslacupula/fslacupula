import React from "react";

const VisorLocalStorage = ({
  visible,
  partidoId,
  datosLocalStoragePartido,
  onClose,
  onCopiar,
}) => {
  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-xl font-bold text-blue-600">
            Datos en LocalStorage - Partido {partidoId}
          </h3>
        </div>
        <div className="p-6 overflow-y-auto flex-1">
          {datosLocalStoragePartido ? (
            <pre className="bg-gray-50 p-4 rounded-lg overflow-x-auto text-xs">
              {JSON.stringify(datosLocalStoragePartido, null, 2)}
            </pre>
          ) : (
            <p className="text-gray-500 text-center py-8">
              No hay datos guardados para este partido
            </p>
          )}
        </div>
        <div className="p-6 border-t border-gray-200 flex gap-3">
          <button
            onClick={onCopiar}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            disabled={!datosLocalStoragePartido}
          >
            Copiar al Portapapeles
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default VisorLocalStorage;
