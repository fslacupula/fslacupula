import type { EntrenamientoDTO } from "../../domain/entities/Entrenamiento";
import type { PartidoDTO } from "../../domain/entities/Partido";

// Extender los DTOs con campos de asistencia del jugador
export type EntrenamientoWithAsistenciaDTO = EntrenamientoDTO & {
  estado: string;
  motivo_ausencia_id?: number;
  motivo_nombre?: string;
  comentarios?: string;
};

export type PartidoWithAsistenciaDTO = PartidoDTO & {
  estado: string;
  motivo_ausencia_id?: number;
  motivo_nombre?: string;
  comentarios?: string;
};

export type EventoWithTipoDTO = (
  | EntrenamientoWithAsistenciaDTO
  | PartidoWithAsistenciaDTO
) & {
  tipoEvento?: "entrenamientos" | "partidos";
};

type EventoCardJugadorProps = {
  evento: EventoWithTipoDTO;
  esEntrenamiento: boolean;
  onModificar: () => void;
};

// Helper para extraer fecha en formato YYYY-MM-DD sin conversión de zona horaria
const getFechaString = (fecha: string): string => {
  if (!fecha) return "";
  return fecha.split("T")[0];
};

const getEstadoBadge = (estado: string): string => {
  const colores: Record<string, string> = {
    confirmado: "bg-green-100 text-green-800",
    no_asiste: "bg-red-100 text-red-800",
    pendiente: "bg-yellow-100 text-yellow-800",
  };
  return colores[estado] || colores.pendiente;
};

export default function EventoCardJugador({
  evento,
  esEntrenamiento,
  onModificar,
}: EventoCardJugadorProps) {
  const fechaStr = getFechaString(evento.fecha);
  const [year, month, day] = fechaStr.split("-");
  const fecha = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  const fechaFormateada = fecha.toLocaleDateString("es-ES", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="bg-white rounded-lg shadow p-3 sm:p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
      <div className="flex-1">
        {evento.tipoEvento && (
          <span
            className={`inline-block px-2 py-1 rounded text-xs font-semibold mb-2 ${
              esEntrenamiento
                ? "bg-green-100 text-green-800"
                : "bg-blue-100 text-blue-800"
            }`}
          >
            {esEntrenamiento ? "📋 Entrenamiento" : "⚽ Partido"}
          </span>
        )}
        <h4 className="font-semibold text-base sm:text-lg">
          {fechaFormateada}
        </h4>
        {!esEntrenamiento && "rival" in evento && (
          <p className="text-gray-800 font-medium text-sm sm:text-base">
            {"es_local" in evento && evento.es_local ? "🏠" : "✈️"} vs{" "}
            {evento.rival}
          </p>
        )}
        <p className="text-gray-600 text-sm">
          🕒 {evento.hora} - 📍 {evento.ubicacion}
        </p>
        {esEntrenamiento && "descripcion" in evento && evento.descripcion && (
          <p className="text-gray-500 text-xs sm:text-sm mt-1 line-clamp-2">
            {evento.descripcion}
          </p>
        )}
        {!esEntrenamiento && "tipo" in evento && (
          <>
            <p className="text-gray-500 text-xs sm:text-sm">
              Tipo: {evento.tipo}
            </p>
            {"resultado" in evento && evento.resultado && (
              <p className="text-xs sm:text-sm text-gray-600">
                Resultado: {evento.resultado}
              </p>
            )}
          </>
        )}
        <div className="flex flex-wrap items-center gap-2 mt-2">
          <span
            className={`inline-block px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${getEstadoBadge(
              evento.estado
            )}`}
          >
            {evento.estado === "confirmado"
              ? "Confirmado"
              : evento.estado === "no_asiste"
              ? "No asiste"
              : "Pendiente"}
          </span>
          {evento.motivo_nombre && (
            <span className="text-xs sm:text-sm text-gray-600">
              ({evento.motivo_nombre})
            </span>
          )}
        </div>
      </div>
      <button
        onClick={onModificar}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 text-sm sm:text-base whitespace-nowrap w-full sm:w-auto"
      >
        {evento.estado === "pendiente" ? "Confirmar" : "Modificar"}
      </button>
    </div>
  );
}
