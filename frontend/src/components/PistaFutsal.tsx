import { DragEvent } from "react";

interface Jugador {
  id: number;
  nombre: string;
  alias?: string;
  numero_dorsal?: number;
  dorsal?: number;
  posicion: string;
  color?: string;
}

interface Estadisticas {
  [jugadorId: number]: {
    minutos?: number;
    goles?: number;
    asistencias?: number;
    amarillas?: number;
    rojas?: number;
  };
}

interface PistaFutsalProps {
  jugadores?: Jugador[];
  onPosicionClick?: (posicion: string) => void;
  jugadoresAsignados?: { [posicion: string]: Jugador | null };
  onDrop?: (jugador: Jugador, posicion: string) => void;
  onJugadorDragStart?: (e: DragEvent<HTMLDivElement>, jugador: Jugador) => void;
  estadisticas?: Estadisticas;
  posicionSeleccionada?: string | null;
  onPosicionSeleccionar?: (posicion: string | null) => void;
  accionActiva?: string | null;
  onJugadorClick?: (jugador: Jugador) => void;
}

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
}: PistaFutsalProps) {
  const handlePosicionClick = (posicion: string) => {
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

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>, posicion: string) => {
    e.preventDefault();
    const jugadorData = e.dataTransfer.getData("jugador");
    if (jugadorData && onDrop) {
      const jugador = JSON.parse(jugadorData) as Jugador;
      onDrop(jugador, posicion);
    }
  };

  // Renderizar jugador con círculo de color
  const renderJugador = (jugador: Jugador | null, index: number = 0) => {
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

    const colorClasses: Record<string, string> = {
      blue: "bg-blue-500 border-blue-700",
      red: "bg-red-500 border-red-700",
      orangered: "bg-orange-600 border-orange-800",
    };

    const colorClass =
      colorClasses[jugador.color?.toLowerCase() || ""] ||
      "bg-gray-500 border-gray-700";

    const dorsal = jugador.numero_dorsal || jugador.dorsal;

    return (
      <div key={jugador.id || index} className="flex flex-col items-center">
        <div
          className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full ${colorClass} border-2 flex items-center justify-center text-white font-bold text-xs sm:text-sm shadow-lg`}
          title={`${jugador.nombre} ${dorsal ? `(#${dorsal})` : ""}`}
        >
          {iniciales}
        </div>
        {dorsal && (
          <span className="text-xs font-semibold mt-1 text-gray-700">
            #{dorsal}
          </span>
        )}
      </div>
    );
  };

  const renderPosicion = (
    posicionNombre: string,
    left: string,
    top: string,
    abreviatura: string
  ) => {
    const jugadorAsignado = jugadoresAsignados[posicionNombre];
    const dorsal = jugadorAsignado?.numero_dorsal || jugadorAsignado?.dorsal;

    return (
      <div
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, posicionNombre)}
        onClick={() => handlePosicionClick(posicionNombre)}
        className={`absolute z-10 hover:scale-110 transition-transform cursor-pointer ${
          posicionSeleccionada === posicionNombre
            ? "ring-4 ring-green-400 rounded-full scale-125 animate-pulse"
            : ""
        }`}
        style={{ left, top }}
        title={
          posicionSeleccionada === posicionNombre
            ? "Posición seleccionada - Click en un jugador para asignar"
            : "Click para seleccionar posición o arrastrar jugador aquí"
        }
      >
        {jugadorAsignado ? (
          <div
            draggable
            onDragStart={(e) =>
              onJugadorDragStart && onJugadorDragStart(e, jugadorAsignado)
            }
            onDragEnd={(e) => {
              e.currentTarget.style.opacity = "1";
            }}
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border-2 border-blue-700 flex items-center justify-center font-bold shadow-lg cursor-grab active:cursor-grabbing overflow-hidden"
            style={{
              background: (() => {
                const segundosJugados =
                  estadisticas[jugadorAsignado.id]?.minutos || 0;
                const TOTAL_PARTIDO = 3000;
                const porcentaje = Math.min(
                  (segundosJugados / TOTAL_PARTIDO) * 100,
                  100
                );
                return `linear-gradient(to bottom, #cbd5e1 ${porcentaje}%, #3b82f6 ${porcentaje}%)`;
              })(),
            }}
          >
            {(estadisticas[jugadorAsignado.id]?.rojas || 0) > 0 ? (
              <div className="w-8 h-11 bg-red-500 rounded flex items-center justify-center text-white text-base font-bold shadow-inner">
                {dorsal}
              </div>
            ) : (estadisticas[jugadorAsignado.id]?.amarillas || 0) > 0 ? (
              <div className="w-8 h-11 bg-yellow-400 rounded flex items-center justify-center text-gray-800 text-base font-bold shadow-inner">
                {dorsal}
              </div>
            ) : (
              <span className="text-white text-base">{dorsal}</span>
            )}
          </div>
        ) : (
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border-2 border-dashed border-white/50 flex items-center justify-center hover:border-white hover:bg-white/10">
            <span className="text-white/50 text-xs">{abreviatura}</span>
          </div>
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
        {renderPosicion("Portero", "5%", "50%", "POR")}
        {renderPosicion("Cierre", "22%", "50%", "CIE")}
        {renderPosicion("Ala Superior", "38%", "15%", "AS")}
        {renderPosicion("Ala Inferior", "38%", "85%", "AI")}
        {renderPosicion("Pívot", "60%", "50%", "PIV")}
      </div>
    </div>
  );
}
