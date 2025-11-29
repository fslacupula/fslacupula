/**
 * Entidad Entrenamiento - Dominio
 * Representa un entrenamiento del equipo
 */
import { ValidationError } from "../errors/index.js";

export class Entrenamiento {
  static DEFAULT_DURACION = 90; // minutos
  static MIN_DURACION = 15;
  static MAX_DURACION = 240;

  constructor({
    id,
    fechaHora,
    lugar,
    descripcion = null,
    duracionMinutos = Entrenamiento.DEFAULT_DURACION,
    creadoPor,
    createdAt = null,
  }) {
    // Validaciones
    this.#validateFechaHora(fechaHora);
    this.#validateLugar(lugar);
    this.#validateDuracion(duracionMinutos);
    this.#validateCreadoPor(creadoPor);

    // Asignación
    this._id = id;
    this._fechaHora = new Date(fechaHora);
    this._lugar = lugar;
    this._descripcion = descripcion;
    this._duracionMinutos = duracionMinutos;
    this._creadoPor = creadoPor;
    this._createdAt = createdAt || new Date();
  }

  // Getters
  get id() {
    return this._id;
  }
  get fechaHora() {
    return this._fechaHora;
  }
  get lugar() {
    return this._lugar;
  }
  get descripcion() {
    return this._descripcion;
  }
  get duracionMinutos() {
    return this._duracionMinutos;
  }
  get creadoPor() {
    return this._creadoPor;
  }
  get createdAt() {
    return this._createdAt;
  }

  // Validaciones privadas
  #validateFechaHora(fechaHora) {
    if (!fechaHora) {
      throw new ValidationError("Fecha y hora son requeridas", "fechaHora");
    }

    const fecha = new Date(fechaHora);
    if (isNaN(fecha.getTime())) {
      throw new ValidationError("Fecha y hora inválidas", "fechaHora");
    }
  }

  #validateLugar(lugar) {
    if (!lugar || typeof lugar !== "string" || lugar.trim().length === 0) {
      throw new ValidationError("Lugar es requerido", "lugar");
    }
  }

  #validateDuracion(duracion) {
    if (!Entrenamiento.esDuracionValida(duracion)) {
      throw new ValidationError(
        `Duración debe estar entre ${Entrenamiento.MIN_DURACION} y ${Entrenamiento.MAX_DURACION} minutos`,
        "duracionMinutos"
      );
    }
  }

  #validateCreadoPor(creadoPor) {
    if (!creadoPor || typeof creadoPor !== "number" || creadoPor <= 0) {
      throw new ValidationError(
        "Creado por debe ser un ID válido",
        "creadoPor"
      );
    }
  }

  // Métodos de negocio
  cambiarLugar(nuevoLugar) {
    this.#validateLugar(nuevoLugar);
    this._lugar = nuevoLugar;
  }

  cambiarDescripcion(nuevaDescripcion) {
    this._descripcion = nuevaDescripcion;
  }

  cambiarDuracion(nuevaDuracion) {
    this.#validateDuracion(nuevaDuracion);
    this._duracionMinutos = nuevaDuracion;
  }

  esProximo() {
    return this._fechaHora > new Date();
  }

  calcularHoraFin() {
    return new Date(
      this._fechaHora.getTime() + this._duracionMinutos * 60 * 1000
    );
  }

  toObject() {
    return {
      id: this._id,
      fechaHora: this._fechaHora,
      lugar: this._lugar,
      descripcion: this._descripcion,
      duracionMinutos: this._duracionMinutos,
      creadoPor: this._creadoPor,
      createdAt: this._createdAt,
    };
  }

  static esDuracionValida(duracion) {
    if (typeof duracion !== "number") {
      return false;
    }
    return (
      duracion >= Entrenamiento.MIN_DURACION &&
      duracion <= Entrenamiento.MAX_DURACION
    );
  }

  static fromDatabase(data) {
    return new Entrenamiento({
      id: data.id,
      fechaHora: data.fechaHora, // Cambiado a camelCase
      lugar: data.lugar,
      descripcion: data.descripcion,
      duracionMinutos: data.duracionMinutos, // Cambiado a camelCase
      creadoPor: data.creadoPor, // Cambiado a camelCase
      createdAt: data.createdAt ? new Date(data.createdAt) : null, // Cambiado a camelCase
    });
  }
}
