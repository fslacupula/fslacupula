# Repository Interfaces - Documentación

## 📋 Visión General

Las interfaces de repositorio definen los **contratos** entre la capa de dominio y la capa de infraestructura, siguiendo el **Principio de Inversión de Dependencias (DIP)** de SOLID.

### Principios Aplicados

#### 1. Inversión de Dependencias (DIP)

```
┌─────────────────────────────────────────────────┐
│              CAPA DE APLICACIÓN                 │
│         (Casos de Uso / Servicios)              │
│                      ↓                          │
│              Depende de ↓                       │
└─────────────────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────┐
│              CAPA DE DOMINIO                    │
│         IUsuarioRepository (Interface)          │
│         IJugadorRepository (Interface)          │
│         IPartidoRepository (Interface)          │
│         IEntrenamientoRepository (Interface)    │
└─────────────────────────────────────────────────┘
                       ↑
                Implementa ↑
                       ↑
┌─────────────────────────────────────────────────┐
│           CAPA DE INFRAESTRUCTURA               │
│      PostgresUsuarioRepository (Implementación) │
│      PostgresJugadorRepository (Implementación) │
│      PostgresPartidoRepository (Implementación) │
│   PostgresEntrenamientoRepository (Implement.)  │
└─────────────────────────────────────────────────┘
```

**Beneficios:**

- ✅ El dominio NO depende de la infraestructura
- ✅ Fácil cambio de base de datos (Postgres → MongoDB → etc)
- ✅ Testing simplificado (mocks de interfaces)
- ✅ Separación clara de responsabilidades

---

## 📚 Interfaces Definidas

### 1. IUsuarioRepository

**Responsabilidad:** Gestión de persistencia de entidades Usuario

**Métodos principales:**

- `findById(id)` - Buscar por ID
- `findByEmail(email)` - Buscar por email único
- `findAll(filters)` - Listar con filtros
- `findPaginated(page, limit, filters)` - Paginación
- `create(usuario)` - Crear nuevo
- `update(id, usuario)` - Actualizar existente
- `delete(id)` - Soft delete (marcar inactivo)
- `hardDelete(id)` - Eliminación permanente
- `existsByEmail(email, excludeId)` - Verificar unicidad
- `count(filters)` - Contar registros
- `findAllJugadores()` - Obtener jugadores
- `findAllGestores()` - Obtener gestores
- `findActivos()` - Obtener usuarios activos

**Ejemplo de uso:**

```javascript
// En un caso de uso
class CrearUsuarioUseCase {
  constructor(usuarioRepository) {
    this.usuarioRepository = usuarioRepository; // IUsuarioRepository
  }

  async execute(data) {
    // Verificar que el email no exista
    const existe = await this.usuarioRepository.existsByEmail(data.email);
    if (existe) {
      throw new Error("Email ya registrado");
    }

    // Crear el usuario
    const usuario = new Usuario(/* ... */);
    return await this.usuarioRepository.create(usuario);
  }
}
```

---

### 2. IJugadorRepository

**Responsabilidad:** Gestión de persistencia de entidades Jugador (extensión de Usuario)

**Métodos principales:**

- `findById(id)` - Buscar por ID
- `findByUsuarioId(usuarioId)` - Buscar por usuario asociado
- `findAll(filters)` - Listar con filtros
- `findPaginated(page, limit, filters)` - Paginación
- `findByNumeroDorsal(numeroDorsal)` - Buscar por dorsal
- `findByPosicion(posicion)` - Filtrar por posición
- `create(jugador)` - Crear nuevo
- `update(id, jugador)` - Actualizar existente
- `delete(id)` - Eliminar
- `existsByNumeroDorsal(numeroDorsal, excludeId)` - Verificar unicidad de dorsal
- `count(filters)` - Contar registros
- `findWithCompleteProfile()` - Jugadores con datos completos
- `findWithIncompleteProfile()` - Jugadores con datos incompletos
- `getStatsByPosicion()` - Estadísticas por posición

**Ejemplo de uso:**

```javascript
class AsignarDorsalUseCase {
  constructor(jugadorRepository) {
    this.jugadorRepository = jugadorRepository;
  }

  async execute(jugadorId, numeroDorsal) {
    // Verificar que el dorsal no esté ocupado
    const ocupado = await this.jugadorRepository.existsByNumeroDorsal(
      numeroDorsal,
      jugadorId
    );

    if (ocupado) {
      throw new Error("Dorsal ya asignado a otro jugador");
    }

    const jugador = await this.jugadorRepository.findById(jugadorId);
    jugador.cambiarNumeroDorsal(numeroDorsal);

    return await this.jugadorRepository.update(jugadorId, jugador);
  }
}
```

---

### 3. IPartidoRepository

**Responsabilidad:** Gestión de persistencia de entidades Partido

**Métodos principales:**

- `findById(id)` - Buscar por ID
- `findAll(filters)` - Listar con filtros (tipo, fechas, resultado)
- `findPaginated(page, limit, filters)` - Paginación
- `findByTipo(tipo)` - Filtrar por tipo (liga/amistoso/copa/torneo)
- `findByDateRange(fechaInicio, fechaFin)` - Rango de fechas
- `findUpcoming(limit)` - Próximos partidos
- `findPast(limit)` - Partidos pasados
- `findWithResult()` - Con resultado registrado
- `findWithoutResult()` - Sin resultado (pendientes)
- `findByRival(rival)` - Buscar por rival
- `findByLugar(lugar)` - Buscar por lugar
- `create(partido)` - Crear nuevo
- `update(id, partido)` - Actualizar existente
- `delete(id)` - Eliminar
- `count(filters)` - Contar registros
- `getStats()` - Estadísticas generales
- `getStatsByTipo()` - Estadísticas por tipo
- `getNext()` - Próximo partido
- `getLast()` - Último partido jugado

**Ejemplo de uso:**

```javascript
class ObtenerProximosPartidosUseCase {
  constructor(partidoRepository) {
    this.partidoRepository = partidoRepository;
  }

  async execute(limite = 5) {
    return await this.partidoRepository.findUpcoming(limite);
  }
}

class RegistrarResultadoUseCase {
  constructor(partidoRepository) {
    this.partidoRepository = partidoRepository;
  }

  async execute(partidoId, golesLocal, golesVisitante) {
    const partido = await this.partidoRepository.findById(partidoId);

    if (!partido) {
      throw new Error("Partido no encontrado");
    }

    if (!partido.esPasado()) {
      throw new Error("No se puede registrar resultado de partido futuro");
    }

    partido.registrarResultado(golesLocal, golesVisitante);
    return await this.partidoRepository.update(partidoId, partido);
  }
}
```

---

### 4. IEntrenamientoRepository

**Responsabilidad:** Gestión de persistencia de entidades Entrenamiento

**Métodos principales:**

- `findById(id)` - Buscar por ID
- `findAll(filters)` - Listar con filtros
- `findPaginated(page, limit, filters)` - Paginación
- `findByDateRange(fechaInicio, fechaFin)` - Rango de fechas
- `findUpcoming(limit)` - Próximos entrenamientos
- `findPast(limit)` - Entrenamientos pasados
- `findByLugar(lugar)` - Buscar por lugar
- `findToday()` - Entrenamientos de hoy
- `findThisWeek()` - Entrenamientos de esta semana
- `findThisMonth()` - Entrenamientos de este mes
- `create(entrenamiento)` - Crear nuevo
- `update(id, entrenamiento)` - Actualizar existente
- `delete(id)` - Eliminar
- `count(filters)` - Contar registros
- `getStats()` - Estadísticas generales
- `getStatsByLugar()` - Estadísticas por lugar
- `getNext()` - Próximo entrenamiento
- `getLast()` - Último entrenamiento
- `hasScheduleConflict(fechaHora, duracion, excludeId)` - Verificar conflictos de horario

**Ejemplo de uso:**

```javascript
class ProgramarEntrenamientoUseCase {
  constructor(entrenamientoRepository) {
    this.entrenamientoRepository = entrenamientoRepository;
  }

  async execute(data) {
    // Verificar conflictos de horario
    const hayConflicto = await this.entrenamientoRepository.hasScheduleConflict(
      data.fechaHora,
      data.duracion
    );

    if (hayConflicto) {
      throw new Error("Ya existe un entrenamiento programado en ese horario");
    }

    const entrenamiento = new Entrenamiento(/* ... */);
    return await this.entrenamientoRepository.create(entrenamiento);
  }
}
```

---

## 🔧 Implementación de Interfaces

### Estructura recomendada

```
src/
├── domain/
│   ├── entities/
│   ├── valueObjects/
│   ├── repositories/          ← Interfaces (contratos)
│   │   ├── IUsuarioRepository.js
│   │   ├── IJugadorRepository.js
│   │   ├── IPartidoRepository.js
│   │   ├── IEntrenamientoRepository.js
│   │   └── index.js
│   └── errors/
└── infrastructure/
    └── persistence/
        └── postgres/          ← Implementaciones concretas
            ├── PostgresUsuarioRepository.js
            ├── PostgresJugadorRepository.js
            ├── PostgresPartidoRepository.js
            └── PostgresEntrenamientoRepository.js
```

### Ejemplo de implementación

```javascript
// infrastructure/persistence/postgres/PostgresUsuarioRepository.js
import { IUsuarioRepository } from "../../../domain/repositories/IUsuarioRepository.js";
import { Usuario } from "../../../domain/entities/Usuario.js";

export class PostgresUsuarioRepository extends IUsuarioRepository {
  constructor(pool) {
    super();
    this.pool = pool;
  }

  async findById(id) {
    const result = await this.pool.query(
      "SELECT * FROM usuarios WHERE id = $1",
      [id]
    );

    if (result.rows.length === 0) return null;

    return Usuario.fromDatabase(result.rows[0]);
  }

  async findByEmail(email) {
    const result = await this.pool.query(
      "SELECT * FROM usuarios WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) return null;

    return Usuario.fromDatabase(result.rows[0]);
  }

  async create(usuario) {
    const result = await this.pool.query(
      `INSERT INTO usuarios (email, password, nombre, rol, activo)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        usuario.email,
        usuario.password,
        usuario.nombre,
        usuario.rol,
        usuario.activo,
      ]
    );

    return Usuario.fromDatabase(result.rows[0]);
  }

  // ... implementar resto de métodos
}
```

---

## 🧪 Testing con Interfaces

### Ventajas para Testing

Las interfaces facilitan enormemente el testing mediante **mocks**:

```javascript
// tests/mocks/MockUsuarioRepository.js
import { IUsuarioRepository } from "../../src/domain/repositories/IUsuarioRepository.js";

export class MockUsuarioRepository extends IUsuarioRepository {
  constructor() {
    super();
    this.usuarios = [];
    this.nextId = 1;
  }

  async findById(id) {
    return this.usuarios.find((u) => u.id === id) || null;
  }

  async findByEmail(email) {
    return this.usuarios.find((u) => u.email === email) || null;
  }

  async create(usuario) {
    usuario.id = this.nextId++;
    this.usuarios.push(usuario);
    return usuario;
  }

  async existsByEmail(email, excludeId = null) {
    return this.usuarios.some((u) => u.email === email && u.id !== excludeId);
  }

  // ... resto de métodos
}
```

**Uso en tests:**

```javascript
import { CrearUsuarioUseCase } from "../src/application/useCases/CrearUsuarioUseCase.js";
import { MockUsuarioRepository } from "./mocks/MockUsuarioRepository.js";

describe("CrearUsuarioUseCase", () => {
  test("should create user successfully", async () => {
    const repository = new MockUsuarioRepository();
    const useCase = new CrearUsuarioUseCase(repository);

    const result = await useCase.execute({
      email: "test@test.com",
      password: "Pass123!",
      nombre: "Test User",
      rol: "jugador",
    });

    expect(result.id).toBeDefined();
    expect(result.email).toBe("test@test.com");
  });

  test("should throw error if email exists", async () => {
    const repository = new MockUsuarioRepository();
    await repository.create({ email: "existing@test.com" /* ... */ });

    const useCase = new CrearUsuarioUseCase(repository);

    await expect(
      useCase.execute({ email: "existing@test.com" /* ... */ })
    ).rejects.toThrow("Email ya registrado");
  });
});
```

---

## 📐 Patrones de Diseño Aplicados

### 1. Repository Pattern

Abstrae la lógica de acceso a datos del dominio.

### 2. Dependency Inversion Principle (DIP)

- Módulos de alto nivel (casos de uso) no dependen de módulos de bajo nivel (DB)
- Ambos dependen de abstracciones (interfaces)

### 3. Interface Segregation Principle (ISP)

Cada interfaz tiene métodos cohesivos y específicos para su entidad.

### 4. Single Responsibility Principle (SRP)

Cada repositorio gestiona la persistencia de UNA entidad.

---

## 🎯 Convenciones y Buenas Prácticas

### Nomenclatura de métodos

| Operación            | Método                      | Retorno                 |
| -------------------- | --------------------------- | ----------------------- |
| Buscar uno           | `findById`, `findByEmail`   | `Promise<Entity\|null>` |
| Buscar varios        | `findAll`, `findByXxx`      | `Promise<Entity[]>`     |
| Verificar existencia | `existsByXxx`               | `Promise<boolean>`      |
| Crear                | `create`                    | `Promise<Entity>`       |
| Actualizar           | `update`                    | `Promise<Entity>`       |
| Eliminar             | `delete`, `hardDelete`      | `Promise<boolean>`      |
| Contar               | `count`                     | `Promise<number>`       |
| Obtener uno especial | `getNext`, `getLast`        | `Promise<Entity\|null>` |
| Estadísticas         | `getStats`, `getStatsByXxx` | `Promise<Object>`       |

### Filtros

```javascript
{
  // Filtros opcionales siempre como objeto
  filters: {
    campo1: valor1,
    campo2: valor2
  }
}
```

### Paginación

```javascript
{
  page: 1,           // Número de página (1-indexed)
  limit: 10,         // Resultados por página
  total: 100,        // Total de resultados
  totalPages: 10,    // Total de páginas
  data: [/* ... */]  // Resultados
}
```

---

## ✅ Checklist de Implementación

Cuando implementes estas interfaces en la capa de infraestructura:

- [ ] Heredar de la interfaz correspondiente
- [ ] Implementar TODOS los métodos
- [ ] Manejar errores de base de datos apropiadamente
- [ ] Convertir datos de DB a entidades del dominio
- [ ] Validar parámetros de entrada
- [ ] Usar transacciones cuando sea necesario
- [ ] Loggear operaciones importantes
- [ ] Implementar retry logic para operaciones críticas
- [ ] Manejar conexiones de DB eficientemente
- [ ] Escribir tests de integración

---

## 🚀 Próximos Pasos

### Fase 2 - Casos de Uso

Una vez implementadas estas interfaces, se crearán los casos de uso que las utilicen:

```javascript
// application/useCases/usuario/
├── CrearUsuarioUseCase.js
├── ActualizarUsuarioUseCase.js
├── ObtenerUsuarioPorIdUseCase.js
└── ListarUsuariosUseCase.js
```

### Fase 3 - Implementación en Infraestructura

```javascript
// infrastructure/persistence/postgres/
├── PostgresUsuarioRepository.js
├── PostgresJugadorRepository.js
├── PostgresPartidoRepository.js
└── PostgresEntrenamientoRepository.js
```

---

**Documentación generada para Tarea 1.4 - Repository Interfaces**
