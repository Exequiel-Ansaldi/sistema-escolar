# Pagination Status

## Server-side (skip/take + PaginatedResult)

| Page | Backend Repo | Frontend Page | Status |
|------|-------------|---------------|--------|
| Alumnos | ✅ `alumnos.repository.ts` | ✅ `CrudPages.tsx` | Done |
| Cursos | ✅ `cursos.repository.ts` | ✅ `CrudPages.tsx` | Done |
| Docentes | ✅ `docentes.repository.ts` | ✅ `CrudPages.tsx` | Done |
| Materias | ✅ `materias.repository.ts` | ✅ `CrudPages.tsx` | Done |
| Módulos Semanales | ✅ `modulos-semana.repository.ts` | ✅ `ModulosPage.tsx` | Done |
| Inscripciones | ✅ `inscripcion.repository.ts` | ✅ `InscripcionesPage.tsx` | Done |
| Días sin Clases | ✅ `dias-sin-clases.repository.ts` | ✅ `CalendarioPage.tsx` | Done |
| Carga Horaria (grupos) | ✅ `CursoMateriaService.findGrupos` | ✅ `CargaHorariaPage.tsx` | Done |

## Missing pagination

| Page | Backend | Frontend |
|------|---------|----------|
| Actas (4 tabs) | ❌ Actas, Acuerdos, Seguimientos, Tutores repos | ❌ |
| Asistencias | ❌ `asistencia.repository.ts` | ❌ |
| Calificaciones | ❌ `calificaciones.repository.ts` | ❌ |
| Licencias | ❌ `licencias.repository.ts` | ❌ |

## API pagination pattern

Backend: `skip`/`take` in repository methods, return `PaginatedResult<T>`.
Frontend: `api.ts` methods return `PaginatedResult<T>`, pages use `<Pagination>`.
