/**
 * Entidad Jugador - Dominio
 * Representa los datos específicos de un jugador del equipo
 *
 * Responsabilidades:
 * - Validar datos específicos del jugador
 * - Encapsular lógica de negocio del jugador
 * - Gestionar información deportiva (dorsal, posición, etc.)
 */
import { ValidationError } from "../errors/index.js";

export class Jugador {
  // Constantes
  static MIN_DORSAL = 0;
  static MAX_DORSAL = 99;

  // Regex para validación de teléfono internacional
  static TELEFONO_REGEX = /^\+\d{10,15}$/;

  constructor({
    id,
    usuarioId,
    numeroDorsal = null,
    posicionId = null,
    telefono = null,
    fechaNacimiento = null,
    alias = null,
    fotoUrl = null,
    createdAt = null,
    skipValidation = false, // Para casos de carga desde BD con datos legacy
  }) {
    // Validaciones (solo si no se está cargando desde BD)
    if (!skipValidation) {
      this.#validateUsuarioId(usuarioId);
    }
    if (numeroDorsal !== null) {
      this.#validateNumeroDorsal(numeroDorsal);
    }
    if (telefono !== null) {
      this.#validateTelefono(telefono);
    }

    // Asignación de propiedades
    this._id = id;
    this._usuarioId = usuarioId;
    this._numeroDorsal = numeroDorsal;
    this._posicionId = posicionId;
    this._telefono = telefono;
    this._fechaNacimiento = fechaNacimiento;
    this._alias = alias;
    this._fotoUrl = fotoUrl;
    this._createdAt = createdAt || new Date();
  }

  // Getters
  get id() {
    return this._id;
  }

  get usuarioId() {
    return this._usuarioId;
  }

  get numeroDorsal() {
    return this._numeroDorsal;
  }

  get posicionId() {
    return this._posicionId;
  }

  get telefono() {
    return this._telefono;
  }

  get fechaNacimiento() {
    return this._fechaNacimiento;
  }

  get alias() {
    return this._alias;
  }

  get fotoUrl() {
    return this._fotoUrl;
  }

  get createdAt() {
    return this._createdAt;
  }

  // Métodos de validación privados
  #validateUsuarioId(usuarioId) {
    if (!usuarioId) {
      throw new ValidationError("Usuario ID es requerido", "usuarioId");
    }

    if (typeof usuarioId !== "number" || usuarioId <= 0) {
      throw new ValidationError(
        "Usuario ID debe ser un número positivo",
        "usuarioId"
      );
    }
  }

  #validateNumeroDorsal(dorsal) {
    if (!Jugador.esNumeroDorsalValido(dorsal)) {
      throw new ValidationError(
        `Número de dorsal debe estar entre ${Jugador.MIN_DORSAL} y ${Jugador.MAX_DORSAL}`,
        "numeroDorsal"
      );
    }
  }

  #validateTelefono(telefono) {
    if (!Jugador.esTelefonoValido(telefono)) {
      throw new ValidationError(
        "Teléfono debe tener formato internacional (+XXXXXXXXXXX)",
        "telefono"
      );
    }
  }

  // Métodos de negocio

  /**
   * Cambia el número de dorsal del jugador
   */
  cambiarNumeroDorsal(nuevoDorsal) {
    this.#validateNumeroDorsal(nuevoDorsal);
    this._numeroDorsal = nuevoDorsal;
  }

  /**
   * Cambia la posición del jugador
   */
  cambiarPosicion(nuevaPosicionId) {
    this._posicionId = nuevaPosicionId;
  }

  /**
   * Cambia el alias del jugador
   */
  cambiarAlias(nuevoAlias) {
    this._alias = nuevoAlias;
  }

  /**
   * Cambia el teléfono del jugador
   */
  cambiarTelefono(nuevoTelefono) {
    if (nuevoTelefono !== null) {
      this.#validateTelefono(nuevoTelefono);
    }
    this._telefono = nuevoTelefono;
  }

  /**
   * Cambia la foto del jugador
   */
  cambiarFoto(nuevaFotoUrl) {
    this._fotoUrl = nuevaFotoUrl;
  }

  /**
   * Verifica si el jugador tiene un perfil completo
   */
  tienePerfilCompleto() {
    return (
      this._numeroDorsal !== null &&
      this._posicionId !== null &&
      this._telefono !== null &&
      this._fechaNacimiento !== null
    );
  }

  /**
   * Calcula la edad del jugador
   */
  calcularEdad() {
    if (!this._fechaNacimiento) {
      return null;
    }

    const hoy = new Date();
    const fechaNac = new Date(this._fechaNacimiento);
    let edad = hoy.getFullYear() - fechaNac.getFullYear();
    const mes = hoy.getMonth() - fechaNac.getMonth();

    if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNac.getDate())) {
      edad--;
    }

    return edad;
  }

  /**
   * Retorna los datos del jugador como objeto plano
   */
  toObject() {
    return {
      id: this._id,
      usuarioId: this._usuarioId,
      numeroDorsal: this._numeroDorsal,
      posicionId: this._posicionId,
      telefono: this._telefono,
      fechaNacimiento: this._fechaNacimiento,
      alias: this._alias,
      fotoUrl: this._fotoUrl,
      createdAt: this._createdAt,
    };
  }

  // Métodos estáticos de validación

  /**
   * Valida si un número de dorsal es válido
   */
  static esNumeroDorsalValido(dorsal) {
    if (typeof dorsal !== "number") {
      return false;
    }
    return dorsal >= Jugador.MIN_DORSAL && dorsal <= Jugador.MAX_DORSAL;
  }

  /**
   * Valida formato de teléfono internacional
   */
  static esTelefonoValido(telefono) {
    if (!telefono || typeof telefono !== "string") {
      return false;
    }
    return Jugador.TELEFONO_REGEX.test(telefono);
  }

  /**
   * Crea un jugador desde datos de base de datos
   */
  static fromDatabase(data) {
    return new Jugador({
      id: data.id,
      usuarioId: data.usuario_id,
      numeroDorsal: data.numero_dorsal,
      posicionId: data.posicion_id,
      telefono: data.telefono,
      fechaNacimiento: data.fecha_nacimiento,
      alias: data.alias,
      fotoUrl: data.foto_url,
      createdAt: data.created_at ? new Date(data.created_at) : null,
      skipValidation: true, // Permitir datos legacy sin usuario_id
    });
  }
}
