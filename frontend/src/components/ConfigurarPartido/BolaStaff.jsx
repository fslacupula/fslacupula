/**
 * Componente para mostrar una bola de staff (Entrenador, Delegado, Auxiliar)
 */
export const BolaStaff = ({
  id,
  letra,
  nombre,
  estadisticas,
  accionActiva,
  onDragStart,
  onDragEnd,
  onClick,
}) => {
  const stats = estadisticas[id];
  const tieneAmarilla = stats?.amarillas > 0;
  const tieneRoja = stats?.rojas > 0;

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={onClick}
      className={`relative w-14 h-14 rounded-full bg-amber-600 border-2 border-amber-800 flex items-center justify-center text-white font-bold text-sm shadow-lg hover:scale-110 transition-transform overflow-hidden ${
        accionActiva
          ? "cursor-pointer hover:ring-4 hover:ring-amber-300"
          : "cursor-grab active:cursor-grabbing"
      }`}
      title={
        accionActiva
          ? `Click para aplicar ${accionActiva}`
          : `${nombre} - Arrastra para asignar tarjeta`
      }
    >
      {tieneRoja ? (
        <div className="w-6 h-9 bg-red-500 rounded flex items-center justify-center text-white text-sm font-bold shadow-inner">
          {letra}
        </div>
      ) : tieneAmarilla ? (
        <div className="w-6 h-9 bg-yellow-400 rounded flex items-center justify-center text-gray-800 text-sm font-bold shadow-inner">
          {letra}
        </div>
      ) : (
        letra
      )}
    </div>
  );
};
