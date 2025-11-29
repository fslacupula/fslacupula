/**
 * Tests unitarios para la entidad Partido
 */
import { describe, it, expect } from "@jest/globals";
import { Partido } from "../../../../src/domain/entities/Partido.js";
import { ValidationError } from "../../../../src/domain/errors/index.js";

describe("Partido Entity", () => {
  describe("Constructor y creación", () => {
    it("should create a valid partido", () => {
      const fechaHora = new Date("2025-12-15T18:00:00Z");
      const partido = new Partido({
        id: 1,
        fechaHora,
        rival: "Rival FC",
        lugar: "Pabellón Municipal",
        tipo: "liga",
        esLocal: true,
        creadoPor: 10,
      });

      expect(partido.id).toBe(1);
      expect(partido.fechaHora).toEqual(fechaHora);
      expect(partido.rival).toBe("Rival FC");
      expect(partido.lugar).toBe("Pabellón Municipal");
      expect(partido.tipo).toBe("liga");
      expect(partido.esLocal).toBe(true);
      expect(partido.creadoPor).toBe(10);
      expect(partido.resultado).toBeNull();
    });

    it("should throw ValidationError if rival is missing", () => {
      expect(() => {
        new Partido({
          id: 1,
          fechaHora: new Date(),
          lugar: "Test",
          tipo: "liga",
          esLocal: true,
          creadoPor: 1,
        });
      }).toThrow(ValidationError);
    });

    it("should throw ValidationError if lugar is missing", () => {
      expect(() => {
        new Partido({
          id: 1,
          fechaHora: new Date(),
          rival: "Test FC",
          tipo: "liga",
          esLocal: true,
          creadoPor: 1,
        });
      }).toThrow(ValidationError);
    });

    it("should throw ValidationError if fechaHora is invalid", () => {
      expect(() => {
        new Partido({
          id: 1,
          fechaHora: "invalid-date",
          rival: "Test FC",
          lugar: "Test",
          tipo: "liga",
          esLocal: true,
          creadoPor: 1,
        });
      }).toThrow(ValidationError);
    });

    it("should accept valid tipo values", () => {
      const tipos = ["liga", "amistoso", "copa", "torneo"];

      tipos.forEach((tipo) => {
        const partido = new Partido({
          id: 1,
          fechaHora: new Date(),
          rival: "Test FC",
          lugar: "Test",
          tipo,
          esLocal: true,
          creadoPor: 1,
        });

        expect(partido.tipo).toBe(tipo);
      });
    });

    it("should throw ValidationError for invalid tipo", () => {
      expect(() => {
        new Partido({
          id: 1,
          fechaHora: new Date(),
          rival: "Test FC",
          lugar: "Test",
          tipo: "invalid-tipo",
          esLocal: true,
          creadoPor: 1,
        });
      }).toThrow(ValidationError);
    });
  });

  describe("Métodos de negocio", () => {
    let partido;

    beforeEach(() => {
      partido = new Partido({
        id: 1,
        fechaHora: new Date("2025-12-15T18:00:00Z"),
        rival: "Rival FC",
        lugar: "Pabellón",
        tipo: "liga",
        esLocal: true,
        creadoPor: 10,
      });
    });

    it("should register resultado", () => {
      partido.registrarResultado("3-2");
      expect(partido.resultado).toBe("3-2");
    });

    it("should update lugar", () => {
      partido.cambiarLugar("Nuevo Pabellón");
      expect(partido.lugar).toBe("Nuevo Pabellón");
    });

    it("should check if partido is in the future", () => {
      const partidoFuturo = new Partido({
        id: 1,
        fechaHora: new Date(Date.now() + 86400000), // +1 día
        rival: "Test FC",
        lugar: "Test",
        tipo: "liga",
        esLocal: true,
        creadoPor: 1,
      });

      expect(partidoFuturo.esProximo()).toBe(true);
    });

    it("should check if partido is in the past", () => {
      const partidoPasado = new Partido({
        id: 1,
        fechaHora: new Date("2020-01-01"),
        rival: "Test FC",
        lugar: "Test",
        tipo: "liga",
        esLocal: true,
        creadoPor: 1,
      });

      expect(partidoPasado.esProximo()).toBe(false);
    });

    it("should check if partido has resultado", () => {
      expect(partido.tieneResultado()).toBe(false);

      partido.registrarResultado("2-1");
      expect(partido.tieneResultado()).toBe(true);
    });
  });

  describe("Conversión de datos", () => {
    it("should convert to plain object", () => {
      const fechaHora = new Date("2025-12-15T18:00:00Z");
      const partido = new Partido({
        id: 1,
        fechaHora,
        rival: "Test FC",
        lugar: "Test",
        tipo: "liga",
        esLocal: true,
        creadoPor: 1,
        resultado: "3-2",
        observaciones: "Gran partido",
      });

      const obj = partido.toObject();

      expect(obj).toEqual({
        id: 1,
        fechaHora,
        rival: "Test FC",
        lugar: "Test",
        tipo: "liga",
        esLocal: true,
        creadoPor: 1,
        resultado: "3-2",
        observaciones: "Gran partido",
        createdAt: expect.any(Date),
      });
    });

    it("should create from database data", () => {
      const dbData = {
        id: 1,
        fecha_hora: new Date("2025-12-15T18:00:00Z"),
        rival: "Test FC",
        lugar: "Test",
        tipo: "liga",
        es_local: true,
        creado_por: 1,
        resultado: "3-2",
        observaciones: "Test",
        created_at: new Date(),
      };

      const partido = Partido.fromDatabase(dbData);

      expect(partido.id).toBe(1);
      expect(partido.rival).toBe("Test FC");
      expect(partido.esLocal).toBe(true);
    });
  });
});
