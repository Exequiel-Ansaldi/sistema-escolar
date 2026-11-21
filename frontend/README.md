# Frontend — Sistema de Gestión Escolar (React + Vite)

Interfaz web del sistema escolar. Documentación completa del proyecto en el vault de Obsidian (`Proyecto_para_luci/`).

## Stack

| Capa | Tecnología |
|------|-----------|
| Framework | React 19 |
| Build | Vite 8 |
| Estilos | TailwindCSS 4 |
| Ruteo | React Router DOM 7 |
| Gráficos | Recharts |
| Iconos | Lucide React |
| Linter | oxlint |

## Scripts

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Dev server (puerto 5173, proxy `/api` → localhost:3000) |
| `npm run build` | `tsc -b && vite build` |
| `npm run lint` | oxlint |
| `npm run test` | Tests unitarios (Vitest + Testing Library, jsdom) |
| `npm run test:watch` | Tests en modo watch |
| `npm run test:coverage` | Cobertura del frontend |
| `npm run preview` | Sirve el build de producción |

## Tests (Unidad IV)

Specs colocados junto a su código (`*.spec.ts[x]`), según la estructura de la cátedra:

| Capa | Spec | Qué cubre |
|------|------|-----------|
| Service Layer | `services/api.spec.ts` | `request` con token de localStorage, errores con `message`, URLs `/api` |
| RBAC puro | `constants/roles.spec.ts` | `puedeAcceder`, `puedeEscribir` (asesoría solo lectura), `rutaInicial` |
| Hook headless | `hooks/useCrud.spec.tsx` | load/create/update/delete con api mockeada |
| Estado global | `context/AuthContext.spec.tsx` | login/logout, token y usuario |
| Presentacionales | `components/ui.spec.tsx` | DataTable, Badge, ConfirmModal, Input (labels asociadas) |
| Contenedor | `pages/Login.spec.tsx` | login con api falsa: éxito guarda token, error muestra mensaje genérico |
| Rutas | `App.spec.tsx` | sin token → `/login`; rol sin acceso → su ruta inicial |

La CI (`tests.yml`) corre `npm test` del frontend antes del build.

## Estructura

```
src/
├── main.tsx / App.tsx          # Entry + rutas (ProtectedRoute envuelve todo excepto /login)
├── index.css                   # Tailwind + animaciones
├── components/                 # ui.tsx (DataTable, Modals, Pagination), CrudPage, Layout
├── pages/                      # Dashboard, Login, CrudPages, Actas, Asistencias, ...
├── services/api.ts             # Cliente HTTP centralizado (base /api, token JWT automático)
├── hooks/useCrud.ts            # Estado genérico para CRUD + paginación
├── context/AuthContext.tsx     # Login/logout, token en localStorage
├── constants/roles.ts          # RBAC (espejo del backend: mantener sincronizados)
├── test/                       # setup de Vitest + smoke de infraestructura
└── types/index.ts              # Tipos compartidos con el backend
```

## Páginas

| Ruta | Página |
|------|--------|
| `/login` | Login |
| `/` | Dashboard |
| `/alumnos` `/cursos` `/docentes` `/materias` | CrudPages (ABM genérico) |
| `/inscripciones` | InscripcionesPage |
| `/asistencias` | AsistenciasPage |
| `/calificaciones` | CalificacionesPage |
| `/actas` | ActasPage (tabs: actas, acuerdos, seguimientos, tutores) |
| `/licencias` | LicenciasPage |
| `/modulos` | ModulosPage |
| `/carga-horaria` | CargaHorariaPage |
| `/calendario` | CalendarioPage |

## Deploy

- `vercel.json`: rewrites `/api/*` → Render y SPA catch-all.
- `vite.config.ts`: proxy `/api` → `localhost:3000` en dev.
