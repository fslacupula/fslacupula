import { describe, it, expect } from "vitest";
import { formatearFecha, formatearHora, parseISO8601 } from "./fechas";

describe("fechas utils", () => {
  describe("formatearFecha", () => {
    it("debe formatear fecha ISO correctamente", () => {
      expect(formatearFecha("2024-01-15")).toBe("15/01/2024");
      expect(formatearFecha("2024-12-31")).toBe("31/12/2024");
    });

    it("debe manejar fecha con timestamp", () => {
      expect(formatearFecha("2024-01-15T18:00:00Z")).toBe("15/01/2024");
    });

    it("debe retornar la fecha original si el formato es inválido", () => {
      const invalidDate = "invalid-date";
      expect(formatearFecha(invalidDate)).toBe(invalidDate);
    });

    it("debe manejar fechas con diferentes separadores", () => {
      expect(formatearFecha("2024/01/15")).toBe("15/01/2024");
    });
  });

  describe("formatearHora", () => {
    it("debe formatear hora HH:MM correctamente", () => {
      expect(formatearHora("18:30")).toBe("18:30");
      expect(formatearHora("09:00")).toBe("09:00");
    });

    it("debe extraer hora de timestamp ISO", () => {
      expect(formatearHora("2024-01-15T18:30:00Z")).toContain(":");
    });

    it("debe manejar hora con segundos", () => {
      expect(formatearHora("18:30:45")).toBe("18:30");
    });

    it("debe retornar la hora original si el formato es inválido", () => {
      const invalidTime = "invalid-time";
      expect(formatearHora(invalidTime)).toBe(invalidTime);
    });
  });

  describe("parseISO8601", () => {
    it("debe parsear fecha ISO8601 correctamente", () => {
      const date = parseISO8601("2024-01-15T18:30:00Z");
      expect(date).toBeInstanceOf(Date);
      expect(date.getFullYear()).toBe(2024);
      expect(date.getMonth()).toBe(0); // Enero es 0
      expect(date.getDate()).toBe(15);
    });

    it("debe manejar fecha sin timezone", () => {
      const date = parseISO8601("2024-01-15T18:30:00");
      expect(date).toBeInstanceOf(Date);
      expect(date.getFullYear()).toBe(2024);
    });

    it("debe retornar fecha inválida para string inválido", () => {
      const date = parseISO8601("invalid-date");
      expect(isNaN(date.getTime())).toBe(true);
    });

    it("debe manejar fecha solo (sin hora)", () => {
      const date = parseISO8601("2024-01-15");
      expect(date).toBeInstanceOf(Date);
      expect(date.getFullYear()).toBe(2024);
      expect(date.getMonth()).toBe(0);
      expect(date.getDate()).toBe(15);
    });
  });

  describe("integración fechas", () => {
    it("debe poder formatear una fecha parseada", () => {
      const isoDate = "2024-01-15T18:30:00Z";
      const parsed = parseISO8601(isoDate);
      const formatted = formatearFecha(parsed.toISOString());

      expect(formatted).toBe("15/01/2024");
    });

    it("debe manejar el flujo completo de fecha y hora", () => {
      const isoDateTime = "2024-01-15T18:30:00Z";

      const fecha = formatearFecha(isoDateTime);
      const hora = formatearHora(isoDateTime);

      expect(fecha).toBe("15/01/2024");
      expect(hora).toContain(":");
    });
  });
});
