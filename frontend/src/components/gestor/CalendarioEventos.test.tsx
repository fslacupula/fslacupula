import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CalendarioEventos } from "./CalendarioEventos";
import { Entrenamiento, Partido, FechaHora } from "@domain";

describe("CalendarioEventos", () => {
  const mockFechaHora = new FechaHora("2024-03-15", "10:00");

  const mockEntrenamiento = new Entrenamiento(
    1,
    mockFechaHora,
    "10:00",
    "Polideportivo",
    "Entrenamiento táctico"
  );

  const mockPartido = new Partido(
    1,
    mockFechaHora,
    "10:00",
    "Campo Local",
    "Rival FC",
    "liga",
    true
  );

  const defaultProps = {
    entrenamientos: [],
    partidos: [],
    mesActual: new Date("2024-03-01"),
    onMesAnterior: vi.fn(),
    onMesSiguiente: vi.fn(),
    onEventoClick: vi.fn(),
  };

  it("renderiza el calendario correctamente", () => {
    render(<CalendarioEventos {...defaultProps} />);

    expect(screen.getByText("Marzo 2024")).toBeInTheDocument();
    expect(screen.getByText("← Anterior")).toBeInTheDocument();
    expect(screen.getByText("Siguiente →")).toBeInTheDocument();
  });

  it("muestra los nombres de los días de la semana", () => {
    render(<CalendarioEventos {...defaultProps} />);

    expect(screen.getByText("Lun")).toBeInTheDocument();
    expect(screen.getByText("Mar")).toBeInTheDocument();
    expect(screen.getByText("Mié")).toBeInTheDocument();
    expect(screen.getByText("Jue")).toBeInTheDocument();
    expect(screen.getByText("Vie")).toBeInTheDocument();
    expect(screen.getByText("Sáb")).toBeInTheDocument();
    expect(screen.getByText("Dom")).toBeInTheDocument();
  });

  it("navega al mes anterior", () => {
    const onMesAnterior = vi.fn();
    render(
      <CalendarioEventos {...defaultProps} onMesAnterior={onMesAnterior} />
    );

    fireEvent.click(screen.getByText("← Anterior"));
    expect(onMesAnterior).toHaveBeenCalledTimes(1);
  });

  it("navega al mes siguiente", () => {
    const onMesSiguiente = vi.fn();
    render(
      <CalendarioEventos {...defaultProps} onMesSiguiente={onMesSiguiente} />
    );

    fireEvent.click(screen.getByText("Siguiente →"));
    expect(onMesSiguiente).toHaveBeenCalledTimes(1);
  });

  it("muestra entrenamientos en el calendario", () => {
    render(
      <CalendarioEventos
        {...defaultProps}
        entrenamientos={[mockEntrenamiento]}
      />
    );

    // Verifica que se muestra el emoji de entrenamiento
    const entrenamientoElement = screen.getByText(/🏃/);
    expect(entrenamientoElement).toBeInTheDocument();
  });

  it("muestra partidos en el calendario", () => {
    render(<CalendarioEventos {...defaultProps} partidos={[mockPartido]} />);

    // Verifica que se muestra el emoji de partido
    const partidoElement = screen.getByText(/⚽/);
    expect(partidoElement).toBeInTheDocument();
  });

  it("llama a onEventoClick cuando se hace clic en un entrenamiento", () => {
    const onEventoClick = vi.fn();
    render(
      <CalendarioEventos
        {...defaultProps}
        entrenamientos={[mockEntrenamiento]}
        onEventoClick={onEventoClick}
      />
    );

    const entrenamientoElement = screen.getByText(/🏃/);
    fireEvent.click(entrenamientoElement);

    expect(onEventoClick).toHaveBeenCalledWith(1, "entrenamiento");
  });

  it("llama a onEventoClick cuando se hace clic en un partido", () => {
    const onEventoClick = vi.fn();
    render(
      <CalendarioEventos
        {...defaultProps}
        partidos={[mockPartido]}
        onEventoClick={onEventoClick}
      />
    );

    const partidoElement = screen.getByText(/⚽/);
    fireEvent.click(partidoElement);

    expect(onEventoClick).toHaveBeenCalledWith(1, "partido");
  });

  it("muestra mensaje cuando no hay eventos", () => {
    render(<CalendarioEventos {...defaultProps} />);

    // No debería mostrar ningún evento
    expect(screen.queryByText(/🏃/)).not.toBeInTheDocument();
    expect(screen.queryByText(/⚽/)).not.toBeInTheDocument();
  });

  it("destaca el día actual", () => {
    const hoy = new Date();
    render(
      <CalendarioEventos
        {...defaultProps}
        mesActual={new Date(hoy.getFullYear(), hoy.getMonth(), 1)}
      />
    );

    // El día de hoy debería tener una clase especial
    const diaActual = screen.getByText(hoy.getDate().toString());
    expect(diaActual).toHaveClass("font-semibold");
  });

  it("muestra múltiples eventos en el mismo día", () => {
    const entrenamiento1 = new Entrenamiento(
      1,
      mockFechaHora,
      "10:00",
      "Polideportivo",
      "Entrenamiento 1"
    );
    const entrenamiento2 = new Entrenamiento(
      2,
      mockFechaHora,
      "11:00",
      "Polideportivo",
      "Entrenamiento 2"
    );

    render(
      <CalendarioEventos
        {...defaultProps}
        entrenamientos={[entrenamiento1, entrenamiento2]}
      />
    );

    const entrenamientos = screen.getAllByText(/🏃/);
    expect(entrenamientos).toHaveLength(2);
  });
});
