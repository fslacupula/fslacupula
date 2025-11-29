import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useEventos } from "../useEventos";
import type {
  IEntrenamientoRepository,
  IPartidoRepository,
} from "../../interfaces";
import type { Entrenamiento, Partido } from "@domain";

// Mock de los repositorios
const mockEntrenamientoRepo: Partial<IEntrenamientoRepository> = {
  listar: vi.fn(),
  crear: vi.fn(),
  actualizar: vi.fn(),
  eliminar: vi.fn(),
};

const mockPartidoRepo: Partial<IPartidoRepository> = {
  listar: vi.fn(),
  crear: vi.fn(),
  actualizar: vi.fn(),
  eliminar: vi.fn(),
};

describe("useEventos", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("cargar eventos", () => {
    it("debe cargar entrenamientos exitosamente", async () => {
      const mockEntrenamientos: Entrenamiento[] = [
        {
          id: 1,
          fecha: "2024-01-15",
          hora: "18:00",
          lugar: "Campo 1",
          notas: "Entrenamiento normal",
        },
        {
          id: 2,
          fecha: "2024-01-17",
          hora: "19:00",
          lugar: "Campo 2",
          notas: "Táctica",
        },
      ];

      vi.mocked(mockEntrenamientoRepo.listar).mockResolvedValue(
        mockEntrenamientos
      );
      vi.mocked(mockPartidoRepo.listar).mockResolvedValue([]);

      const { result } = renderHook(() =>
        useEventos(
          mockEntrenamientoRepo as IEntrenamientoRepository,
          mockPartidoRepo as IPartidoRepository
        )
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.entrenamientos).toHaveLength(2);
      expect(result.current.entrenamientos[0].id).toBe(1);
      expect(mockEntrenamientoRepo.listar).toHaveBeenCalled();
    });

    it("debe cargar partidos exitosamente", async () => {
      const mockPartidos: Partido[] = [
        {
          id: 1,
          fecha: "2024-01-20",
          hora: "20:00",
          lugar: "Estadio Central",
          rival: "Equipo A",
          tipo: "liga",
        },
      ];

      vi.mocked(mockEntrenamientoRepo.listar).mockResolvedValue([]);
      vi.mocked(mockPartidoRepo.listar).mockResolvedValue(mockPartidos);

      const { result } = renderHook(() =>
        useEventos(
          mockEntrenamientoRepo as IEntrenamientoRepository,
          mockPartidoRepo as IPartidoRepository
        )
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.partidos).toHaveLength(1);
      expect(result.current.partidos[0].rival).toBe("Equipo A");
      expect(mockPartidoRepo.listar).toHaveBeenCalled();
    });

    it("debe manejar error al cargar eventos", async () => {
      vi.mocked(mockEntrenamientoRepo.listar).mockRejectedValue(
        new Error("Error de red")
      );

      const { result } = renderHook(() =>
        useEventos(
          mockEntrenamientoRepo as IEntrenamientoRepository,
          mockPartidoRepo as IPartidoRepository
        )
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBe("Error de red");
    });
  });

  describe("crear eventos", () => {
    it("debe crear entrenamiento", async () => {
      const nuevoEntrenamiento: Omit<Entrenamiento, "id"> = {
        fecha: "2024-01-25",
        hora: "18:00",
        lugar: "Campo 3",
        notas: "Nuevo entrenamiento",
      };

      const entrenamientoCreado: Entrenamiento = {
        id: 3,
        ...nuevoEntrenamiento,
      };

      vi.mocked(mockEntrenamientoRepo.crear).mockResolvedValue(
        entrenamientoCreado
      );
      vi.mocked(mockEntrenamientoRepo.listar).mockResolvedValue([]);
      vi.mocked(mockPartidoRepo.listar).mockResolvedValue([]);

      const { result } = renderHook(() =>
        useEventos(
          mockEntrenamientoRepo as IEntrenamientoRepository,
          mockPartidoRepo as IPartidoRepository
        )
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await result.current.crearEntrenamiento(nuevoEntrenamiento);

      expect(mockEntrenamientoRepo.crear).toHaveBeenCalledWith(
        nuevoEntrenamiento
      );
    });

    it("debe crear partido", async () => {
      const nuevoPartido: Omit<Partido, "id"> = {
        fecha: "2024-01-28",
        hora: "20:00",
        lugar: "Estadio",
        rival: "Equipo B",
        tipo: "amistoso",
      };

      const partidoCreado: Partido = {
        id: 2,
        ...nuevoPartido,
      };

      vi.mocked(mockPartidoRepo.crear).mockResolvedValue(partidoCreado);
      vi.mocked(mockEntrenamientoRepo.listar).mockResolvedValue([]);
      vi.mocked(mockPartidoRepo.listar).mockResolvedValue([]);

      const { result } = renderHook(() =>
        useEventos(
          mockEntrenamientoRepo as IEntrenamientoRepository,
          mockPartidoRepo as IPartidoRepository
        )
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await result.current.crearPartido(nuevoPartido);

      expect(mockPartidoRepo.crear).toHaveBeenCalledWith(nuevoPartido);
    });
  });

  describe("actualizar eventos", () => {
    it("debe actualizar entrenamiento", async () => {
      const entrenamientoActualizado: Entrenamiento = {
        id: 1,
        fecha: "2024-01-15",
        hora: "19:00", // Hora cambiada
        lugar: "Campo 1",
        notas: "Actualizado",
      };

      vi.mocked(mockEntrenamientoRepo.actualizar).mockResolvedValue(
        entrenamientoActualizado
      );
      vi.mocked(mockEntrenamientoRepo.listar).mockResolvedValue([]);
      vi.mocked(mockPartidoRepo.listar).mockResolvedValue([]);

      const { result } = renderHook(() =>
        useEventos(
          mockEntrenamientoRepo as IEntrenamientoRepository,
          mockPartidoRepo as IPartidoRepository
        )
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await result.current.actualizarEntrenamiento(1, entrenamientoActualizado);

      expect(mockEntrenamientoRepo.actualizar).toHaveBeenCalledWith(
        1,
        entrenamientoActualizado
      );
    });

    it("debe actualizar partido", async () => {
      const partidoActualizado: Partido = {
        id: 1,
        fecha: "2024-01-20",
        hora: "21:00",
        lugar: "Estadio Central",
        rival: "Equipo A Modified",
        tipo: "liga",
      };

      vi.mocked(mockPartidoRepo.actualizar).mockResolvedValue(
        partidoActualizado
      );
      vi.mocked(mockEntrenamientoRepo.listar).mockResolvedValue([]);
      vi.mocked(mockPartidoRepo.listar).mockResolvedValue([]);

      const { result } = renderHook(() =>
        useEventos(
          mockEntrenamientoRepo as IEntrenamientoRepository,
          mockPartidoRepo as IPartidoRepository
        )
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await result.current.actualizarPartido(1, partidoActualizado);

      expect(mockPartidoRepo.actualizar).toHaveBeenCalledWith(
        1,
        partidoActualizado
      );
    });
  });

  describe("eliminar eventos", () => {
    it("debe eliminar entrenamiento", async () => {
      vi.mocked(mockEntrenamientoRepo.eliminar).mockResolvedValue(undefined);
      vi.mocked(mockEntrenamientoRepo.listar).mockResolvedValue([]);
      vi.mocked(mockPartidoRepo.listar).mockResolvedValue([]);

      const { result } = renderHook(() =>
        useEventos(
          mockEntrenamientoRepo as IEntrenamientoRepository,
          mockPartidoRepo as IPartidoRepository
        )
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await result.current.eliminarEntrenamiento(1);

      expect(mockEntrenamientoRepo.eliminar).toHaveBeenCalledWith(1);
    });

    it("debe eliminar partido", async () => {
      vi.mocked(mockPartidoRepo.eliminar).mockResolvedValue(undefined);
      vi.mocked(mockEntrenamientoRepo.listar).mockResolvedValue([]);
      vi.mocked(mockPartidoRepo.listar).mockResolvedValue([]);

      const { result } = renderHook(() =>
        useEventos(
          mockEntrenamientoRepo as IEntrenamientoRepository,
          mockPartidoRepo as IPartidoRepository
        )
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await result.current.eliminarPartido(1);

      expect(mockPartidoRepo.eliminar).toHaveBeenCalledWith(1);
    });
  });
});
