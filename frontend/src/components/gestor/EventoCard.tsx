import type { Entrenamiento, Partido } from "@domain";

interface EventoCardProps {
  evento: Entrenamiento | Partido;
  tipoEvento: "entrenamiento" | "partido";
  onVerDetalle: () => void;
  onEditar: () => void;
  onEliminar: () => void;
}

/**
 * Tarjeta para mostrar un evento (entrenamiento o partido)
 * Versión optimizada y con tipos
 */
export function EventoCard({
  evento,
  tipoEvento,
  onVerDetalle,
  onEditar,
  onEliminar,
}: EventoCardProps) {
  const esPartido = tipoEvento === "partido";
  const partido = esPartido ? (evento as Partido) : null;
  const entrenamiento = !esPartido ? (evento as Entrenamiento) : null;

  // Contar asistencias
  const stats = evento.contarAsistencias();

  return (
    <div className="bg-white border rounded-lg p-4 hover:shadow-lg transition-shadow">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
        <div className="flex-1 text-center sm:text-left">
          {/* Encabezado */}
          <div className="mb-2">
            <span
              className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                esPartido
                  ? "bg-green-100 text-green-800"
                  : "bg-blue-100 text-blue-800"
              }`}
            >
              {esPartido ? "⚽ PARTIDO" : "🏃 ENTRENAMIENTO"}
            </span>
            {partido && (
              <span
                className={`ml-2 inline-block px-2 py-1 rounded text-xs font-semibold ${
                  partido.esPartidoLocal()
                    ? "bg-purple-100 text-purple-800"
                    : "bg-orange-100 text-orange-800"
                }`}
              >
                {partido.esPartidoLocal() ? "🏠 LOCAL" : "✈️ VISITANTE"}
              </span>
            )}
          </div>

          {/* Título */}
          <h3 className="text-lg font-bold text-gray-900 mb-1">
            {partido
              ? `vs ${partido.rival}`
              : entrenamiento?.descripcion || "Entrenamiento"}
          </h3>

          {/* Fecha y hora */}
          <p className="text-sm text-gray-600 mb-1">
            📅 {evento.fechaHora.formatearLargo()}
          </p>
          <p className="text-sm text-gray-600 mb-2">📍 {evento.ubicacion}</p>

          {/* Resultado (solo partidos) */}
          {partido?.tieneResultado() && (
            <p className="text-lg font-bold text-indigo-600 mb-2">
              {partido.resultado}
            </p>
          )}

          {/* Estadísticas de asistencia */}
          <div className="flex gap-4 justify-center sm:justify-start text-sm">
            <span className="text-green-600 font-semibold">
              ✅ {stats.confirmados} confirmado{stats.confirmados !== 1 && "s"}
            </span>
            <span className="text-red-600 font-semibold">
              ❌ {stats.ausentes} ausente{stats.ausentes !== 1 && "s"}
            </span>
            <span className="text-gray-500 font-semibold">
              ⏳ {stats.pendientes} pendiente{stats.pendientes !== 1 && "s"}
            </span>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-shrink-0">
          <button
            onClick={onVerDetalle}
            className="px-3 py-1.5 bg-indigo-600 text-white rounded text-sm hover:bg-indigo-700 transition-colors"
          >
            Ver Detalle
          </button>

          <div className="grid grid-cols-2 gap-2 sm:flex sm:gap-2">
            <button
              onClick={onEditar}
              className="px-3 py-1.5 bg-yellow-500 text-white rounded text-sm hover:bg-yellow-600 transition-colors"
            >
              Editar
            </button>
            <button
              onClick={onEliminar}
              className="px-3 py-1.5 bg-red-500 text-white rounded text-sm hover:bg-red-600 transition-colors"
            >
              Eliminar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
