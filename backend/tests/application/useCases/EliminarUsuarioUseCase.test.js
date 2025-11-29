import { describe, test, expect, beforeEach } from "@jest/globals";
import { EliminarUsuarioUseCase } from "../../../src/application/useCases/usuario/EliminarUsuarioUseCase.js";
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

  async delete(id) {
    const usuario = this.usuarios.find((u) => u.id === id);
    if (!usuario) return false;

    // Soft delete - marcar como inactivo
    usuario.activo = false;
    return true;
  }

  async hardDelete(id) {
    const index = this.usuarios.findIndex((u) => u.id === id);
    if (index === -1) return false;

    // Hard delete - eliminar del array
    this.usuarios.splice(index, 1);
    return true;
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

describe("EliminarUsuarioUseCase", () => {
  let mockRepository;
  let useCase;

  beforeEach(() => {
    mockRepository = new MockUsuarioRepository();
    useCase = new EliminarUsuarioUseCase(mockRepository);
  });

  describe("constructor", () => {
    test("debe requerir usuarioRepository", () => {
      expect(() => new EliminarUsuarioUseCase(null)).toThrow(
        "usuarioRepository is required"
      );
    });

    test("debe crear instancia correctamente", () => {
      expect(useCase.usuarioRepository).toBe(mockRepository);
    });
  });

  describe("execute - soft delete", () => {
    test("debe eliminar usuario correctamente (soft delete)", async () => {
      const usuario = await mockRepository.create(
        new Usuario({
          id: null,
          email: "test@test.com",
          password: "Password123!",
          nombre: "Usuario Test",
          rol: "jugador",
          activo: true,
        })
      );

      const resultado = await useCase.execute(usuario.id);

      expect(resultado.success).toBe(true);
      expect(resultado.message).toBe("Usuario eliminado correctamente");
      expect(resultado.id).toBe(usuario.id);

      // Verificar que el usuario está marcado como inactivo
      const usuarioEnBD = await mockRepository.findById(usuario.id);
      expect(usuarioEnBD.activo).toBe(false);
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

    test("debe poder eliminar usuario ya inactivo", async () => {
      const usuario = await mockRepository.create(
        new Usuario({
          id: null,
          email: "test@test.com",
          password: "Password123!",
          nombre: "Usuario Test",
          rol: "jugador",
          activo: false,
        })
      );

      const resultado = await useCase.execute(usuario.id);

      expect(resultado.success).toBe(true);
      expect(resultado.id).toBe(usuario.id);
    });

    test("debe mantener usuario en base de datos después de soft delete", async () => {
      const usuario = await mockRepository.create(
        new Usuario({
          id: null,
          email: "test@test.com",
          password: "Password123!",
          nombre: "Usuario Test",
          rol: "jugador",
          activo: true,
        })
      );

      await useCase.execute(usuario.id);

      // El usuario debe seguir existiendo en BD
      const usuarioEnBD = await mockRepository.findById(usuario.id);
      expect(usuarioEnBD).not.toBeNull();
      expect(usuarioEnBD.id).toBe(usuario.id);
    });

    test("debe eliminar múltiples usuarios secuencialmente", async () => {
      const usuario1 = await mockRepository.create(
        new Usuario({
          id: null,
          email: "user1@test.com",
          password: "Password123!",
          nombre: "Usuario 1",
          rol: "jugador",
          activo: true,
        })
      );
      const usuario2 = await mockRepository.create(
        new Usuario({
          id: null,
          email: "user2@test.com",
          password: "Password123!",
          nombre: "Usuario 2",
          rol: "jugador",
          activo: true,
        })
      );

      const resultado1 = await useCase.execute(usuario1.id);
      const resultado2 = await useCase.execute(usuario2.id);

      expect(resultado1.success).toBe(true);
      expect(resultado2.success).toBe(true);

      const u1 = await mockRepository.findById(usuario1.id);
      const u2 = await mockRepository.findById(usuario2.id);

      expect(u1.activo).toBe(false);
      expect(u2.activo).toBe(false);
    });
  });

  describe("executeHard - hard delete", () => {
    test("debe eliminar usuario permanentemente (hard delete)", async () => {
      const usuario = await mockRepository.create(
        new Usuario({
          id: null,
          email: "test@test.com",
          password: "Password123!",
          nombre: "Usuario Test",
          rol: "jugador",
          activo: true,
        })
      );

      const resultado = await useCase.executeHard(usuario.id);

      expect(resultado.success).toBe(true);
      expect(resultado.message).toBe("Usuario eliminado permanentemente");
      expect(resultado.id).toBe(usuario.id);

      // Verificar que el usuario ya no existe
      const usuarioEnBD = await mockRepository.findById(usuario.id);
      expect(usuarioEnBD).toBeNull();
    });

    test("debe lanzar error si usuario no existe (hard delete)", async () => {
      await expect(useCase.executeHard(999)).rejects.toThrow(ValidationError);

      await expect(useCase.executeHard(999)).rejects.toThrow(
        "Usuario no encontrado"
      );
    });

    test("debe lanzar error si ID es null (hard delete)", async () => {
      await expect(useCase.executeHard(null)).rejects.toThrow(ValidationError);
    });

    test("debe eliminar usuario de la base de datos permanentemente", async () => {
      const usuario = await mockRepository.create(
        new Usuario({
          id: null,
          email: "test@test.com",
          password: "Password123!",
          nombre: "Usuario Test",
          rol: "jugador",
          activo: true,
        })
      );

      const cantidadAntes = mockRepository.usuarios.length;
      await useCase.executeHard(usuario.id);
      const cantidadDespues = mockRepository.usuarios.length;

      expect(cantidadDespues).toBe(cantidadAntes - 1);
    });

    test("debe poder hacer hard delete de usuario inactivo", async () => {
      const usuario = await mockRepository.create(
        new Usuario({
          id: null,
          email: "test@test.com",
          password: "Password123!",
          nombre: "Usuario Test",
          rol: "jugador",
          activo: false,
        })
      );

      const resultado = await useCase.executeHard(usuario.id);

      expect(resultado.success).toBe(true);
      const usuarioEnBD = await mockRepository.findById(usuario.id);
      expect(usuarioEnBD).toBeNull();
    });
  });
});
