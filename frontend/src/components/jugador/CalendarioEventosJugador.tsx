import type {
  EntrenamientoWithAsistenciaDTO,
  PartidoWithAsistenciaDTO,
  EventoWithTipoDTO,
} from "./EventoCardJugador";
import type { TabJugador } from "./TabsJugador";

type CalendarioEventosJugadorProps = {
  entrenamientos: EntrenamientoWithAsistenciaDTO[];
  partidos: PartidoWithAsistenciaDTO[];
  activeTab: TabJugador;
  mesActual: Date;
  onCambiarMes: (direccion: number) => void;
  onModificarAsistencia: (
    evento: EventoWithTipoDTO,
    tipo: "entrenamiento" | "partido"
  ) => void;
};

// Helper para extraer fecha en formato YYYY-MM-DD sin conversión de zona horaria
const getFechaString = (fecha: string): string => {
  if (!fecha) return "";
  return fecha.split("T")[0];
};

export default function CalendarioEventosJugador({
  entrenamientos,
  partidos,
  activeTab,
  mesActual,
  onCambiarMes,
  onModificarAsistencia,
}: CalendarioEventosJugadorProps) {
  const getDiasDelMes = (): (Date | null)[] => {
    const year = mesActual.getFullYear();
    const month = mesActual.getMonth();
    const primerDia = new Date(year, month, 1);
    const diasEnMes = new Date(year, month + 1, 0).getDate();
    let primerDiaSemana = primerDia.getDay();

    // Ajustar para que lunes sea 0 (domingo es 6)
    primerDiaSemana = primerDiaSemana === 0 ? 6 : primerDiaSemana - 1;

    const dias: (Date | null)[] = [];
    // Días vacíos al inicio
    for (let i = 0; i < primerDiaSemana; i++) {
      dias.push(null);
    }
    // Días del mes
    for (let i = 1; i <= diasEnMes; i++) {
      dias.push(new Date(year, month, i));
    }
    return dias;
  };

  const getEventosDelDia = (fecha: Date | null): EventoWithTipoDTO[] => {
    if (!fecha) return [];

    const year = fecha.getFullYear();
    const month = String(fecha.getMonth() + 1).padStart(2, "0");
    const day = String(fecha.getDate()).padStart(2, "0");
    const fechaStr = `${year}-${month}-${day}`;

    let eventos: EventoWithTipoDTO[] = [];
    if (activeTab === "todos") {
      const entrenamientos2 = entrenamientos
        .filter((e) => getFechaString(e.fecha) === fechaStr)
        .map((e) => ({ ...e, tipoEvento: "entrenamientos" as const }));
      const partidos2 = partidos
        .filter((e) => getFechaString(e.fecha) === fechaStr)
        .map((e) => ({ ...e, tipoEvento: "partidos" as const }));
      eventos = [...entrenamientos2, ...partidos2].sort((a, b) =>
        a.hora.localeCompare(b.hora)
      );
    } else {
      eventos = (
        activeTab === "entrenamientos" ? entrenamientos : partidos
      ).filter(
        (e) => getFechaString(e.fecha) === fechaStr
      ) as EventoWithTipoDTO[];
    }
    return eventos;
  };

  const dias = getDiasDelMes();
  const nombresDias = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
  const nombresDiasCortos = ["L", "M", "X", "J", "V", "S", "D"];

  return (
    <div className="bg-white rounded-lg shadow p-2 sm:p-4">
      {/* Controles de navegación */}
      <div className="flex justify-between items-center mb-3 sm:mb-4">
        <button
          onClick={() => onCambiarMes(-1)}
          className="bg-gray-200 hover:bg-gray-300 px-2 sm:px-4 py-1.5 sm:py-2 rounded text-sm sm:text-base"
        >
          ←
        </button>
        <h3 className="text-base sm:text-xl font-semibold capitalize">
          {mesActual.toLocaleDateString("es-ES", {
            month: "long",
            year: "numeric",
          })}
        </h3>
        <button
          onClick={() => onCambiarMes(1)}
          className="bg-gray-200 hover:bg-gray-300 px-2 sm:px-4 py-1.5 sm:py-2 rounded text-sm sm:text-base"
        >
          →
        </button>
      </div>

      {/* Nombres de días */}
      <div className="grid grid-cols-7 gap-0.5 sm:gap-2 mb-1 sm:mb-2">
        {nombresDias.map((dia, index) => (
          <div
            key={dia}
            className="text-center font-semibold text-gray-600 text-xs sm:text-sm py-1 sm:py-2"
          >
            <span className="hidden sm:inline">{dia}</span>
            <span className="sm:hidden">{nombresDiasCortos[index]}</span>
          </div>
        ))}
      </div>

      {/* Días del calendario */}
      <div className="grid grid-cols-7 gap-0.5 sm:gap-2">
        {dias.map((fecha, index) => {
          const eventosDelDia = fecha ? getEventosDelDia(fecha) : [];
          const esHoy =
            fecha && fecha.toDateString() === new Date().toDateString();

          return (
            <div
              key={index}
              className={`min-h-[60px] sm:min-h-[100px] border rounded p-0.5 sm:p-1 ${
                fecha ? "bg-white" : "bg-gray-100"
              } ${esHoy ? "border-blue-500 border-2" : "border-gray-200"}`}
            >
              {fecha && (
                <>
                  <div
                    className={`text-right text-[10px] sm:text-sm font-semibold mb-0.5 sm:mb-1 px-0.5 sm:px-1 ${
                      esHoy ? "text-blue-600" : "text-gray-700"
                    }`}
                  >
                    {fecha.getDate()}
                  </div>
                  <div className="space-y-0.5 sm:space-y-1">
                    {eventosDelDia.map((evento) => {
                      const esEntrenamiento =
                        activeTab === "todos"
                          ? evento.tipoEvento === "entrenamientos"
                          : activeTab === "entrenamientos";

                      const rival =
                        !esEntrenamiento && "rival" in evento
                          ? evento.rival
                          : "";

                      return (
                        <div
                          key={`${evento.tipoEvento || activeTab}-${evento.id}`}
                          onClick={() =>
                            onModificarAsistencia(
                              evento,
                              esEntrenamiento ? "entrenamiento" : "partido"
                            )
                          }
                          className={`text-[8px] sm:text-xs p-1 sm:p-2 rounded cursor-pointer ${
                            esEntrenamiento
                              ? "bg-green-50 hover:bg-green-100 border border-green-200"
                              : "bg-blue-50 hover:bg-blue-100 border border-blue-200"
                          }`}
                          title={
                            esEntrenamiento
                              ? `${evento.hora} - ${evento.ubicacion}`
                              : `${evento.hora} - vs ${rival}`
                          }
                        >
                          <div className="font-semibold mb-0.5 sm:mb-1 flex items-center justify-between">
                            <span className="truncate">{evento.hora}</span>
                            <span className="text-xs sm:text-sm">
                              {esEntrenamiento ? "📋" : "⚽"}
                            </span>
                          </div>
                          <div className="text-[8px] sm:text-[10px] truncate mb-0.5 sm:mb-1 text-gray-600 hidden sm:block">
                            {esEntrenamiento ? evento.ubicacion : `vs ${rival}`}
                          </div>
                          <div className="text-[8px] sm:text-[10px]">
                            <span
                              className={`px-0.5 sm:px-1 rounded ${
                                evento.estado === "confirmado"
                                  ? "bg-green-200 text-green-800"
                                  : evento.estado === "no_asiste"
                                  ? "bg-red-200 text-red-800"
                                  : "bg-yellow-200 text-yellow-800"
                              }`}
                            >
                              {evento.estado === "confirmado"
                                ? "✓"
                                : evento.estado === "no_asiste"
                                ? "✗"
                                : "⏳"}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
