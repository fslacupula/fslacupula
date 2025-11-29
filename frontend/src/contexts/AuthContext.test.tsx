import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { AuthProvider, useAuthContext } from "@contexts";
import { auth } from "../../services/api";

// Mock del módulo api
vi.mock("../../services/api", () => ({
  auth: {
    profile: vi.fn(),
  },
}));

// Componente de prueba que consume el contexto
function TestComponent() {
  const { usuario, isLoading, isAuthenticated, login, logout, updateUsuario } =
    useAuthContext();

  if (isLoading) return <div>Cargando...</div>;

  return (
    <div>
      <div data-testid="authenticated">{isAuthenticated ? "yes" : "no"}</div>
      <div data-testid="usuario">{usuario?.nombre || "null"}</div>
      <button
        onClick={() =>
          login({
            id: 1,
            nombre: "Test",
            email: "test@test.com",
            rol: "jugador",
          })
        }
      >
        Login
      </button>
      <button onClick={logout}>Logout</button>
      <button onClick={() => updateUsuario({ ...usuario!, nombre: "Updated" })}>
        Update
      </button>
    </div>
  );
}

describe("AuthContext", () => {
  beforeEach(() => {
    // Limpiar localStorage antes de cada test
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe("Initial Load", () => {
    it("debe renderizar en estado de carga inicialmente", () => {
      const mockProfile = vi.mocked(auth.profile);
      mockProfile.mockImplementation(
        () =>
          new Promise((resolve) => {
            // No resolver inmediatamente para capturar estado de carga
          })
      );

      localStorage.setItem("token", "test-token");

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      expect(screen.getByText("Cargando...")).toBeInTheDocument();
    });

    it("debe cargar usuario desde token válido", async () => {
      const mockUsuario = {
        id: 1,
        nombre: "Juan Pérez",
        email: "juan@test.com",
        rol: "jugador" as const,
        activo: true,
      };

      const mockProfile = vi.mocked(auth.profile);
      mockProfile.mockResolvedValue({
        data: { usuario: mockUsuario },
      });

      localStorage.setItem("token", "valid-token");

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId("usuario")).toHaveTextContent("Juan Pérez");
        expect(screen.getByTestId("authenticated")).toHaveTextContent("yes");
      });

      expect(mockProfile).toHaveBeenCalledTimes(1);
    });

    it("debe limpiar token inválido", async () => {
      const mockProfile = vi.mocked(auth.profile);
      mockProfile.mockRejectedValue(new Error("Invalid token"));

      localStorage.setItem("token", "invalid-token");

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId("usuario")).toHaveTextContent("null");
        expect(screen.getByTestId("authenticated")).toHaveTextContent("no");
      });

      expect(localStorage.getItem("token")).toBeNull();
    });

    it("debe iniciar sin usuario cuando no hay token", async () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId("usuario")).toHaveTextContent("null");
        expect(screen.getByTestId("authenticated")).toHaveTextContent("no");
      });
    });
  });

  describe("Login", () => {
    it("debe establecer usuario al hacer login", async () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId("usuario")).toHaveTextContent("null");
      });

      const loginButton = screen.getByText("Login");
      loginButton.click();

      await waitFor(() => {
        expect(screen.getByTestId("usuario")).toHaveTextContent("Test");
        expect(screen.getByTestId("authenticated")).toHaveTextContent("yes");
      });
    });
  });

  describe("Logout", () => {
    it("debe limpiar usuario y token al hacer logout", async () => {
      const mockUsuario = {
        id: 1,
        nombre: "Juan Pérez",
        email: "juan@test.com",
        rol: "jugador" as const,
      };

      const mockProfile = vi.mocked(auth.profile);
      mockProfile.mockResolvedValue({
        data: { usuario: mockUsuario },
      });

      localStorage.setItem("token", "valid-token");

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      // Esperar a que cargue el usuario
      await waitFor(() => {
        expect(screen.getByTestId("usuario")).toHaveTextContent("Juan Pérez");
      });

      // Hacer logout
      const logoutButton = screen.getByText("Logout");
      logoutButton.click();

      await waitFor(() => {
        expect(screen.getByTestId("usuario")).toHaveTextContent("null");
        expect(screen.getByTestId("authenticated")).toHaveTextContent("no");
        expect(localStorage.getItem("token")).toBeNull();
      });
    });
  });

  describe("Update Usuario", () => {
    it("debe actualizar datos del usuario", async () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      // Login primero
      const loginButton = screen.getByText("Login");
      loginButton.click();

      await waitFor(() => {
        expect(screen.getByTestId("usuario")).toHaveTextContent("Test");
      });

      // Actualizar usuario
      const updateButton = screen.getByText("Update");
      updateButton.click();

      await waitFor(() => {
        expect(screen.getByTestId("usuario")).toHaveTextContent("Updated");
      });
    });
  });

  describe("Error Handling", () => {
    it("debe lanzar error si useAuthContext se usa fuera del provider", () => {
      // Suprimir console.error para este test
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      expect(() => {
        render(<TestComponent />);
      }).toThrow("useAuthContext debe usarse dentro de un AuthProvider");

      consoleSpy.mockRestore();
    });
  });

  describe("isAuthenticated", () => {
    it("debe ser false cuando no hay usuario", async () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId("authenticated")).toHaveTextContent("no");
      });
    });

    it("debe ser true cuando hay usuario", async () => {
      const mockUsuario = {
        id: 1,
        nombre: "Juan Pérez",
        email: "juan@test.com",
        rol: "jugador" as const,
      };

      const mockProfile = vi.mocked(auth.profile);
      mockProfile.mockResolvedValue({
        data: { usuario: mockUsuario },
      });

      localStorage.setItem("token", "valid-token");

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId("authenticated")).toHaveTextContent("yes");
      });
    });
  });
});
