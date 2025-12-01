import { BolaJugador } from "./BolaJugador";

/**
 * Componente que renderiza una columna de jugadores
 */
export const ColumnaJugadores = ({
  jugadores,
  estadisticas,
  accionActiva,
  posicionSeleccionada,
  flashEffect,
  handleDragStart,
  ejecutarAccion,
  asignarJugadorAPosicionLocal,
}) => {
  return (
    <div className="flex flex-col items-center gap-2">
      {jugadores.map((jugador) => (
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
};
