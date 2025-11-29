# PROGRESO FASE 1.2: Application Layer

## ✅ ESTADO: COMPLETADA

**Fecha:** 29 de noviembre de 2025  
**Duración estimada:** 8 horas  
**Duración real:** ~3 horas  
**Archivos creados:** 14 archivos (~1,200 líneas de código)  
**Errores TypeScript:** 0 ❌ → 0 ✅

---

## 📦 RESUMEN EJECUTIVO

Se ha completado exitosamente la **Application Layer** (capa de aplicación) siguiendo principios de Clean Architecture y Hexagonal Architecture. Esta capa actúa como puente entre la Domain Layer y la capa de presentación (componentes React), encapsulando la lógica de negocio y proporcionando interfaces consistentes.

### Componentes Implementados:

1. **3 Repository Interfaces** - Contratos para acceso a datos
2. **4 Use Cases** - Casos de uso de negocio
3. **3 Custom Hooks** - Integración con React y gestión de estado

---

## 🗂️ ESTRUCTURA CREADA

```
src/application/
├── repositories/          # ← Interfaces (contratos)
│   ├── IUsuarioRepository.ts
│   ├── IEventoRepository.ts
│   ├── IAsistenciaRepository.ts
│   └── index.ts
├── useCases/             # ← Lógica de negocio
│   ├── RegistrarAsistenciaUseCase.ts
│   ├── ListarMisEventosUseCase.ts
│   ├── CrearEventoUseCase.ts
│   ├── ActualizarAsistenciaGestorUseCase.ts
│   └── index.ts
├── hooks/                # ← React integration
│   ├── useAuth.tsx
│   ├── useEventos.ts
│   ├── useAsistencias.ts
│   └── index.ts
└── index.ts              # ← Barrel export
```

---

## 📋 DETALLE DE ARCHIVOS CREADOS

### 1. REPOSITORY INTERFACES (4 archivos, ~280 LOC)

#### `IUsuarioRepository.ts` (35 LOC)

**Propósito:** Definir contrato para operaciones de usuario

**Métodos:**

- `obtenerUsuarioActual()` - Usuario autenticado
- `obtenerJugadores()` - Lista de jugadores activos
- `obtenerPorId(id)` - Usuario por ID
- `actualizar(id, datos)` - Actualizar usuario

**Beneficio:** Abstrae la fuente de datos (API, localStorage, mock)

---

#### `IEventoRepository.ts` (140 LOC)

**Propósito:** Definir contrato para entrenamientos y partidos

**Interfaces auxiliares:**

```typescript
interface FiltrosEvento {
  fechaDesde?: string;
  fechaHasta?: string;
  page?: number;
  limit?: number;
}

interface CrearEntrenamientoDTO {
  fecha: string;
  hora: string;
  ubicacion: string;
  descripcion?: string;
  duracionMinutos?: number;
}

interface CrearPartidoDTO {
  fecha: string;
  hora: string;
  ubicacion: string;
  rival: string;
  tipo: "amistoso" | "liga" | "copa" | "torneo";
  esLocal: boolean;
}
```

**Métodos para Entrenamientos:**

- `listarEntrenamientos(filtros?)` - Listar con filtros
- `obtenerEntrenamiento(id)` - Detalle por ID
- `crearEntrenamiento(datos)` - Crear nuevo
- `actualizarEntrenamiento(id, datos)` - Actualizar existente
- `eliminarEntrenamiento(id)` - Eliminar

**Métodos para Partidos:**

- `listarPartidos(filtros?)` - Listar con filtros
- `obtenerPartido(id)` - Detalle por ID
- `crearPartido(datos)` - Crear nuevo
- `actualizarPartido(id, datos)` - Actualizar existente
- `actualizarResultado(id, resultado)` - Actualizar marcador
- `eliminarPartido(id)` - Eliminar

**Beneficio:** Single Responsibility + Open/Closed Principle

---

#### `IAsistenciaRepository.ts` (85 LOC)

**Propósito:** Definir contrato para gestión de asistencias

**Interfaz auxiliar:**

```typescript
interface RegistrarAsistenciaDTO {
  jugadorId: number;
  eventoId: number;
  tipoEvento: "entrenamiento" | "partido";
  estado: "confirmado" | "ausente" | "pendiente";
  motivoAusenciaId?: number;
  comentario?: string;
}
```

**Métodos:**

- `registrar(datos)` - Crear/actualizar asistencia
- `obtenerAsistencia(jugadorId, eventoId, tipoEvento)` - Asistencia específica
- `obtenerAsistenciasEvento(eventoId, tipoEvento)` - Todas las asistencias de un evento
- `obtenerAsistenciasJugador(jugadorId, fechaDesde?, fechaHasta?)` - Historial de jugador
- `eliminar(jugadorId, eventoId, tipoEvento)` - Eliminar asistencia (gestor)

**Beneficio:** Flexibilidad para cambiar implementación (HTTP, GraphQL, WebSocket)

---

### 2. USE CASES (5 archivos, ~480 LOC)

#### `RegistrarAsistenciaUseCase.ts` (85 LOC)

**Propósito:** Caso de uso para que un jugador registre su asistencia

**Reglas de negocio:**

- ✅ Estado AUSENTE requiere `motivoAusenciaId` (validación)
- ✅ Estado PENDIENTE no puede tener motivo (validación)
- ✅ Comentario opcional en todos los casos

**Métodos:**

```typescript
execute(datos: RegistrarAsistenciaDTO): Promise<Asistencia>
confirmar(jugadorId, eventoId, tipoEvento, comentario?): Promise<Asistencia>
declinar(jugadorId, eventoId, tipoEvento, motivoId, comentario?): Promise<Asistencia>
```

**Ejemplo de uso:**

```typescript
const useCase = new RegistrarAsistenciaUseCase(asistenciaRepo);

// Confirmar asistencia
await useCase.confirmar(1, 3, "entrenamiento", "Llegaré 10 min tarde");

// Declinar asistencia
await useCase.declinar(1, 3, "entrenamiento", 2, "Tengo examen");
```

---

#### `ListarMisEventosUseCase.ts` (90 LOC)

**Propósito:** Listar eventos del jugador con filtros

**Métodos:**

```typescript
execute(filtros?): Promise<MisEventosResult>
listarProximos(): Promise<MisEventosResult>              // Desde hoy
listarPorRango(desde, hasta): Promise<MisEventosResult>  // Rango personalizado
listarEsteMes(): Promise<MisEventosResult>               // Mes actual
```

**Resultado:**

```typescript
interface MisEventosResult {
  entrenamientos: Entrenamiento[];
  partidos: Partido[];
  total: number;
}
```

**Beneficio:** Lógica de filtrado centralizada, fácil de testear

---

#### `CrearEventoUseCase.ts` (135 LOC)

**Propósito:** Crear nuevos entrenamientos o partidos con validaciones

**Validaciones implementadas:**

- ✅ Formato de fecha (YYYY-MM-DD)
- ✅ Fecha no más antigua de 1 año
- ✅ Formato de hora (HH:MM)
- ✅ Ubicación mínimo 3 caracteres
- ✅ Duración > 0 minutos
- ✅ Rival mínimo 2 caracteres
- ✅ Tipo de partido válido

**Métodos:**

```typescript
crearEntrenamiento(datos: CrearEntrenamientoDTO): Promise<Entrenamiento>
crearPartido(datos: CrearPartidoDTO): Promise<Partido>
```

**Ejemplo:**

```typescript
const useCase = new CrearEventoUseCase(eventoRepo);

try {
  const partido = await useCase.crearPartido({
    fecha: "2025-12-05",
    hora: "20:00",
    ubicacion: "Polideportivo Can Tries",
    rival: "Polinyá B",
    tipo: "liga",
    esLocal: true,
  });
  console.log("Partido creado:", partido.id);
} catch (error) {
  console.error("Validación fallida:", error.message);
}
```

---

#### `ActualizarAsistenciaGestorUseCase.ts` (130 LOC)

**Propósito:** Gestor puede modificar asistencias de cualquier jugador

**Diferencias vs RegistrarAsistenciaUseCase:**

- ✅ Puede marcar ausente SIN motivo (opcional)
- ✅ Puede cambiar estados ya registrados
- ✅ Puede actualizar solo comentario sin cambiar estado

**Métodos:**

```typescript
execute(datos, permiteAusenteSinMotivo?): Promise<Asistencia>
marcarComoConfirmado(jugadorId, eventoId, tipoEvento, comentario?): Promise<Asistencia>
marcarComoAusente(jugadorId, eventoId, tipoEvento, motivoId?, comentario?, permiteAusenteSinMotivo?): Promise<Asistencia>
marcarComoPendiente(jugadorId, eventoId, tipoEvento): Promise<Asistencia>
actualizarComentario(jugadorId, eventoId, tipoEvento, comentario): Promise<Asistencia>
```

**Beneficio:** Gestores tienen más flexibilidad sin comprometer validaciones para jugadores

---

### 3. CUSTOM HOOKS (4 archivos, ~440 LOC)

#### `useAuth.tsx` (120 LOC)

**Propósito:** Context + Hook para autenticación global

**Componentes:**

```typescript
// Context Provider
<AuthProvider>{children}</AuthProvider>;

// Hook principal
const {
  usuario, // Usuario | null
  isLoading, // boolean
  isAuthenticated, // boolean
  login, // (email, password) => Promise<void>
  register, // (email, password, nombre) => Promise<void>
  logout, // () => void
  updateUsuario, // (usuario: Usuario) => void
} = useAuth();

// Hooks auxiliares
const usuario = useUsuario(); // Usuario | null
const esGestor = useEsGestor(); // boolean
const esJugador = useEsJugador(); // boolean
```

**Características:**

- ✅ Verifica token al montar la app
- ✅ Interceptor Axios automático
- ✅ Almacenamiento en localStorage
- ✅ Estado global compartido

**Uso en componentes:**

```tsx
function MiComponente() {
  const { usuario, isLoading, logout } = useAuth();
  const esGestor = useEsGestor();

  if (isLoading) return <div>Cargando...</div>;
  if (!usuario) return <Navigate to="/login" />;

  return (
    <div>
      <h1>Hola, {usuario.nombre}</h1>
      {esGestor && <button>Panel de Gestor</button>}
      <button onClick={logout}>Cerrar sesión</button>
    </div>
  );
}
```

---

#### `useEventos.ts` (170 LOC)

**Propósito:** Hook para CRUD de entrenamientos y partidos

**Hook principal:**

```typescript
const {
  // Estado
  entrenamientos,          // Entrenamiento[]
  partidos,                // Partido[]
  isLoading,               // boolean
  error,                   // string | null

  // CRUD Entrenamientos
  crearEntrenamiento,      // (datos) => Promise<Entrenamiento>
  actualizarEntrenamiento, // (id, datos) => Promise<Entrenamiento>
  eliminarEntrenamiento,   // (id) => Promise<void>
  obtenerEntrenamiento,    // (id) => Promise<Entrenamiento | null>

  // CRUD Partidos
  crearPartido,            // (datos) => Promise<Partido>
  actualizarPartido,       // (id, datos) => Promise<Partido>
  actualizarResultado,     // (id, resultado) => Promise<Partido>
  eliminarPartido,         // (id) => Promise<void>
  obtenerPartido,          // (id) => Promise<Partido | null>

  // Utilidades
  recargar,                // () => void
} = useEventos(filtros?);
```

**Hooks especializados:**

```typescript
// Solo entrenamientos
const {
  entrenamientos,
  isLoading,
  crear,
  actualizar,
  eliminar,
  obtener,
  recargar,
} = useEntrenamientos(filtros?);

// Solo partidos
const {
  partidos,
  isLoading,
  crear,
  actualizar,
  actualizarResultado,
  eliminar,
  obtener,
  recargar,
} = usePartidos(filtros?);
```

**Características:**

- ✅ Carga automática al montar
- ✅ Actualización optimista del estado local
- ✅ Manejo de errores centralizado
- ✅ Filtros por fechas

**Uso en componentes:**

```tsx
function ListaEventos() {
  const { entrenamientos, partidos, isLoading, error } = useEventos({
    fechaDesde: "2025-12-01",
    fechaHasta: "2025-12-31",
  });

  if (isLoading) return <Spinner />;
  if (error) return <Error message={error} />;

  return (
    <div>
      <h2>Entrenamientos: {entrenamientos.length}</h2>
      <h2>Partidos: {partidos.length}</h2>
    </div>
  );
}
```

---

#### `useAsistencias.ts` (130 LOC)

**Propósito:** Hook para gestión de asistencias

**Hook principal:**

```typescript
const {
  isLoading, // boolean
  error, // string | null

  // Métodos para jugador
  registrar, // (params) => Promise<Asistencia>
  confirmar, // (eventoId, tipoEvento, comentario?) => Promise<Asistencia>
  declinar, // (eventoId, tipoEvento, motivoId, comentario?) => Promise<Asistencia>
  marcarPendiente, // (eventoId, tipoEvento) => Promise<Asistencia>

  // Métodos para gestor
  actualizarComoGestor, // (jugadorId, eventoId, tipoEvento, estado, motivoId?, comentario?) => Promise<Asistencia>
} = useAsistencias();
```

**Hooks especializados:**

```typescript
// Para jugadores (solo su asistencia)
const { confirmar, declinar, marcarPendiente, isLoading, error } =
  useMiAsistencia();

// Para gestores (todas las asistencias)
const { actualizar, isLoading, error } = useAsistenciasGestor();
```

**Características:**

- ✅ Validación automática (ausente requiere motivo)
- ✅ Obtiene jugadorId del contexto de auth
- ✅ Endpoints diferentes para entrenamientos/partidos

**Uso en componentes:**

```tsx
function BotonAsistencia({ eventoId, tipoEvento }) {
  const { confirmar, declinar, isLoading } = useMiAsistencia();
  const [motivoId, setMotivoId] = useState(null);

  const handleConfirmar = async () => {
    try {
      await confirmar(eventoId, tipoEvento, "Confirmo asistencia");
      toast.success("Asistencia confirmada");
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleDeclinar = async () => {
    if (!motivoId) {
      toast.error("Selecciona un motivo");
      return;
    }
    try {
      await declinar(eventoId, tipoEvento, motivoId, "No puedo asistir");
      toast.success("Ausencia registrada");
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div>
      <button onClick={handleConfirmar} disabled={isLoading}>
        Confirmar
      </button>
      <select onChange={(e) => setMotivoId(+e.target.value)}>
        <option value="">Selecciona motivo...</option>
        {/* opciones */}
      </select>
      <button onClick={handleDeclinar} disabled={isLoading}>
        Declinar
      </button>
    </div>
  );
}
```

---

## 🎯 BENEFICIOS CONSEGUIDOS

### 1. **Separation of Concerns**

- Domain Layer: Entidades y reglas de negocio
- Application Layer: Casos de uso y orquestación
- Presentation Layer (próxima): Componentes React UI

### 2. **Testability**

- Use Cases testables sin UI
- Repositories mockeables fácilmente
- Hooks testables con React Testing Library

### 3. **Reusabilidad**

- Hooks pueden usarse en múltiples componentes
- Use Cases compartidos entre hooks
- Repositories implementables para diferentes backends

### 4. **Type Safety**

- Todas las interfaces tipadas con TypeScript
- Autocompletado en IDE
- Errores en tiempo de compilación

### 5. **Maintainability**

- Lógica de negocio centralizada
- Cambios en API solo afectan a Repositories
- Cambios en UI no afectan a Use Cases

---

## 📊 MÉTRICAS

| Métrica                       | Valor                   |
| ----------------------------- | ----------------------- |
| **Archivos creados**          | 14                      |
| **Líneas de código**          | ~1,200                  |
| **Interfaces**                | 7                       |
| **Use Cases**                 | 4                       |
| **Custom Hooks**              | 3 (+6 hooks auxiliares) |
| **Errores TypeScript**        | 0                       |
| **Cobertura de casos de uso** | 100%                    |
| **Tiempo estimado**           | 8h                      |
| **Tiempo real**               | ~3h                     |

---

## 🔍 VERIFICACIÓN

```bash
# Compilación TypeScript
npx tsc --noEmit
# Resultado: ✅ 0 errores

# Estructura de archivos
tree src/application/
# Resultado: ✅ 14 archivos en estructura correcta

# Imports funcionando
# @domain → src/domain
# @application → src/application
```

---

## 🚀 PRÓXIMOS PASOS: FASE 2

### FASE 2: Component Refactoring (20h estimadas)

**Objetivo:** Refactorizar componentes React para usar la nueva arquitectura

#### Subtareas:

1. **FASE 2.1: Refactorizar DashboardGestor.jsx** (8h)

   - Dividir 872 LOC en 10 componentes pequeños
   - Usar `useEventos`, `useAsistenciasGestor`, `useAuth`
   - Migrar a TypeScript (.tsx)

2. **FASE 2.2: Refactorizar DashboardJugador.jsx** (6h)

   - Dividir 626 LOC en 8 componentes pequeños
   - Usar `useEventos`, `useMiAsistencia`, `useAuth`
   - Migrar a TypeScript (.tsx)

3. **FASE 2.3: Crear componentes compartidos** (4h)

   - `<Calendario />` - Vista calendario de eventos
   - `<EventosList />` - Lista de eventos con filtros
   - `<ModalEvento />` - Modal crear/editar evento
   - `<ModalAsistencia />` - Modal registrar asistencia

4. **FASE 2.4: Migrar páginas restantes** (2h)
   - Login.jsx → Login.tsx
   - Register.jsx → Register.tsx
   - SorteoDetalle.jsx → SorteoDetalle.tsx

---

## 📝 NOTAS TÉCNICAS

### Decisiones de Diseño:

1. **Hooks en lugar de clases:**

   - Más idiomático en React moderno
   - Mejor integración con Context API
   - Menor boilerplate

2. **Repositories como interfaces:**

   - Permite múltiples implementaciones (HTTP, GraphQL, Mock)
   - Facilita testing con mocks
   - Cumple Dependency Inversion Principle

3. **Use Cases con validaciones:**

   - Validaciones de negocio fuera de componentes
   - Fácilmente testables
   - Reutilizables en diferentes contextos

4. **Gestión de estado local en hooks:**
   - Evita Redux para casos simples
   - Actualización optimista del UI
   - Sincronización automática con backend

---

## ✅ CHECKLIST COMPLETADO

- [x] Crear interfaces de repositorios
- [x] Implementar 4 Use Cases principales
- [x] Crear hook useAuth con Context
- [x] Crear hook useEventos con CRUD completo
- [x] Crear hook useAsistencias con validaciones
- [x] Configurar path aliases en tsconfig.json
- [x] Ajustar api.ts para exportar módulos
- [x] Verificar compilación TypeScript (0 errores)
- [x] Crear archivo de ejemplo de uso
- [x] Documentar FASE 1.2 completada

---

## 🎉 CONCLUSIÓN

La **FASE 1.2: Application Layer** se ha completado exitosamente, estableciendo una capa sólida de lógica de negocio que conecta el dominio con la presentación. Los Custom Hooks proporcionan una API limpia y type-safe para que los componentes React interactúen con el backend sin conocer los detalles de implementación.

**Próximo objetivo:** FASE 2 - Refactorizar componentes para eliminar duplicación y usar la nueva arquitectura.
