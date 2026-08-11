# Pagination Status

## Server-side (skip/take + PaginatedResult)

| Page | Backend Repo | Frontend Page | Status |
|------|-------------|---------------|--------|
| Alumnos | ✅ `alumnos/repositories/alumnos.repository.ts` | ✅ `CrudPages.tsx` | Done |
| Cursos | ✅ `cursos/repositories/cursos.repository.ts` | ✅ `CrudPages.tsx` | Done |
| Docentes | ✅ `docentes/repositories/docentes.repository.ts` | ✅ `CrudPages.tsx` | Done |
| Materias | ✅ `materias/repositories/materias.repository.ts` | ✅ `CrudPages.tsx` | Done |
| Módulos Mensuales | ✅ `modulos-mensuales/repositories/modulos-mensuales.repository.ts` | ✅ `ModulosMensualesPage.tsx` | Done |
| Inscripciones | ✅ `inscripcion/repositories/inscripcion.repository.ts` | ✅ `InscripcionesPage.tsx` | Done |
| Días sin Clases | ✅ `dias-sin-clases/repositories/dias-sin-clases.repository.ts` | ✅ `CalendarioPage.tsx` | Done |
| Carga Horaria (grupos) | ✅ `cursos/repositories/curso-materia.repository.ts` (via `CursoMateriaService.findGrupos`) | ✅ `CargaHorariaPage.tsx` | Done |
| Actas | ✅ `actas/repositories/actas.repository.ts` | ✅ `ActasPage.tsx` | Done |
| Acuerdos | ✅ `acuerdos/repositories/acuerdos.repository.ts` | ✅ `ActasPage.tsx` | Done |
| Seguimientos | ✅ `seguimientos/repositories/seguimiento.repository.ts` | ✅ `ActasPage.tsx` | Done |
| Tutores | ✅ `tutores/repositories/tutores.repository.ts` | ✅ `ActasPage.tsx` | Done |
| Asistencias | ✅ `asistencia/repositories/asistencia.repository.ts` | ✅ `AsistenciasPage.tsx` | Done |
| Calificaciones | ✅ `calificaciones/repositories/calificaciones.repository.ts` | ✅ `CalificacionesPage.tsx` | Done |
| Licencias | ✅ `licencias/repositories/licencias.repository.ts` | ✅ `LicenciasPage.tsx` | Done |

Note: Actas/Acuerdos/Seguimientos/Tutores/Calificaciones/Licencias paginan dentro del scope del alumno/docente seleccionado; Asistencias pagina las inscripciones de la fecha elegida.

Note: Módulos Mensuales (`modulos_mensuales` → `ModuloMensual`) tiene una tabla hija `modulos_no_dictados` → `ModuloNoDictado` (`factor`, `cantidad`, unique `[moduloMensualId, factor]`, cascade). Los módulos no dictados de cada mes se cargan como filas hijas; el backend valida `modulosDictados + Σ(cantidad) === modulosPrevistos` (400 si no). Dashboard `porFactor` agrega por `cantidad` de la tabla hija.

Note: Días sin Clases (`dias_sin_clases` → `DiaSinClases`): `tipo` ∈ `feriado | paro | asamblea`. `cursoId: null` = global (todos los cursos); con `cursoId` = solo ese curso (ej. paro de 1°A no afecta a 1°B). `AsistenciaService.esSinClases` bloquea asistencia en fin de semana/global/del curso (409); la lista marca `no_corresponde`. `DiasSinClasesRepository.find` con `cursoId` devuelve globales + del curso (`OR [{cursoId},{cursoId:null}]`). Dashboard `esHabil` solo considera registros globales para "asistencia hoy". En `CalendarioPage` el curso de paro/asamblea se elige con selects encadenados Año → División → Turno (obligatorio, sin opción "Todos los cursos"); el `cursoId` se resuelve en el frontend buscando la coincidencia `(anio, division, turno)`. El seed tiene 21 cursos (1-6° × A/B/C + turno noche 4-6°N).

Note: Dashboard — "Aprobados por Curso": aprobado = promedio **por materia** de sus trimestres (T1/T2/T3 disponibles) y luego promedio general del alumno; **≥ 6 aprueba**. `GET /api/dashboard/aprobados-por-curso` → `[{ anio, turno, aprobados, alumnos }]` (agrupado por `(anio, turno)`, turnos: mañana/tarde/noche). `GET /api/dashboard/promedio-por-anio` → `[{ anio, promedio }]`. Los viejos `alumnos-por-curso` y `calificaciones-resumen` ya no existen. En `Dashboard.tsx` el BarChart de aprobados se pivotea a `stackData` (barras apiladas por turno) y el de promedio usa `ReferenceLine y={6}`. La página de Carga Horaria usa `PAGE_SIZE = 1` (cada curso renderiza un `rowSpan` con sus materias).

## API pagination pattern

Backend: `skip`/`take` in repository methods, return `PaginatedResult<T>`.
Frontend: `api.ts` methods return `PaginatedResult<T>`, pages use `<Pagination>`.

## Backend conventions (DTO refactor, 2026-08)

- **Layered architecture**: `Controller → Service → Repository → PrismaService`. Only repositories inject `PrismaService`.
- **Input DTOs**: class-validator classes in `modules/<modulo>/dto/` (e.g. `crear-alumno.dto.ts`, `filtrar-alumnos.dto.ts`). Query DTOs extend `PaginacionQueryDto` and are bound with `@Query()`.
- **Output DTOs**: plain interfaces named `*Response` in `dto/` (e.g. `alumno-response.ts`, `docente-response.ts`). Never use `any` in response types.
- **Date serialization**: Prisma returns `Date`, but the frontend contract uses ISO `string`. Repositories map dates with `.toISOString()` (via `serializar*` helpers and `Prisma.GetPayload` types) before returning.
- **Repositories**: typed with `Prisma.<Model>WhereInput` / `Prisma.<Model>UpdateInput`, return `PaginatedResult<TResponse>`, live in `modules/<modulo>/repositories/`.
- **PrismaModule is `@Global`**: repositories just inject `PrismaService`, no module imports needed.
- `POST /api/asistencias/masivo` sends `{ datos: [...] }` (the array is wrapped).

## RBAC (2026-08-04)

- Roles: `admin`, `rector`, `vicerrector`, `secretaria_personal`, `secretaria_alumnado`, `asesoria_pedagogica`, `preceptor_manana`. Source of truth: `backend/src/common/constants/roles.ts` (mirrored in `frontend/src/constants/roles.ts`; keep both in sync).
- Every controller except `auth` (public login) must use `@UseGuards(JwtAuthGuard, RolesGuard)` + `@Roles(...)`. Always include `ROLES.RECTOR`. `admin` always passes (`roles.guard.ts` bypass). Dashboard is restricted to `ROLES.RECTOR` + `ROLES.VICERRECTOR`.
- Frontend: `Layout` filters `menuItems` via `puedeAcceder(rol, path)`; `ProtectedRoute` in `App.tsx` redirects to `rutaInicial(rol)` when the role lacks access to the route (`RUTAS_POR_ROL`). UI filtering is UX only — the backend guards are the real defense. Roles without dashboard access land on their first accessible module after login.
- PDF reports require JWT + roles; frontend downloads with `api.descargarPdf` (fetch + `Authorization` + blob), never `window.open`.
- Seed creates one user per role; password = `username + "123"`.

## E2E testing (2026-08-04)

- Reusable E2E script: `C:\Users\GAMER\AppData\Local\Temp\opencode\e2e-rbac.ps1` — hits the real API (`http://localhost:3000/api`), no mocks. Run with backend up: `& "..."`. Full guide: Obsidian `Guia de Pruebas E2E.md`.
- Pattern per request: 401 without token, 200 for allowed role (+ always `admin`/`rector`), 403 for other roles. Writes: 2xx for allowed role, 403 for others.
- **Must re-seed at script start AND end** (PostgreSQL sequences don't reset on `deleteMany`, so leftover test rows break the next run).
- PowerShell pitfalls when writing tests: interpolate IDs with `${id}` (a `?` after `$var` becomes part of the variable name); 409s on business validations (duplicate curso by `(anio, division, turno)`, asistencia needs an active inscripcion, unique dni/email/nombre) are NOT RBAC failures — vary test data per call with a counter.
- PDF responses: only check Content-Type when status is 200 (errors are JSON); Content-Type may be an array (`-join ';'`).
