/**
 * Error base del dominio
 * Todos los errores de dominio deben extender de esta clase
 */
export class DomainError extends Error {
  constructor(message) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}
