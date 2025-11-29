import { Email } from "../valueObjects/Email";

export type RolUsuario = "gestor" | "jugador";

export interface UsuarioDTO {
  id: number;
  email: string;
  nombre: string;
  rol: RolUsuario;
  activo: boolean;
  createdAt?: string;
}

export class Usuario {
  constructor(
    public readonly id: number,
    public readonly email: Email,
    public readonly nombre: string,
    public readonly rol: RolUsuario,
    public readonly activo: boolean,
    public readonly createdAt?: Date
  ) {
    this.validate();
  }

  private validate(): void {
    if (!this.nombre || this.nombre.trim().length === 0) {
      throw new Error("El nombre es requerido");
    }
    if (!["gestor", "jugador"].includes(this.rol)) {
      throw new Error("Rol inválido");
    }
  }

  esGestor(): boolean {
    return this.rol === "gestor";
  }

  esJugador(): boolean {
    return this.rol === "jugador";
  }

  estaActivo(): boolean {
    return this.activo;
  }

  // Factory method para crear desde DTO
  static fromDTO(dto: UsuarioDTO): Usuario {
    return new Usuario(
      dto.id,
      new Email(dto.email),
      dto.nombre,
      dto.rol,
      dto.activo,
      dto.createdAt ? new Date(dto.createdAt) : undefined
    );
  }

  // Método para convertir a DTO
  toDTO(): UsuarioDTO {
    return {
      id: this.id,
      email: this.email.getValue(),
      nombre: this.nombre,
      rol: this.rol,
      activo: this.activo,
      createdAt: this.createdAt?.toISOString(),
    };
  }
}
