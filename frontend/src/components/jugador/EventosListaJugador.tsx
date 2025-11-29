import EventoCardJugador from "./EventoCardJugador";
import type {
  EntrenamientoWithAsistenciaDTO,
  PartidoWithAsistenciaDTO,
  EventoWithTipoDTO,
} from "./EventoCardJugador";
import type { TabJugador } from "./TabsJugador";

type EventosListaJugadorProps = {
  entrenamientos: EntrenamientoWithAsistenciaDTO[];
  partidos: PartidoWithAsistenciaDTO[];
  activeTab: TabJugador;
  onModificarAsistencia: (
    evento: EventoWithTipoDTO,
    tipo: "entrenamiento" | "partido"
  ) => void;
};

// Helper para comparar fechas sin conversión de zona horaria
const compararFechas = (fechaStr1: string, fechaStr2: string): number => {
  const f1 = fechaStr1.split("T")[0];
  const f2 = fechaStr2.split("T")[0];
  return f1.localeCompare(f2);
};

export default function EventosListaJugador({
  entrenamientos,
  partidos,
  activeTab,
  onModificarAsistencia,
}: EventosListaJugadorProps) {
  let eventos: EventoWithTipoDTO[] = [];

  if (activeTab === "todos") {
    const entrenamientosConTipo = entrenamientos.map((e) => ({
      ...e,
      tipoEvento: "entrenamientos" as const,
    }));
    const partidosConTipo = partidos.map((p) => ({
      ...p,
      tipoEvento: "partidos" as const,
    }));
    eventos = [...entrenamientosConTipo, ...partidosConTipo].sort((a, b) => {
      return -compararFechas(a.fecha, b.fecha); // Más recientes primero
    });
  } else {
    eventos = (
      activeTab === "entrenamientos" ? entrenamientos : partidos
    ) as EventoWithTipoDTO[];
  }

  if (eventos.length === 0) {
    return <p className="text-gray-500 text-center py-8">No hay eventos</p>;
  }

  return (
    <div className="grid gap-3 sm:gap-4">
      {eventos.map((evento) => {
        const esEntrenamiento =
          activeTab === "todos"
            ? evento.tipoEvento === "entrenamientos"
            : activeTab === "entrenamientos";

        return (
          <EventoCardJugador
            key={`${evento.tipoEvento || activeTab}-${evento.id}`}
            evento={evento}
            esEntrenamiento={esEntrenamiento}
            onModificar={() =>
              onModificarAsistencia(
                evento,
                esEntrenamiento ? "entrenamiento" : "partido"
              )
            }
          />
        );
      })}
    </div>
  );
}
