import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { puedeAcceder, rutaInicial } from './constants/roles';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import { AlumnosPage, CursosPage, DocentesPage, MateriasPage } from './pages/CrudPages';
import { InscripcionesPage } from './pages/InscripcionesPage';
import { AsistenciasPage } from './pages/AsistenciasPage';
import { CalificacionesPage } from './pages/CalificacionesPage';
import { ActasPage } from './pages/ActasPage';
import { LicenciasPage } from './pages/LicenciasPage';
import { ModulosMensualesPage } from './pages/ModulosMensualesPage';
import { CargaHorariaPage } from './pages/CargaHorariaPage';
import { CalendarioPage } from './pages/CalendarioPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { token, user } = useAuth();
  const { pathname } = useLocation();
  if (!token) return <Navigate to="/login" replace />;
  if (!puedeAcceder(user?.rol, pathname)) return <Navigate to={rutaInicial(user?.rol)} replace />;
  return <Layout>{children}</Layout>;
}

function CatchAll() {
  const { token, user } = useAuth();
  return <Navigate to={token ? rutaInicial(user?.rol) : '/login'} replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/alumnos" element={<ProtectedRoute><AlumnosPage /></ProtectedRoute>} />
          <Route path="/cursos" element={<ProtectedRoute><CursosPage /></ProtectedRoute>} />
          <Route path="/docentes" element={<ProtectedRoute><DocentesPage /></ProtectedRoute>} />
          <Route path="/materias" element={<ProtectedRoute><MateriasPage /></ProtectedRoute>} />
          <Route path="/inscripciones" element={<ProtectedRoute><InscripcionesPage /></ProtectedRoute>} />
          <Route path="/asistencias" element={<ProtectedRoute><AsistenciasPage /></ProtectedRoute>} />
          <Route path="/calificaciones" element={<ProtectedRoute><CalificacionesPage /></ProtectedRoute>} />
          <Route path="/actas" element={<ProtectedRoute><ActasPage /></ProtectedRoute>} />
          <Route path="/licencias" element={<ProtectedRoute><LicenciasPage /></ProtectedRoute>} />
          <Route path="/modulos-mensuales" element={<ProtectedRoute><ModulosMensualesPage /></ProtectedRoute>} />
          <Route path="/carga-horaria" element={<ProtectedRoute><CargaHorariaPage /></ProtectedRoute>} />
          <Route path="/calendario" element={<ProtectedRoute><CalendarioPage /></ProtectedRoute>} />
          <Route path="*" element={<CatchAll />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
