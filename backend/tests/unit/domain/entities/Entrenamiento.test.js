/**
 * Tests unitarios para la entidad Entrenamiento
 */
import { describe, it, expect, beforeEach } from "@jest/globals";
import { Entrenamiento } from "../../../../src/domain/entities/Entrenamiento.js";
import { ValidationError } from "../../../../src/domain/errors/index.js";

describe("Entrenamiento Entity", () => {
  describe("Constructor y creación", () => {
    it("should create a valid entrenamiento", () => {
      const fechaHora = new Date("2025-12-10T19:00:00Z");
      const entrenamiento = new Entrenamiento({
        id: 1,
        fechaHora,
        lugar: "Pabellón Municipal",
        descripcion: "Entrenamiento táctico",
        duracionMinutos: 90,
        creadoPor: 10,
      });

      expect(entrenamiento.id).toBe(1);
      expect(entrenamiento.fechaHora).toEqual(fechaHora);
      expect(entrenamiento.lugar).toBe("Pabellón Municipal");
      expect(entrenamiento.descripcion).toBe("Entrenamiento táctico");
      expect(entrenamiento.duracionMinutos).toBe(90);
      expect(entrenamiento.creadoPor).toBe(10);
    });

    it("should use default duracionMinutos if not provided", () => {
      const entrenamiento = new Entrenamiento({
        id: 1,
        fechaHora: new Date(),
        lugar: "Test",
        creadoPor: 1,
      });

      expect(entrenamiento.duracionMinutos).toBe(90);
    });

    it("should throw ValidationError if lugar is missing", () => {
      expect(() => {
        new Entrenamiento({
          id: 1,
          fechaHora: new Date(),
          creadoPor: 1,
        });
      }).toThrow(ValidationError);
    });

    it("should throw ValidationError if fechaHora is invalid", () => {
      expect(() => {
        new Entrenamiento({
          id: 1,
          fechaHora: "invalid-date",
          lugar: "Test",
          creadoPor: 1,
        });
      }).toThrow(ValidationError);
    });

    it("should throw ValidationError if duracionMinutos is negative", () => {
      expect(() => {
        new Entrenamiento({
          id: 1,
          fechaHora: new Date(),
          lugar: "Test",
          duracionMinutos: -10,
          creadoPor: 1,
        });
      }).toThrow(ValidationError);
    });

    it("should throw ValidationError if duracionMinutos exceeds maximum", () => {
      expect(() => {
        new Entrenamiento({
          id: 1,
          fechaHora: new Date(),
          lugar: "Test",
          duracionMinutos: 500,
          creadoPor: 1,
        });
      }).toThrow(ValidationError);
    });
  });

  describe("Métodos de negocio", () => {
    let entrenamiento;

    beforeEach(() => {
      entrenamiento = new Entrenamiento({
        id: 1,
        fechaHora: new Date("2025-12-10T19:00:00Z"),
        lugar: "Pabellón",
        descripcion: "Test",
        duracionMinutos: 90,
        creadoPor: 10,
      });
    });

    it("should change lugar", () => {
      entrenamiento.cambiarLugar("Nuevo Pabellón");
      expect(entrenamiento.lugar).toBe("Nuevo Pabellón");
    });

    it("should change descripcion", () => {
      entrenamiento.cambiarDescripcion("Nueva descripción");
      expect(entrenamiento.descripcion).toBe("Nueva descripción");
    });

    it("should change duracion with validation", () => {
      entrenamiento.cambiarDuracion(120);
      expect(entrenamiento.duracionMinutos).toBe(120);
    });

    it("should throw error when changing to invalid duracion", () => {
      expect(() => {
        entrenamiento.cambiarDuracion(-10);
      }).toThrow(ValidationError);
    });

    it("should check if entrenamiento is in the future", () => {
      const entrenamientoFuturo = new Entrenamiento({
        id: 1,
        fechaHora: new Date(Date.now() + 86400000), // +1 día
        lugar: "Test",
        creadoPor: 1,
      });

      expect(entrenamientoFuturo.esProximo()).toBe(true);
    });

    it("should check if entrenamiento is in the past", () => {
      const entrenamientoPasado = new Entrenamiento({
        id: 1,
        fechaHora: new Date("2020-01-01"),
        lugar: "Test",
        creadoPor: 1,
      });

      expect(entrenamientoPasado.esProximo()).toBe(false);
    });

    it("should calculate hora de finalizacion", () => {
      const inicio = new Date("2025-12-10T19:00:00Z");
      const ent = new Entrenamiento({
        id: 1,
        fechaHora: inicio,
        lugar: "Test",
        duracionMinutos: 90,
        creadoPor: 1,
      });

      const fin = ent.calcularHoraFin();
      const esperado = new Date(inicio.getTime() + 90 * 60 * 1000);

      expect(fin.getTime()).toBe(esperado.getTime());
    });
  });

  describe("Validaciones estáticas", () => {
    it("should validate duracion range", () => {
      expect(Entrenamiento.esDuracionValida(30)).toBe(true);
      expect(Entrenamiento.esDuracionValida(90)).toBe(true);
      expect(Entrenamiento.esDuracionValida(240)).toBe(true);
      expect(Entrenamiento.esDuracionValida(0)).toBe(false);
      expect(Entrenamiento.esDuracionValida(-10)).toBe(false);
      expect(Entrenamiento.esDuracionValida(500)).toBe(false);
    });
  });

  describe("Conversión de datos", () => {
    it("should convert to plain object", () => {
      const fechaHora = new Date("2025-12-10T19:00:00Z");
      const entrenamiento = new Entrenamiento({
        id: 1,
        fechaHora,
        lugar: "Pabellón",
        descripcion: "Test",
        duracionMinutos: 90,
        creadoPor: 1,
      });

      const obj = entrenamiento.toObject();

      expect(obj).toEqual({
        id: 1,
        fechaHora,
        lugar: "Pabellón",
        descripcion: "Test",
        duracionMinutos: 90,
        creadoPor: 1,
        createdAt: expect.any(Date),
      });
    });

    it("should create from database data", () => {
      const dbData = {
        id: 1,
        fecha_hora: new Date("2025-12-10T19:00:00Z"),
        lugar: "Pabellón",
        descripcion: "Test",
        duracion_minutos: 90,
        creado_por: 1,
        created_at: new Date(),
      };

      const entrenamiento = Entrenamiento.fromDatabase(dbData);

      expect(entrenamiento.id).toBe(1);
      expect(entrenamiento.lugar).toBe("Pabellón");
      expect(entrenamiento.duracionMinutos).toBe(90);
    });
  });
});
