import { BolaJugador } from "./BolaJugador";
import { PanelStaff } from "./PanelStaff";

/**
 * Panel lateral con jugadores locales (3 columnas) y staff técnico
 */
export const PanelJugadoresLocales = ({
  jugadores,
  isJugadorAsignado,
  estadisticas,
  accionActiva,
  posicionSeleccionada,
  flashEffect,
  handleDragStart,
  handleDropFueraPista,
  handleDragOverFueraPista,
  ejecutarAccion,
  asignarJugadorAPosicionLocal,
}) => {
  // Filtrar jugadores no asignados y ordenar por minutos jugados
  const jugadoresDisponibles = jugadores
    .filter((j) => !isJugadorAsignado(j.id))
    .sort((a, b) => {
      const minutosA = estadisticas[a.id]?.minutos || 0;
      const minutosB = estadisticas[b.id]?.minutos || 0;
      return minutosA - minutosB; // Menor a mayor
    });

  const totalJugadores = jugadoresDisponibles.length;
  const tercio = Math.ceil(totalJugadores / 3);

  // Dividir en 3 columnas
  const columna1 = jugadoresDisponibles.slice(0, tercio);
  const columna2 = jugadoresDisponibles.slice(tercio, tercio * 2);
  const columna3 = jugadoresDisponibles.slice(tercio * 2);

  const renderColumna = (jugadoresColumna) => (
    <div className="flex flex-col items-center gap-2">
      {jugadoresColumna.map((jugador) => (
        <BolaJugador
          key={jugador.id}
          jugador={jugador}
          asignado={false}
          estadisticas={estadisticas}
          accionActiva={accionActiva}
          posicionSeleccionada={posicionSeleccionada}
          flashEffect={flashEffect}
          onDragStart={(e) => handleDragStart(e, jugador)}
          onDragEnd={(e) => {
            e.target.style.opacity = "1";
          }}
          onClick={() => {
            if (accionActiva) {
              ejecutarAccion(jugador, accionActiva);
            } else if (posicionSeleccionada) {
              asignarJugadorAPosicionLocal(jugador, posicionSeleccionada);
            }
          }}
        />
      ))}
    </div>
  );

  return (
    <div
      className="flex-shrink-0 flex flex-col items-center"
      onDrop={handleDropFueraPista}
      onDragOver={handleDragOverFueraPista}
    >
      {/* Staff Técnico */}
      <PanelStaff
        estadisticas={estadisticas}
        accionActiva={accionActiva}
        handleDragStart={handleDragStart}
        ejecutarAccion={ejecutarAccion}
      />

      {/* 3 Columnas de Jugadores */}
      <div className="flex gap-2">
        {renderColumna(columna1)}
        {renderColumna(columna2)}
        {renderColumna(columna3)}
      </div>
    </div>
  );
};
