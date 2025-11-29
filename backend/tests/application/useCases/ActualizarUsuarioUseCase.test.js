import { describe, test, expect, beforeEach } from "@jest/globals";
import { ActualizarUsuarioUseCase } from "../../../src/application/useCases/usuario/ActualizarUsuarioUseCase.js";
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

  async existsByEmail(email, excludeId = null) {
    return this.usuarios.some(
      (u) => u.email === email && (!excludeId || u.id !== excludeId)
    );
  }

  async findById(id) {
    return this.usuarios.find((u) => u.id === id) || null;
  }

  async update(id, usuario) {
    const index = this.usuarios.findIndex((u) => u.id === id);
    if (index === -1) return null;

    this.usuarios[index] = usuario;
    return usuario;
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

describe("ActualizarUsuarioUseCase", () => {
  let mockRepository;
  let useCase;

  beforeEach(() => {
    mockRepository = new MockUsuarioRepository();
    useCase = new ActualizarUsuarioUseCase(mockRepository);
  });

  describe("constructor", () => {
    test("debe requerir usuarioRepository", () => {
      expect(() => new ActualizarUsuarioUseCase(null)).toThrow(
        "usuarioRepository is required"
      );
    });

    test("debe crear instancia correctamente", () => {
      expect(useCase.usuarioRepository).toBe(mockRepository);
    });
  });

  describe("execute", () => {
    test("debe actualizar nombre del usuario", async () => {
      // Crear usuario inicial
      const usuarioInicial = await mockRepository.create(
        new Usuario({
          id: null,
          email: "test@test.com",
          password: "Password123!",
          nombre: "Nombre Original",
          rol: "jugador",
          activo: true,
        })
      );

      // Actualizar nombre
      const resultado = await useCase.execute(usuarioInicial.id, {
        nombre: "Nombre Actualizado",
      });

      expect(resultado.id).toBe(usuarioInicial.id);
      expect(resultado.nombre).toBe("Nombre Actualizado");
      expect(resultado.email).toBe("test@test.com");
      expect(resultado.password).toBeUndefined();
    });

    test("debe actualizar email del usuario", async () => {
      const usuarioInicial = await mockRepository.create(
        new Usuario({
          id: null,
          email: "original@test.com",
          password: "Password123!",
          nombre: "Usuario Test",
          rol: "jugador",
          activo: true,
        })
      );

      const resultado = await useCase.execute(usuarioInicial.id, {
        email: "nuevo@test.com",
      });

      expect(resultado.email).toBe("nuevo@test.com");
      expect(resultado.nombre).toBe("Usuario Test");
    });

    test("debe actualizar múltiples campos a la vez", async () => {
      const usuarioInicial = await mockRepository.create(
        new Usuario({
          id: null,
          email: "original@test.com",
          password: "Password123!",
          nombre: "Nombre Original",
          rol: "jugador",
          activo: true,
        })
      );

      const resultado = await useCase.execute(usuarioInicial.id, {
        email: "nuevo@test.com",
        nombre: "Nombre Nuevo",
        password: "NewPassword456!",
      });

      expect(resultado.email).toBe("nuevo@test.com");
      expect(resultado.nombre).toBe("Nombre Nuevo");
      expect(resultado.password).toBeUndefined(); // No debe exponerse
    });

    test("debe lanzar error si usuario no existe", async () => {
      await expect(
        useCase.execute(999, { nombre: "Nuevo Nombre" })
      ).rejects.toThrow(ValidationError);

      await expect(
        useCase.execute(999, { nombre: "Nuevo Nombre" })
      ).rejects.toThrow("Usuario no encontrado");
    });

    test("debe lanzar error si email nuevo ya existe", async () => {
      // Crear dos usuarios
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

      await mockRepository.create(
        new Usuario({
          id: null,
          email: "user2@test.com",
          password: "Password123!",
          nombre: "Usuario Dos",
          rol: "jugador",
          activo: true,
        })
      );

      // Intentar actualizar usuario1 con el email de usuario2
      await expect(
        useCase.execute(usuario1.id, { email: "user2@test.com" })
      ).rejects.toThrow(ValidationError);

      await expect(
        useCase.execute(usuario1.id, { email: "user2@test.com" })
      ).rejects.toThrow("El email ya está registrado por otro usuario");
    });

    test("debe permitir actualizar email al mismo valor", async () => {
      const usuario = await mockRepository.create(
        new Usuario({
          id: null,
          email: "same@test.com",
          password: "Password123!",
          nombre: "Usuario Test",
          rol: "jugador",
          activo: true,
        })
      );

      // Actualizar con el mismo email no debe dar error
      const resultado = await useCase.execute(usuario.id, {
        email: "same@test.com",
        nombre: "Nuevo Nombre",
      });

      expect(resultado.email).toBe("same@test.com");
      expect(resultado.nombre).toBe("Nuevo Nombre");
    });

    test("debe lanzar error con email inválido", async () => {
      const usuario = await mockRepository.create(
        new Usuario({
          id: null,
          email: "valid@test.com",
          password: "Password123!",
          nombre: "Usuario Test",
          rol: "jugador",
          activo: true,
        })
      );

      await expect(
        useCase.execute(usuario.id, { email: "email-invalido" })
      ).rejects.toThrow(ValidationError);
    });

    test("debe lanzar error con nombre vacío", async () => {
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

      await expect(useCase.execute(usuario.id, { nombre: "" })).rejects.toThrow(
        ValidationError
      );
    });

    test("debe mantener campos no actualizados", async () => {
      const usuario = await mockRepository.create(
        new Usuario({
          id: null,
          email: "test@test.com",
          password: "Password123!",
          nombre: "Nombre Original",
          rol: "jugador",
          activo: true,
        })
      );

      const resultado = await useCase.execute(usuario.id, {
        nombre: "Nombre Actualizado",
      });

      expect(resultado.email).toBe("test@test.com"); // No cambió
      expect(resultado.nombre).toBe("Nombre Actualizado"); // Cambió
      expect(resultado.rol).toBe("jugador"); // No cambió
    });
  });
});
