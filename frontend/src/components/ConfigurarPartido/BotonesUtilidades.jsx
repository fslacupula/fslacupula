import React from "react";

/**
 * Componente para los botones de utilidades del partido
 * (Finalizar Excepcional, Ver Datos, Volver)
 */
const BotonesUtilidades = ({
  partidoId,
  partidoInfo,
  finalizarPartidoExcepcional,
  mostrarDatosLocalStorage,
  setModalVolverDashboard,
  navigate,
}) => {
  return (
    <>
      {/* Card de Botones de Acción */}
      {partidoId && partidoInfo && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-4">
          <div className="flex flex-wrap gap-3 justify-start items-center">
            {/* Botón Finalizar Excepcional - Rojo */}
            <button
              onClick={finalizarPartidoExcepcional}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg shadow-md transition-all hover:scale-105 flex items-center gap-2"
              title="Finalizar partido de forma excepcional (requiere motivo)"
            >
              <svg
                className="w-5 h-5"
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
              Finalizar Partido (Excepcional)
            </button>

            {/* Botón Ver Datos */}
            <button
              onClick={mostrarDatosLocalStorage}
              className="px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white font-semibold rounded-lg shadow-md transition-all hover:scale-105 flex items-center gap-2"
              title="Ver datos guardados en localStorage"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Ver Datos
            </button>

            {/* Botón Volver */}
            <button
              onClick={() => setModalVolverDashboard(true)}
              className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white font-semibold rounded-lg shadow-md transition-all hover:scale-105 flex items-center gap-2"
              title="Volver al dashboard"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Volver
            </button>
          </div>
        </div>
      )}

      {/* Navegación para usuarios sin partido */}
      {!partidoId && (
        <button
          onClick={() => navigate("/dashboard")}
          className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white font-semibold rounded-lg shadow-md transition-all hover:scale-105 flex items-center gap-2 mb-4"
          title="Volver al dashboard"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Volver
        </button>
      )}
    </>
  );
};

export default BotonesUtilidades;
