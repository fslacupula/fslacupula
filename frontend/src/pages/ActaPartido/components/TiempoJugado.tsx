import { formatearTiempo } from "../utils/actaHelpers";

interface Jugador {
  jugador_id: number;
  jugador_nombre_completo: string;
  alias?: string;
  dorsal?: number;
  equipo: "local" | "visitante";
  minutos_jugados?: number;
  tarjetas_amarillas?: number;
  tarjetas_rojas?: number;
  goles?: number;
}

interface Staff {
  id?: number;
  nombre: string;
  tipo?: string;
  tipo_staff?: string;
  equipo: "local" | "visitante";
  tarjetas_amarillas?: number;
  tarjetas_rojas?: number;
}

interface TiempoJugadoProps {
  jugadores: Jugador[];
  staff?: Staff[];
}

export default function TiempoJugado({ jugadores, staff }: TiempoJugadoProps) {
  return (
    <div className="col-span-1">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4 text-blue-600">Tiempo Jugado</h2>
        <div className="space-y-2">
          {jugadores
            .filter((j) => j.equipo === "local")
            .sort((a, b) => (b.minutos_jugados || 0) - (a.minutos_jugados || 0))
            .map((jugador, index) => {
              const tieneAmarilla = (jugador.tarjetas_amarillas || 0) > 0;
              const tieneRoja = (jugador.tarjetas_rojas || 0) > 0;
              const numGoles = jugador.goles || 0;

              return (
                <div
                  key={index}
                  className="flex items-stretch p-2 rounded-lg border-2 gap-2 bg-gray-50 border-gray-300"
                >
                  {/* Columna 1: Dorsal/Alias y Minutos */}
                  <div className="flex flex-col justify-between flex-1">
                    <div className="flex items-center gap-1">
                      <span className="font-bold text-blue-600 text-base">
                        {jugador.dorsal || "?"}
                      </span>
                      <span className="text-gray-700 text-xs truncate max-w-[80px]">
                        {jugador.alias || jugador.jugador_nombre_completo}
                      </span>
                    </div>
                    <div className="flex items-center gap-0.5">
                      <span className="font-bold text-gray-800 text-base font-mono">
                        {formatearTiempo(jugador.minutos_jugados)}
                      </span>
                    </div>
                  </div>

                  {/* Columna 2: Balón con goles */}
                  {numGoles > 0 && (
                    <div className="flex items-center justify-center">
                      <div className="relative w-8 h-8 bg-white rounded-full border-2 border-gray-800 flex items-center justify-center">
                        <span className="text-sm font-bold text-gray-800 relative z-10">
                          {numGoles}
                        </span>
                        {/* Patrón de balón simplificado */}
                        <svg
                          className="absolute inset-0 w-full h-full"
                          viewBox="0 0 20 20"
                        >
                          <circle
                            cx="10"
                            cy="10"
                            r="9"
                            fill="none"
                            stroke="#000"
                            strokeWidth="0.5"
                          />
                          <path
                            d="M10 2 L11 6 L10 10 L9 6 Z"
                            fill="#000"
                            fillOpacity="0.15"
                          />
                          <path
                            d="M18 10 L14 11 L10 10 L14 9 Z"
                            fill="#000"
                            fillOpacity="0.15"
                          />
                        </svg>
                      </div>
                    </div>
                  )}

                  {/* Columna 3: Tarjetas */}
                  <div className="flex flex-col justify-between">
                    <div className="h-1/2 flex items-start">
                      {tieneAmarilla && (
                        <div className="w-4 h-5 bg-yellow-400 rounded-sm border border-yellow-600"></div>
                      )}
                    </div>
                    <div className="h-1/2 flex items-end">
                      {tieneRoja && (
                        <div className="w-4 h-5 bg-red-500 rounded-sm border border-red-700"></div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
        </div>

        {/* Staff - dentro de la misma columna */}
        {staff && staff.length > 0 && (
          <div className="mt-6 pt-4 border-t border-gray-200">
            <h3 className="text-lg font-bold mb-3 text-gray-600">
              Staff Técnico
            </h3>
            <div className="space-y-2">
              {staff
                .filter((miembro) => miembro.equipo === "local")
                .map((miembro, index) => {
                  const tieneAmarilla = (miembro.tarjetas_amarillas || 0) > 0;
                  const tieneRoja = (miembro.tarjetas_rojas || 0) > 0;

                  return (
                    <div
                      key={index}
                      className="flex items-stretch p-2 rounded-lg border-2 gap-2 bg-gray-50 border-gray-300"
                    >
                      {/* Columna 1: Tipo y Nombre */}
                      <div className="flex flex-col justify-between flex-1">
                        <div className="flex items-center gap-1">
                          <span className="font-bold text-gray-600 text-xs uppercase">
                            {miembro.tipo_staff || miembro.tipo || "Staff"}
                          </span>
                        </div>
                        <div className="flex items-center gap-0.5">
                          <span className="text-gray-700 text-xs truncate max-w-[120px]">
                            {miembro.nombre}
                          </span>
                        </div>
                      </div>

                      {/* Columna 2: Tarjetas */}
                      <div className="flex flex-col justify-between">
                        <div className="h-1/2 flex items-start">
                          {tieneAmarilla && (
                            <div className="w-4 h-5 bg-yellow-400 rounded-sm border border-yellow-600"></div>
                          )}
                        </div>
                        <div className="h-1/2 flex items-end">
                          {tieneRoja && (
                            <div className="w-4 h-5 bg-red-500 rounded-sm border border-red-700"></div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
