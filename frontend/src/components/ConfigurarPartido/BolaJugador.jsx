/**
 * Componente para mostrar una bola de jugador con su dorsal y estado
 */
export const BolaJugador = ({
  jugador,
  asignado,
  estadisticas,
  accionActiva,
  posicionSeleccionada,
  flashEffect,
  onDragStart,
  onDragEnd,
  onClick,
}) => {
  const stats = estadisticas[jugador.id];
  const tieneAmarilla = stats?.amarillas > 0;
  const tieneRoja = stats?.rojas > 0;

  // Calcular porcentaje de esfuerzo (50 minutos = 3000 segundos)
  const segundosJugados = stats?.minutos || 0;
  const TOTAL_PARTIDO = 3000; // 50 minutos en segundos
  const porcentajeEsfuerzo = Math.min(
    (segundosJugados / TOTAL_PARTIDO) * 100,
    100
  );

  // Detectar si este jugador debe animarse
  const debeAnimarse =
    flashEffect.jugadorId === jugador.id &&
    (flashEffect.type === "amarilla" || flashEffect.type === "roja");

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={onClick}
      className={`relative w-14 h-14 rounded-full border-2 flex items-center justify-center font-bold shadow-lg transition-all duration-300 overflow-hidden ${
        asignado
          ? "border-gray-500 opacity-50 cursor-grab"
          : accionActiva
          ? "border-blue-700 cursor-pointer hover:scale-125 hover:ring-4 hover:ring-blue-300"
          : posicionSeleccionada
          ? "border-blue-700 cursor-pointer hover:scale-125 hover:ring-4 hover:ring-green-300"
          : "border-blue-700 cursor-grab hover:scale-110 active:cursor-grabbing"
      } ${debeAnimarse ? "scale-125" : ""}`}
      style={{
        background: asignado
          ? "#9ca3af"
          : `linear-gradient(to bottom, #cbd5e1 ${porcentajeEsfuerzo}%, #3b82f6 ${porcentajeEsfuerzo}%)`,
      }}
      title={
        accionActiva
          ? `Click para aplicar ${accionActiva}`
          : posicionSeleccionada
          ? `Click para asignar a ${posicionSeleccionada}`
          : "Arrastra a la pista o a zona de acciones"
      }
    >
      <div className="flex flex-col items-center">
        {tieneRoja ? (
          <div className="w-6 h-9 bg-red-500 rounded flex items-center justify-center text-white text-sm font-bold shadow-inner">
            {jugador.numero_dorsal}
          </div>
        ) : tieneAmarilla ? (
          <div className="w-6 h-9 bg-yellow-400 rounded flex items-center justify-center text-gray-800 text-sm font-bold shadow-inner">
            {jugador.numero_dorsal}
          </div>
        ) : (
          <span className="text-white text-lg">{jugador.numero_dorsal}</span>
        )}
      </div>
    </div>
  );
};
