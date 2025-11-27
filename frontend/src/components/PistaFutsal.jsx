import React from "react";

/**
 * Componente de pista de fútbol sala vista desde arriba
 * Muestra 5 posiciones: Portero, Cierre, 2 Alas, Pívot
 */
export default function PistaFutsal({ jugadores = [] }) {
  // Agrupar jugadores por posición
  const porteros = jugadores.filter((j) => j.posicion === "Portero");
  const cierres = jugadores.filter((j) => j.posicion === "Cierre");
  const alas = jugadores.filter((j) => j.posicion === "Ala");
  const pivots = jugadores.filter((j) => j.posicion === "Pivot");
  const alaPivots = jugadores.filter((j) => j.posicion === "Ala-Pivot");

  // Renderizar jugador con círculo de color
  const renderJugador = (jugador, index = 0) => {
    if (!jugador) return null;

    const iniciales = jugador.alias
      ? jugador.alias.substring(0, 2).toUpperCase()
      : jugador.nombre
      ? jugador.nombre
          .split(" ")
          .map((n) => n[0])
          .join("")
          .substring(0, 2)
          .toUpperCase()
      : "?";

    const colorClasses = {
      blue: "bg-blue-500 border-blue-700",
      red: "bg-red-500 border-red-700",
      orangered: "bg-orange-600 border-orange-800",
    };

    const colorClass =
      colorClasses[jugador.color?.toLowerCase()] ||
      "bg-gray-500 border-gray-700";

    return (
      <div key={jugador.id || index} className="flex flex-col items-center">
        <div
          className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full ${colorClass} border-2 flex items-center justify-center text-white font-bold text-xs sm:text-sm shadow-lg`}
          title={`${jugador.nombre} ${
            jugador.dorsal ? `(#${jugador.dorsal})` : ""
          }`}
        >
          {iniciales}
        </div>
        {jugador.dorsal && (
          <span className="text-xs font-semibold mt-1 text-gray-700">
            #{jugador.dorsal}
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Pista de fútbol sala */}
      <div className="relative bg-gradient-to-b from-green-600 to-green-700 rounded-lg shadow-2xl p-4 sm:p-6 aspect-[2/3]">
        {/* Líneas de la pista */}

        {/* Línea central horizontal */}
        <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-white/70"></div>

        {/* Círculo central */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 sm:w-20 sm:h-20 border-2 border-white/70 rounded-full"></div>
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-white/70 rounded-full"></div>

        {/* Área inferior (portería propia) */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/5 h-1/6 border-2 border-t-white/70 border-x-white/70 border-b-0 rounded-t-lg"></div>

        {/* Portería inferior */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/4 h-2 bg-white/90 rounded-t"></div>

        {/* Área superior (portería rival) */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/5 h-1/6 border-2 border-b-white/70 border-x-white/70 border-t-0 rounded-b-lg"></div>

        {/* Portería superior */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/4 h-2 bg-white/90 rounded-b"></div>

        {/* Líneas laterales */}
        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-white/70"></div>
        <div className="absolute right-0 top-0 bottom-0 w-0.5 bg-white/70"></div>

        {/* POSICIONES DE JUGADORES */}

        {/* PORTERO - En la portería inferior */}
        <div className="absolute bottom-[5%] left-1/2 -translate-x-1/2 z-10">
          {porteros.length > 0 ? (
            renderJugador(porteros[0])
          ) : (
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-dashed border-white/50 flex items-center justify-center">
              <span className="text-white/50 text-xs">POR</span>
            </div>
          )}
        </div>

        {/* CIERRE - Por delante del portero, a la altura del área */}
        <div className="absolute bottom-[22%] left-1/2 -translate-x-1/2 z-10">
          {cierres.length > 0 ? (
            renderJugador(cierres[0])
          ) : (
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-dashed border-white/50 flex items-center justify-center">
              <span className="text-white/50 text-xs">CIE</span>
            </div>
          )}
        </div>

        {/* ALA IZQUIERDA - Por delante del cierre, tocando la banda izquierda */}
        <div className="absolute bottom-[38%] left-[15%] z-10">
          {alas.length > 0 ? (
            renderJugador(alas[0])
          ) : alaPivots.length > 0 ? (
            renderJugador(alaPivots[0])
          ) : (
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-dashed border-white/50 flex items-center justify-center">
              <span className="text-white/50 text-xs">AI</span>
            </div>
          )}
        </div>

        {/* ALA DERECHA - Por delante del cierre, tocando la banda derecha */}
        <div className="absolute bottom-[38%] right-[15%] z-10">
          {alas.length > 1 ? (
            renderJugador(alas[1], 1)
          ) : alaPivots.length > 1 ? (
            renderJugador(alaPivots[1], 1)
          ) : (
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-dashed border-white/50 flex items-center justify-center">
              <span className="text-white/50 text-xs">AD</span>
            </div>
          )}
        </div>

        {/* PÍVOT - En el área contraria (arriba) */}
        <div className="absolute top-[22%] left-1/2 -translate-x-1/2 z-10">
          {pivots.length > 0 ? (
            renderJugador(pivots[0])
          ) : alaPivots.length > 2 ? (
            renderJugador(alaPivots[2], 2)
          ) : (
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-dashed border-white/50 flex items-center justify-center">
              <span className="text-white/50 text-xs">PIV</span>
            </div>
          )}
        </div>

        {/* Etiquetas de portería */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 text-white/60 text-xs font-semibold">
          RIVAL
        </div>
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-white/60 text-xs font-semibold">
          NUESTRO
        </div>
      </div>

      {/* Leyenda */}
      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <h4 className="text-xs font-semibold text-gray-700 mb-2">
          Posiciones:
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs text-gray-600">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span>Jugador</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span>Staff</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-orange-600 rounded-full"></div>
            <span>Extra</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 border-2 border-dashed border-gray-400 rounded-full"></div>
            <span>Sin asignar</span>
          </div>
        </div>
      </div>
    </div>
  );
}
