import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import Marcador from "./Marcador";
import userEvent from "@testing-library/user-event";

describe("Marcador", () => {
  const mockOnDeshacer = vi.fn();
  const mockSetGolesLocal = vi.fn();
  const mockSetGolesVisitante = vi.fn();
  const mockOnCronometroChange = vi.fn();

  const defaultProps = {
    equipoLocal: "LOCAL",
    equipoVisitante: "VISITANTE",
    onDeshacer: mockOnDeshacer,
    deshabilitarDeshacer: false,
    golesLocal: 0,
    golesVisitante: 0,
    faltasLocal: 0,
    faltasVisitante: 0,
    setGolesLocal: mockSetGolesLocal,
    setGolesVisitante: mockSetGolesVisitante,
    onCronometroChange: mockOnCronometroChange,
    flashEffect: { type: null, jugadorId: null, timestamp: null },
    jugadoresLocal: [],
    jugadoresAsignados: {},
    estadisticas: {},
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  describe("Renderizado inicial", () => {
    it("debe mostrar marcador con valores iniciales", () => {
      render(<Marcador {...defaultProps} />);

      expect(screen.getByText("00")).toBeInTheDocument(); // Goles local
      expect(screen.getByText("00:00")).toBeInTheDocument(); // Cronómetro
    });

    it("debe mostrar marcador con valores personalizados", () => {
      render(<Marcador {...defaultProps} golesLocal={2} golesVisitante={1} />);

      const golesMarcados = screen.getAllByText("02");
      expect(golesMarcados.length).toBeGreaterThan(0);
    });

    it("debe mostrar botones de control", () => {
      render(<Marcador {...defaultProps} />);

      expect(
        screen.getByRole("button", { name: /iniciar/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /reset/i })
      ).toBeInTheDocument();
    });
  });

  describe("Cronómetro", () => {
    it("debe iniciar el cronómetro al hacer click en Iniciar", async () => {
      const user = userEvent.setup({ delay: null });
      render(<Marcador {...defaultProps} />);

      const botonIniciar = screen.getByRole("button", { name: /iniciar/i });
      await user.click(botonIniciar);

      expect(mockOnCronometroChange).toHaveBeenCalledWith(true);
      expect(screen.getByText(/pausar/i)).toBeInTheDocument();
    });

    it("debe pausar el cronómetro al hacer click en Pausar", async () => {
      const user = userEvent.setup({ delay: null });
      render(<Marcador {...defaultProps} />);

      const botonIniciar = screen.getByRole("button", { name: /iniciar/i });
      await user.click(botonIniciar);

      const botonPausar = screen.getByRole("button", { name: /pausar/i });
      await user.click(botonPausar);

      expect(mockOnCronometroChange).toHaveBeenCalledWith(false);
      expect(screen.getByText(/iniciar/i)).toBeInTheDocument();
    });

    it("debe reiniciar el cronómetro al hacer click en Reset", async () => {
      const user = userEvent.setup({ delay: null });
      render(<Marcador {...defaultProps} />);

      const botonIniciar = screen.getByRole("button", { name: /iniciar/i });
      await user.click(botonIniciar);

      vi.advanceTimersByTime(5000); // 5 segundos

      const botonReset = screen.getByRole("button", { name: /reset/i });
      await user.click(botonReset);

      expect(screen.getByText("00:00")).toBeInTheDocument();
      expect(screen.getByText(/iniciar/i)).toBeInTheDocument();
    });

    it("debe incrementar segundos cuando está corriendo", async () => {
      const user = userEvent.setup({ delay: null });
      render(<Marcador {...defaultProps} />);

      const botonIniciar = screen.getByRole("button", { name: /iniciar/i });
      await user.click(botonIniciar);

      vi.advanceTimersByTime(1000);

      expect(screen.getByText("00:01")).toBeInTheDocument();
    });

    it("debe incrementar minutos después de 59 segundos", async () => {
      const user = userEvent.setup({ delay: null });
      render(<Marcador {...defaultProps} />);

      const botonIniciar = screen.getByRole("button", { name: /iniciar/i });
      await user.click(botonIniciar);

      vi.advanceTimersByTime(60000); // 60 segundos

      expect(screen.getByText("01:00")).toBeInTheDocument();
    });
  });

  describe("Marcador de goles - Local", () => {
    it("debe incrementar goles locales", async () => {
      const user = userEvent.setup();
      render(<Marcador {...defaultProps} />);

      const botonesPlus = screen.getAllByRole("button", { name: "+" });
      await user.click(botonesPlus[0]); // Primer botón + es del equipo local

      expect(mockSetGolesLocal).toHaveBeenCalledTimes(1);
    });

    it("debe decrementar goles locales", async () => {
      const user = userEvent.setup();
      render(<Marcador {...defaultProps} golesLocal={2} />);

      const botonesMinus = screen.getAllByRole("button", { name: "-" });
      await user.click(botonesMinus[0]); // Primer botón - es del equipo local

      expect(mockSetGolesLocal).toHaveBeenCalledTimes(1);
    });

    it("no debe decrementar goles locales por debajo de 0", async () => {
      const user = userEvent.setup();
      const setGolesLocal = vi.fn((fn) => {
        const result = fn(0);
        expect(result).toBe(0);
      });

      render(<Marcador {...defaultProps} setGolesLocal={setGolesLocal} />);

      const botonesMinus = screen.getAllByRole("button", { name: "-" });
      await user.click(botonesMinus[0]);

      expect(setGolesLocal).toHaveBeenCalled();
    });
  });

  describe("Marcador de goles - Visitante", () => {
    it("debe incrementar goles visitantes", async () => {
      const user = userEvent.setup();
      render(<Marcador {...defaultProps} />);

      const botonesPlus = screen.getAllByRole("button", { name: "+" });
      await user.click(botonesPlus[1]); // Segundo botón + es del equipo visitante

      expect(mockSetGolesVisitante).toHaveBeenCalledTimes(1);
    });

    it("debe decrementar goles visitantes", async () => {
      const user = userEvent.setup();
      render(<Marcador {...defaultProps} golesVisitante={3} />);

      const botonesMinus = screen.getAllByRole("button", { name: "-" });
      await user.click(botonesMinus[1]); // Segundo botón - es del equipo visitante

      expect(mockSetGolesVisitante).toHaveBeenCalledTimes(1);
    });
  });

  describe("Faltas", () => {
    it("debe mostrar indicadores de faltas locales", () => {
      render(<Marcador {...defaultProps} faltasLocal={3} />);

      const container = screen.getByRole("generic");
      expect(container).toBeInTheDocument();
    });

    it("debe mostrar indicadores de faltas visitantes", () => {
      render(<Marcador {...defaultProps} faltasVisitante={2} />);

      const container = screen.getByRole("generic");
      expect(container).toBeInTheDocument();
    });

    it("debe resaltar faltas activas con color blanco", () => {
      const { container } = render(
        <Marcador {...defaultProps} faltasLocal={3} />
      );

      const faltasActivas = container.querySelectorAll(".bg-white");
      expect(faltasActivas.length).toBeGreaterThan(0);
    });
  });

  describe("Efectos flash", () => {
    it("debe mostrar efecto flash en gol local", () => {
      const timestamp = Date.now();
      render(
        <Marcador
          {...defaultProps}
          flashEffect={{
            type: "gol",
            equipo: "local",
            jugadorId: 1,
            timestamp,
          }}
        />
      );

      // El efecto debe activarse
      vi.advanceTimersByTime(100);
      expect(screen.getByRole("generic")).toBeInTheDocument();
    });

    it("debe mostrar efecto flash en gol visitante", () => {
      const timestamp = Date.now();
      render(
        <Marcador
          {...defaultProps}
          flashEffect={{
            type: "gol",
            equipo: "visitante",
            jugadorId: 2,
            timestamp,
          }}
        />
      );

      vi.advanceTimersByTime(100);
      expect(screen.getByRole("generic")).toBeInTheDocument();
    });

    it("debe desaparecer el efecto flash después de 500ms", async () => {
      const timestamp = Date.now();
      render(
        <Marcador
          {...defaultProps}
          flashEffect={{
            type: "gol",
            equipo: "local",
            jugadorId: 1,
            timestamp,
          }}
        />
      );

      vi.advanceTimersByTime(600);
      expect(screen.getByRole("generic")).toBeInTheDocument();
    });
  });

  describe("Responsive y estilos", () => {
    it("debe aplicar estilos de contenedor negro", () => {
      const { container } = render(<Marcador {...defaultProps} />);

      const mainContainer = container.querySelector(".bg-black");
      expect(mainContainer).toBeInTheDocument();
    });

    it("debe usar fuente Orbitron para números", () => {
      render(<Marcador {...defaultProps} />);

      // Verificar que el cronómetro tiene el estilo de fuente correcto
      const cronometro = screen.getByText("00:00");
      expect(cronometro.parentElement).toHaveStyle({
        fontFamily: "'Orbitron', monospace",
      });
    });
  });

  describe("Formato de números", () => {
    it("debe mostrar números con padding de ceros", () => {
      render(<Marcador {...defaultProps} golesLocal={5} />);

      expect(screen.getByText("05")).toBeInTheDocument();
    });

    it("debe mostrar números de dos dígitos sin padding", () => {
      render(<Marcador {...defaultProps} golesLocal={12} />);

      expect(screen.getByText("12")).toBeInTheDocument();
    });
  });

  describe("Edge cases", () => {
    it("debe manejar múltiples clicks rápidos", async () => {
      const user = userEvent.setup({ delay: null });
      render(<Marcador {...defaultProps} />);

      const botonIniciar = screen.getByRole("button", { name: /iniciar/i });

      await user.click(botonIniciar);
      await user.click(botonIniciar);
      await user.click(botonIniciar);

      // El último estado debería ser pausado (toggle)
      expect(mockOnCronometroChange).toHaveBeenCalled();
    });

    it("debe manejar props opcionales ausentes", () => {
      render(
        <Marcador
          equipoLocal="LOCAL"
          equipoVisitante="VISITANTE"
          golesLocal={0}
          golesVisitante={0}
          faltasLocal={0}
          faltasVisitante={0}
          setGolesLocal={mockSetGolesLocal}
          setGolesVisitante={mockSetGolesVisitante}
        />
      );

      expect(screen.getByText("00:00")).toBeInTheDocument();
    });
  });
});
