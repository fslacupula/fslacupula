import { obtenerIconoAccion } from "../utils/actaHelpers";

export default function CronologiaPartido({ historial, estadisticas }) {
  return (
    <div className="col-span-4">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4 text-center">
          Cronología del Partido
        </h2>

        <div className="grid grid-cols-2 gap-6">
          {/* 1ª Parte */}
          <div className="bg-gray-100 rounded-lg p-4 shadow">
            <h3 className="text-xl font-bold mb-3 text-center text-blue-600">
              1ª Parte
            </h3>
            <div className="space-y-1">
              {[...historial]
                .filter((accion) => {
                  // Filtrar por período 1 (o si no tiene período, por minuto)
                  if (accion.periodo !== undefined) {
                    return accion.periodo === 1;
                  }
                  // Fallback para acciones sin período: usar minuto
                  const minuto = accion.minuto_partido || accion.minuto || 0;
                  return minuto <= estadisticas.duracion_minutos / 2;
                })
                .sort((a, b) => {
                  const minutoA = a.minuto_partido || a.minuto || 0;
                  const minutoB = b.minuto_partido || b.minuto || 0;
                  return minutoA - minutoB;
                })
                .map((accion, index) => {
                  const minuto = accion.minuto_partido || accion.minuto || 0;
                  const esLocal = accion.equipo === "local";

                  return (
                    <div
                      key={index}
                      className="grid grid-cols-2 gap-2 border-b border-gray-200 py-2"
                    >
                      {/* Columna Izquierda - LOCAL */}
                      {esLocal ? (
                        <div className="flex items-center gap-2 justify-end">
                          <div className="text-right">
                            <p className="font-semibold text-gray-800 text-sm">
                              {accion.accion === "tiempo_muerto"
                                ? accion.jugador_nombre
                                : accion.jugador_nombre ||
                                  `Dorsal ${accion.dorsal}`}
                            </p>
                            <p className="text-xs text-gray-600 capitalize">
                              {accion.accion === "tiempo_muerto"
                                ? "Tiempo Muerto"
                                : accion.accion}
                            </p>
                          </div>
                          <div className="text-xl">
                            {obtenerIconoAccion(accion.accion)}
                          </div>
                          <div className="text-base font-bold text-blue-600 min-w-[40px] text-center">
                            {minuto}'
                          </div>
                        </div>
                      ) : (
                        <div></div>
                      )}

                      {/* Columna Derecha - VISITANTE */}
                      {!esLocal ? (
                        <div className="flex items-center gap-2">
                          <div className="text-base font-bold text-gray-600 min-w-[40px] text-center">
                            {minuto}'
                          </div>
                          <div className="text-xl">
                            {obtenerIconoAccion(accion.accion)}
                          </div>
                          <div className="text-left">
                            <p className="font-semibold text-gray-800 text-sm">
                              {accion.accion === "tiempo_muerto"
                                ? accion.jugador_nombre
                                : `Dorsal #${accion.dorsal || "?"}`}
                            </p>
                            <p className="text-xs text-gray-600 capitalize">
                              {accion.accion === "tiempo_muerto"
                                ? "Tiempo Muerto"
                                : accion.accion}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div></div>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>

          {/* 2ª Parte */}
          <div className="bg-gray-100 rounded-lg p-4 shadow">
            <h3 className="text-xl font-bold mb-3 text-center text-blue-600">
              2ª Parte
            </h3>
            <div className="space-y-1">
              {[...historial]
                .filter((accion) => {
                  // Filtrar por período 2 (o si no tiene período, por minuto)
                  if (accion.periodo !== undefined) {
                    return accion.periodo === 2;
                  }
                  // Fallback para acciones sin período: usar minuto
                  const minuto = accion.minuto_partido || accion.minuto || 0;
                  return minuto > estadisticas.duracion_minutos / 2;
                })
                .sort((a, b) => {
                  const minutoA = a.minuto_partido || a.minuto || 0;
                  const minutoB = b.minuto_partido || b.minuto || 0;
                  return minutoA - minutoB;
                })
                .map((accion, index) => {
                  const minuto = accion.minuto_partido || accion.minuto || 0;
                  const esLocal = accion.equipo === "local";

                  return (
                    <div
                      key={index}
                      className="grid grid-cols-2 gap-2 border-b border-gray-200 py-2"
                    >
                      {/* Columna Izquierda - LOCAL */}
                      {esLocal ? (
                        <div className="flex items-center gap-2 justify-end">
                          <div className="text-right">
                            <p className="font-semibold text-gray-800 text-sm">
                              {accion.accion === "tiempo_muerto"
                                ? accion.jugador_nombre
                                : accion.jugador_nombre ||
                                  `Dorsal ${accion.dorsal}`}
                            </p>
                            <p className="text-xs text-gray-600 capitalize">
                              {accion.accion === "tiempo_muerto"
                                ? "Tiempo Muerto"
                                : accion.accion}
                            </p>
                          </div>
                          <div className="text-xl">
                            {obtenerIconoAccion(accion.accion)}
                          </div>
                          <div className="text-base font-bold text-blue-600 min-w-[40px] text-center">
                            {minuto}'
                          </div>
                        </div>
                      ) : (
                        <div></div>
                      )}

                      {/* Columna Derecha - VISITANTE */}
                      {!esLocal ? (
                        <div className="flex items-center gap-2">
                          <div className="text-base font-bold text-gray-600 min-w-[40px] text-center">
                            {minuto}'
                          </div>
                          <div className="text-xl">
                            {obtenerIconoAccion(accion.accion)}
                          </div>
                          <div className="text-left">
                            <p className="font-semibold text-gray-800 text-sm">
                              {accion.accion === "tiempo_muerto"
                                ? accion.jugador_nombre
                                : `Dorsal #${accion.dorsal || "?"}`}
                            </p>
                            <p className="text-xs text-gray-600 capitalize">
                              {accion.accion === "tiempo_muerto"
                                ? "Tiempo Muerto"
                                : accion.accion}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div></div>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>
        </div>

        {historial.length === 0 && (
          <p className="text-center text-gray-400 py-8">
            Sin acciones registradas
          </p>
        )}
      </div>
    </div>
  );
}
