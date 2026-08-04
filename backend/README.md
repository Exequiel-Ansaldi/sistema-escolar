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

## Estructura

```
src/
├── main.ts                      # Bootstrap (CORS, prefix /api, ValidationPipe)
├── app.module.ts                # Módulo raíz
├── config/app.config.ts         # Config global (JWT, BD, CORS)
├── middleware/logger.middleware.ts
├── common/                      # guards, decorators, interceptors, dto, interfaces
├── prisma/                      # PrismaService (global)
└── modules/<modulo>/            # Cada módulo: controller → service → repository
    ├── *.controller.ts
    ├── *.service.ts
    ├── *.module.ts
    ├── dto/                     # Inputs (class-validator) + salidas (*Response)
    └── repositories/            # Solo acá se inyecta PrismaService
```

### Convenciones

- **Capas**: `Controller → Service → Repository → PrismaService`. Solo los repos inyectan `PrismaService`.
- **DTOs de entrada**: clases class-validator (ej. `crear-alumno.dto.ts`). Query DTOs extienden `PaginacionQueryDto`.
- **DTOs de salida**: interfaces `*Response` (ej. `alumno-response.ts`). Sin `any`.
- **Fechas**: Prisma devuelve `Date`; los repos serializan a ISO `string` (`.toISOString()`) porque el contrato del frontend usa strings.
- **Paginación**: `PaginatedResult<T>` con `skip`/`take` (`total`, `page`, `limit`, `totalPages`).
- `POST /api/asistencias/masivo` recibe `{ datos: [...] }`.

## Base de datos

- Migraciones: `npx prisma migrate dev --name <nombre>`
- Studio: `npx prisma studio`
- Seed: `npm run seed` — usuarios `admin/admin123`, `preceptor/preceptor123`.
