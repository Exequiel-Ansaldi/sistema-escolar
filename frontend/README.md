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
| `npm run preview` | Sirve el build de producción |

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
