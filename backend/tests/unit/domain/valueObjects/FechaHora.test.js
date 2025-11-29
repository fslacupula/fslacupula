import { describe, test, expect, beforeEach } from "@jest/globals";
import { FechaHora } from "../../../../src/domain/valueObjects/FechaHora.js";
import { ValidationError } from "../../../../src/domain/errors/index.js";

describe("FechaHora Value Object", () => {
  let fechaReferencia;

  beforeEach(() => {
    // 15 de marzo de 2024, 14:30
    fechaReferencia = new Date(2024, 2, 15, 14, 30, 0);
  });

  describe("Creación exitosa", () => {
    test("debería crear desde un objeto Date", () => {
      const fecha = new FechaHora(fechaReferencia);
      expect(fecha.getValue().getTime()).toBe(fechaReferencia.getTime());
    });

    test("debería crear desde un string ISO", () => {
      const isoString = "2024-03-15T14:30:00.000Z";
      const fecha = new FechaHora(isoString);
      expect(fecha.toISOString()).toBe(isoString);
    });

    test("debería crear desde un timestamp", () => {
      const timestamp = fechaReferencia.getTime();
      const fecha = new FechaHora(timestamp);
      expect(fecha.getTimestamp()).toBe(timestamp);
    });

    test("debería crear fechas antiguas", () => {
      const fechaAntigua = new Date(1990, 0, 1);
      const fecha = new FechaHora(fechaAntigua);
      expect(fecha.getValue().getFullYear()).toBe(1990);
    });

    test("debería crear fechas futuras", () => {
      const fechaFutura = new Date(2030, 11, 31);
      const fecha = new FechaHora(fechaFutura);
      expect(fecha.getValue().getFullYear()).toBe(2030);
    });
  });

  describe("Validaciones", () => {
    test("debería lanzar error si la fecha es null", () => {
      expect(() => new FechaHora(null)).toThrow(ValidationError);
      expect(() => new FechaHora(null)).toThrow("La fecha es requerida");
    });

    test("debería lanzar error si la fecha es undefined", () => {
      expect(() => new FechaHora(undefined)).toThrow(ValidationError);
    });

    test("debería lanzar error con string inválido", () => {
      expect(() => new FechaHora("fecha-invalida")).toThrow(ValidationError);
      expect(() => new FechaHora("fecha-invalida")).toThrow("no es válida");
    });

    test("debería lanzar error con Date inválida", () => {
      const fechaInvalida = new Date("invalid");
      expect(() => new FechaHora(fechaInvalida)).toThrow(ValidationError);
    });

    test("debería lanzar error con tipo incorrecto", () => {
      expect(() => new FechaHora({})).toThrow(ValidationError);
      expect(() => new FechaHora([])).toThrow(ValidationError);
      expect(() => new FechaHora(true)).toThrow(ValidationError);
    });
  });

  describe("Métodos de conversión", () => {
    test("toISOString debería retornar formato ISO", () => {
      const fecha = new FechaHora(fechaReferencia);
      const iso = fecha.toISOString();
      expect(iso).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });

    test("toFormattedString debería retornar formato legible", () => {
      const fecha = new FechaHora(fechaReferencia);
      const formatted = fecha.toFormattedString();
      expect(formatted).toContain("2024");
      expect(formatted).toContain("15");
    });

    test("toDateString debería retornar solo la fecha", () => {
      const fecha = new FechaHora(fechaReferencia);
      expect(fecha.toDateString()).toBe("2024-03-15");
    });

    test("toTimeString debería retornar solo la hora", () => {
      const fecha = new FechaHora(fechaReferencia);
      expect(fecha.toTimeString()).toBe("14:30");
    });

    test("getTimestamp debería retornar milisegundos", () => {
      const fecha = new FechaHora(fechaReferencia);
      expect(fecha.getTimestamp()).toBe(fechaReferencia.getTime());
    });

    test("toString debería retornar ISO string", () => {
      const fecha = new FechaHora(fechaReferencia);
      expect(typeof fecha.toString()).toBe("string");
      expect(fecha.toString()).toBe(fecha.toISOString());
    });

    test("toJSON debería retornar ISO string", () => {
      const fecha = new FechaHora(fechaReferencia);
      const json = JSON.stringify({ fecha });
      expect(json).toContain(fecha.toISOString());
    });
  });

  describe("Comparaciones", () => {
    test("equals debería comparar fechas iguales", () => {
      const fecha1 = new FechaHora(fechaReferencia);
      const fecha2 = new FechaHora(fechaReferencia);
      expect(fecha1.equals(fecha2)).toBe(true);
    });

    test("equals debería comparar fechas diferentes", () => {
      const fecha1 = new FechaHora(fechaReferencia);
      const fecha2 = new FechaHora(new Date(2024, 3, 20));
      expect(fecha1.equals(fecha2)).toBe(false);
    });

    test("equals debería retornar false si no es FechaHora", () => {
      const fecha = new FechaHora(fechaReferencia);
      expect(fecha.equals(fechaReferencia)).toBe(false);
      expect(fecha.equals("2024-03-15")).toBe(false);
    });

    test("esAnteriorA debería funcionar correctamente", () => {
      const fecha1 = new FechaHora(new Date(2024, 2, 15));
      const fecha2 = new FechaHora(new Date(2024, 2, 20));
      expect(fecha1.esAnteriorA(fecha2)).toBe(true);
      expect(fecha2.esAnteriorA(fecha1)).toBe(false);
    });

    test("esPosteriorA debería funcionar correctamente", () => {
      const fecha1 = new FechaHora(new Date(2024, 2, 20));
      const fecha2 = new FechaHora(new Date(2024, 2, 15));
      expect(fecha1.esPosteriorA(fecha2)).toBe(true);
      expect(fecha2.esPosteriorA(fecha1)).toBe(false);
    });

    test("esAnteriorA debería lanzar error si no es FechaHora", () => {
      const fecha = new FechaHora(fechaReferencia);
      expect(() => fecha.esAnteriorA(new Date())).toThrow(ValidationError);
    });

    test("esPosteriorA debería lanzar error si no es FechaHora", () => {
      const fecha = new FechaHora(fechaReferencia);
      expect(() => fecha.esPosteriorA(new Date())).toThrow(ValidationError);
    });
  });

  describe("Verificaciones temporales", () => {
    test("esFutura debería detectar fechas futuras", () => {
      const fechaFutura = new Date();
      fechaFutura.setFullYear(fechaFutura.getFullYear() + 1);
      const fecha = new FechaHora(fechaFutura);
      expect(fecha.esFutura()).toBe(true);
    });

    test("esPasada debería detectar fechas pasadas", () => {
      const fechaPasada = new Date();
      fechaPasada.setFullYear(fechaPasada.getFullYear() - 1);
      const fecha = new FechaHora(fechaPasada);
      expect(fecha.esPasada()).toBe(true);
    });

    test("esHoy debería detectar la fecha actual", () => {
      const fecha = new FechaHora(new Date());
      expect(fecha.esHoy()).toBe(true);
    });

    test("esHoy debería retornar false para otras fechas", () => {
      const ayer = new Date();
      ayer.setDate(ayer.getDate() - 1);
      const fecha = new FechaHora(ayer);
      expect(fecha.esHoy()).toBe(false);
    });
  });

  describe("Cálculos de diferencias", () => {
    test("diferenciaEnDias debería calcular correctamente", () => {
      const fecha1 = new FechaHora(new Date(2024, 2, 15));
      const fecha2 = new FechaHora(new Date(2024, 2, 20));
      expect(fecha2.diferenciaEnDias(fecha1)).toBe(5);
      expect(fecha1.diferenciaEnDias(fecha2)).toBe(-5);
    });

    test("diferenciaEnHoras debería calcular correctamente", () => {
      const fecha1 = new FechaHora(new Date(2024, 2, 15, 10, 0));
      const fecha2 = new FechaHora(new Date(2024, 2, 15, 13, 0));
      expect(fecha2.diferenciaEnHoras(fecha1)).toBe(3);
      expect(fecha1.diferenciaEnHoras(fecha2)).toBe(-3);
    });

    test("diferenciaEnDias debería lanzar error si no es FechaHora", () => {
      const fecha = new FechaHora(fechaReferencia);
      expect(() => fecha.diferenciaEnDias(new Date())).toThrow(ValidationError);
    });

    test("diferenciaEnHoras debería lanzar error si no es FechaHora", () => {
      const fecha = new FechaHora(fechaReferencia);
      expect(() => fecha.diferenciaEnHoras(new Date())).toThrow(
        ValidationError
      );
    });
  });

  describe("Operaciones inmutables", () => {
    test("agregarMinutos debería crear una nueva FechaHora", () => {
      const fecha = new FechaHora(new Date(2024, 2, 15, 10, 0));
      const nuevaFecha = fecha.agregarMinutos(30);

      expect(nuevaFecha).toBeInstanceOf(FechaHora);
      expect(nuevaFecha).not.toBe(fecha);
      expect(nuevaFecha.toTimeString()).toBe("10:30");
      expect(fecha.toTimeString()).toBe("10:00"); // Original sin cambios
    });

    test("agregarMinutos con número negativo", () => {
      const fecha = new FechaHora(new Date(2024, 2, 15, 10, 30));
      const nuevaFecha = fecha.agregarMinutos(-30);
      expect(nuevaFecha.toTimeString()).toBe("10:00");
    });

    test("agregarMinutos debería lanzar error con valor inválido", () => {
      const fecha = new FechaHora(fechaReferencia);
      expect(() => fecha.agregarMinutos("30")).toThrow(ValidationError);
      expect(() => fecha.agregarMinutos(NaN)).toThrow(ValidationError);
    });
  });

  describe("Inmutabilidad", () => {
    test("getValue debería retornar una copia", () => {
      const fecha = new FechaHora(fechaReferencia);
      const valor1 = fecha.getValue();
      const valor2 = fecha.getValue();

      expect(valor1).not.toBe(valor2);
      expect(valor1.getTime()).toBe(valor2.getTime());
    });

    test("modificar el Date retornado no debería afectar el VO", () => {
      const fecha = new FechaHora(fechaReferencia);
      const valor = fecha.getValue();
      valor.setFullYear(2099);

      expect(fecha.getValue().getFullYear()).toBe(2024);
    });

    test("debería estar congelado", () => {
      const fecha = new FechaHora(fechaReferencia);
      expect(Object.isFrozen(fecha)).toBe(true);
    });
  });

  describe("Factory methods", () => {
    test("fromISO debería crear desde string ISO", () => {
      const fecha = FechaHora.fromISO("2024-03-15T14:30:00.000Z");
      expect(fecha).toBeInstanceOf(FechaHora);
      expect(fecha.toDateString()).toBe("2024-03-15");
    });

    test("fromTimestamp debería crear desde timestamp", () => {
      const timestamp = fechaReferencia.getTime();
      const fecha = FechaHora.fromTimestamp(timestamp);
      expect(fecha).toBeInstanceOf(FechaHora);
      expect(fecha.getTimestamp()).toBe(timestamp);
    });

    test("now debería crear con fecha actual", () => {
      const antes = Date.now();
      const fecha = FechaHora.now();
      const despues = Date.now();

      expect(fecha).toBeInstanceOf(FechaHora);
      expect(fecha.getTimestamp()).toBeGreaterThanOrEqual(antes);
      expect(fecha.getTimestamp()).toBeLessThanOrEqual(despues);
    });

    test("from debería crear desde componentes", () => {
      const fecha = FechaHora.from(2024, 3, 15, 14, 30);
      expect(fecha).toBeInstanceOf(FechaHora);
      expect(fecha.toDateString()).toBe("2024-03-15");
      expect(fecha.toTimeString()).toBe("14:30");
    });

    test("from debería usar valores por defecto para hora", () => {
      const fecha = FechaHora.from(2024, 3, 15);
      expect(fecha.toTimeString()).toBe("00:00");
    });
  });
});
