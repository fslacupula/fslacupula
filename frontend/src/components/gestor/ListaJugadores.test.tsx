import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ListaJugadores } from "./ListaJugadores";
import userEvent from "@testing-library/user-event";

interface Usuario {
  id: number;
  nombre: string;
  email: string;
  activo: boolean;
}

describe("ListaJugadores", () => {
  const mockOnToggleEstado = vi.fn();

  const jugadoresActivos: Usuario[] = [
    { id: 1, nombre: "Juan Pérez", email: "juan@test.com", activo: true },
    { id: 2, nombre: "María García", email: "maria@test.com", activo: true },
  ];

  const jugadoresMixtos: Usuario[] = [
    { id: 1, nombre: "Juan Pérez", email: "juan@test.com", activo: true },
    { id: 2, nombre: "María García", email: "maria@test.com", activo: false },
    { id: 3, nombre: "Pedro López", email: "pedro@test.com", activo: true },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Estado vacío", () => {
    it("debe mostrar mensaje cuando no hay jugadores", () => {
      render(
        <ListaJugadores jugadores={[]} onToggleEstado={mockOnToggleEstado} />
      );

      expect(
        screen.getByText("No hay jugadores registrados")
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Crea un nuevo jugador usando el botón/i)
      ).toBeInTheDocument();
    });

    it("no debe mostrar botones cuando no hay jugadores", () => {
      render(
        <ListaJugadores jugadores={[]} onToggleEstado={mockOnToggleEstado} />
      );

      expect(
        screen.queryByRole("button", { name: /desactivar/i })
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: /activar/i })
      ).not.toBeInTheDocument();
    });
  });

  describe("Renderizado de jugadores", () => {
    it("debe mostrar todos los jugadores activos", () => {
      render(
        <ListaJugadores
          jugadores={jugadoresActivos}
          onToggleEstado={mockOnToggleEstado}
        />
      );

      expect(screen.getByText("Juan Pérez")).toBeInTheDocument();
      expect(screen.getByText("juan@test.com")).toBeInTheDocument();
      expect(screen.getByText("María García")).toBeInTheDocument();
      expect(screen.getByText("maria@test.com")).toBeInTheDocument();
    });

    it("debe mostrar estado activo correctamente", () => {
      render(
        <ListaJugadores
          jugadores={[jugadoresActivos[0]]}
          onToggleEstado={mockOnToggleEstado}
        />
      );

      const badges = screen.getAllByText("Activo");
      expect(badges.length).toBeGreaterThan(0);
      expect(badges[0]).toHaveClass("bg-green-100", "text-green-800");
    });

    it("debe mostrar estado inactivo correctamente", () => {
      render(
        <ListaJugadores
          jugadores={[jugadoresMixtos[1]]}
          onToggleEstado={mockOnToggleEstado}
        />
      );

      expect(screen.getByText("Inactivo")).toBeInTheDocument();
      expect(screen.getByText("Inactivo")).toHaveClass(
        "bg-gray-100",
        "text-gray-800"
      );
    });

    it("debe aplicar opacidad reducida a jugadores inactivos", () => {
      const { container } = render(
        <ListaJugadores
          jugadores={jugadoresMixtos}
          onToggleEstado={mockOnToggleEstado}
        />
      );

      const cards = container.querySelectorAll(".border.rounded-lg");
      expect(cards[1]).toHaveClass("opacity-60"); // María García está inactiva
    });

    it("debe aplicar borde verde a jugadores activos", () => {
      const { container } = render(
        <ListaJugadores
          jugadores={jugadoresActivos}
          onToggleEstado={mockOnToggleEstado}
        />
      );

      const cards = container.querySelectorAll(".border.rounded-lg");
      expect(cards[0]).toHaveClass("border-green-200");
    });
  });

  describe("Botones de toggle", () => {
    it("debe mostrar botón 'Desactivar' para jugadores activos", () => {
      render(
        <ListaJugadores
          jugadores={[jugadoresActivos[0]]}
          onToggleEstado={mockOnToggleEstado}
        />
      );

      const boton = screen.getByRole("button", { name: /desactivar/i });
      expect(boton).toBeInTheDocument();
      expect(boton).toHaveClass("bg-red-100", "text-red-700");
    });

    it("debe mostrar botón 'Activar' para jugadores inactivos", () => {
      render(
        <ListaJugadores
          jugadores={[jugadoresMixtos[1]]}
          onToggleEstado={mockOnToggleEstado}
        />
      );

      const boton = screen.getByRole("button", { name: /activar/i });
      expect(boton).toBeInTheDocument();
      expect(boton).toHaveClass("bg-green-100", "text-green-700");
    });

    it("debe llamar onToggleEstado con parámetros correctos al desactivar", async () => {
      const user = userEvent.setup();
      render(
        <ListaJugadores
          jugadores={[jugadoresActivos[0]]}
          onToggleEstado={mockOnToggleEstado}
        />
      );

      const boton = screen.getByRole("button", { name: /desactivar/i });
      await user.click(boton);

      expect(mockOnToggleEstado).toHaveBeenCalledTimes(1);
      expect(mockOnToggleEstado).toHaveBeenCalledWith(1, true);
    });

    it("debe llamar onToggleEstado con parámetros correctos al activar", async () => {
      const user = userEvent.setup();
      render(
        <ListaJugadores
          jugadores={[jugadoresMixtos[1]]}
          onToggleEstado={mockOnToggleEstado}
        />
      );

      const boton = screen.getByRole("button", { name: /activar/i });
      await user.click(boton);

      expect(mockOnToggleEstado).toHaveBeenCalledTimes(1);
      expect(mockOnToggleEstado).toHaveBeenCalledWith(2, false);
    });
  });

  describe("Múltiples jugadores", () => {
    it("debe renderizar todos los jugadores en una lista", () => {
      render(
        <ListaJugadores
          jugadores={jugadoresMixtos}
          onToggleEstado={mockOnToggleEstado}
        />
      );

      expect(screen.getByText("Juan Pérez")).toBeInTheDocument();
      expect(screen.getByText("María García")).toBeInTheDocument();
      expect(screen.getByText("Pedro López")).toBeInTheDocument();
    });

    it("debe manejar clicks en diferentes botones correctamente", async () => {
      const user = userEvent.setup();
      render(
        <ListaJugadores
          jugadores={jugadoresMixtos}
          onToggleEstado={mockOnToggleEstado}
        />
      );

      const botonesDesactivar = screen.getAllByRole("button", {
        name: /desactivar/i,
      });
      const botonActivar = screen.getByRole("button", { name: /activar/i });

      // Desactivar Juan
      await user.click(botonesDesactivar[0]);
      expect(mockOnToggleEstado).toHaveBeenCalledWith(1, true);

      // Activar María
      await user.click(botonActivar);
      expect(mockOnToggleEstado).toHaveBeenCalledWith(2, false);

      // Desactivar Pedro
      await user.click(botonesDesactivar[1]);
      expect(mockOnToggleEstado).toHaveBeenCalledWith(3, true);

      expect(mockOnToggleEstado).toHaveBeenCalledTimes(3);
    });
  });

  describe("Responsive layout", () => {
    it("debe usar grid layout para múltiples jugadores", () => {
      const { container } = render(
        <ListaJugadores
          jugadores={jugadoresActivos}
          onToggleEstado={mockOnToggleEstado}
        />
      );

      const grid = container.querySelector(".grid");
      expect(grid).toHaveClass(
        "grid-cols-1",
        "md:grid-cols-2",
        "lg:grid-cols-3"
      );
    });
  });

  describe("Edge cases", () => {
    it("debe manejar jugador con nombre muy largo", () => {
      const jugadorNombreLargo: Usuario[] = [
        {
          id: 1,
          nombre: "Juan Carlos Pedro Antonio de la Fuente García López",
          email: "juancarlos@test.com",
          activo: true,
        },
      ];

      render(
        <ListaJugadores
          jugadores={jugadorNombreLargo}
          onToggleEstado={mockOnToggleEstado}
        />
      );

      expect(
        screen.getByText("Juan Carlos Pedro Antonio de la Fuente García López")
      ).toBeInTheDocument();
    });

    it("debe manejar email muy largo", () => {
      const jugadorEmailLargo: Usuario[] = [
        {
          id: 1,
          nombre: "Test User",
          email: "usuario.con.email.muy.largo.de.prueba@dominio.ejemplo.com",
          activo: true,
        },
      ];

      render(
        <ListaJugadores
          jugadores={jugadorEmailLargo}
          onToggleEstado={mockOnToggleEstado}
        />
      );

      expect(
        screen.getByText(
          "usuario.con.email.muy.largo.de.prueba@dominio.ejemplo.com"
        )
      ).toBeInTheDocument();
    });

    it("debe mantener estado correcto después de múltiples operaciones", async () => {
      const user = userEvent.setup();
      const { rerender } = render(
        <ListaJugadores
          jugadores={jugadoresActivos}
          onToggleEstado={mockOnToggleEstado}
        />
      );

      // Primera operación
      const primerBoton = screen.getAllByRole("button", {
        name: /desactivar/i,
      })[0];
      await user.click(primerBoton);

      // Simular actualización del estado
      const jugadoresActualizados = [...jugadoresActivos];
      jugadoresActualizados[0] = { ...jugadoresActualizados[0], activo: false };

      rerender(
        <ListaJugadores
          jugadores={jugadoresActualizados}
          onToggleEstado={mockOnToggleEstado}
        />
      );

      expect(
        screen.getByRole("button", { name: /activar/i })
      ).toBeInTheDocument();
      expect(
        screen.getAllByRole("button", { name: /desactivar/i })
      ).toHaveLength(1);
    });
  });
});
