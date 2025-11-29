/**
 * Error de validación del dominio
 * Se lanza cuando una entidad o value object no cumple las reglas de negocio
 */
import { DomainError } from "./DomainError.js";

export class ValidationError extends DomainError {
  constructor(message, field = null) {
    super(message);
    this.field = field;
  }
}
