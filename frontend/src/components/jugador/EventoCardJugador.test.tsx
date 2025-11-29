import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import EventoCardJugador from "./EventoCardJugador";
import type { EventoWithTipoDTO } from "./EventoCardJugador";
import userEvent from "@testing-library/user-event";

describe("EventoCardJugador", () => {
  const mockOnModificar = vi.fn();

  const entrenamientoBase: EventoWithTipoDTO = {
    id: 1,
    fecha: "2025-01-15T10:00:00Z",
    hora: "10:00",
    ubicacion: "Campo Municipal",
    descripcion: "Entrenamiento de táctica",
    duracion_minutos: 90,
    estado: "pendiente",
    tipoEvento: "entrenamientos",
    asistencias: [],
  };

  const partidoBase: EventoWithTipoDTO = {
    id: 2,
    fecha: "2025-01-20T18:00:00Z",
    hora: "18:00",
    ubicacion: "Estadio Central",
    rival: "FC Barcelona",
    tipo: "amistoso",
    es_local: true,
    resultado: "3-1",
    estado: "confirmado",
    tipoEvento: "partidos",
    asistencias: [],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Renderizado de entrenamientos", () => {
    it("debe mostrar información básica del entrenamiento", () => {
      render(
        <EventoCardJugador
          evento={entrenamientoBase}
          esEntrenamiento={true}
          onModificar={mockOnModificar}
        />
      );

      expect(screen.getByText(/📋 Entrenamiento/)).toBeInTheDocument();
      expect(screen.getByText(/10:00/)).toBeInTheDocument();
      expect(screen.getByText(/Campo Municipal/)).toBeInTheDocument();
      expect(screen.getByText("Entrenamiento de táctica")).toBeInTheDocument();
    });

    it("debe mostrar estado pendiente correctamente", () => {
      render(
        <EventoCardJugador
          evento={entrenamientoBase}
          esEntrenamiento={true}
          onModificar={mockOnModificar}
        />
      );

      expect(screen.getByText("Pendiente")).toBeInTheDocument();
      const badge = screen.getByText("Pendiente");
      expect(badge).toHaveClass("bg-yellow-100", "text-yellow-800");
    });

    it("debe mostrar botón 'Confirmar' cuando estado es pendiente", () => {
      render(
        <EventoCardJugador
          evento={entrenamientoBase}
          esEntrenamiento={true}
          onModificar={mockOnModificar}
        />
      );

      expect(
        screen.getByRole("button", { name: /confirmar/i })
      ).toBeInTheDocument();
    });

    it("debe mostrar entrenamiento sin descripción", () => {
      const entrenamientoSinDescripcion = { ...entrenamientoBase };
      delete (entrenamientoSinDescripcion as any).descripcion;

      render(
        <EventoCardJugador
          evento={entrenamientoSinDescripcion}
          esEntrenamiento={true}
          onModificar={mockOnModificar}
        />
      );

      expect(
        screen.queryByText("Entrenamiento de táctica")
      ).not.toBeInTheDocument();
    });
  });

  describe("Renderizado de partidos", () => {
    it("debe mostrar información básica del partido", () => {
      render(
        <EventoCardJugador
          evento={partidoBase}
          esEntrenamiento={false}
          onModificar={mockOnModificar}
        />
      );

      expect(screen.getByText(/⚽ Partido/)).toBeInTheDocument();
      expect(screen.getByText(/vs FC Barcelona/)).toBeInTheDocument();
      expect(screen.getByText(/18:00/)).toBeInTheDocument();
      expect(screen.getByText(/Estadio Central/)).toBeInTheDocument();
    });

    it("debe mostrar icono de local para partido local", () => {
      render(
        <EventoCardJugador
          evento={partidoBase}
          esEntrenamiento={false}
          onModificar={mockOnModificar}
        />
      );

      expect(screen.getByText(/🏠/)).toBeInTheDocument();
    });

    it("debe mostrar icono de visitante para partido visitante", () => {
      const partidoVisitante = { ...partidoBase, es_local: false };

      render(
        <EventoCardJugador
          evento={partidoVisitante}
          esEntrenamiento={false}
          onModificar={mockOnModificar}
        />
      );

      expect(screen.getByText(/✈️/)).toBeInTheDocument();
    });

    it("debe mostrar resultado del partido", () => {
      render(
        <EventoCardJugador
          evento={partidoBase}
          esEntrenamiento={false}
          onModificar={mockOnModificar}
        />
      );

      expect(screen.getByText(/Resultado: 3-1/)).toBeInTheDocument();
    });

    it("debe mostrar tipo de partido", () => {
      render(
        <EventoCardJugador
          evento={partidoBase}
          esEntrenamiento={false}
          onModificar={mockOnModificar}
        />
      );

      expect(screen.getByText(/Tipo: amistoso/)).toBeInTheDocument();
    });

    it("debe mostrar estado confirmado correctamente", () => {
      render(
        <EventoCardJugador
          evento={partidoBase}
          esEntrenamiento={false}
          onModificar={mockOnModificar}
        />
      );

      expect(screen.getByText("Confirmado")).toBeInTheDocument();
      const badge = screen.getByText("Confirmado");
      expect(badge).toHaveClass("bg-green-100", "text-green-800");
    });

    it("debe mostrar botón 'Modificar' cuando estado no es pendiente", () => {
      render(
        <EventoCardJugador
          evento={partidoBase}
          esEntrenamiento={false}
          onModificar={mockOnModificar}
        />
      );

      expect(
        screen.getByRole("button", { name: /modificar/i })
      ).toBeInTheDocument();
    });
  });

  describe("Estados de asistencia", () => {
    it("debe mostrar estado 'No asiste' correctamente", () => {
      const eventoNoAsiste = {
        ...entrenamientoBase,
        estado: "no_asiste",
        motivo_ausencia_id: 1,
        motivo_nombre: "Lesión",
      };

      render(
        <EventoCardJugador
          evento={eventoNoAsiste}
          esEntrenamiento={true}
          onModificar={mockOnModificar}
        />
      );

      expect(screen.getByText("No asiste")).toBeInTheDocument();
      const badge = screen.getByText("No asiste");
      expect(badge).toHaveClass("bg-red-100", "text-red-800");
    });

    it("debe mostrar motivo de ausencia cuando existe", () => {
      const eventoConMotivo = {
        ...entrenamientoBase,
        estado: "no_asiste",
        motivo_ausencia_id: 1,
        motivo_nombre: "Trabajo",
      };

      render(
        <EventoCardJugador
          evento={eventoConMotivo}
          esEntrenamiento={true}
          onModificar={mockOnModificar}
        />
      );

      expect(screen.getByText("(Trabajo)")).toBeInTheDocument();
    });

    it("no debe mostrar motivo cuando no existe", () => {
      render(
        <EventoCardJugador
          evento={entrenamientoBase}
          esEntrenamiento={true}
          onModificar={mockOnModificar}
        />
      );

      expect(screen.queryByText(/\(/)).not.toBeInTheDocument();
    });
  });

  describe("Interacciones", () => {
    it("debe llamar onModificar al hacer click en botón Confirmar", async () => {
      const user = userEvent.setup();

      render(
        <EventoCardJugador
          evento={entrenamientoBase}
          esEntrenamiento={true}
          onModificar={mockOnModificar}
        />
      );

      const boton = screen.getByRole("button", { name: /confirmar/i });
      await user.click(boton);

      expect(mockOnModificar).toHaveBeenCalledTimes(1);
    });

    it("debe llamar onModificar al hacer click en botón Modificar", async () => {
      const user = userEvent.setup();

      render(
        <EventoCardJugador
          evento={partidoBase}
          esEntrenamiento={false}
          onModificar={mockOnModificar}
        />
      );

      const boton = screen.getByRole("button", { name: /modificar/i });
      await user.click(boton);

      expect(mockOnModificar).toHaveBeenCalledTimes(1);
    });
  });

  describe("Formato de fecha", () => {
    it("debe formatear la fecha correctamente", () => {
      render(
        <EventoCardJugador
          evento={entrenamientoBase}
          esEntrenamiento={true}
          onModificar={mockOnModificar}
        />
      );

      // La fecha debe mostrarse en formato largo español
      const fechaElement = screen.getByText((content, element) => {
        return element?.tagName === "H4" && content.includes("15");
      });

      expect(fechaElement).toBeInTheDocument();
    });
  });

  describe("Estilos condicionales", () => {
    it("debe aplicar estilos correctos para entrenamiento", () => {
      render(
        <EventoCardJugador
          evento={entrenamientoBase}
          esEntrenamiento={true}
          onModificar={mockOnModificar}
        />
      );

      const badge = screen.getByText(/📋 Entrenamiento/);
      expect(badge).toHaveClass("bg-green-100", "text-green-800");
    });

    it("debe aplicar estilos correctos para partido", () => {
      render(
        <EventoCardJugador
          evento={partidoBase}
          esEntrenamiento={false}
          onModificar={mockOnModificar}
        />
      );

      const badge = screen.getByText(/⚽ Partido/);
      expect(badge).toHaveClass("bg-blue-100", "text-blue-800");
    });
  });

  describe("Edge cases", () => {
    it("debe manejar partido sin resultado", () => {
      const partidoSinResultado = { ...partidoBase };
      delete (partidoSinResultado as any).resultado;

      render(
        <EventoCardJugador
          evento={partidoSinResultado}
          esEntrenamiento={false}
          onModificar={mockOnModificar}
        />
      );

      expect(screen.queryByText(/Resultado:/)).not.toBeInTheDocument();
    });

    it("debe manejar evento sin tipoEvento", () => {
      const eventoSinTipo = { ...entrenamientoBase };
      delete (eventoSinTipo as any).tipoEvento;

      render(
        <EventoCardJugador
          evento={eventoSinTipo}
          esEntrenamiento={true}
          onModificar={mockOnModificar}
        />
      );

      expect(screen.queryByText(/📋 Entrenamiento/)).not.toBeInTheDocument();
    });

    it("debe manejar estado desconocido con estilo por defecto", () => {
      const eventoEstadoRaro = {
        ...entrenamientoBase,
        estado: "estado_raro",
      };

      render(
        <EventoCardJugador
          evento={eventoEstadoRaro}
          esEntrenamiento={true}
          onModificar={mockOnModificar}
        />
      );

      // Debe usar el estilo de "Pendiente" por defecto
      const badge = screen.getByText("Pendiente");
      expect(badge).toHaveClass("bg-yellow-100", "text-yellow-800");
    });
  });
});
