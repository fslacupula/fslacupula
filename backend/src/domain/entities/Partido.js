/**
 * Entidad Partido - Dominio
 * Representa un partido de fútbol del equipo
 */
import { ValidationError } from "../errors/index.js";

export class Partido {
  static TIPOS = {
    LIGA: "liga",
    AMISTOSO: "amistoso",
    COPA: "copa",
    TORNEO: "torneo",
  };

  constructor({
    id,
    fechaHora,
    rival,
    lugar,
    tipo,
    esLocal,
    creadoPor,
    resultado = null,
    observaciones = null,
    createdAt = null,
  }) {
    // Validaciones
    this.#validateFechaHora(fechaHora);
    this.#validateRival(rival);
    this.#validateLugar(lugar);
    this.#validateTipo(tipo);
    this.#validateCreadoPor(creadoPor);

    // Asignación
    this._id = id;
    this._fechaHora = new Date(fechaHora);
    this._rival = rival;
    this._lugar = lugar;
    this._tipo = tipo;
    this._esLocal = esLocal;
    this._creadoPor = creadoPor;
    this._resultado = resultado;
    this._observaciones = observaciones;
    this._createdAt = createdAt || new Date();
  }

  // Getters
  get id() {
    return this._id;
  }
  get fechaHora() {
    return this._fechaHora;
  }
  get rival() {
    return this._rival;
  }
  get lugar() {
    return this._lugar;
  }
  get tipo() {
    return this._tipo;
  }
  get esLocal() {
    return this._esLocal;
  }
  get creadoPor() {
    return this._creadoPor;
  }
  get resultado() {
    return this._resultado;
  }
  get observaciones() {
    return this._observaciones;
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

  #validateRival(rival) {
    if (!rival || typeof rival !== "string" || rival.trim().length === 0) {
      throw new ValidationError("Rival es requerido", "rival");
    }
  }

  #validateLugar(lugar) {
    if (!lugar || typeof lugar !== "string" || lugar.trim().length === 0) {
      throw new ValidationError("Lugar es requerido", "lugar");
    }
  }

  #validateTipo(tipo) {
    if (!Object.values(Partido.TIPOS).includes(tipo)) {
      throw new ValidationError(
        `Tipo inválido. Debe ser uno de: ${Object.values(Partido.TIPOS).join(
          ", "
        )}`,
        "tipo"
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
  registrarResultado(resultado) {
    this._resultado = resultado;
  }

  cambiarLugar(nuevoLugar) {
    this.#validateLugar(nuevoLugar);
    this._lugar = nuevoLugar;
  }

  esProximo() {
    return this._fechaHora > new Date();
  }

  tieneResultado() {
    return this._resultado !== null && this._resultado !== "";
  }

  toObject() {
    return {
      id: this._id,
      fechaHora: this._fechaHora,
      rival: this._rival,
      lugar: this._lugar,
      tipo: this._tipo,
      esLocal: this._esLocal,
      creadoPor: this._creadoPor,
      resultado: this._resultado,
      observaciones: this._observaciones,
      createdAt: this._createdAt,
    };
  }

  static fromDatabase(data) {
    return new Partido({
      id: data.id,
      fechaHora: data.fechaHora, // Cambiado a camelCase
      rival: data.rival,
      lugar: data.lugar,
      tipo: data.tipo,
      esLocal: data.esLocal, // Cambiado a camelCase
      creadoPor: data.creadoPor, // Cambiado a camelCase
      resultado: data.resultado,
      observaciones: data.observaciones,
      createdAt: data.createdAt ? new Date(data.createdAt) : null, // Cambiado a camelCase
    });
  }
}
