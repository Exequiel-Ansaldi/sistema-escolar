# Backend — Sistema de Gestión Escolar (API NestJS)

API REST del sistema escolar. Documentación completa del proyecto en el vault de Obsidian (`Proyecto_para_luci/`).

## Stack

| Capa | Tecnología |
|------|-----------|
| Framework | NestJS 11 |
| ORM | Prisma 6 (`@prisma/adapter-pg`) |
| Base de datos | PostgreSQL (local `5432` / Supabase en producción) |
| Autenticación | JWT (passport-jwt + bcrypt) |
| Validación | class-validator + class-transformer |
| PDF | PDFKit |

## Scripts

| Comando | Descripción |
|---------|-------------|
| `npm run start:dev` | Dev con recarga automática (watch) |
| `npm run build` | Compila TypeScript a `dist/` |
| `npm run start:prod` | `node dist/src/main.js` |
| `npm run lint` | ESLint |
| `npm run seed` | Borra y resiembra la BD con datos deterministas |
| `npm run dev:all` | Backend + frontend juntos (`../start.js`) |
| `npm run test` | Tests unitarios (`src/**/*.spec.ts`, `createTestingModule` + mocks) |
| `npm run test:e2e` | Integración de API (Supertest + PostgreSQL real) — requiere la base seedeada |
| `npm run test:cov` | Cobertura (`coverage/lcov-report/index.html`) |

## Estructura

```
src/
├── main.ts                      # Bootstrap (CORS, prefix /api, ValidationPipe, shutdown hooks)
├── app.module.ts                # Módulo raíz
├── config/app.config.ts         # Config global (JWT, BD, CORS)
├── middleware/logger.middleware.ts
├── common/                      # guards, decorators, interceptors, dto, interfaces
├── prisma/                      # PrismaService (global)
├── modules/<modulo>/            # Cada módulo: controller → service → repository
│   ├── *.controller.ts
│   ├── *.service.ts
│   ├── *.module.ts
│   ├── *.spec.ts                # Unitarios: controller/service con mocks (cátedra)
│   ├── dto/                     # Inputs (class-validator) + salidas (*Response)
│   └── repositories/            # Solo acá se inyecta PrismaService
└── test/                        # Integración de API: Supertest contra AppModule + PostgreSQL real
    ├── helpers.ts               # App en memoria (globals de main.ts repetidos), login/auth
    └── *.e2e-spec.ts            # auth, rbac, transacciones, concurrencia y flujos e2e
```

### Modelo de datos

`personas` es el supertipo de las personas físicas (dni único nullable, nombre, apellido, teléfono, estado); los subtipos son roles de vida 1:1 — `alumnos`, `docentes` y `personal` (cuentas de acceso: nombre de usuario único, contraseña hasheada, rol, activo) — y `tutores` N:1 hacia alumnos. Las FKs de negocio apuntan a los subtipos.

### Convenciones

- **Capas**: `Controller → Service → Repository → PrismaService`. Solo los repos inyectan `PrismaService`.
- **DTOs de entrada**: clases class-validator (ej. `crear-alumno.dto.ts`). Query DTOs extienden `PaginacionQueryDto`.
- **DTOs de salida**: interfaces `*Response` (ej. `alumno-response.ts`). Sin `any`.
- **Fechas**: Prisma devuelve `Date`; los repos serializan a ISO `string` (`.toISOString()`) porque el contrato del frontend usa strings.
- **Paginación**: `PaginatedResult<T>` con `skip`/`take` (`total`, `page`, `limit`, `totalPages`).
- `POST /api/asistencias/masivo` recibe `{ datos: [...] }`.

## Base de datos

- Migraciones: `npx prisma migrate dev --name <nombre>` (o `migrate deploy` en CI)
- Studio: `npx prisma studio`
- Seed: `npm run seed` — un usuario por rol con contraseña `usuario + "123"` (ej. `admin`/`admin123`, `rector`/`rector123`); los datos son deterministas y las secuencias NO se resetean entre seeds (los tests usan dnis con sufijo temporal).

## Tests (Unidad V)

- **Unitarios** (149): `src/**/*.spec.ts` — `Test.createTestingModule` + `overrideProvider` con mocks, `test.each` para tablas de casos. No tocan la base.
- **Integración de API** (32): `test/*.e2e-spec.ts` — Supertest contra la app completa con los globals de `main.ts` repetidos, guarda JWT real y PostgreSQL real. Cubren auth/RBAC, transacciones (usuarios, módulos-mensuales, cursos-materias masivo), concurrencia (duplicados paralelos → 409, no 500) y dos flujos críticos (ciclo académico y ciclo de vida de licencia).
- Cobertura honesta ~76% (excluye módulos, DTOs, `main.ts`, prisma, middleware, common, config, strategies y repositorios).
