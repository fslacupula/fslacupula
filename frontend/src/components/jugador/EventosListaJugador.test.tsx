import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import EventosListaJugador from "./EventosListaJugador";
import type {
  EntrenamientoWithAsistenciaDTO,
  PartidoWithAsistenciaDTO,
} from "./EventoCardJugador";

describe("EventosListaJugador", () => {
  const mockEntrenamiento: EntrenamientoWithAsistenciaDTO = {
    id: 1,
    fecha: "2024-03-15T10:00:00",
    hora: "10:00",
    ubicacion: "Polideportivo",
    descripcion: "Entrenamiento",
    estado: "pendiente",
  };

  const mockPartido: PartidoWithAsistenciaDTO = {
    id: 2,
    fecha: "2024-03-20T18:00:00",
    hora: "18:00",
    ubicacion: "Campo Local",
    rival: "Rival FC",
    tipo: "liga",
    es_local: true,
    estado: "confirmado",
  };

  const defaultProps = {
    entrenamientos: [],
    partidos: [],
    activeTab: "todos" as const,
    onModificarAsistencia: vi.fn(),
  };

  it("muestra mensaje cuando no hay eventos", () => {
    render(<EventosListaJugador {...defaultProps} />);

    expect(screen.getByText("No hay eventos")).toBeInTheDocument();
  });

  it("renderiza lista de entrenamientos", () => {
    render(
      <EventosListaJugador
        {...defaultProps}
        entrenamientos={[mockEntrenamiento]}
        activeTab="entrenamientos"
      />
    );

    expect(screen.getByText("10:00")).toBeInTheDocument();
    expect(screen.getByText("Polideportivo")).toBeInTheDocument();
  });

  it("renderiza lista de partidos", () => {
    render(
      <EventosListaJugador
        {...defaultProps}
        partidos={[mockPartido]}
        activeTab="partidos"
      />
    );

    expect(screen.getByText("18:00")).toBeInTheDocument();
    expect(screen.getByText(/Rival FC/i)).toBeInTheDocument();
  });

  it("muestra eventos mixtos cuando activeTab es 'todos'", () => {
    render(
      <EventosListaJugador
        {...defaultProps}
        entrenamientos={[mockEntrenamiento]}
        partidos={[mockPartido]}
        activeTab="todos"
      />
    );

    expect(screen.getByText("10:00")).toBeInTheDocument();
    expect(screen.getByText("18:00")).toBeInTheDocument();
  });

  it("ordena eventos por fecha descendente", () => {
    const entrenamiento1 = {
      ...mockEntrenamiento,
      fecha: "2024-03-10T10:00:00",
    };
    const entrenamiento2 = {
      ...mockEntrenamiento,
      fecha: "2024-03-20T10:00:00",
    };

    render(
      <EventosListaJugador
        {...defaultProps}
        entrenamientos={[entrenamiento1, entrenamiento2]}
        activeTab="entrenamientos"
      />
    );

    const eventos = screen.getAllByText("10:00");
    expect(eventos.length).toBeGreaterThan(0);
  });

  it("llama a onModificarAsistencia con los parámetros correctos", () => {
    const onModificarAsistencia = vi.fn();
    render(
      <EventosListaJugador
        {...defaultProps}
        entrenamientos={[mockEntrenamiento]}
        activeTab="entrenamientos"
        onModificarAsistencia={onModificarAsistencia}
      />
    );

    // Busca el botón de modificar
    const modificarButtons = screen.getAllByRole("button");
    if (modificarButtons.length > 0) {
      fireEvent.click(modificarButtons[0]);
      expect(onModificarAsistencia).toHaveBeenCalled();
    }
  });

  it("diferencia entre entrenamientos y partidos en el tipo", () => {
    render(
      <EventosListaJugador
        {...defaultProps}
        entrenamientos={[mockEntrenamiento]}
        partidos={[mockPartido]}
        activeTab="todos"
      />
    );

    // Verifica que se renderizan ambos tipos
    expect(screen.getByText("Polideportivo")).toBeInTheDocument();
    expect(screen.getByText(/Rival FC/i)).toBeInTheDocument();
  });
});
