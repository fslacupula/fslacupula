import React from "react";
import { formatearTiempo } from "../../utils/partidoUtils";

const TablaMinutosJugados = ({
  jugadores,
  estadisticas,
  isJugadorAsignado,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4">
      <h3 className="text-lg font-bold text-gray-700 mb-3">Minutos Jugados</h3>
      <div className="grid grid-cols-6 gap-2">
        {jugadores
          .sort((a, b) => {
            const minutosA = estadisticas[a.id]?.minutos || 0;
            const minutosB = estadisticas[b.id]?.minutos || 0;
            return minutosB - minutosA; // Mayor a menor
          })
          .map((jugador) => {
            const stats = estadisticas[jugador.id];
            const segundos = stats?.minutos || 0;
            const tiempoFormateado = formatearTiempo(segundos);
            const enPista = isJugadorAsignado(jugador.id);
            const tieneAmarilla = stats?.amarillas > 0;
            const tieneRoja = stats?.rojas > 0;
            const numGoles = stats?.goles || 0;

            return (
              <div
                key={jugador.id}
                className={`flex items-stretch p-2 rounded-lg border-2 gap-2 ${
                  enPista
                    ? "bg-green-50 border-green-500"
                    : "bg-gray-50 border-gray-300"
                }`}
              >
                {/* Columna 1: Dorsal/Alias y Minutos */}
                <div className="flex flex-col justify-between flex-1">
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-blue-600 text-base">
                      {jugador.numero_dorsal}
                    </span>
                    <span className="text-gray-700 text-xs truncate max-w-[45px]">
                      {jugador.alias || jugador.nombre}
                    </span>
                  </div>
                  <div className="flex items-center gap-0.5">
                    <span className="font-bold text-gray-800 text-base font-mono">
                      {tiempoFormateado}
                    </span>
                  </div>
                </div>

                {/* Columna 2: Balón con goles (ocupa alto completo) */}
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

                {/* Columna 3: Tarjetas (amarilla arriba, roja abajo) */}
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
  );
};

export default TablaMinutosJugados;
