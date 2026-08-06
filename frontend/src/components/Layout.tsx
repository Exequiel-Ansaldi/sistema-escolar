import { useState } from 'react';
import { Menu, X, LayoutDashboard, Users, BookOpen, GraduationCap, BookType, FileText, ClipboardList, Calendar, CalendarDays, Clock, UserCheck, LogOut, Weight } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROL_LABELS, puedeAcceder } from '../constants/roles';

const menuItems = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/' },
  { label: 'Alumnos', icon: Users, path: '/alumnos' },
  { label: 'Cursos', icon: BookOpen, path: '/cursos' },
  { label: 'Docentes', icon: GraduationCap, path: '/docentes' },
  { label: 'Materias', icon: BookType, path: '/materias' },
  { label: 'Carga Horaria', icon: Weight, path: '/carga-horaria' },
  { label: 'Inscripciones', icon: FileText, path: '/inscripciones' },
  { label: 'Asistencias', icon: ClipboardList, path: '/asistencias' },
  { label: 'Calificaciones', icon: UserCheck, path: '/calificaciones' },
  { label: 'Actas', icon: FileText, path: '/actas' },
  { label: 'Licencias', icon: Calendar, path: '/licencias' },
  { label: 'Módulos Mensuales', icon: Clock, path: '/modulos-mensuales' },
  { label: 'Calendario', icon: CalendarDays, path: '/calendario' },
];

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="flex h-screen bg-gray-100">
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-linear-to-b from-gray-900 to-gray-800 text-white transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:inset-auto shadow-lg`}>
        <div className="flex items-center justify-between px-5 h-16 border-b border-gray-700/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-sm font-bold">SG</div>
            <span className="font-bold text-base tracking-tight">SGE</span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1.5 rounded-lg hover:bg-gray-700/50"><X size={18} /></button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
          {menuItems.filter(item => puedeAcceder(user?.rol, item.path)).map(item => {
            const isActive = pathname === item.path;
            return (
              <Link key={item.path} to={item.path} onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group ${isActive ? 'bg-gray-700/60 text-white' : 'text-gray-300 hover:bg-gray-700/40 hover:text-white'}`}>
                {isActive && <span className="absolute left-0 w-1 h-6 bg-blue-400 rounded-r-full" />}
                <item.icon size={18} className={isActive ? 'text-blue-400' : 'text-gray-400 group-hover:text-gray-200'} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="px-4 py-4 border-t border-gray-700/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gray-700 flex items-center justify-center text-sm font-bold text-gray-300">
              {user ? getInitials(`${user.nombre} ${user.apellido}`) : 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{user?.nombre} {user?.apellido}</div>
              <div className="text-xs text-gray-400 truncate">{user?.rol ? (ROL_LABELS[user.rol] ?? user.rol) : 'Usuario'}</div>
            </div>
            <button onClick={handleLogout} className="p-1.5 rounded-lg hover:bg-gray-700/50 text-gray-400 hover:text-red-300 transition-colors" title="Cerrar sesión"><LogOut size={16} /></button>
          </div>
        </div>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 px-4 lg:px-6 h-16 flex items-center gap-3 shrink-0">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-gray-100 text-gray-600"><Menu size={20} /></button>
          <div className="flex-1" />
        </header>
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
