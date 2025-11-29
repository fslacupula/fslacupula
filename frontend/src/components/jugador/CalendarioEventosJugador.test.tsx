import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import CalendarioEventosJugador from "./CalendarioEventosJugador";
import type {
  EntrenamientoWithAsistenciaDTO,
  PartidoWithAsistenciaDTO,
} from "./EventoCardJugador";

describe("CalendarioEventosJugador", () => {
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
    mesActual: new Date("2024-03-01"),
    onCambiarMes: vi.fn(),
    onModificarAsistencia: vi.fn(),
  };

  it("renderiza el calendario correctamente", () => {
    render(<CalendarioEventosJugador {...defaultProps} />);

    expect(screen.getByText(/marzo/i)).toBeInTheDocument();
    expect(screen.getByText("←")).toBeInTheDocument();
    expect(screen.getByText("→")).toBeInTheDocument();
  });

  it("muestra los nombres de los días de la semana", () => {
    render(<CalendarioEventosJugador {...defaultProps} />);

    expect(screen.getByText("Lun")).toBeInTheDocument();
    expect(screen.getByText("Mar")).toBeInTheDocument();
    expect(screen.getByText("Mié")).toBeInTheDocument();
  });

  it("llama a onCambiarMes con -1 al hacer clic en anterior", () => {
    const onCambiarMes = vi.fn();
    render(
      <CalendarioEventosJugador {...defaultProps} onCambiarMes={onCambiarMes} />
    );

    fireEvent.click(screen.getByText("←"));
    expect(onCambiarMes).toHaveBeenCalledWith(-1);
  });

  it("llama a onCambiarMes con 1 al hacer clic en siguiente", () => {
    const onCambiarMes = vi.fn();
    render(
      <CalendarioEventosJugador {...defaultProps} onCambiarMes={onCambiarMes} />
    );

    fireEvent.click(screen.getByText("→"));
    expect(onCambiarMes).toHaveBeenCalledWith(1);
  });

  it("muestra entrenamientos en el calendario", () => {
    render(
      <CalendarioEventosJugador
        {...defaultProps}
        entrenamientos={[mockEntrenamiento]}
        activeTab="entrenamientos"
      />
    );

    expect(screen.getByText("10:00")).toBeInTheDocument();
  });

  it("muestra partidos en el calendario", () => {
    render(
      <CalendarioEventosJugador
        {...defaultProps}
        partidos={[mockPartido]}
        activeTab="partidos"
      />
    );

    expect(screen.getByText("18:00")).toBeInTheDocument();
  });

  it("muestra estados de asistencia con emojis", () => {
    render(
      <CalendarioEventosJugador
        {...defaultProps}
        entrenamientos={[mockEntrenamiento]}
        activeTab="entrenamientos"
      />
    );

    // Estado pendiente muestra ⏳
    expect(screen.getByText("⏳")).toBeInTheDocument();
  });

  it("llama a onModificarAsistencia al hacer clic en un evento", () => {
    const onModificarAsistencia = vi.fn();
    render(
      <CalendarioEventosJugador
        {...defaultProps}
        entrenamientos={[mockEntrenamiento]}
        activeTab="entrenamientos"
        onModificarAsistencia={onModificarAsistencia}
      />
    );

    const eventoElement = screen.getByText("10:00").closest("div");
    if (eventoElement) {
      fireEvent.click(eventoElement);
      expect(onModificarAsistencia).toHaveBeenCalled();
    }
  });

  it("destaca el día actual", () => {
    const hoy = new Date();
    render(
      <CalendarioEventosJugador
        {...defaultProps}
        mesActual={new Date(hoy.getFullYear(), hoy.getMonth(), 1)}
      />
    );

    const diaElement = screen.getByText(hoy.getDate().toString());
    expect(diaElement).toHaveClass("text-blue-600");
  });

  it("muestra eventos mixtos cuando activeTab es 'todos'", () => {
    render(
      <CalendarioEventosJugador
        {...defaultProps}
        entrenamientos={[mockEntrenamiento]}
        partidos={[mockPartido]}
        activeTab="todos"
      />
    );

    expect(screen.getByText("10:00")).toBeInTheDocument();
    expect(screen.getByText("18:00")).toBeInTheDocument();
  });

  it("muestra emojis correctos según tipo de evento", () => {
    render(
      <CalendarioEventosJugador
        {...defaultProps}
        entrenamientos={[mockEntrenamiento]}
        partidos={[mockPartido]}
        activeTab="todos"
      />
    );

    // 📋 para entrenamientos, ⚽ para partidos
    expect(screen.getByText("📋")).toBeInTheDocument();
    expect(screen.getByText("⚽")).toBeInTheDocument();
  });
});
