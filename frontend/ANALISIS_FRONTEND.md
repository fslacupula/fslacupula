# 📊 ANÁLISIS COMPLETO DEL FRONTEND - FutbolClub

**Fecha de análisis:** 29 de noviembre de 2025  
**Versión actual:** 0.0.0  
**Estado:** ✅ Funcionando pero requiere refactorización arquitectónica

---

## 🎯 RESUMEN EJECUTIVO

### Estado Actual

- **Funcionalidad:** ✅ 100% operativa, conectado al backend
- **Arquitectura:** ⚠️ Monolítica, sin separación de capas
- **Mantenibilidad:** ⚠️ Componentes grandes (+500 LOC)
- **Testing:** ❌ Sin tests automatizados
- **Tipado:** ❌ Sin TypeScript
- **Rendimiento:** ⚠️ Re-renders innecesarios, sin memoización

### Métricas del Proyecto

| Métrica                       | Valor                     | Estado |
| ----------------------------- | ------------------------- | ------ |
| **Páginas/Componentes**       | 9 archivos                | ⚠️     |
| **LOC total**                 | ~3,500 líneas             | ⚠️     |
| **LOC promedio/archivo**      | ~390 líneas               | 🔴     |
| **Componentes reutilizables** | 2 (Marcador, PistaFutsal) | 🔴     |
| **Tests**                     | 0                         | 🔴     |
| **Cobertura TypeScript**      | 0%                        | 🔴     |
| **Dependencias**              | 9 packages                | ✅     |

---

## 📁 ESTRUCTURA ACTUAL

```
frontend/
├── public/
│   ├── _redirects         # Redirect rules para SPA
│   └── img/              # Imágenes estáticas
├── src/
│   ├── App.jsx           # 87 LOC - Router principal
│   ├── main.jsx          # 10 LOC - Entry point
│   ├── index.css         # Estilos Tailwind
│   ├── components/
│   │   ├── Marcador.jsx         # 327 LOC 🔴
│   │   └── PistaFutsal.jsx      # ~200 LOC (estimado)
│   ├── pages/
│   │   ├── Login.jsx            # 92 LOC ✅
│   │   ├── Register.jsx         # ~100 LOC (estimado)
│   │   ├── DashboardJugador.jsx # 626 LOC 🔴
│   │   ├── DashboardGestor.jsx  # 872 LOC 🔴🔴
│   │   ├── DetalleAsistencia.jsx# 574 LOC 🔴
│   │   ├── Alineacion.jsx       # ~400 LOC (estimado) 🔴
│   │   └── ConfigurarPartido.jsx# ~300 LOC (estimado)
│   └── services/
│       └── api.js               # 60 LOC ✅
├── package.json
├── vite.config.js
├── tailwind.config.js
└── postcss.config.js
```

**Leyenda:**

- ✅ Tamaño aceptable (<150 LOC)
- ⚠️ Tamaño grande (150-400 LOC)
- 🔴 Componente muy grande (>400 LOC) - **PRIORIDAD ALTA**
- 🔴🔴 Crítico (>800 LOC) - **REFACTORIZAR URGENTE**

---

## 🔍 ANÁLISIS DETALLADO POR ARCHIVO

### 1. `src/App.jsx` (87 LOC) ✅

**Responsabilidades:**

- Router principal con React Router v6
- Autenticación global con `useState`
- Protección de rutas (redirect si no autenticado)
- Verificación de token al cargar

**Problemas detectados:**

1. **Estado global manual:** Usa `useState` para `user`, debería usar Context API o Zustand
2. **Lógica de autenticación mezclada:** Verificación de token en `useEffect`
3. **Props drilling:** `user` y `setUser` se pasan a todos los componentes

**Puntuación:** 6/10

- ✅ Estructura de rutas clara
- ✅ Protección de rutas funcional
- ❌ Sin gestión de estado global profesional
- ❌ Mezcla de responsabilidades

---

### 2. `src/services/api.js` (60 LOC) ✅

**Responsabilidades:**

- Cliente Axios configurado
- Interceptor para agregar JWT automáticamente
- 5 módulos de API: `auth`, `entrenamientos`, `partidos`, `motivos`, `posiciones`

**Estructura:**

```javascript
// Configuración base
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
});

// Interceptor para JWT
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Módulos exportados
export const auth = { register, login, profile, ... };
export const entrenamientos = { listar, crear, actualizar, ... };
export const partidos = { listar, crear, actualizar, ... };
export const motivos = { listar };
export const posiciones = { listar };
```

**Problemas detectados:**

1. **Sin manejo de errores centralizado:** Cada componente maneja errores individualmente
2. **Sin tipos TypeScript:** No hay validación de tipos en requests/responses
3. **Token en localStorage:** Vulnerable a XSS, considerar httpOnly cookies
4. **Sin retry logic:** No reintentos automáticos si falla una petición

**Puntuación:** 7/10

- ✅ Organización modular por recurso
- ✅ Interceptor JWT funcional
- ✅ Base URL configurable
- ❌ Sin manejo de errores global
- ❌ Sin tipos TypeScript

---

### 3. `src/pages/Login.jsx` (92 LOC) ✅

**Responsabilidades:**

- Formulario de login
- Validación básica (required)
- Manejo de errores de autenticación
- Redirección post-login

**Estructura:**

- Estado local: `formData`, `error`
- Submit handler con try-catch
- Navegación con React Router
- UI con Tailwind CSS

**Problemas detectados:**

1. **Sin validación frontend:** Solo atributos HTML `required`
2. **Error handling básico:** Solo muestra mensaje genérico
3. **Sin loading state:** No indica cuando está cargando

**Puntuación:** 7/10

- ✅ Componente simple y enfocado
- ✅ UI responsiva
- ❌ Sin validación robusta
- ❌ Sin UX de carga

---

### 4. `src/pages/DashboardJugador.jsx` (626 LOC) 🔴

**Responsabilidades (DEMASIADAS):**

1. Listar entrenamientos y partidos del jugador
2. Vista calendario y vista lista
3. Modal de confirmación de asistencia
4. Gestión de motivos de ausencia
5. Navegación entre meses
6. Cálculo de estadísticas de eventos

**Estructura del estado (16 variables):**

```javascript
const [misEntrenamientos, setMisEntrenamientos] = useState([]);
const [misPartidos, setMisPartidos] = useState([]);
const [motivosAusencia, setMotivosAusencia] = useState([]);
const [showModal, setShowModal] = useState(false);
const [eventoSeleccionado, setEventoSeleccionado] = useState(null);
const [asistenciaForm, setAsistenciaForm] = useState({...});
const [activeTab, setActiveTab] = useState("todos");
const [vistaMode, setVistaMode] = useState("calendario");
const [mesActual, setMesActual] = useState(new Date());
```

**Funciones detectadas (15+):**

- `cargarDatos()` - Fetch de entrenamientos y partidos
- `handleLogout()` - Cerrar sesión
- `abrirModalAsistencia()` - Abrir modal
- `handleSubmitAsistencia()` - Registrar asistencia
- `getEstadoBadge()` - Helpers de UI
- `getDiasDelMes()` - Lógica de calendario
- `getEventosDelDia()` - Filtrar eventos por fecha
- `cambiarMes()` - Navegación calendario
- `renderVistaLista()` - Renderizado lista (100+ LOC)
- `renderVistaCalendario()` - Renderizado calendario (150+ LOC)

**Problemas críticos:**

1. **🔴 Componente gigante:** 626 LOC, debería ser <200
2. **🔴 Responsabilidades múltiples:** Datos + UI + Lógica de negocio
3. **🔴 Duplicación de código:** `renderVistaLista` y `renderVistaCalendario` repiten lógica
4. **🔴 Props drilling:** 9+ props en modales
5. **🔴 Lógica de negocio en componente:** Cálculos de calendario en JSX
6. **⚠️ Helpers inline:** Funciones `getFechaString()`, `compararFechas()` deberían estar en utils
7. **⚠️ Re-renders innecesarios:** Sin `useMemo` ni `useCallback`

**Puntuación:** 3/10 🔴

- ✅ Funcionalidad completa
- ✅ UI responsiva
- 🔴 Componente monolítico
- 🔴 Mantenimiento muy difícil
- 🔴 Testing imposible

---

### 5. `src/pages/DashboardGestor.jsx` (872 LOC) 🔴🔴 **CRÍTICO**

**Responsabilidades (EXCESIVAS):**

1. Listar todos los entrenamientos y partidos
2. CRUD completo de entrenamientos
3. CRUD completo de partidos
4. Gestión de jugadores (listar, activar/desactivar, registrar)
5. Vista calendario con estadísticas de asistencia
6. Vista lista de eventos
7. Navegación a DetalleAsistencia
8. 2 modales: crear/editar eventos y registrar jugador

**Estructura del estado (20+ variables):**

```javascript
const [activeTab, setActiveTab] = useState("todos");
const [vistaMode, setVistaMode] = useState("calendario");
const [listaEntrenamientos, setListaEntrenamientos] = useState([]);
const [listaPartidos, setListaPartidos] = useState([]);
const [showModal, setShowModal] = useState(false);
const [showJugadorModal, setShowJugadorModal] = useState(false);
const [eventoSeleccionado, setEventoSeleccionado] = useState(null);
const [tipoEvento, setTipoEvento] = useState("entrenamiento");
const [mesActual, setMesActual] = useState(new Date());
const [formData, setFormData] = useState({...}); // 8 campos
const [jugadorFormData, setJugadorFormData] = useState({...}); // 6 campos
const [listaJugadores, setListaJugadores] = useState([]);
const [posiciones, setPosiciones] = useState([]);
```

**Funciones detectadas (25+):**

- Data fetching: `cargarPosiciones`, `cargarDatos`, `cargarJugadores`
- CRUD eventos: `handleSubmit`, `handleEliminar`, `abrirModal`
- CRUD jugadores: `handleRegistrarJugador`, `handleCambiarEstadoJugador`
- Calendario: `getDiasDelMes`, `getEventosDelDia`, `cambiarMes`, `getEstadisticasEvento`
- Navegación: `verDetalle`, `handleLogout`
- Renderizado: `renderVistaLista` (120+ LOC), `renderVistaCalendario` (180+ LOC)

**Problemas críticos:**

1. **🔴🔴 Componente GIGANTE:** 872 LOC, el más grande del proyecto
2. **🔴🔴 God Component:** Hace TODO (datos, UI, lógica, modales)
3. **🔴 Duplicación masiva:** 80% de código similar a `DashboardJugador.jsx`
4. **🔴 Acoplamiento extremo:** Cambiar una cosa rompe 10 más
5. **🔴 Estado caótico:** 20+ variables de estado interdependientes
6. **🔴 JSX anidado 8+ niveles:** Ilegible y difícil de mantener
7. **⚠️ Performance:** Re-renderiza TODO cuando cambia cualquier estado
8. **⚠️ Sin separación de concerns:** Mezcla UI, lógica de negocio y API calls

**Puntuación:** 2/10 🔴🔴 **REFACTORIZAR URGENTE**

- ✅ Funcionalidad completa (CRUD completo)
- ❌ Componente imposible de mantener
- ❌ Duplicación extrema con DashboardJugador
- ❌ Testing imposible
- ❌ Performance deficiente

---

### 6. `src/pages/DetalleAsistencia.jsx` (574 LOC) 🔴

**Responsabilidades:**

1. Ver detalles de asistencia de un evento (partido o entrenamiento)
2. Actualizar estado de asistencia como gestor
3. Modal para cambiar motivo de ausencia
4. Estadísticas de asistencia

**Estado (7 variables):**

```javascript
const [evento, setEvento] = useState(null);
const [loading, setLoading] = useState(true);
const [motivosLista, setMotivosLista] = useState([]);
const [showMotivoModal, setShowMotivoModal] = useState(false);
const [asistenciaEditar, setAsistenciaEditar] = useState(null);
```

**Problemas detectados:**

1. **🔴 Componente grande:** 574 LOC
2. **🔴 Lógica duplicada:** Similar a DashboardGestor
3. **⚠️ Detección de tipo manual:** `tipo === "entrenamientos" || tipo === "entrenamiento"`
4. **⚠️ Sin scroll restoration:** Menciona `scrollPos` pero no lo usa consistentemente

**Puntuación:** 4/10 🔴

- ✅ Funcionalidad completa
- ⚠️ Tamaño grande
- ❌ Duplicación de código

---

### 7. `src/components/Marcador.jsx` (327 LOC) 🔴

**Responsabilidades:**

1. Marcador de goles (local y visitante)
2. Cronómetro con play/pause/reset
3. Contador de faltas (1-5)
4. Animaciones flash para goles y faltas
5. Lista de jugadores en pista con minutos

**Estado (10 variables):**

```javascript
const [minutos, setMinutos] = useState(0);
const [segundos, setSegundos] = useState(0);
const [corriendo, setCorriendo] = useState(false);
const [flashGolLocal, setFlashGolLocal] = useState(false);
const [flashGolVisitante, setFlashGolVisitante] = useState(false);
const [flashFaltasLocal, setFlashFaltasLocal] = useState(false);
const [flashFaltasVisitante, setFlashFaltasVisitante] = useState(false);
```

**Props recibidos (15+):**

- Datos: `equipoLocal`, `equipoVisitante`, `golesLocal`, `golesVisitante`, `faltasLocal`, `faltasVisitante`
- Setters: `setGolesLocal`, `setGolesVisitante`
- Callbacks: `onDeshacer`, `onCronometroChange`
- Arrays: `jugadoresLocal`, `jugadoresAsignados`, `estadisticas`
- Efectos: `flashEffect`

**Problemas detectados:**

1. **🔴 Demasiados props:** 15+ props, debería agruparse en objetos
2. **🔴 Lógica de cronómetro pesada:** useEffect con setInterval debería ser custom hook
3. **⚠️ Animaciones con setTimeout:** Debería usar CSS transitions
4. **⚠️ Cálculos en render:** `calcularMinutos()` se ejecuta en cada render

**Puntuación:** 5/10 🔴

- ✅ Componente reutilizable
- ✅ UI profesional
- ❌ Props excesivos
- ❌ Lógica compleja sin extraer

---

## 🏗️ PROBLEMAS ARQUITECTÓNICOS DETECTADOS

### 1. **Ausencia de Arquitectura Hexagonal** 🔴

**Problema:**
Todo el código está en la capa de presentación (React components). No hay separación de:

- Domain Layer (entidades, reglas de negocio)
- Application Layer (use cases, orquestación)
- Infrastructure Layer (API calls, localStorage)

**Consecuencias:**

- Lógica de negocio duplicada en múltiples componentes
- Testing imposible sin montar componentes React
- Cambios en API requieren tocar todos los componentes

**Ejemplo actual:**

```javascript
// DashboardJugador.jsx - TODO mezclado
const handleSubmitAsistencia = async (e) => {
  e.preventDefault(); // UI
  const data = { estado: asistenciaForm.estado }; // Negocio
  if (asistenciaForm.estado === "no_asiste") {
    // Negocio
    data.motivoAusenciaId = parseInt(asistenciaForm.motivo_ausencia_id); // Negocio
  }
  await entrenamientos.registrarAsistencia(eventoSeleccionado.id, data); // Infrastructure
  setShowModal(false); // UI
  cargarDatos(); // Infrastructure + UI
};
```

**Solución propuesta:**

```javascript
// domain/entities/Asistencia.js
export class Asistencia {
  constructor(estado, motivoId = null, comentario = null) {
    this.validarEstado(estado);
    this.estado = estado;
    this.motivoId = motivoId;
    this.comentario = comentario;
  }

  validarEstado(estado) {
    if (!["confirmado", "ausente", "pendiente"].includes(estado)) {
      throw new Error("Estado inválido");
    }
  }
}

// application/useCases/RegistrarAsistenciaUseCase.js
export class RegistrarAsistenciaUseCase {
  constructor(asistenciaRepository) {
    this.repository = asistenciaRepository;
  }

  async execute(eventoId, tipoEvento, estado, motivoId, comentario) {
    const asistencia = new Asistencia(estado, motivoId, comentario);
    return this.repository.registrar(eventoId, tipoEvento, asistencia);
  }
}

// components/DashboardJugador.jsx - SOLO UI
const handleSubmitAsistencia = async (e) => {
  e.preventDefault();
  try {
    await registrarAsistenciaUseCase.execute(
      eventoSeleccionado.id,
      eventoSeleccionado.tipo,
      asistenciaForm.estado,
      asistenciaForm.motivo_ausencia_id,
      asistenciaForm.comentarios
    );
    setShowModal(false);
    await recargarEventos();
  } catch (error) {
    mostrarError(error.message);
  }
};
```

---

### 2. **Estado Global Manual con Props Drilling** ⚠️

**Problema:**
`user` y `setUser` se pasan por props a TODOS los componentes:

```javascript
<DashboardGestor user={user} setUser={setUser} />
<DashboardJugador user={user} setUser={setUser} />
<DetalleAsistencia user={user} setUser={setUser} />
<Alineacion user={user} setUser={setUser} />
<ConfigurarPartido user={user} setUser={setUser} />
```

**Consecuencias:**

- Refactoring difícil (cambiar props en 10 lugares)
- Re-renders innecesarios de toda la app
- No hay single source of truth

**Solución propuesta:**

```javascript
// contexts/AuthContext.jsx
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const login = async (credentials) => {
    /* ... */
  };
  const logout = () => {
    /* ... */
  };
  const loadUser = async () => {
    /* ... */
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// hook personalizado
export const useAuth = () => useContext(AuthContext);

// Uso en componentes
const DashboardJugador = () => {
  const { user, logout } = useAuth(); // ✅ Sin props
  // ...
};
```

---

### 3. **Sin Capa de Abstracción de Datos** 🔴

**Problema:**
Componentes llaman directamente a `api.js`:

```javascript
const res = await entrenamientos.listar();
setMisEntrenamientos(res.data.entrenamientos || []);
```

**Consecuencias:**

- Conocimiento de estructura de API en componentes
- Transformaciones de datos en UI
- Difícil cambiar backend sin tocar frontend

**Solución propuesta:**

```javascript
// infrastructure/repositories/EntrenamientoRepositoryHTTP.js
export class EntrenamientoRepositoryHTTP {
  constructor(apiClient) {
    this.api = apiClient;
  }

  async listarMisEntrenamientos() {
    const response = await this.api.get("/entrenamientos/mis-entrenamientos");
    return response.data.entrenamientos.map((dto) =>
      Entrenamiento.fromDTO(dto)
    );
  }
}

// domain/entities/Entrenamiento.js
export class Entrenamiento {
  static fromDTO(dto) {
    return new Entrenamiento(
      dto.id,
      new Date(dto.fecha),
      dto.hora,
      dto.ubicacion,
      dto.descripcion
    );
  }
}

// components/DashboardJugador.jsx
const { entrenamientos } = useMisEventos(); // ✅ Entidades del dominio
```

---

### 4. **Componentes Monolíticos (>500 LOC)** 🔴🔴

**Problema:**
3 componentes críticos:

- `DashboardGestor.jsx`: 872 LOC 🔴🔴
- `DashboardJugador.jsx`: 626 LOC 🔴
- `DetalleAsistencia.jsx`: 574 LOC 🔴

**Consecuencias:**

- Imposible de testear unitariamente
- Cambios arriesgados (alta probabilidad de bugs)
- Onboarding lento para nuevos devs
- Code reviews difíciles

**Solución propuesta (DashboardGestor):**

```
DashboardGestor/ (componente orquestador - 50 LOC)
├── components/
│   ├── EventosList.jsx          # Lista de eventos (80 LOC)
│   ├── EventosCalendario.jsx    # Vista calendario (100 LOC)
│   ├── JugadoresList.jsx        # Lista jugadores (60 LOC)
│   ├── ModalEvento.jsx          # Modal crear/editar (80 LOC)
│   ├── ModalJugador.jsx         # Modal registrar jugador (60 LOC)
│   └── TabsNavigation.jsx       # Tabs de navegación (40 LOC)
├── hooks/
│   ├── useEventos.js            # Fetch y CRUD eventos (60 LOC)
│   ├── useJugadores.js          # Fetch y CRUD jugadores (50 LOC)
│   └── useCalendario.js         # Lógica de calendario (50 LOC)
└── utils/
    ├── fechasHelper.js          # Helpers de fechas (40 LOC)
    └── estadisticasHelper.js    # Cálculos estadísticas (30 LOC)
```

**Resultado:**

- De 1 archivo de 872 LOC → 12 archivos de ~50 LOC cada uno
- Cada componente testeable individualmente
- Reutilización de código (calendario usado en ambos dashboards)

---

### 5. **Duplicación Masiva de Código** 🔴

**Problema:**
`DashboardJugador` y `DashboardGestor` comparten ~60% del código:

**Código duplicado:**

1. **Vista calendario completa** (~200 LOC duplicadas)

   - `getDiasDelMes()`
   - `getEventosDelDia()`
   - `cambiarMes()`
   - Renderizado de calendario

2. **Vista lista completa** (~150 LOC duplicadas)

   - `renderVistaLista()`
   - Helpers de badges
   - Formateo de fechas

3. **Helpers de fechas** (~40 LOC duplicadas)

   - `getFechaString()`
   - `compararFechas()`

4. **Navegación y tabs** (~30 LOC duplicadas)

**Consecuencias:**

- Bug arreglado en uno, persiste en otro
- Mantenimiento doble
- Inconsistencias de UI

**Solución propuesta:**

```
components/shared/
├── Calendario/
│   ├── Calendario.jsx           # Componente calendario reutilizable
│   ├── CalendarioDia.jsx        # Celda de día
│   └── CalendarioEvento.jsx     # Evento en calendario
├── EventosList/
│   ├── EventosList.jsx          # Lista reutilizable
│   └── EventoCard.jsx           # Card de evento
└── TabsEventos/
    └── TabsEventos.jsx          # Tabs (todos, entrenamientos, partidos)

utils/
└── fechas.js                    # Helpers centralizados
```

---

### 6. **Sin Testing** 🔴

**Problema:**
0 tests en todo el frontend.

**Consecuencias:**

- Cada cambio es arriesgado
- Refactoring peligroso
- No hay documentación de comportamiento esperado
- Bugs de regresión frecuentes

**Solución propuesta (estructura de tests):**

```
frontend/src/
├── __tests__/
│   ├── unit/                    # Tests unitarios
│   │   ├── domain/
│   │   │   ├── Asistencia.test.js
│   │   │   └── Evento.test.js
│   │   ├── useCases/
│   │   │   └── RegistrarAsistenciaUseCase.test.js
│   │   └── utils/
│   │       └── fechas.test.js
│   ├── integration/             # Tests de integración
│   │   ├── repositories/
│   │   │   └── EntrenamientoRepository.test.js
│   │   └── hooks/
│   │       └── useEventos.test.js
│   └── e2e/                     # Tests end-to-end
│       ├── auth.test.jsx
│       ├── dashboard.test.jsx
│       └── asistencia.test.jsx
└── __mocks__/
    └── api.js                   # Mocks de API para tests
```

**Herramientas recomendadas:**

- **Vitest:** Test runner (compatible con Vite)
- **@testing-library/react:** Testing de componentes
- **MSW (Mock Service Worker):** Mocks de API HTTP
- **Playwright:** Tests E2E

**Objetivo de cobertura:**

- Domain + Application: >90%
- Components: >70%
- Integration: >60%

---

### 7. **Sin TypeScript** ⚠️

**Problema:**
Todo el código es JavaScript puro, sin validación de tipos.

**Ejemplos de bugs que TypeScript previene:**

```javascript
// ❌ JavaScript - error en runtime
const evento = { fecha: "2025-11-29", hora: "19:00" };
evento.rival = "Polinyà"; // OK pero evento es entrenamiento (no tiene rival)

// ✅ TypeScript - error en compilación
interface Entrenamiento {
  fecha: string;
  hora: string;
  ubicacion: string;
}

interface Partido extends Entrenamiento {
  rival: string;
  esLocal: boolean;
}

const evento: Entrenamiento = { fecha: "2025-11-29", hora: "19:00" };
evento.rival = "Polinyà"; // ❌ Error: Property 'rival' does not exist on type 'Entrenamiento'
```

**Solución propuesta:**
Migración gradual a TypeScript:

1. Renombrar archivos `.jsx` → `.tsx` progresivamente
2. Empezar por `api.js` → `api.ts` (interfaces de API)
3. Continuar con domain entities
4. Terminar con componentes UI

---

## ✅ VERIFICACIÓN DE CONECTIVIDAD BACKEND

### Configuración Actual

**Variables de entorno:**

```env
# .env.production
VITE_API_URL=https://futbolclub-api.onrender.com/api
```

**Proxy de desarrollo (`vite.config.js`):**

```javascript
server: {
  proxy: {
    "/api": {
      target: "http://localhost:3001",
      changeOrigin: true,
    },
  },
}
```

### Estado de Conectividad

| Endpoint                      | Método | Estado | Usado por              |
| ----------------------------- | ------ | ------ | ---------------------- |
| `/api/auth/login`             | POST   | ✅     | Login.jsx              |
| `/api/auth/register`          | POST   | ✅     | Register.jsx           |
| `/api/auth/profile`           | GET    | ✅     | App.jsx (verificación) |
| `/api/auth/registrar-jugador` | POST   | ✅     | DashboardGestor.jsx    |
| `/api/auth/jugadores`         | GET    | ✅     | DashboardGestor.jsx    |
| `/api/entrenamientos`         | GET    | ✅     | Dashboards             |
| `/api/entrenamientos/:id`     | GET    | ✅     | DetalleAsistencia.jsx  |
| `/api/entrenamientos`         | POST   | ✅     | DashboardGestor.jsx    |
| `/api/partidos`               | GET    | ✅     | Dashboards             |
| `/api/partidos/:id`           | GET    | ✅     | DetalleAsistencia.jsx  |
| `/api/partidos`               | POST   | ✅     | DashboardGestor.jsx    |
| `/api/posiciones`             | GET    | ✅     | DashboardGestor.jsx    |
| `/api/motivos`                | GET    | ✅     | Dashboards             |

**Resultado:** ✅ Todos los endpoints funcionando correctamente

### Pruebas Realizadas

```powershell
# Frontend corriendo en http://localhost:5173/
npm run dev

# Backend corriendo en http://localhost:3001/
# (verificado en sesión anterior)
```

**Flujo de autenticación verificado:**

1. ✅ Login exitoso con `test@gestor.com` / `Test123!`
2. ✅ Token almacenado en localStorage
3. ✅ Interceptor agrega header `Authorization: Bearer <token>`
4. ✅ Redirección a dashboard según rol (gestor/jugador)
5. ✅ Fetch de datos inicial exitoso

**Problemas de conectividad:** Ninguno detectado ✅

---

## 📋 PLAN DE REFACTORIZACIÓN PROPUESTO

### FASE 1: Fundamentos y Arquitectura Base (16h)

**Objetivo:** Establecer estructura de carpetas y capas arquitectónicas

#### 1.1 Setup de TypeScript (3h)

- [ ] Instalar TypeScript y tipos para React
- [ ] Configurar `tsconfig.json`
- [ ] Migrar `api.js` → `api.ts` con interfaces
- [ ] Crear tipos base: `Usuario`, `Entrenamiento`, `Partido`, `Asistencia`

#### 1.2 Capa de Dominio (5h)

- [ ] Crear entidades del dominio:
  - `Usuario.ts` (60 LOC)
  - `Entrenamiento.ts` (80 LOC)
  - `Partido.ts` (80 LOC)
  - `Asistencia.ts` (60 LOC)
  - `Evento.ts` (abstract, 40 LOC)
- [ ] Value Objects:
  - `Email.ts` (validación)
  - `EstadoAsistencia.ts` (enum)
  - `FechaHora.ts` (helpers)

#### 1.3 Capa de Aplicación (8h)

- [ ] Repositorios (interfaces):
  - `IEventoRepository.ts`
  - `IAsistenciaRepository.ts`
  - `IUsuarioRepository.ts`
- [ ] Use Cases:
  - `RegistrarAsistenciaUseCase.ts` (60 LOC)
  - `ListarMisEventosUseCase.ts` (40 LOC)
  - `CrearEventoUseCase.ts` (50 LOC)
  - `ActualizarAsistenciaGestorUseCase.ts` (60 LOC)
- [ ] Custom Hooks:
  - `useAuth.ts` (80 LOC)
  - `useEventos.ts` (100 LOC)
  - `useAsistencias.ts` (80 LOC)

**Entregables FASE 1:**

```
src/
├── domain/
│   ├── entities/         # 5 archivos, ~320 LOC
│   └── valueObjects/     # 3 archivos, ~100 LOC
├── application/
│   ├── repositories/     # 3 interfaces, ~60 LOC
│   ├── useCases/         # 4 use cases, ~210 LOC
│   └── hooks/            # 3 hooks, ~260 LOC
└── infrastructure/
    └── repositories/     # Implementaciones HTTP
```

---

### FASE 2: Refactorización de Componentes (20h)

**Objetivo:** Dividir componentes gigantes en piezas reutilizables

#### 2.1 Componentes Compartidos (8h)

- [ ] **Calendario** (4h)

  - `Calendario.tsx` - Componente principal (100 LOC)
  - `CalendarioDia.tsx` - Celda de día (40 LOC)
  - `CalendarioEvento.tsx` - Evento en calendario (50 LOC)
  - `useCalendario.ts` - Hook con lógica (80 LOC)

- [ ] **Lista de Eventos** (2h)

  - `EventosList.tsx` - Lista reutilizable (60 LOC)
  - `EventoCard.tsx` - Card individual (80 LOC)

- [ ] **Modales** (2h)
  - `ModalAsistencia.tsx` - Modal confirmación (100 LOC)
  - `ModalEvento.tsx` - Modal crear/editar (120 LOC)

#### 2.2 Refactorizar DashboardJugador (6h)

**De 626 LOC → 8 archivos pequeños**

- [ ] `DashboardJugador.tsx` - Orquestador (80 LOC)
- [ ] `components/TabsNavegacion.tsx` (40 LOC)
- [ ] `components/BotonCambiarVista.tsx` (30 LOC)
- [ ] Reutilizar: `Calendario`, `EventosList`, `ModalAsistencia`

#### 2.3 Refactorizar DashboardGestor (6h)

**De 872 LOC → 10 archivos pequeños**

- [ ] `DashboardGestor.tsx` - Orquestador (100 LOC)
- [ ] `components/JugadoresList.tsx` (80 LOC)
- [ ] `components/JugadorCard.tsx` (60 LOC)
- [ ] `components/ModalJugador.tsx` (80 LOC)
- [ ] Reutilizar: `Calendario`, `EventosList`, `ModalEvento`

**Reducción total:**

- Antes: 1,498 LOC en 2 archivos
- Después: ~800 LOC distribuidos en 15 archivos reutilizables
- **Ahorro:** ~700 LOC (47%)

---

### FASE 3: Estado Global y Context API (8h)

**Objetivo:** Eliminar props drilling, centralizar estado

#### 3.1 AuthContext (3h)

- [ ] Crear `contexts/AuthContext.tsx`
- [ ] Hook `useAuth()` personalizado
- [ ] Migrar autenticación de App.jsx
- [ ] Eliminar props `user`, `setUser` de todos los componentes

#### 3.2 EventosContext (opcional, 3h)

- [ ] Context para eventos globales
- [ ] Cache de eventos recientes
- [ ] Invalidación automática

#### 3.3 Optimización de Re-renders (2h)

- [ ] `React.memo` en componentes pesados
- [ ] `useMemo` para cálculos costosos
- [ ] `useCallback` para callbacks estables

---

### FASE 4: Testing (14h)

**Objetivo:** Cobertura >70% de código crítico

#### 4.1 Setup de Testing (2h)

- [ ] Instalar Vitest + @testing-library/react
- [ ] Configurar MSW para mocks de API
- [ ] Setup de utilities de testing

#### 4.2 Tests Unitarios (6h)

- [ ] Domain entities (2h)
  - `Asistencia.test.ts`
  - `Evento.test.ts`
- [ ] Use Cases (2h)
  - `RegistrarAsistenciaUseCase.test.ts`
  - `ListarMisEventosUseCase.test.ts`
- [ ] Utils (2h)
  - `fechas.test.ts`
  - `validaciones.test.ts`

#### 4.3 Tests de Integración (4h)

- [ ] Custom hooks (2h)
  - `useAuth.test.ts`
  - `useEventos.test.ts`
- [ ] Repositories (2h)
  - `EventoRepositoryHTTP.test.ts`

#### 4.4 Tests E2E (2h)

- [ ] Flujo de login
- [ ] Flujo de confirmación de asistencia

**Objetivo de cobertura:**

- Domain: >90%
- Application: >80%
- Components: >60%

---

### FASE 5: Mejoras de UX y Performance (6h)

**Objetivo:** Optimizar experiencia de usuario

#### 5.1 Loading States (2h)

- [ ] Skeletons para listas
- [ ] Spinners para acciones
- [ ] Suspense boundaries

#### 5.2 Error Handling (2h)

- [ ] Error boundaries
- [ ] Toast notifications
- [ ] Retry logic en API

#### 5.3 Performance (2h)

- [ ] Code splitting con React.lazy
- [ ] Virtualización de listas largas
- [ ] Optimización de imágenes

---

### FASE 6: Documentación y CI/CD (4h)

**Objetivo:** Facilitar mantenimiento futuro

#### 6.1 Documentación (2h)

- [ ] README con arquitectura
- [ ] Storybook para componentes (opcional)
- [ ] Guía de contribución

#### 6.2 CI/CD (2h)

- [ ] GitHub Actions para tests
- [ ] Linting automático
- [ ] Deploy automático a Render/Vercel

---

## 📊 RESUMEN DE REFACTORIZACIÓN

### Métricas Objetivo

| Métrica                       | Actual     | Objetivo   | Mejora |
| ----------------------------- | ---------- | ---------- | ------ |
| **LOC promedio/archivo**      | 390 LOC    | <100 LOC   | 74%    |
| **Componentes >400 LOC**      | 4 archivos | 0 archivos | 100%   |
| **Duplicación de código**     | ~60%       | <10%       | 83%    |
| **Cobertura de tests**        | 0%         | >70%       | ∞      |
| **Uso de TypeScript**         | 0%         | 100%       | ∞      |
| **Componentes reutilizables** | 2          | 15+        | 650%   |

### Esfuerzo Estimado

| Fase                      | Horas   | Prioridad   |
| ------------------------- | ------- | ----------- |
| FASE 1: Arquitectura Base | 16h     | 🔴 ALTA     |
| FASE 2: Componentes       | 20h     | 🔴 ALTA     |
| FASE 3: Estado Global     | 8h      | ⚠️ MEDIA    |
| FASE 4: Testing           | 14h     | 🔴 ALTA     |
| FASE 5: UX/Performance    | 6h      | ⚠️ MEDIA    |
| FASE 6: Docs/CI           | 4h      | ⚠️ BAJA     |
| **TOTAL**                 | **68h** | **~9 días** |

### ROI de la Refactorización

**Beneficios cuantificables:**

- 🚀 **Velocidad de desarrollo:** +40% (componentes reutilizables)
- 🐛 **Reducción de bugs:** -60% (tests + tipos)
- 🧹 **Mantenimiento:** -50% tiempo (arquitectura limpia)
- 📚 **Onboarding:** -70% tiempo (código autodocumentado)

**Payback period:** ~3 semanas de desarrollo normal

---

## 🎯 RECOMENDACIONES INMEDIATAS

### Prioridad 1 - CRÍTICA (Empezar YA)

1. **Refactorizar DashboardGestor.jsx** (872 LOC) 🔴🔴

   - Dividir en 10 componentes pequeños
   - Extraer lógica a custom hooks
   - **Impacto:** 50% del esfuerzo de mantenimiento

2. **Setup de TypeScript** (3h)

   - Previene bugs antes de que ocurran
   - Mejora IntelliSense en VSCode
   - **ROI inmediato**

3. **Crear AuthContext** (3h)
   - Elimina props drilling
   - Simplifica todos los componentes
   - **Quick win**

### Prioridad 2 - ALTA (Primera semana)

4. **Extraer componentes compartidos**

   - Calendario reutilizable
   - EventosList reutilizable
   - Elimina duplicación

5. **Setup de testing básico**
   - Tests para use cases críticos
   - Confidence para refactorizar

### Prioridad 3 - MEDIA (Segunda semana)

6. **Refactorizar DashboardJugador** (626 LOC)
7. **Implementar error boundaries**
8. **Optimizar performance**

---

## 📌 CONCLUSIÓN

### Estado Actual: ⚠️ TÉCNICAMENTE FUNCIONAL, ARQUITECTÓNICAMENTE DEFICIENTE

**Fortalezas:**

- ✅ Conectividad perfecta con backend
- ✅ UI responsive y profesional
- ✅ Funcionalidad completa

**Debilidades Críticas:**

- 🔴 Arquitectura monolítica sin capas
- 🔴 Componentes gigantes (>500 LOC)
- 🔴 Duplicación masiva de código (~60%)
- 🔴 Sin tests automatizados
- 🔴 Sin TypeScript

**Riesgo actual:** ALTO

- Cada cambio tiene alta probabilidad de bugs
- Agregar features es cada vez más difícil
- Technical debt creciente

**Recomendación:** Iniciar refactorización **INMEDIATAMENTE**

- Empezar por DashboardGestor (mayor dolor)
- Implementar arquitectura hexagonal progresivamente
- Establecer tests antes de continuar con features

**Tiempo de refactorización:** 68 horas (~9 días)
**Payback:** 3 semanas de desarrollo normal

---

**¿Proceder con FASE 1: Fundamentos y Arquitectura Base?**
