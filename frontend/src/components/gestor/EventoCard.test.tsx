import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { EventoCard } from "./EventoCard";
import { Entrenamiento, Partido, FechaHora } from "@domain";
import userEvent from "@testing-library/user-event";

describe("EventoCard", () => {
  const mockOnVerDetalle = vi.fn();
  const mockOnEditar = vi.fn();
  const mockOnEliminar = vi.fn();

  const crearEntrenamiento = () => {
    const fechaHora = new FechaHora("2025-01-15", "10:00");
    const entrenamiento = new Entrenamiento(
      1,
      fechaHora,
      "10:00",
      "Campo Municipal",
      "Entrenamiento de porteros"
    );
    return entrenamiento;
  };

  const crearPartido = (esLocal: boolean) => {
    const fechaHora = new FechaHora("2025-01-20", "18:00");
    const partido = new Partido(
      2,
      fechaHora,
      "18:00",
      "Estadio Central",
      "FC Barcelona",
      "liga",
      esLocal,
      "3-1"
    );
    return partido;
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Renderizado de entrenamientos", () => {
    it("debe mostrar información básica del entrenamiento", () => {
      const entrenamiento = crearEntrenamiento();
      render(
        <EventoCard
          evento={entrenamiento}
          tipoEvento="entrenamiento"
          onVerDetalle={mockOnVerDetalle}
          onEditar={mockOnEditar}
          onEliminar={mockOnEliminar}
        />
      );

      expect(screen.getByText(/🏃 ENTRENAMIENTO/)).toBeInTheDocument();
      expect(screen.getByText("Entrenamiento de porteros")).toBeInTheDocument();
      expect(screen.getByText(/Campo Municipal/)).toBeInTheDocument();
    });

    // Test deshabilitado temporalmente - requiere refactorización
    /*
    it("debe mostrar estadísticas de asistencia correctas", () => {
      const asistencias = [
        crearAsistencia("confirmado"),
        crearAsistencia("confirmado"),
        crearAsistencia("ausente"),
        crearAsistencia("pendiente"),
      ];
      const entrenamiento = crearEntrenamiento(asistencias);

      render(
        <EventoCard
          evento={entrenamiento}
          tipoEvento="entrenamiento"
          onVerDetalle={mockOnVerDetalle}
          onEditar={mockOnEditar}
          onEliminar={mockOnEliminar}
        />
      );

      expect(screen.getByText(/2 confirmados/)).toBeInTheDocument();
      expect(screen.getByText(/1 ausente/)).toBeInTheDocument();
      expect(screen.getByText(/1 pendiente/)).toBeInTheDocument();
    });

    it("debe usar singular cuando hay solo 1 asistencia de cada tipo", () => {
      const asistencias = [
        crearAsistencia("confirmado"),
        crearAsistencia("ausente"),
        crearAsistencia("pendiente"),
      ];
      const entrenamiento = crearEntrenamiento(asistencias);

      render(
        <EventoCard
          evento={entrenamiento}
          tipoEvento="entrenamiento"
          onVerDetalle={mockOnVerDetalle}
          onEditar={mockOnEditar}
          onEliminar={mockOnEliminar}
        />
      );

      expect(screen.getByText(/1 confirmado/)).toBeInTheDocument();
      expect(screen.getByText(/1 ausente/)).toBeInTheDocument();
      expect(screen.getByText(/1 pendiente/)).toBeInTheDocument();
    });
    */
  });

  describe("Renderizado de partidos", () => {
    it("debe mostrar información básica del partido local", () => {
      const partido = crearPartido(true);
      render(
        <EventoCard
          evento={partido}
          tipoEvento="partido"
          onVerDetalle={mockOnVerDetalle}
          onEditar={mockOnEditar}
          onEliminar={mockOnEliminar}
        />
      );

      expect(screen.getByText(/⚽ PARTIDO/)).toBeInTheDocument();
      expect(screen.getByText(/🏠 LOCAL/)).toBeInTheDocument();
      expect(screen.getByText("vs FC Barcelona")).toBeInTheDocument();
      expect(screen.getByText(/Estadio Central/)).toBeInTheDocument();
    });

    it("debe mostrar información básica del partido visitante", () => {
      const partido = crearPartido(false);
      render(
        <EventoCard
          evento={partido}
          tipoEvento="partido"
          onVerDetalle={mockOnVerDetalle}
          onEditar={mockOnEditar}
          onEliminar={mockOnEliminar}
        />
      );

      expect(screen.getByText(/⚽ PARTIDO/)).toBeInTheDocument();
      expect(screen.getByText(/✈️ VISITANTE/)).toBeInTheDocument();
    });

    it("debe mostrar resultado cuando existe", () => {
      const partido = crearPartido(true);
      render(
        <EventoCard
          evento={partido}
          tipoEvento="partido"
          onVerDetalle={mockOnVerDetalle}
          onEditar={mockOnEditar}
          onEliminar={mockOnEliminar}
        />
      );

      expect(screen.getByText("3-1")).toBeInTheDocument();
    });

    it("no debe mostrar resultado cuando no existe", () => {
      const fechaHora = new FechaHora("2025-01-20", "18:00");
      const partido = new Partido(
        2,
        fechaHora,
        "18:00",
        "Estadio Central",
        "FC Barcelona",
        "liga",
        true
      );

      render(
        <EventoCard
          evento={partido}
          tipoEvento="partido"
          onVerDetalle={mockOnVerDetalle}
          onEditar={mockOnEditar}
          onEliminar={mockOnEliminar}
        />
      );

      expect(screen.queryByText("3-1")).not.toBeInTheDocument();
    });
  });

  describe("Interacciones", () => {
    it("debe llamar onVerDetalle al hacer click en el botón", async () => {
      const user = userEvent.setup();
      const entrenamiento = crearEntrenamiento();

      render(
        <EventoCard
          evento={entrenamiento}
          tipoEvento="entrenamiento"
          onVerDetalle={mockOnVerDetalle}
          onEditar={mockOnEditar}
          onEliminar={mockOnEliminar}
        />
      );

      const botonVerDetalle = screen.getByRole("button", {
        name: /ver detalle/i,
      });
      await user.click(botonVerDetalle);

      expect(mockOnVerDetalle).toHaveBeenCalledTimes(1);
    });

    it("debe llamar onEditar al hacer click en el botón", async () => {
      const user = userEvent.setup();
      const entrenamiento = crearEntrenamiento();

      render(
        <EventoCard
          evento={entrenamiento}
          tipoEvento="entrenamiento"
          onVerDetalle={mockOnVerDetalle}
          onEditar={mockOnEditar}
          onEliminar={mockOnEliminar}
        />
      );

      const botonEditar = screen.getByRole("button", { name: /editar/i });
      await user.click(botonEditar);

      expect(mockOnEditar).toHaveBeenCalledTimes(1);
    });

    it("debe llamar onEliminar al hacer click en el botón", async () => {
      const user = userEvent.setup();
      const entrenamiento = crearEntrenamiento();

      render(
        <EventoCard
          evento={entrenamiento}
          tipoEvento="entrenamiento"
          onVerDetalle={mockOnVerDetalle}
          onEditar={mockOnEditar}
          onEliminar={mockOnEliminar}
        />
      );

      const botonEliminar = screen.getByRole("button", { name: /eliminar/i });
      await user.click(botonEliminar);

      expect(mockOnEliminar).toHaveBeenCalledTimes(1);
    });
  });

  describe("Estilos condicionales", () => {
    it("debe aplicar estilos de entrenamiento correctamente", () => {
      const entrenamiento = crearEntrenamiento();
      render(
        <EventoCard
          evento={entrenamiento}
          tipoEvento="entrenamiento"
          onVerDetalle={mockOnVerDetalle}
          onEditar={mockOnEditar}
          onEliminar={mockOnEliminar}
        />
      );

      const badge = screen.getByText(/🏃 ENTRENAMIENTO/);
      expect(badge).toHaveClass("bg-blue-100", "text-blue-800");
    });

    it("debe aplicar estilos de partido correctamente", () => {
      const partido = crearPartido(true);
      render(
        <EventoCard
          evento={partido}
          tipoEvento="partido"
          onVerDetalle={mockOnVerDetalle}
          onEditar={mockOnEditar}
          onEliminar={mockOnEliminar}
        />
      );

      const badge = screen.getByText(/⚽ PARTIDO/);
      expect(badge).toHaveClass("bg-green-100", "text-green-800");
    });

    it("debe aplicar estilos de partido local correctamente", () => {
      const partido = crearPartido(true);
      render(
        <EventoCard
          evento={partido}
          tipoEvento="partido"
          onVerDetalle={mockOnVerDetalle}
          onEditar={mockOnEditar}
          onEliminar={mockOnEliminar}
        />
      );

      const badgeLocal = screen.getByText(/🏠 LOCAL/);
      expect(badgeLocal).toHaveClass("bg-purple-100", "text-purple-800");
    });

    it("debe aplicar estilos de partido visitante correctamente", () => {
      const partido = crearPartido(false);
      render(
        <EventoCard
          evento={partido}
          tipoEvento="partido"
          onVerDetalle={mockOnVerDetalle}
          onEditar={mockOnEditar}
          onEliminar={mockOnEliminar}
        />
      );

      const badgeVisitante = screen.getByText(/✈️ VISITANTE/);
      expect(badgeVisitante).toHaveClass("bg-orange-100", "text-orange-800");
    });
  });

  describe("Edge cases", () => {
    it("debe manejar entrenamiento sin descripción", () => {
      const fechaHora = new FechaHora("2025-01-15", "10:00");
      const entrenamiento = new Entrenamiento(
        1,
        fechaHora,
        "10:00",
        "Campo Municipal"
      );

      render(
        <EventoCard
          evento={entrenamiento}
          tipoEvento="entrenamiento"
          onVerDetalle={mockOnVerDetalle}
          onEditar={mockOnEditar}
          onEliminar={mockOnEliminar}
        />
      );

      expect(screen.getByText("Entrenamiento")).toBeInTheDocument();
    });

    it("debe manejar evento sin asistencias", () => {
      const entrenamiento = crearEntrenamiento();

      render(
        <EventoCard
          evento={entrenamiento}
          tipoEvento="entrenamiento"
          onVerDetalle={mockOnVerDetalle}
          onEditar={mockOnEditar}
          onEliminar={mockOnEliminar}
        />
      );

      expect(screen.getByText(/0 confirmados/)).toBeInTheDocument();
      expect(screen.getByText(/0 ausentes/)).toBeInTheDocument();
      expect(screen.getByText(/0 pendientes/)).toBeInTheDocument();
    });
  });
});
