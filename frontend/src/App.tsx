import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import { AlumnosPage, CursosPage, DocentesPage, MateriasPage } from './pages/CrudPages';
import { InscripcionesPage } from './pages/InscripcionesPage';
import { AsistenciasPage } from './pages/AsistenciasPage';
import { CalificacionesPage } from './pages/CalificacionesPage';
import { ActasPage } from './pages/ActasPage';
import { LicenciasPage } from './pages/LicenciasPage';
import { ModulosPage } from './pages/ModulosPage';
import { CargaHorariaPage } from './pages/CargaHorariaPage';
import { CalendarioPage } from './pages/CalendarioPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { token } = useAuth();
  return token ? <Layout>{children}</Layout> : <Navigate to="/login" replace />;
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
          <Route path="/modulos" element={<ProtectedRoute><ModulosPage /></ProtectedRoute>} />
          <Route path="/carga-horaria" element={<ProtectedRoute><CargaHorariaPage /></ProtectedRoute>} />
          <Route path="/calendario" element={<ProtectedRoute><CalendarioPage /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
