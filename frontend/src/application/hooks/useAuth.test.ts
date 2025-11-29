import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useAuth } from "../useAuth";
import { auth } from "../../../services/api";
import type { Usuario } from "@domain";

// Mock del módulo api
vi.mock("../../../services/api", () => ({
  auth: {
    login: vi.fn(),
    register: vi.fn(),
    profile: vi.fn(),
  },
}));

// Mock de useAuthContext
const mockLogin = vi.fn();
const mockLogout = vi.fn();
const mockUpdateUsuario = vi.fn();

vi.mock("@contexts", () => ({
  useAuthContext: () => ({
    usuario: null,
    isLoading: false,
    isAuthenticated: false,
    login: mockLogin,
    logout: mockLogout,
    updateUsuario: mockUpdateUsuario,
  }),
}));

describe("useAuth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe("login", () => {
    it("debe hacer login exitosamente", async () => {
      const mockUsuario: Usuario = {
        id: 1,
        nombre: "Juan Pérez",
        email: "juan@test.com",
        rol: "jugador",
        activo: true,
      };

      const mockResponse = {
        data: {
          token: "test-token",
          usuario: mockUsuario,
        },
      };

      vi.mocked(auth.login).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useAuth());

      const credentials = { email: "juan@test.com", password: "password123" };
      await result.current.login(credentials);

      expect(auth.login).toHaveBeenCalledWith(credentials);
      expect(localStorage.getItem("token")).toBe("test-token");
      expect(mockLogin).toHaveBeenCalledWith(mockUsuario);
    });

    it("debe lanzar error en login fallido", async () => {
      const error = new Error("Credenciales inválidas");
      vi.mocked(auth.login).mockRejectedValue(error);

      const { result } = renderHook(() => useAuth());

      await expect(
        result.current.login({ email: "wrong@test.com", password: "wrong" })
      ).rejects.toThrow("Credenciales inválidas");

      expect(localStorage.getItem("token")).toBeNull();
      expect(mockLogin).not.toHaveBeenCalled();
    });
  });

  describe("register", () => {
    it("debe registrar usuario exitosamente", async () => {
      const mockUsuario: Usuario = {
        id: 1,
        nombre: "Nuevo Usuario",
        email: "nuevo@test.com",
        rol: "jugador",
        activo: true,
      };

      const mockResponse = {
        data: {
          token: "new-token",
          usuario: mockUsuario,
        },
      };

      vi.mocked(auth.register).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useAuth());

      const registerData = {
        nombre: "Nuevo Usuario",
        email: "nuevo@test.com",
        password: "password123",
        rol: "jugador" as const,
      };

      await result.current.register(registerData);

      expect(auth.register).toHaveBeenCalledWith(registerData);
      expect(localStorage.getItem("token")).toBe("new-token");
      expect(mockLogin).toHaveBeenCalledWith(mockUsuario);
    });

    it("debe lanzar error en registro fallido", async () => {
      const error = new Error("Email ya existe");
      vi.mocked(auth.register).mockRejectedValue(error);

      const { result } = renderHook(() => useAuth());

      const registerData = {
        nombre: "Usuario",
        email: "existe@test.com",
        password: "password123",
        rol: "jugador" as const,
      };

      await expect(result.current.register(registerData)).rejects.toThrow(
        "Email ya existe"
      );

      expect(localStorage.getItem("token")).toBeNull();
      expect(mockLogin).not.toHaveBeenCalled();
    });
  });

  describe("logout", () => {
    it("debe hacer logout correctamente", async () => {
      localStorage.setItem("token", "test-token");

      const { result } = renderHook(() => useAuth());

      result.current.logout();

      expect(localStorage.getItem("token")).toBeNull();
      expect(mockLogout).toHaveBeenCalled();
    });
  });

  describe("loadUser", () => {
    it("debe cargar usuario desde token", async () => {
      const mockUsuario: Usuario = {
        id: 1,
        nombre: "Juan Pérez",
        email: "juan@test.com",
        rol: "jugador",
        activo: true,
      };

      vi.mocked(auth.profile).mockResolvedValue({
        data: { usuario: mockUsuario },
      });

      localStorage.setItem("token", "valid-token");

      const { result } = renderHook(() => useAuth());

      await result.current.loadUser();

      expect(auth.profile).toHaveBeenCalled();
      expect(mockLogin).toHaveBeenCalledWith(mockUsuario);
    });

    it("debe manejar error al cargar usuario", async () => {
      vi.mocked(auth.profile).mockRejectedValue(new Error("Token inválido"));

      localStorage.setItem("token", "invalid-token");

      const { result } = renderHook(() => useAuth());

      await expect(result.current.loadUser()).rejects.toThrow("Token inválido");
      expect(localStorage.getItem("token")).toBeNull();
    });

    it("no debe hacer nada si no hay token", async () => {
      const { result } = renderHook(() => useAuth());

      await result.current.loadUser();

      expect(auth.profile).not.toHaveBeenCalled();
      expect(mockLogin).not.toHaveBeenCalled();
    });
  });
});
