interface Usuario {
  id: number;
  nombre: string;
  email: string;
  activo: boolean;
}

interface ListaJugadoresProps {
  jugadores: Usuario[];
  onToggleEstado: (id: number, estadoActual: boolean) => void;
}

/**
 * Lista de jugadores con controles de activación/desactivación
 */
export function ListaJugadores({
  jugadores,
  onToggleEstado,
}: ListaJugadoresProps) {
  if (jugadores.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p className="text-lg">No hay jugadores registrados</p>
        <p className="text-sm mt-2">
          Crea un nuevo jugador usando el botón "Añadir Jugador"
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {jugadores.map((jugador) => (
        <div
          key={jugador.id}
          className={`bg-white border rounded-lg p-4 ${
            jugador.activo ? "border-green-200" : "border-gray-200 opacity-60"
          }`}
        >
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="font-bold text-gray-900">{jugador.nombre}</h3>
              <p className="text-sm text-gray-600">{jugador.email}</p>
            </div>
            <span
              className={`px-2 py-1 rounded text-xs font-semibold ${
                jugador.activo
                  ? "bg-green-100 text-green-800"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {jugador.activo ? "Activo" : "Inactivo"}
            </span>
          </div>

          <button
            onClick={() => onToggleEstado(jugador.id, jugador.activo)}
            className={`w-full mt-2 px-3 py-1.5 rounded text-sm font-medium transition-colors ${
              jugador.activo
                ? "bg-red-100 text-red-700 hover:bg-red-200"
                : "bg-green-100 text-green-700 hover:bg-green-200"
            }`}
          >
            {jugador.activo ? "Desactivar" : "Activar"}
          </button>
        </div>
      ))}
    </div>
  );
}
