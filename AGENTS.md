# Pagination Status

## Server-side (skip/take + PaginatedResult)

| Page | Backend Repo | Frontend Page | Status |
|------|-------------|---------------|--------|
| Alumnos | ✅ `alumnos/repositories/alumnos.repository.ts` | ✅ `CrudPages.tsx` | Done |
| Cursos | ✅ `cursos/repositories/cursos.repository.ts` | ✅ `CrudPages.tsx` | Done |
| Docentes | ✅ `docentes/repositories/docentes.repository.ts` | ✅ `CrudPages.tsx` | Done |
| Materias | ✅ `materias/repositories/materias.repository.ts` | ✅ `CrudPages.tsx` | Done |
| Módulos Semanales | ✅ `modulos-semana/repositories/modulos-semana.repository.ts` | ✅ `ModulosPage.tsx` | Done |
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
