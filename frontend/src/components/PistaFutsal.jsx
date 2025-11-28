import React from "react";

/**
 * Componente de pista de fútbol sala vista desde arriba
 * Muestra 5 posiciones: Portero, Cierre, 2 Alas, Pívot
 */
export default function PistaFutsal({
  jugadores = [],
  onPosicionClick,
  jugadoresAsignados = {},
  onDrop,
  onJugadorDragStart,
  estadisticas = {},
  posicionSeleccionada = null,
  onPosicionSeleccionar,
  accionActiva = null,
  onJugadorClick,
}) {
  // Agrupar jugadores por posición
  const porteros = jugadores.filter((j) => j.posicion === "Portero");
  const cierres = jugadores.filter((j) => j.posicion === "Cierre");
  const alas = jugadores.filter((j) => j.posicion === "Ala");
  const pivots = jugadores.filter((j) => j.posicion === "Pivot");
  const alaPivots = jugadores.filter((j) => j.posicion === "Ala-Pivot");

  const handlePosicionClick = (posicion) => {
    const jugadorEnPosicion = jugadoresAsignados[posicion];
    
    // Si hay acción activa y hay un jugador, ejecutar la acción en el jugador
    if (accionActiva && jugadorEnPosicion && onJugadorClick) {
      onJugadorClick(jugadorEnPosicion);
      return;
    }
    
    // Si hay un jugador y NO hay acción activa, quitarlo (comportamiento original)
    if (onPosicionClick && jugadorEnPosicion && !accionActiva) {
      onPosicionClick(posicion);
    }
    // Si no hay jugador y hay callback de selección, activar/desactivar selección de posición
    else if (onPosicionSeleccionar && !jugadorEnPosicion) {
      // Toggle: si ya está seleccionada, deseleccionar; si no, seleccionar
      onPosicionSeleccionar(
        posicionSeleccionada === posicion ? null : posicion
      );
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, posicion) => {
    e.preventDefault();
    const jugadorData = e.dataTransfer.getData("jugador");
    if (jugadorData && onDrop) {
      const jugador = JSON.parse(jugadorData);
      onDrop(jugador, posicion);
    }
  };

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
    <div className="w-full max-w-4xl mx-auto">
      {/* Pista de fútbol sala con medidas reglamentarias */}
      <div className="relative bg-gradient-to-br from-amber-700 via-amber-600 to-amber-800 rounded-lg shadow-2xl p-4 sm:p-6 aspect-[2/1]">
        {/* Textura de parquet */}
        <div className="absolute inset-0 opacity-20">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `repeating-linear-gradient(
              90deg,
              transparent,
              transparent 50px,
              rgba(0,0,0,0.1) 50px,
              rgba(0,0,0,0.1) 51px
            ),
            repeating-linear-gradient(
              0deg,
              transparent,
              transparent 8px,
              rgba(0,0,0,0.05) 8px,
              rgba(0,0,0,0.05) 9px
            )`,
            }}
          ></div>
        </div>
        {/* Borde del campo */}
        <div className="absolute inset-0 border-2 border-white/70 rounded-lg"></div>

        {/* Línea central vertical */}
        <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-white/70"></div>

        {/* Círculo central (3m de radio) */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[15%] aspect-square border-2 border-white/70 rounded-full"></div>
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-white/70 rounded-full"></div>

        {/* Semicírculo izquierdo (área) - Radio 6m */}
        <svg
          className="absolute left-0 top-1/2 -translate-y-1/2 w-[15%] h-[50%]"
          viewBox="0 0 100 200"
          preserveAspectRatio="none"
        >
          <path
            d="M 0 0 C 100 0, 100 100, 100 100 C 100 100, 100 200, 0 200 Z"
            fill="none"
            stroke="rgba(255, 255, 255, 0.7)"
            strokeWidth="3"
          />
        </svg>

        {/* Punto de penalti izquierdo (6m) */}
        <div className="absolute left-[15%] top-1/2 -translate-y-1/2 w-2 h-2 bg-white/90 rounded-full z-10"></div>

        {/* Punto de doble penalti izquierdo (10m) */}
        <div className="absolute left-[25%] top-1/2 -translate-y-1/2 w-2 h-2 bg-white/90 rounded-full z-10"></div>

        {/* Portería izquierda con estructura */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 h-[20%] w-3 z-20">
          <div className="w-full h-full bg-white/90 border-2 border-white rounded-r-sm"></div>
          {/* Postes */}
          <div className="absolute top-0 left-0 w-1 h-2 bg-white"></div>
          <div className="absolute bottom-0 left-0 w-1 h-2 bg-white"></div>
        </div>

        {/* Semicírculo derecho (área) - Radio 6m */}
        <svg
          className="absolute right-0 top-1/2 -translate-y-1/2 w-[15%] h-[50%]"
          viewBox="0 0 100 200"
          preserveAspectRatio="none"
        >
          <path
            d="M 100 0 C 0 0, 0 100, 0 100 C 0 100, 0 200, 100 200 Z"
            fill="none"
            stroke="rgba(255, 255, 255, 0.7)"
            strokeWidth="3"
          />
        </svg>

        {/* Punto de penalti derecho (6m) */}
        <div className="absolute right-[15%] top-1/2 -translate-y-1/2 w-2 h-2 bg-white/90 rounded-full z-10"></div>

        {/* Punto de doble penalti derecho (10m) */}
        <div className="absolute right-[25%] top-1/2 -translate-y-1/2 w-2 h-2 bg-white/90 rounded-full z-10"></div>

        {/* Portería derecha con estructura */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 h-[20%] w-3 z-20">
          <div className="w-full h-full bg-white/90 border-2 border-white rounded-l-sm"></div>
          {/* Postes */}
          <div className="absolute top-0 right-0 w-1 h-2 bg-white"></div>
          <div className="absolute bottom-0 right-0 w-1 h-2 bg-white"></div>
        </div>

        {/* Esquinas con cuartos de círculo (r=0.25m) */}
        <svg className="absolute top-0 left-0 w-8 h-8" viewBox="0 0 100 100">
          <path
            d="M 0 100 Q 0 0 100 0"
            fill="none"
            stroke="rgba(255, 255, 255, 0.7)"
            strokeWidth="3"
          />
        </svg>
        <svg className="absolute top-0 right-0 w-8 h-8" viewBox="0 0 100 100">
          <path
            d="M 100 100 Q 100 0 0 0"
            fill="none"
            stroke="rgba(255, 255, 255, 0.7)"
            strokeWidth="3"
          />
        </svg>
        <svg className="absolute bottom-0 left-0 w-8 h-8" viewBox="0 0 100 100">
          <path
            d="M 0 0 Q 0 100 100 100"
            fill="none"
            stroke="rgba(255, 255, 255, 0.7)"
            strokeWidth="3"
          />
        </svg>
        <svg
          className="absolute bottom-0 right-0 w-8 h-8"
          viewBox="0 0 100 100"
        >
          <path
            d="M 100 0 Q 100 100 0 100"
            fill="none"
            stroke="rgba(255, 255, 255, 0.7)"
            strokeWidth="3"
          />
        </svg>

        {/* POSICIONES DE JUGADORES (giradas 90 grados) */}

        {/* PORTERO - En la portería izquierda */}
        <div
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, "Portero")}
          onClick={() => handlePosicionClick("Portero")}
          className={`absolute left-[5%] top-1/2 -translate-y-1/2 z-10 hover:scale-110 transition-transform cursor-pointer ${
            posicionSeleccionada === "Portero"
              ? "ring-4 ring-green-400 rounded-full scale-125 animate-pulse"
              : ""
          }`}
          title={
            posicionSeleccionada === "Portero"
              ? "Posición seleccionada - Click en un jugador para asignar"
              : "Click para seleccionar posición o arrastrar jugador aquí"
          }
        >
          {jugadoresAsignados.Portero ? (
            <div
              draggable
              onDragStart={(e) =>
                onJugadorDragStart &&
                onJugadorDragStart(e, jugadoresAsignados.Portero)
              }
              onDragEnd={(e) => {
                e.target.style.opacity = "1";
              }}
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border-2 border-blue-700 flex items-center justify-center font-bold shadow-lg cursor-grab active:cursor-grabbing overflow-hidden"
              style={{
                background: (() => {
                  const segundosJugados =
                    estadisticas[jugadoresAsignados.Portero.id]?.minutos || 0;
                  const TOTAL_PARTIDO = 3000;
                  const porcentaje = Math.min(
                    (segundosJugados / TOTAL_PARTIDO) * 100,
                    100
                  );
                  return `linear-gradient(to bottom, #cbd5e1 ${porcentaje}%, #3b82f6 ${porcentaje}%)`;
                })(),
              }}
            >
              {estadisticas[jugadoresAsignados.Portero.id]?.rojas > 0 ? (
                <div className="w-8 h-11 bg-red-500 rounded flex items-center justify-center text-white text-base font-bold shadow-inner">
                  {jugadoresAsignados.Portero.numero_dorsal}
                </div>
              ) : estadisticas[jugadoresAsignados.Portero.id]?.amarillas > 0 ? (
                <div className="w-8 h-11 bg-yellow-400 rounded flex items-center justify-center text-gray-800 text-base font-bold shadow-inner">
                  {jugadoresAsignados.Portero.numero_dorsal}
                </div>
              ) : (
                <span className="text-white text-base">
                  {jugadoresAsignados.Portero.numero_dorsal}
                </span>
              )}
            </div>
          ) : (
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border-2 border-dashed border-white/50 flex items-center justify-center hover:border-white hover:bg-white/10">
              <span className="text-white/50 text-xs">POR</span>
            </div>
          )}
        </div>

        {/* CIERRE - Por delante del portero, a la altura del área */}
        <div
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, "Cierre")}
          onClick={() => handlePosicionClick("Cierre")}
          className={`absolute left-[22%] top-1/2 -translate-y-1/2 z-10 hover:scale-110 transition-transform cursor-pointer ${
            posicionSeleccionada === "Cierre"
              ? "ring-4 ring-green-400 rounded-full scale-125 animate-pulse"
              : ""
          }`}
          title={
            posicionSeleccionada === "Cierre"
              ? "Posición seleccionada - Click en un jugador para asignar"
              : "Click para seleccionar posición o arrastrar jugador aquí"
          }
        >
          {jugadoresAsignados.Cierre ? (
            <div
              draggable
              onDragStart={(e) =>
                onJugadorDragStart &&
                onJugadorDragStart(e, jugadoresAsignados.Cierre)
              }
              onDragEnd={(e) => {
                e.target.style.opacity = "1";
              }}
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border-2 border-blue-700 flex items-center justify-center font-bold shadow-lg cursor-grab active:cursor-grabbing overflow-hidden"
              style={{
                background: (() => {
                  const segundosJugados =
                    estadisticas[jugadoresAsignados.Cierre.id]?.minutos || 0;
                  const TOTAL_PARTIDO = 3000;
                  const porcentaje = Math.min(
                    (segundosJugados / TOTAL_PARTIDO) * 100,
                    100
                  );
                  return `linear-gradient(to bottom, #cbd5e1 ${porcentaje}%, #3b82f6 ${porcentaje}%)`;
                })(),
              }}
            >
              {estadisticas[jugadoresAsignados.Cierre.id]?.rojas > 0 ? (
                <div className="w-8 h-11 bg-red-500 rounded flex items-center justify-center text-white text-base font-bold shadow-inner">
                  {jugadoresAsignados.Cierre.numero_dorsal}
                </div>
              ) : estadisticas[jugadoresAsignados.Cierre.id]?.amarillas > 0 ? (
                <div className="w-8 h-11 bg-yellow-400 rounded flex items-center justify-center text-gray-800 text-base font-bold shadow-inner">
                  {jugadoresAsignados.Cierre.numero_dorsal}
                </div>
              ) : (
                <span className="text-white text-base">
                  {jugadoresAsignados.Cierre.numero_dorsal}
                </span>
              )}
            </div>
          ) : (
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border-2 border-dashed border-white/50 flex items-center justify-center hover:border-white hover:bg-white/10">
              <span className="text-white/50 text-xs">CIE</span>
            </div>
          )}
        </div>

        {/* ALA SUPERIOR - Por delante del cierre, tocando la banda superior */}
        <div
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, "Ala Superior")}
          onClick={() => handlePosicionClick("Ala Superior")}
          className={`absolute left-[38%] top-[15%] z-10 hover:scale-110 transition-transform cursor-pointer ${
            posicionSeleccionada === "Ala Superior"
              ? "ring-4 ring-green-400 rounded-full scale-125 animate-pulse"
              : ""
          }`}
          title={
            posicionSeleccionada === "Ala Superior"
              ? "Posición seleccionada - Click en un jugador para asignar"
              : "Click para seleccionar posición o arrastrar jugador aquí"
          }
        >
          {jugadoresAsignados["Ala Superior"] ? (
            <div
              draggable
              onDragStart={(e) =>
                onJugadorDragStart &&
                onJugadorDragStart(e, jugadoresAsignados["Ala Superior"])
              }
              onDragEnd={(e) => {
                e.target.style.opacity = "1";
              }}
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border-2 border-blue-700 flex items-center justify-center font-bold shadow-lg cursor-grab active:cursor-grabbing overflow-hidden"
              style={{
                background: (() => {
                  const segundosJugados =
                    estadisticas[jugadoresAsignados["Ala Superior"].id]
                      ?.minutos || 0;
                  const TOTAL_PARTIDO = 3000;
                  const porcentaje = Math.min(
                    (segundosJugados / TOTAL_PARTIDO) * 100,
                    100
                  );
                  return `linear-gradient(to bottom, #cbd5e1 ${porcentaje}%, #3b82f6 ${porcentaje}%)`;
                })(),
              }}
            >
              {estadisticas[jugadoresAsignados["Ala Superior"].id]?.rojas >
              0 ? (
                <div className="w-8 h-11 bg-red-500 rounded flex items-center justify-center text-white text-base font-bold shadow-inner">
                  {jugadoresAsignados["Ala Superior"].numero_dorsal}
                </div>
              ) : estadisticas[jugadoresAsignados["Ala Superior"].id]
                  ?.amarillas > 0 ? (
                <div className="w-8 h-11 bg-yellow-400 rounded flex items-center justify-center text-gray-800 text-base font-bold shadow-inner">
                  {jugadoresAsignados["Ala Superior"].numero_dorsal}
                </div>
              ) : (
                <span className="text-white text-base">
                  {jugadoresAsignados["Ala Superior"].numero_dorsal}
                </span>
              )}
            </div>
          ) : (
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border-2 border-dashed border-white/50 flex items-center justify-center hover:border-white hover:bg-white/10">
              <span className="text-white/50 text-xs">AS</span>
            </div>
          )}
        </div>

        {/* ALA INFERIOR - Por delante del cierre, tocando la banda inferior */}
        <div
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, "Ala Inferior")}
          onClick={() => handlePosicionClick("Ala Inferior")}
          className={`absolute left-[38%] bottom-[15%] z-10 hover:scale-110 transition-transform cursor-pointer ${
            posicionSeleccionada === "Ala Inferior"
              ? "ring-4 ring-green-400 rounded-full scale-125 animate-pulse"
              : ""
          }`}
          title={
            posicionSeleccionada === "Ala Inferior"
              ? "Posición seleccionada - Click en un jugador para asignar"
              : "Click para seleccionar posición o arrastrar jugador aquí"
          }
        >
          {jugadoresAsignados["Ala Inferior"] ? (
            <div
              draggable
              onDragStart={(e) =>
                onJugadorDragStart &&
                onJugadorDragStart(e, jugadoresAsignados["Ala Inferior"])
              }
              onDragEnd={(e) => {
                e.target.style.opacity = "1";
              }}
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border-2 border-blue-700 flex items-center justify-center font-bold shadow-lg cursor-grab active:cursor-grabbing overflow-hidden"
              style={{
                background: (() => {
                  const segundosJugados =
                    estadisticas[jugadoresAsignados["Ala Inferior"].id]
                      ?.minutos || 0;
                  const TOTAL_PARTIDO = 3000;
                  const porcentaje = Math.min(
                    (segundosJugados / TOTAL_PARTIDO) * 100,
                    100
                  );
                  return `linear-gradient(to bottom, #cbd5e1 ${porcentaje}%, #3b82f6 ${porcentaje}%)`;
                })(),
              }}
            >
              {estadisticas[jugadoresAsignados["Ala Inferior"].id]?.rojas >
              0 ? (
                <div className="w-8 h-11 bg-red-500 rounded flex items-center justify-center text-white text-base font-bold shadow-inner">
                  {jugadoresAsignados["Ala Inferior"].numero_dorsal}
                </div>
              ) : estadisticas[jugadoresAsignados["Ala Inferior"].id]
                  ?.amarillas > 0 ? (
                <div className="w-8 h-11 bg-yellow-400 rounded flex items-center justify-center text-gray-800 text-base font-bold shadow-inner">
                  {jugadoresAsignados["Ala Inferior"].numero_dorsal}
                </div>
              ) : (
                <span className="text-white text-base">
                  {jugadoresAsignados["Ala Inferior"].numero_dorsal}
                </span>
              )}
            </div>
          ) : (
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border-2 border-dashed border-white/50 flex items-center justify-center hover:border-white hover:bg-white/10">
              <span className="text-white/50 text-xs">AI</span>
            </div>
          )}
        </div>

        {/* PÍVOT - En el área contraria (derecha) */}
        <div
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, "Pívot")}
          onClick={() => handlePosicionClick("Pívot")}
          className={`absolute left-[60%] top-1/2 -translate-y-1/2 z-10 hover:scale-110 transition-transform cursor-pointer ${
            posicionSeleccionada === "Pívot"
              ? "ring-4 ring-green-400 rounded-full scale-125 animate-pulse"
              : ""
          }`}
          title={
            posicionSeleccionada === "Pívot"
              ? "Posición seleccionada - Click en un jugador para asignar"
              : "Click para seleccionar posición o arrastrar jugador aquí"
          }
        >
          {jugadoresAsignados.Pívot ? (
            <div
              draggable
              onDragStart={(e) =>
                onJugadorDragStart &&
                onJugadorDragStart(e, jugadoresAsignados.Pívot)
              }
              onDragEnd={(e) => {
                e.target.style.opacity = "1";
              }}
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border-2 border-blue-700 flex items-center justify-center font-bold shadow-lg cursor-grab active:cursor-grabbing overflow-hidden"
              style={{
                background: (() => {
                  const segundosJugados =
                    estadisticas[jugadoresAsignados.Pívot.id]?.minutos || 0;
                  const TOTAL_PARTIDO = 3000;
                  const porcentaje = Math.min(
                    (segundosJugados / TOTAL_PARTIDO) * 100,
                    100
                  );
                  return `linear-gradient(to bottom, #cbd5e1 ${porcentaje}%, #3b82f6 ${porcentaje}%)`;
                })(),
              }}
            >
              {estadisticas[jugadoresAsignados.Pívot.id]?.rojas > 0 ? (
                <div className="w-8 h-11 bg-red-500 rounded flex items-center justify-center text-white text-base font-bold shadow-inner">
                  {jugadoresAsignados.Pívot.numero_dorsal}
                </div>
              ) : estadisticas[jugadoresAsignados.Pívot.id]?.amarillas > 0 ? (
                <div className="w-8 h-11 bg-yellow-400 rounded flex items-center justify-center text-gray-800 text-base font-bold shadow-inner">
                  {jugadoresAsignados.Pívot.numero_dorsal}
                </div>
              ) : (
                <span className="text-white text-base">
                  {jugadoresAsignados.Pívot.numero_dorsal}
                </span>
              )}
            </div>
          ) : (
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border-2 border-dashed border-white/50 flex items-center justify-center hover:border-white hover:bg-white/10">
              <span className="text-white/50 text-xs">PIV</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
