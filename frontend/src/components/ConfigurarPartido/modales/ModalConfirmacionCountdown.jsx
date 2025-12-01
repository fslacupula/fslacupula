import React from "react";

const ModalConfirmacionCountdown = ({
  confirmacionPendiente,
  tiempoRestanteConfirmacion,
  cancelarConfirmacion,
  confirmarAccion,
}) => {
  if (!confirmacionPendiente) return null;

  const getMensaje = () => {
    if (confirmacionPendiente.tipo === "toggle_cronometro") {
      return confirmacionPendiente.data.nuevoEstado
        ? "¿Iniciar cronómetro?"
        : "¿Detener cronómetro?";
    }
    if (confirmacionPendiente.tipo === "incrementar_gol_local") {
      return "¿Añadir gol al equipo local?";
    }
    if (confirmacionPendiente.tipo === "decrementar_gol_local") {
      return "¿Eliminar gol al equipo local?";
    }
    if (confirmacionPendiente.tipo === "incrementar_gol_visitante") {
      return "¿Añadir gol al equipo visitante?";
    }
    if (confirmacionPendiente.tipo === "decrementar_gol_visitante") {
      return "¿Eliminar gol al equipo visitante?";
    }
    if (confirmacionPendiente.tipo === "resetear_cronometro") {
      return "¿Resetear el cronómetro a 0?";
    }
    return "";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full mx-4 animate-slideUp">
        <div className="text-center">
          <div className="mb-4">
            <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-yellow-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
          </div>

          <h3 className="text-xl font-bold text-gray-800 mb-2">
            Confirmar acción
          </h3>

          <p className="text-gray-600 mb-6">{getMensaje()}</p>

          {/* Countdown visual */}
          <div className="mb-6">
            <div className="relative w-20 h-20 mx-auto">
              <svg className="transform -rotate-90 w-20 h-20">
                <circle
                  cx="40"
                  cy="40"
                  r="36"
                  stroke="#e5e7eb"
                  strokeWidth="8"
                  fill="none"
                />
                <circle
                  cx="40"
                  cy="40"
                  r="36"
                  stroke="#3b82f6"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={226.19}
                  strokeDashoffset={
                    226.19 * (1 - tiempoRestanteConfirmacion / 5)
                  }
                  strokeLinecap="round"
                  className="transition-all duration-100"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold text-blue-600">
                  {Math.ceil(tiempoRestanteConfirmacion)}
                </span>
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Se cancelará automáticamente
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={cancelarConfirmacion}
              className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              Cancelar
            </button>
            <button
              onClick={confirmarAccion}
              className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Confirmar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalConfirmacionCountdown;
