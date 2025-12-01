import React from "react";

/**
 * Componente para agrupar todos los diálogos de inicialización y validación del partido
 */
const DialogosPartido = ({
  // Diálogo Validación Jugadores
  mostrarDialogoValidacionJugadores,
  setMostrarDialogoValidacionJugadores,
  jugadoresEnPistaCount,

  // Diálogo Iniciar Partido
  mostrarDialogoIniciarPartido,
  setMostrarDialogoIniciarPartido,
  setEstadoPartido,
  setPeriodoActual,
  setCronometroActivo,

  // Diálogo localStorage
  mostrarDialogoLocalStorage,
  setMostrarDialogoLocalStorage,
  cargarDesdeLocalStorage,
  limpiarLocalStoragePartidoLegacy,
  partidoIdParam,

  // Diálogo Reset Partido
  mostrarDialogoResetPartido,
  setMostrarDialogoResetPartido,
  resetearPartido,
  navigate,
}) => {
  return (
    <>
      {/* Diálogo: Validación de Jugadores */}
      {mostrarDialogoValidacionJugadores && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6">
            <div className="text-center mb-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                <svg
                  className="w-8 h-8 text-red-600"
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
              <h3 className="text-xl font-bold text-gray-800">
                ⚠️ Configuración Incompleta
              </h3>
            </div>
            <p className="text-gray-700 text-center mb-4">
              Debes colocar{" "}
              <strong className="text-red-600">exactamente 5 jugadores</strong>{" "}
              en la pista para iniciar el partido.
            </p>
            <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
              <div className="flex items-center justify-between">
                <span className="text-sm text-red-800 font-medium">
                  Jugadores en pista:
                </span>
                <span className="text-2xl font-bold text-red-600">
                  {jugadoresEnPistaCount} / 5
                </span>
              </div>
              <p className="text-xs text-red-700 mt-2">
                {jugadoresEnPistaCount < 5
                  ? `Faltan ${5 - jugadoresEnPistaCount} jugador${
                      5 - jugadoresEnPistaCount !== 1 ? "es" : ""
                    }`
                  : `Sobran ${jugadoresEnPistaCount - 5} jugador${
                      jugadoresEnPistaCount - 5 !== 1 ? "es" : ""
                    }`}
              </p>
            </div>
            <button
              onClick={() => setMostrarDialogoValidacionJugadores(false)}
              className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Entendido
            </button>
          </div>
        </div>
      )}

      {/* Diálogo: Iniciar Partido */}
      {mostrarDialogoIniciarPartido && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6">
            <div className="text-center mb-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <svg
                  className="w-8 h-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800">
                ¿Iniciar Partido?
              </h3>
            </div>
            <p className="text-gray-600 text-center mb-6">
              Una vez iniciado, se activará el cronómetro y podrás registrar
              acciones durante el partido.
            </p>
            <div className="bg-blue-50 border-l-4 border-blue-400 p-3 mb-6">
              <p className="text-sm text-blue-800">
                <strong>Nota:</strong> Asegúrate de tener configurados todos los
                jugadores antes de comenzar.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setMostrarDialogoIniciarPartido(false)}
                className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  setMostrarDialogoIniciarPartido(false);
                  setEstadoPartido("primera_parte");
                  setPeriodoActual(1);
                  setCronometroActivo(true);
                }}
                className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center gap-2"
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
                    d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Iniciar Partido
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Diálogo: Cargar datos desde localStorage */}
      {mostrarDialogoLocalStorage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4 text-blue-600">
              Datos Encontrados en Caché
            </h3>
            <p className="text-gray-700 mb-6">
              Se han encontrado datos guardados localmente para este partido.
              ¿Deseas cargar estos datos y continuar donde lo dejaste?
            </p>
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 mb-4">
              <p className="text-sm text-yellow-800">
                <strong>Nota:</strong> Si eliges "No", se iniciarán datos nuevos
                y los datos guardados se borrarán.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  // Primero limpiar localStorage
                  limpiarLocalStoragePartidoLegacy();
                  // Cerrar el diálogo
                  setMostrarDialogoLocalStorage(false);
                  // Generar un nuevo ID de partido para evitar conflictos
                  const nuevoPartidoId =
                    partidoIdParam || `partido_${Date.now()}`;
                  if (!partidoIdParam) {
                    localStorage.setItem("partidoActualId", nuevoPartidoId);
                  }
                  // Recargar página para empezar limpio
                  window.location.reload();
                }}
                className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                No, Empezar Nuevo
              </button>
              <button
                onClick={cargarDesdeLocalStorage}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Sí, Cargar Datos
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Diálogo: Resetear partido con datos en BD */}
      {mostrarDialogoResetPartido && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4 text-red-600">
              ⚠️ Partido Ya Finalizado
            </h3>
            <p className="text-gray-700 mb-6">
              Este partido ya tiene datos guardados en la base de datos (fue
              finalizado anteriormente). ¿Deseas resetear el partido y empezar
              de nuevo?
            </p>
            <div className="bg-red-50 border-l-4 border-red-400 p-3 mb-4">
              <p className="text-sm text-red-800">
                <strong>Advertencia:</strong> Esta acción no borrará los datos
                de la BD, pero permitirá configurar un nuevo partido con este
                ID.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setMostrarDialogoResetPartido(false);
                  navigate("/dashboard");
                }}
                className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={resetearPartido}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                Sí, Resetear
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DialogosPartido;
