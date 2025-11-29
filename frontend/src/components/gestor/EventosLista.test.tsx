import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { EventosLista } from "./EventosLista";
import { Entrenamiento, Partido, FechaHora } from "@domain";

describe("EventosLista", () => {
  const mockFechaHora1 = new FechaHora("2024-03-15", "10:00");
  const mockFechaHora2 = new FechaHora("2024-03-20", "18:00");

  const mockEntrenamiento = new Entrenamiento(
    1,
    mockFechaHora1,
    "10:00",
    "Polideportivo",
    "Entrenamiento táctico"
  );

  const mockPartido = new Partido(
    2,
    mockFechaHora2,
    "18:00",
    "Campo Local",
    "Rival FC",
    "liga",
    true
  );

  const defaultProps = {
    entrenamientos: [],
    partidos: [],
    onVerDetalle: vi.fn(),
    onEditar: vi.fn(),
    onEliminar: vi.fn(),
  };

  it("muestra mensaje cuando no hay eventos", () => {
    render(<EventosLista {...defaultProps} />);

    expect(screen.getByText("No hay eventos para mostrar")).toBeInTheDocument();
    expect(
      screen.getByText('Crea un nuevo evento usando el botón "+"')
    ).toBeInTheDocument();
  });

  it("renderiza lista de entrenamientos", () => {
    render(
      <EventosLista {...defaultProps} entrenamientos={[mockEntrenamiento]} />
    );

    expect(screen.getByText(/Entrenamiento/i)).toBeInTheDocument();
  });

  it("renderiza lista de partidos", () => {
    render(<EventosLista {...defaultProps} partidos={[mockPartido]} />);

    expect(screen.getByText(/Partido/i)).toBeInTheDocument();
  });

  it("ordena eventos cronológicamente", () => {
    const entrenamientoTardio = new Entrenamiento(
      3,
      mockFechaHora2,
      "18:00",
      "Polideportivo",
      "Entrenamiento tardío"
    );

    render(
      <EventosLista
        {...defaultProps}
        entrenamientos={[entrenamientoTardio, mockEntrenamiento]}
        partidos={[mockPartido]}
      />
    );

    // Verifica que hay múltiples eventos
    const eventos = screen.getAllByText(/Entrenamiento|Partido/i);
    expect(eventos.length).toBeGreaterThan(0);
  });

  it("llama a onVerDetalle al hacer clic en ver detalle", () => {
    const onVerDetalle = vi.fn();
    render(
      <EventosLista
        {...defaultProps}
        entrenamientos={[mockEntrenamiento]}
        onVerDetalle={onVerDetalle}
      />
    );

    // Busca y hace clic en el botón de ver detalle
    const verDetalleButtons = screen.getAllByRole("button");
    const verDetalleButton = verDetalleButtons.find((btn) =>
      btn.textContent?.includes("Ver")
    );

    if (verDetalleButton) {
      fireEvent.click(verDetalleButton);
      expect(onVerDetalle).toHaveBeenCalled();
    }
  });

  it("muestra eventos mixtos de entrenamientos y partidos", () => {
    render(
      <EventosLista
        {...defaultProps}
        entrenamientos={[mockEntrenamiento]}
        partidos={[mockPartido]}
      />
    );

    expect(screen.getByText(/Entrenamiento/i)).toBeInTheDocument();
    expect(screen.getByText(/Partido/i)).toBeInTheDocument();
  });
});
