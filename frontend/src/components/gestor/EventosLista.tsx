import type { Entrenamiento, Partido } from "@domain";
import { EventoCard } from "./EventoCard";

interface EventosListaProps {
  entrenamientos: Entrenamiento[];
  partidos: Partido[];
  onVerDetalle: (id: number, tipo: "entrenamiento" | "partido") => void;
  onEditar: (
    evento: Entrenamiento | Partido,
    tipo: "entrenamiento" | "partido"
  ) => void;
  onEliminar: (id: number, tipo: "entrenamiento" | "partido") => void;
}

/**
 * Lista de eventos ordenada cronológicamente
 * Mezcla entrenamientos y partidos
 */
export function EventosLista({
  entrenamientos,
  partidos,
  onVerDetalle,
  onEditar,
  onEliminar,
}: EventosListaProps) {
  // Combinar y ordenar eventos por fecha
  const eventosCombinados = [
    ...entrenamientos.map((e) => ({
      evento: e,
      tipo: "entrenamiento" as const,
    })),
    ...partidos.map((p) => ({ evento: p, tipo: "partido" as const })),
  ].sort((a, b) => {
    return a.evento.fechaHora.esAntesDe(b.evento.fechaHora) ? -1 : 1;
  });

  if (eventosCombinados.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p className="text-lg">No hay eventos para mostrar</p>
        <p className="text-sm mt-2">Crea un nuevo evento usando el botón "+"</p>
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:gap-4">
      {eventosCombinados.map(({ evento, tipo }) => (
        <EventoCard
          key={`${tipo}-${evento.id}`}
          evento={evento}
          tipoEvento={tipo}
          onVerDetalle={() => onVerDetalle(evento.id, tipo)}
          onEditar={() => onEditar(evento, tipo)}
          onEliminar={() => onEliminar(evento.id, tipo)}
        />
      ))}
    </div>
  );
}
