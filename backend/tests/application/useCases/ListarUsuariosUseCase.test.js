import { describe, test, expect, beforeEach } from "@jest/globals";
import { ListarUsuariosUseCase } from "../../../src/application/useCases/usuario/ListarUsuariosUseCase.js";
import { Usuario } from "../../../src/domain/entities/index.js";

/**
 * Mock del Repositorio de Usuarios
 */
class MockUsuarioRepository {
  constructor() {
    this.usuarios = [];
    this.nextId = 1;
  }

  async findAll(filtros = {}) {
    let resultado = [...this.usuarios];

    if (filtros.rol) {
      resultado = resultado.filter((u) => u.rol === filtros.rol);
    }

    if (filtros.activo !== undefined) {
      resultado = resultado.filter((u) => u.activo === filtros.activo);
    }

    return resultado;
  }

  async findPaginated(page = 1, limit = 10, filtros = {}) {
    const todosFiltrados = await this.findAll(filtros);
    const total = todosFiltrados.length;
    const totalPages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;
    const data = todosFiltrados.slice(offset, offset + limit);

    return {
      data,
      total,
      page,
      totalPages,
    };
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

describe("ListarUsuariosUseCase", () => {
  let mockRepository;
  let useCase;

  beforeEach(() => {
    mockRepository = new MockUsuarioRepository();
    useCase = new ListarUsuariosUseCase(mockRepository);
  });

  describe("constructor", () => {
    test("debe requerir usuarioRepository", () => {
      expect(() => new ListarUsuariosUseCase(null)).toThrow(
        "usuarioRepository is required"
      );
    });

    test("debe crear instancia correctamente", () => {
      expect(useCase.usuarioRepository).toBe(mockRepository);
    });
  });

  describe("execute - con paginación", () => {
    test("debe listar todos los usuarios paginados", async () => {
      // Crear 15 usuarios
      for (let i = 1; i <= 15; i++) {
        await mockRepository.create(
          new Usuario({
            id: null,
            email: `user${i}@test.com`,
            password: "Password123!",
            nombre: `Usuario ${i}`,
            rol: "jugador",
            activo: true,
          })
        );
      }

      const resultado = await useCase.execute({ page: 1, limit: 10 });

      expect(resultado.data).toHaveLength(10);
      expect(resultado.total).toBe(15);
      expect(resultado.page).toBe(1);
      expect(resultado.totalPages).toBe(2);
      expect(resultado.data[0].password).toBeUndefined(); // Sin contraseñas
    });

    test("debe obtener segunda página correctamente", async () => {
      // Crear 15 usuarios
      for (let i = 1; i <= 15; i++) {
        await mockRepository.create(
          new Usuario({
            id: null,
            email: `user${i}@test.com`,
            password: "Password123!",
            nombre: `Usuario ${i}`,
            rol: "jugador",
            activo: true,
          })
        );
      }

      const resultado = await useCase.execute({ page: 2, limit: 10 });

      expect(resultado.data).toHaveLength(5); // Solo quedan 5 en la segunda página
      expect(resultado.total).toBe(15);
      expect(resultado.page).toBe(2);
      expect(resultado.totalPages).toBe(2);
    });

    test("debe filtrar por rol jugador", async () => {
      await mockRepository.create(
        new Usuario({
          id: null,
          email: "jugador1@test.com",
          password: "Password123!",
          nombre: "Jugador 1",
          rol: "jugador",
          activo: true,
        })
      );
      await mockRepository.create(
        new Usuario({
          id: null,
          email: "gestor1@test.com",
          password: "Password123!",
          nombre: "Gestor 1",
          rol: "gestor",
          activo: true,
        })
      );
      await mockRepository.create(
        new Usuario({
          id: null,
          email: "jugador2@test.com",
          password: "Password123!",
          nombre: "Jugador 2",
          rol: "jugador",
          activo: true,
        })
      );

      const resultado = await useCase.execute({
        page: 1,
        limit: 10,
        rol: "jugador",
      });

      expect(resultado.data).toHaveLength(2);
      expect(resultado.total).toBe(2);
      expect(resultado.data.every((u) => u.rol === "jugador")).toBe(true);
    });

    test("debe filtrar por rol gestor", async () => {
      await mockRepository.create(
        new Usuario({
          id: null,
          email: "jugador1@test.com",
          password: "Password123!",
          nombre: "Jugador 1",
          rol: "jugador",
          activo: true,
        })
      );
      await mockRepository.create(
        new Usuario({
          id: null,
          email: "gestor1@test.com",
          password: "Password123!",
          nombre: "Gestor 1",
          rol: "gestor",
          activo: true,
        })
      );
      await mockRepository.create(
        new Usuario({
          id: null,
          email: "gestor2@test.com",
          password: "Password123!",
          nombre: "Gestor 2",
          rol: "gestor",
          activo: true,
        })
      );

      const resultado = await useCase.execute({
        page: 1,
        limit: 10,
        rol: "gestor",
      });

      expect(resultado.data).toHaveLength(2);
      expect(resultado.total).toBe(2);
      expect(resultado.data.every((u) => u.rol === "gestor")).toBe(true);
    });

    test("debe filtrar por usuarios activos", async () => {
      await mockRepository.create(
        new Usuario({
          id: null,
          email: "activo1@test.com",
          password: "Password123!",
          nombre: "Activo 1",
          rol: "jugador",
          activo: true,
        })
      );
      await mockRepository.create(
        new Usuario({
          id: null,
          email: "inactivo1@test.com",
          password: "Password123!",
          nombre: "Inactivo 1",
          rol: "jugador",
          activo: false,
        })
      );
      await mockRepository.create(
        new Usuario({
          id: null,
          email: "activo2@test.com",
          password: "Password123!",
          nombre: "Activo 2",
          rol: "jugador",
          activo: true,
        })
      );

      const resultado = await useCase.execute({
        page: 1,
        limit: 10,
        activo: true,
      });

      expect(resultado.data).toHaveLength(2);
      expect(resultado.total).toBe(2);
      expect(resultado.data.every((u) => u.activo === true)).toBe(true);
    });

    test("debe filtrar por usuarios inactivos", async () => {
      await mockRepository.create(
        new Usuario({
          id: null,
          email: "activo1@test.com",
          password: "Password123!",
          nombre: "Activo 1",
          rol: "jugador",
          activo: true,
        })
      );
      await mockRepository.create(
        new Usuario({
          id: null,
          email: "inactivo1@test.com",
          password: "Password123!",
          nombre: "Inactivo 1",
          rol: "jugador",
          activo: false,
        })
      );

      const resultado = await useCase.execute({
        page: 1,
        limit: 10,
        activo: false,
      });

      expect(resultado.data).toHaveLength(1);
      expect(resultado.data[0].activo).toBe(false);
    });

    test("debe combinar filtros de rol y activo", async () => {
      await mockRepository.create(
        new Usuario({
          id: null,
          email: "jugador-activo@test.com",
          password: "Password123!",
          nombre: "Jugador Activo",
          rol: "jugador",
          activo: true,
        })
      );
      await mockRepository.create(
        new Usuario({
          id: null,
          email: "jugador-inactivo@test.com",
          password: "Password123!",
          nombre: "Jugador Inactivo",
          rol: "jugador",
          activo: false,
        })
      );
      await mockRepository.create(
        new Usuario({
          id: null,
          email: "gestor-activo@test.com",
          password: "Password123!",
          nombre: "Gestor Activo",
          rol: "gestor",
          activo: true,
        })
      );

      const resultado = await useCase.execute({
        page: 1,
        limit: 10,
        rol: "jugador",
        activo: true,
      });

      expect(resultado.data).toHaveLength(1);
      expect(resultado.data[0].rol).toBe("jugador");
      expect(resultado.data[0].activo).toBe(true);
    });

    test("debe usar valores por defecto si no se pasan opciones", async () => {
      for (let i = 1; i <= 5; i++) {
        await mockRepository.create(
          new Usuario({
            id: null,
            email: `user${i}@test.com`,
            password: "Password123!",
            nombre: `Usuario ${i}`,
            rol: "jugador",
            activo: true,
          })
        );
      }

      const resultado = await useCase.execute();

      expect(resultado.page).toBe(1);
      expect(resultado.data).toHaveLength(5);
    });
  });

  describe("executeAll - sin paginación", () => {
    test("debe listar todos los usuarios sin paginación", async () => {
      for (let i = 1; i <= 5; i++) {
        await mockRepository.create(
          new Usuario({
            id: null,
            email: `user${i}@test.com`,
            password: "Password123!",
            nombre: `Usuario ${i}`,
            rol: "jugador",
            activo: true,
          })
        );
      }

      const resultado = await useCase.executeAll();

      expect(resultado).toHaveLength(5);
      expect(resultado[0].password).toBeUndefined();
    });

    test("debe filtrar por rol sin paginación", async () => {
      await mockRepository.create(
        new Usuario({
          id: null,
          email: "jugador@test.com",
          password: "Password123!",
          nombre: "Jugador",
          rol: "jugador",
          activo: true,
        })
      );
      await mockRepository.create(
        new Usuario({
          id: null,
          email: "gestor@test.com",
          password: "Password123!",
          nombre: "Gestor",
          rol: "gestor",
          activo: true,
        })
      );

      const resultado = await useCase.executeAll({ rol: "jugador" });

      expect(resultado).toHaveLength(1);
      expect(resultado[0].rol).toBe("jugador");
    });

    test("debe retornar array vacío si no hay usuarios", async () => {
      const resultado = await useCase.executeAll();
      expect(resultado).toEqual([]);
    });
  });
});
