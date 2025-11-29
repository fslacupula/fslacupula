import { renderHook, act, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  useAsistencias,
  useMiAsistencia,
  useAsistenciasGestor,
} from "./useAsistencias";
import * as useAuthModule from "./useAuth";
import api from "../../services/api";
import { EstadoAsistencia } from "@domain";

// Mock de dependencias
vi.mock("./useAuth");
vi.mock("../../services/api");

const mockUsuario = {
  id: 1,
  nombre: "Test User",
  email: "test@test.com",
  rol: "jugador",
};

describe("useAsistencias", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(useAuthModule, "useAuth").mockReturnValue({
      usuario: mockUsuario,
      login: vi.fn(),
      logout: vi.fn(),
      isLoading: false,
      error: null,
    } as any);
  });

  describe("registrar", () => {
    it("debe registrar asistencia confirmada para entrenamiento", async () => {
      const mockRegistrar = vi.fn().mockResolvedValue({});
      vi.mocked(api.entrenamientos.registrarAsistencia).mockImplementation(
        mockRegistrar
      );

      const { result } = renderHook(() => useAsistencias());

      await act(async () => {
        await result.current.registrar({
          eventoId: 1,
          tipoEvento: "entrenamiento",
          estado: "confirmado",
        });
      });

      expect(mockRegistrar).toHaveBeenCalledWith(1, {
        estado: "confirmado",
        motivoAusenciaId: undefined,
        comentario: undefined,
      });
      expect(result.current.error).toBeNull();
    });

    it("debe registrar asistencia ausente con motivo para partido", async () => {
      const mockRegistrar = vi.fn().mockResolvedValue({});
      vi.mocked(api.partidos.registrarAsistencia).mockImplementation(
        mockRegistrar
      );

      const { result } = renderHook(() => useAsistencias());

      await act(async () => {
        await result.current.registrar({
          eventoId: 2,
          tipoEvento: "partido",
          estado: "ausente",
          motivoAusenciaId: 1,
          comentario: "Lesionado",
        });
      });

      expect(mockRegistrar).toHaveBeenCalledWith(2, {
        estado: "ausente",
        motivoAusenciaId: 1,
        comentario: "Lesionado",
      });
    });

    it("debe lanzar error si no hay usuario autenticado", async () => {
      vi.spyOn(useAuthModule, "useAuth").mockReturnValue({
        usuario: null,
        login: vi.fn(),
        logout: vi.fn(),
        isLoading: false,
        error: null,
      } as any);

      const { result } = renderHook(() => useAsistencias());

      await expect(
        result.current.registrar({
          eventoId: 1,
          tipoEvento: "entrenamiento",
          estado: "confirmado",
        })
      ).rejects.toThrow("Debes estar autenticado para registrar asistencia");
    });

    it("debe lanzar error si estado es ausente sin motivo", async () => {
      const { result } = renderHook(() => useAsistencias());

      await expect(
        result.current.registrar({
          eventoId: 1,
          tipoEvento: "entrenamiento",
          estado: "ausente",
        })
      ).rejects.toThrow("Debes seleccionar un motivo de ausencia");
    });

    it("debe manejar errores del API", async () => {
      const mockError = new Error("API Error");
      vi.mocked(api.entrenamientos.registrarAsistencia).mockRejectedValue(
        mockError
      );

      const { result } = renderHook(() => useAsistencias());

      await expect(
        result.current.registrar({
          eventoId: 1,
          tipoEvento: "entrenamiento",
          estado: "confirmado",
        })
      ).rejects.toThrow("API Error");

      expect(result.current.error).toBe("Error al registrar asistencia");
    });
  });

  describe("confirmar", () => {
    it("debe confirmar asistencia sin comentario", async () => {
      const mockRegistrar = vi.fn().mockResolvedValue({});
      vi.mocked(api.entrenamientos.registrarAsistencia).mockImplementation(
        mockRegistrar
      );

      const { result } = renderHook(() => useAsistencias());

      await act(async () => {
        await result.current.confirmar(1, "entrenamiento");
      });

      expect(mockRegistrar).toHaveBeenCalledWith(1, {
        estado: EstadoAsistencia.CONFIRMADO,
        motivoAusenciaId: undefined,
        comentario: undefined,
      });
    });

    it("debe confirmar asistencia con comentario", async () => {
      const mockRegistrar = vi.fn().mockResolvedValue({});
      vi.mocked(api.partidos.registrarAsistencia).mockImplementation(
        mockRegistrar
      );

      const { result } = renderHook(() => useAsistencias());

      await act(async () => {
        await result.current.confirmar(2, "partido", "Llegaré temprano");
      });

      expect(mockRegistrar).toHaveBeenCalledWith(2, {
        estado: EstadoAsistencia.CONFIRMADO,
        motivoAusenciaId: undefined,
        comentario: "Llegaré temprano",
      });
    });
  });

  describe("declinar", () => {
    it("debe declinar asistencia con motivo", async () => {
      const mockRegistrar = vi.fn().mockResolvedValue({});
      vi.mocked(api.entrenamientos.registrarAsistencia).mockImplementation(
        mockRegistrar
      );

      const { result } = renderHook(() => useAsistencias());

      await act(async () => {
        await result.current.declinar(
          1,
          "entrenamiento",
          2,
          "Me duele la rodilla"
        );
      });

      expect(mockRegistrar).toHaveBeenCalledWith(1, {
        estado: EstadoAsistencia.AUSENTE,
        motivoAusenciaId: 2,
        comentario: "Me duele la rodilla",
      });
    });

    it("debe lanzar error si no se proporciona motivo", async () => {
      const { result } = renderHook(() => useAsistencias());

      await expect(
        result.current.declinar(1, "entrenamiento", 0)
      ).rejects.toThrow("Debes seleccionar un motivo de ausencia");
    });
  });

  describe("marcarPendiente", () => {
    it("debe marcar asistencia como pendiente", async () => {
      const mockRegistrar = vi.fn().mockResolvedValue({});
      vi.mocked(api.entrenamientos.registrarAsistencia).mockImplementation(
        mockRegistrar
      );

      const { result } = renderHook(() => useAsistencias());

      await act(async () => {
        await result.current.marcarPendiente(1, "entrenamiento");
      });

      expect(mockRegistrar).toHaveBeenCalledWith(1, {
        estado: EstadoAsistencia.PENDIENTE,
        motivoAusenciaId: undefined,
        comentario: undefined,
      });
    });
  });

  describe("actualizarComoGestor", () => {
    it("debe actualizar asistencia de entrenamiento como gestor", async () => {
      const mockActualizar = vi.fn().mockResolvedValue({});
      vi.mocked(
        api.entrenamientos.actualizarAsistenciaGestor
      ).mockImplementation(mockActualizar);

      const { result } = renderHook(() => useAsistencias());

      await act(async () => {
        await result.current.actualizarComoGestor(
          5,
          1,
          "entrenamiento",
          "confirmado"
        );
      });

      expect(mockActualizar).toHaveBeenCalledWith(1, 5, {
        estado: "confirmado",
        motivoAusenciaId: undefined,
        comentario: undefined,
      });
    });

    it("debe actualizar asistencia de partido como gestor", async () => {
      const mockActualizar = vi.fn().mockResolvedValue({});
      vi.mocked(api.partidos.actualizarAsistenciaGestor).mockImplementation(
        mockActualizar
      );

      const { result } = renderHook(() => useAsistencias());

      await act(async () => {
        await result.current.actualizarComoGestor(
          5,
          2,
          "partido",
          "ausente",
          1,
          "Lesión confirmada"
        );
      });

      expect(mockActualizar).toHaveBeenCalledWith(2, 5, {
        estado: "ausente",
        motivoAusenciaId: 1,
        comentario: "Lesión confirmada",
      });
    });

    it("debe manejar errores al actualizar como gestor", async () => {
      const mockError = new Error("Forbidden");
      vi.mocked(
        api.entrenamientos.actualizarAsistenciaGestor
      ).mockRejectedValue(mockError);

      const { result } = renderHook(() => useAsistencias());

      await expect(
        result.current.actualizarComoGestor(5, 1, "entrenamiento", "confirmado")
      ).rejects.toThrow("Forbidden");

      expect(result.current.error).toBe("Error al actualizar asistencia");
    });
  });

  describe("estados de loading y error", () => {
    it("debe actualizar isLoading durante operaciones", async () => {
      let resolvePromise: (value: any) => void;
      const promise = new Promise((resolve) => {
        resolvePromise = resolve;
      });

      vi.mocked(api.entrenamientos.registrarAsistencia).mockReturnValue(
        promise as any
      );

      const { result } = renderHook(() => useAsistencias());

      let registrarPromise: Promise<any>;
      act(() => {
        registrarPromise = result.current.registrar({
          eventoId: 1,
          tipoEvento: "entrenamiento",
          estado: "confirmado",
        });
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(true);
      });

      act(() => {
        resolvePromise!({});
      });

      await act(async () => {
        await registrarPromise!;
      });

      expect(result.current.isLoading).toBe(false);
    });
  });
});

describe("useMiAsistencia", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(useAuthModule, "useAuth").mockReturnValue({
      usuario: mockUsuario,
      login: vi.fn(),
      logout: vi.fn(),
      isLoading: false,
      error: null,
    } as any);
  });

  it("debe exponer solo métodos del jugador", () => {
    const { result } = renderHook(() => useMiAsistencia());

    expect(result.current).toHaveProperty("confirmar");
    expect(result.current).toHaveProperty("declinar");
    expect(result.current).toHaveProperty("marcarPendiente");
    expect(result.current).toHaveProperty("isLoading");
    expect(result.current).toHaveProperty("error");
    expect(result.current).not.toHaveProperty("registrar");
    expect(result.current).not.toHaveProperty("actualizarComoGestor");
  });
});

describe("useAsistenciasGestor", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(useAuthModule, "useAuth").mockReturnValue({
      usuario: mockUsuario,
      login: vi.fn(),
      logout: vi.fn(),
      isLoading: false,
      error: null,
    } as any);
  });

  it("debe exponer solo método de gestor", () => {
    const { result } = renderHook(() => useAsistenciasGestor());

    expect(result.current).toHaveProperty("actualizar");
    expect(result.current).toHaveProperty("isLoading");
    expect(result.current).toHaveProperty("error");
    expect(result.current).not.toHaveProperty("confirmar");
    expect(result.current).not.toHaveProperty("declinar");
  });

  it("debe permitir actualizar asistencias", async () => {
    const mockActualizar = vi.fn().mockResolvedValue({});
    vi.mocked(api.entrenamientos.actualizarAsistenciaGestor).mockImplementation(
      mockActualizar
    );

    const { result } = renderHook(() => useAsistenciasGestor());

    await act(async () => {
      await result.current.actualizar(5, 1, "entrenamiento", "confirmado");
    });

    expect(mockActualizar).toHaveBeenCalledWith(1, 5, {
      estado: "confirmado",
      motivoAusenciaId: undefined,
      comentario: undefined,
    });
  });
});
