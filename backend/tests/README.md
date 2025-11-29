# Tests

Este directorio contiene todos los tests del proyecto organizados por tipo.

## Estructura

```
tests/
├── unit/                    # Tests unitarios (sin dependencias externas)
│   ├── domain/             # Tests de entidades, VOs y servicios de dominio
│   │   ├── entities/
│   │   ├── value-objects/
│   │   └── services/
│   └── application/        # Tests de casos de uso
│       └── use-cases/
│
├── integration/            # Tests de integración (con BD, APIs)
│   ├── repositories/       # Tests de repositorios con BD real
│   └── http/              # Tests de endpoints HTTP
│
├── e2e/                   # Tests end-to-end (flujos completos)
│   └── api/
│
├── helpers/               # Utilidades para tests
│   ├── testHelpers.js    # Helpers generales
│   └── databaseHelpers.js # Helpers de BD
│
├── fixtures/             # Datos de prueba reutilizables
│   └── data.js
│
├── mocks/               # Mocks reutilizables
│
└── setup.js            # Configuración global de tests
```

## Comandos

```bash
# Ejecutar todos los tests
npm test

# Ejecutar tests en modo watch
npm run test:watch

# Ejecutar tests con coverage
npm run test:coverage

# Ejecutar solo tests unitarios
npm run test:unit

# Ejecutar solo tests de integración
npm run test:integration

# Ejecutar solo tests e2e
npm run test:e2e
```

## Convenciones

1. **Nombres de archivos:** `*.test.js` o `*.spec.js`
2. **Estructura describe/it:** Usar describe para agrupar, it para casos individuales
3. **Arrange-Act-Assert:** Seguir patrón AAA en cada test
4. **Mocks:** Usar mocks para dependencias externas en tests unitarios
5. **Fixtures:** Reutilizar datos de `fixtures/data.js`
6. **Limpieza:** Limpiar BD después de cada test de integración

## Ejemplo de Test Unitario

```javascript
import { describe, it, expect, jest } from "@jest/globals";
import { MiServicio } from "../../src/domain/services/MiServicio.js";
import { createRepositoryMock } from "../helpers/testHelpers.js";

describe("MiServicio", () => {
  it("should do something", async () => {
    // Arrange
    const mockRepo = createRepositoryMock();
    mockRepo.findById.mockResolvedValue({ id: 1, name: "Test" });
    const service = new MiServicio(mockRepo);

    // Act
    const result = await service.execute(1);

    // Assert
    expect(result).toBeDefined();
    expect(mockRepo.findById).toHaveBeenCalledWith(1);
  });
});
```

## Ejemplo de Test de Integración

```javascript
import {
  describe,
  it,
  expect,
  beforeAll,
  afterAll,
  afterEach,
} from "@jest/globals";
import {
  cleanDatabase,
  seedTestData,
  closeDatabaseConnection,
} from "../helpers/databaseHelpers.js";
import { UsuarioRepository } from "../../src/infrastructure/persistence/postgres/UsuarioRepositoryPostgres.js";

describe("UsuarioRepository Integration Tests", () => {
  beforeAll(async () => {
    await seedTestData();
  });

  afterEach(async () => {
    await cleanDatabase();
  });

  afterAll(async () => {
    await closeDatabaseConnection();
  });

  it("should create a user", async () => {
    // Arrange
    const repo = new UsuarioRepository();
    const userData = { email: "test@test.com", nombre: "Test" };

    // Act
    const user = await repo.create(userData);

    // Assert
    expect(user).toHaveProperty("id");
    expect(user.email).toBe("test@test.com");
  });
});
```

## Coverage Goals

- **Domain Layer:** >80%
- **Application Layer:** >80%
- **Infrastructure Layer:** >70%
- **Global:** >70%
