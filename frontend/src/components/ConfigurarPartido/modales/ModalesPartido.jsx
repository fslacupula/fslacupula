import React from "react";

/**
 * Componente para agrupar todos los modales de gestión del partido
 */
const ModalesPartido = ({
  // Modal Tiempo Muerto
  modalTiempoMuerto,
  setModalTiempoMuerto,
  confirmarTiempoMuerto,
  periodoActual,
  partidoInfo,

  // Modal Finalizar Primera
  modalFinalizarPrimera,
  setModalFinalizarPrimera,
  confirmarFinalizarPrimera,
  golesLocal,
  golesVisitante,
  faltasLocal,
  faltasVisitante,

  // Modal Iniciar Segunda
  modalIniciarSegunda,
  setModalIniciarSegunda,
  confirmarIniciarSegunda,

  // Modal Finalizar Partido
  modalFinalizarPartido,
  setModalFinalizarPartido,
  ejecutarFinalizacionPartido,

  // Modal Finalizar Excepcional
  modalFinalizarExcepcional,
  setModalFinalizarExcepcional,
  confirmarFinalizarExcepcional,

  // Modal Volver Dashboard
  modalVolverDashboard,
  setModalVolverDashboard,
  navigate,
}) => {
  return (
    <>
      {/* Modal: Tiempo Muerto */}
      {modalTiempoMuerto.visible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6">
            <div className="text-center mb-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                <span className="text-4xl">⏸️</span>
              </div>
              <h3 className="text-xl font-bold text-gray-800">
                ¿Solicitar Tiempo Muerto?
              </h3>
            </div>
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
              <div className="space-y-2 text-sm">
                <p>
                  <strong>Equipo:</strong>{" "}
                  {modalTiempoMuerto.equipo === "local"
                    ? "LA CÚPULA"
                    : partidoInfo?.rival || "VISITANTE"}
                </p>
                <p>
                  <strong>Parte:</strong> {periodoActual === 1 ? "1ª" : "2ª"}
                </p>
                <p>
                  <strong>Duración:</strong> 1 minuto
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-600 text-center mb-6">
              El cronómetro del partido continuará corriendo durante el tiempo
              muerto.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() =>
                  setModalTiempoMuerto({ visible: false, equipo: null })
                }
                className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarTiempoMuerto}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Finalizar Primera Parte */}
      {modalFinalizarPrimera && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6">
            <div className="text-center mb-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-4">
                <span className="text-4xl">🏁</span>
              </div>
              <h3 className="text-xl font-bold text-gray-800">
                ¿Finalizar Primera Parte?
              </h3>
            </div>
            <div className="bg-orange-50 border-l-4 border-orange-400 p-4 mb-6">
              <div className="space-y-2 text-sm">
                <p>
                  <strong>Resultado parcial:</strong> {golesLocal} -{" "}
                  {golesVisitante}
                </p>
                <p>
                  <strong>Faltas:</strong> {faltasLocal} - {faltasVisitante}
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-600 text-center mb-6">
              Se resetearán las faltas del primer período y podrás iniciar la
              segunda parte cuando estés listo.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setModalFinalizarPrimera(false)}
                className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarFinalizarPrimera}
                className="flex-1 px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
              >
                Finalizar 1ª Parte
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Iniciar Segunda Parte */}
      {modalIniciarSegunda && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6">
            <div className="text-center mb-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
                <svg
                  className="w-8 h-8 text-purple-600"
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
                ¿Iniciar Segunda Parte?
              </h3>
            </div>
            <div className="bg-purple-50 border-l-4 border-purple-400 p-4 mb-6">
              <div className="space-y-2 text-sm">
                <p>
                  <strong>Resultado:</strong> {golesLocal} - {golesVisitante}
                </p>
                <p>
                  <strong>Faltas acumuladas:</strong> {faltasLocal} -{" "}
                  {faltasVisitante}
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-600 text-center mb-6">
              Se reactivará el cronómetro y comenzará el segundo período del
              partido.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setModalIniciarSegunda(false)}
                className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarIniciarSegunda}
                className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
              >
                Iniciar 2ª Parte
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Finalizar Partido (sin estadísticas) */}
      {modalFinalizarPartido && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6">
            <div className="text-center mb-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-4">
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
              <h3 className="text-xl font-bold text-gray-800">
                Partido sin Estadísticas
              </h3>
            </div>
            <p className="text-gray-600 text-center mb-6">
              No hay acciones registradas. ¿Estás seguro de que quieres
              finalizar el partido sin estadísticas?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setModalFinalizarPartido(false)}
                className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  setModalFinalizarPartido(false);
                  ejecutarFinalizacionPartido();
                }}
                className="flex-1 px-4 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors font-medium"
              >
                Finalizar Igualmente
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Finalizar Excepcional (con motivo) */}
      {modalFinalizarExcepcional.visible && (
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
                Finalización Excepcional
              </h3>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              ¿Por qué estás finalizando el partido de forma excepcional?
            </p>
            <textarea
              value={modalFinalizarExcepcional.motivo}
              onChange={(e) =>
                setModalFinalizarExcepcional({
                  ...modalFinalizarExcepcional,
                  motivo: e.target.value,
                })
              }
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent mb-4"
              rows="4"
              placeholder="Escribe el motivo de la finalización excepcional..."
            />
            <div className="flex gap-3">
              <button
                onClick={() =>
                  setModalFinalizarExcepcional({ visible: false, motivo: "" })
                }
                className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarFinalizarExcepcional}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                Finalizar Partido
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Confirmación Volver al Dashboard */}
      {modalVolverDashboard && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6">
            <div className="text-center mb-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-4">
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
              <h3 className="text-xl font-bold text-gray-800">
                ¿Volver al Dashboard?
              </h3>
            </div>
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
              <p className="text-sm text-yellow-800">
                <strong>Advertencia:</strong> Si vuelves al dashboard sin
                finalizar el partido, los datos se mantendrán guardados en el
                navegador y podrás continuar más tarde.
              </p>
            </div>
            <p className="text-gray-600 text-center mb-6">
              Todos los datos del partido están guardados localmente. Puedes
              regresar en cualquier momento para continuar donde lo dejaste.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setModalVolverDashboard(false)}
                className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  setModalVolverDashboard(false);
                  navigate("/dashboard");
                }}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Sí, Volver
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ModalesPartido;
