import { describe, test, expect, beforeEach } from "@jest/globals";
import { ObtenerUsuarioPorIdUseCase } from "../../../src/application/useCases/usuario/ObtenerUsuarioPorIdUseCase.js";
import { Usuario } from "../../../src/domain/entities/index.js";
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

describe("ObtenerUsuarioPorIdUseCase", () => {
  let mockRepository;
  let useCase;

  beforeEach(() => {
    mockRepository = new MockUsuarioRepository();
    useCase = new ObtenerUsuarioPorIdUseCase(mockRepository);
  });

  describe("constructor", () => {
    test("debe requerir usuarioRepository", () => {
      expect(() => new ObtenerUsuarioPorIdUseCase(null)).toThrow(
        "usuarioRepository is required"
      );
    });

    test("debe crear instancia correctamente", () => {
      expect(useCase.usuarioRepository).toBe(mockRepository);
    });
  });

  describe("execute", () => {
    test("debe obtener usuario por ID correctamente", async () => {
      const usuarioCreado = await mockRepository.create(
        new Usuario({
          id: null,
          email: "test@test.com",
          password: "Password123!",
          nombre: "Usuario Test",
          rol: "jugador",
          activo: true,
        })
      );

      const resultado = await useCase.execute(usuarioCreado.id);

      expect(resultado.id).toBe(usuarioCreado.id);
      expect(resultado.email).toBe("test@test.com");
      expect(resultado.nombre).toBe("Usuario Test");
      expect(resultado.rol).toBe("jugador");
      expect(resultado.activo).toBe(true);
      expect(resultado.password).toBeUndefined(); // No debe exponer contraseña
    });

    test("debe lanzar error si usuario no existe", async () => {
      await expect(useCase.execute(999)).rejects.toThrow(ValidationError);

      await expect(useCase.execute(999)).rejects.toThrow(
        "Usuario no encontrado"
      );
    });

    test("debe lanzar error si ID es null", async () => {
      await expect(useCase.execute(null)).rejects.toThrow(ValidationError);

      await expect(useCase.execute(null)).rejects.toThrow(
        "El ID del usuario es requerido"
      );
    });

    test("debe lanzar error si ID es undefined", async () => {
      await expect(useCase.execute(undefined)).rejects.toThrow(ValidationError);

      await expect(useCase.execute(undefined)).rejects.toThrow(
        "El ID del usuario es requerido"
      );
    });

    test("debe obtener usuario gestor correctamente", async () => {
      const gestor = await mockRepository.create(
        new Usuario({
          id: null,
          email: "gestor@test.com",
          password: "Password123!",
          nombre: "Gestor Test",
          rol: "gestor",
          activo: true,
        })
      );

      const resultado = await useCase.execute(gestor.id);

      expect(resultado.rol).toBe("gestor");
      expect(resultado.email).toBe("gestor@test.com");
    });

    test("debe obtener usuario inactivo correctamente", async () => {
      const usuarioInactivo = await mockRepository.create(
        new Usuario({
          id: null,
          email: "inactivo@test.com",
          password: "Password123!",
          nombre: "Usuario Inactivo",
          rol: "jugador",
          activo: false,
        })
      );

      const resultado = await useCase.execute(usuarioInactivo.id);

      expect(resultado.activo).toBe(false);
      expect(resultado.id).toBe(usuarioInactivo.id);
    });

    test("debe obtener diferentes usuarios por sus IDs", async () => {
      const usuario1 = await mockRepository.create(
        new Usuario({
          id: null,
          email: "user1@test.com",
          password: "Password123!",
          nombre: "Usuario Uno",
          rol: "jugador",
          activo: true,
        })
      );

      const usuario2 = await mockRepository.create(
        new Usuario({
          id: null,
          email: "user2@test.com",
          password: "Password123!",
          nombre: "Usuario Dos",
          rol: "gestor",
          activo: true,
        })
      );

      const resultado1 = await useCase.execute(usuario1.id);
      const resultado2 = await useCase.execute(usuario2.id);

      expect(resultado1.email).toBe("user1@test.com");
      expect(resultado2.email).toBe("user2@test.com");
      expect(resultado1.id).not.toBe(resultado2.id);
    });
  });
});
