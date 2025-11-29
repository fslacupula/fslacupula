import { describe, test, expect, beforeEach } from "@jest/globals";
import { CrearPerfilJugadorUseCase } from "../../../src/application/useCases/jugador/CrearPerfilJugadorUseCase.js";
import { Usuario } from "../../../src/domain/entities/Usuario.js";
import { Jugador } from "../../../src/domain/entities/Jugador.js";
import { ValidationError } from "../../../src/domain/errors/index.js";

/**
 * Mock del Repositorio de Usuarios
 */
class MockUsuarioRepository {
  constructor() {
    this.usuarios = [];
    this.nextId = 1;
  }

  async findById(id) {
    return this.usuarios.find((u) => u.id === id) || null;
  }

  async create(usuario) {
    const usuarioConId = new Usuario({
      id: this.nextId++,
      email: usuario.email,
      password: usuario.password,
      nombre: usuario.nombre,
      rol: usuario.rol,
      activo: usuario.activo,
    });
    this.usuarios.push(usuarioConId);
    return usuarioConId;
  }

  reset() {
    this.usuarios = [];
    this.nextId = 1;
  }
}

/**
 * Mock del Repositorio de Jugadores
 */
class MockJugadorRepository {
  constructor() {
    this.jugadores = [];
    this.nextId = 1;
  }

  async findByUsuarioId(usuarioId) {
    return this.jugadores.find((j) => j.usuarioId === usuarioId) || null;
  }

  async existsByNumeroDorsal(numeroDorsal, excludeId = null) {
    return this.jugadores.some(
      (j) =>
        j.numeroDorsal === numeroDorsal && (!excludeId || j.id !== excludeId)
    );
  }

  async create(jugador) {
    const jugadorConId = new Jugador({
      id: this.nextId++,
      usuarioId: jugador.usuarioId,
      numeroDorsal: jugador.numeroDorsal,
      posicionId: jugador.posicionId,
      telefono: jugador.telefono,
      fechaNacimiento: jugador.fechaNacimiento,
      alias: jugador.alias,
      fotoUrl: jugador.fotoUrl,
    });
    this.jugadores.push(jugadorConId);
    return jugadorConId;
  }

  reset() {
    this.jugadores = [];
    this.nextId = 1;
  }
}

describe("CrearPerfilJugadorUseCase", () => {
  let mockUsuarioRepository;
  let mockJugadorRepository;
  let useCase;

  beforeEach(() => {
    mockUsuarioRepository = new MockUsuarioRepository();
    mockJugadorRepository = new MockJugadorRepository();
    useCase = new CrearPerfilJugadorUseCase(
      mockUsuarioRepository,
      mockJugadorRepository
    );
  });

  describe("constructor", () => {
    test("debe requerir usuarioRepository", () => {
      expect(
        () => new CrearPerfilJugadorUseCase(null, mockJugadorRepository)
      ).toThrow("usuarioRepository is required");
    });

    test("debe requerir jugadorRepository", () => {
      expect(
        () => new CrearPerfilJugadorUseCase(mockUsuarioRepository, null)
      ).toThrow("jugadorRepository is required");
    });

    test("debe crear instancia correctamente", () => {
      expect(useCase.usuarioRepository).toBe(mockUsuarioRepository);
      expect(useCase.jugadorRepository).toBe(mockJugadorRepository);
    });
  });

  describe("execute", () => {
    test("debe crear perfil de jugador básico correctamente", async () => {
      // Crear usuario jugador
      const usuario = await mockUsuarioRepository.create(
        new Usuario({
          id: null,
          email: "jugador@test.com",
          password: "Password123!",
          nombre: "Juan Pérez",
          rol: "jugador",
          activo: true,
        })
      );

      const resultado = await useCase.execute({
        usuarioId: usuario.id,
      });

      expect(resultado.id).toBeDefined();
      expect(resultado.usuarioId).toBe(usuario.id);
      expect(resultado.numeroDorsal).toBeNull();
      expect(resultado.posicionId).toBeNull();
    });

    test("debe crear perfil con dorsal y posición", async () => {
      const usuario = await mockUsuarioRepository.create(
        new Usuario({
          id: null,
          email: "jugador@test.com",
          password: "Password123!",
          nombre: "Juan Pérez",
          rol: "jugador",
          activo: true,
        })
      );

      const resultado = await useCase.execute({
        usuarioId: usuario.id,
        numeroDorsal: 10,
        posicionId: 1,
      });

      expect(resultado.numeroDorsal).toBe(10);
      expect(resultado.posicionId).toBe(1);
    });

    test("debe crear perfil con todos los datos", async () => {
      const usuario = await mockUsuarioRepository.create(
        new Usuario({
          id: null,
          email: "jugador@test.com",
          password: "Password123!",
          nombre: "Juan Pérez",
          rol: "jugador",
          activo: true,
        })
      );

      const fechaNacimiento = new Date("1995-05-15");

      const resultado = await useCase.execute({
        usuarioId: usuario.id,
        numeroDorsal: 10,
        posicionId: 1,
        telefono: "+34600123456",
        fechaNacimiento,
        alias: "Juanito",
        fotoUrl: "http://example.com/foto.jpg",
      });

      expect(resultado.numeroDorsal).toBe(10);
      expect(resultado.posicionId).toBe(1);
      expect(resultado.telefono).toBe("+34600123456");
      expect(resultado.fechaNacimiento).toEqual(fechaNacimiento);
      expect(resultado.alias).toBe("Juanito");
      expect(resultado.fotoUrl).toBe("http://example.com/foto.jpg");
    });

    test("debe lanzar error si usuario no existe", async () => {
      await expect(useCase.execute({ usuarioId: 999 })).rejects.toThrow(
        ValidationError
      );

      await expect(useCase.execute({ usuarioId: 999 })).rejects.toThrow(
        "Usuario no encontrado"
      );
    });

    test("debe lanzar error si usuario no es jugador", async () => {
      const gestor = await mockUsuarioRepository.create(
        new Usuario({
          id: null,
          email: "gestor@test.com",
          password: "Password123!",
          nombre: "Gestor Test",
          rol: "gestor",
          activo: true,
        })
      );

      await expect(useCase.execute({ usuarioId: gestor.id })).rejects.toThrow(
        ValidationError
      );

      await expect(useCase.execute({ usuarioId: gestor.id })).rejects.toThrow(
        "El usuario no tiene rol de jugador"
      );
    });

    test("debe lanzar error si usuario ya tiene perfil de jugador", async () => {
      const usuario = await mockUsuarioRepository.create(
        new Usuario({
          id: null,
          email: "jugador@test.com",
          password: "Password123!",
          nombre: "Juan Pérez",
          rol: "jugador",
          activo: true,
        })
      );

      // Crear perfil primera vez
      await useCase.execute({ usuarioId: usuario.id });

      // Intentar crear perfil de nuevo
      await expect(useCase.execute({ usuarioId: usuario.id })).rejects.toThrow(
        ValidationError
      );

      await expect(useCase.execute({ usuarioId: usuario.id })).rejects.toThrow(
        "El usuario ya tiene un perfil de jugador"
      );
    });

    test("debe lanzar error si dorsal ya está en uso", async () => {
      const usuario1 = await mockUsuarioRepository.create(
        new Usuario({
          id: null,
          email: "jugador1@test.com",
          password: "Password123!",
          nombre: "Jugador Uno",
          rol: "jugador",
          activo: true,
        })
      );

      const usuario2 = await mockUsuarioRepository.create(
        new Usuario({
          id: null,
          email: "jugador2@test.com",
          password: "Password123!",
          nombre: "Jugador Dos",
          rol: "jugador",
          activo: true,
        })
      );

      // Crear primer jugador con dorsal 10
      await useCase.execute({
        usuarioId: usuario1.id,
        numeroDorsal: 10,
      });

      // Intentar crear segundo jugador con mismo dorsal
      await expect(
        useCase.execute({
          usuarioId: usuario2.id,
          numeroDorsal: 10,
        })
      ).rejects.toThrow(ValidationError);

      await expect(
        useCase.execute({
          usuarioId: usuario2.id,
          numeroDorsal: 10,
        })
      ).rejects.toThrow("El dorsal 10 ya está en uso");
    });

    test("debe permitir crear perfiles sin dorsal", async () => {
      const usuario1 = await mockUsuarioRepository.create(
        new Usuario({
          id: null,
          email: "jugador1@test.com",
          password: "Password123!",
          nombre: "Jugador Uno",
          rol: "jugador",
          activo: true,
        })
      );

      const usuario2 = await mockUsuarioRepository.create(
        new Usuario({
          id: null,
          email: "jugador2@test.com",
          password: "Password123!",
          nombre: "Jugador Dos",
          rol: "jugador",
          activo: true,
        })
      );

      const jugador1 = await useCase.execute({ usuarioId: usuario1.id });
      const jugador2 = await useCase.execute({ usuarioId: usuario2.id });

      expect(jugador1.numeroDorsal).toBeNull();
      expect(jugador2.numeroDorsal).toBeNull();
      expect(mockJugadorRepository.jugadores.length).toBe(2);
    });
  });
});
