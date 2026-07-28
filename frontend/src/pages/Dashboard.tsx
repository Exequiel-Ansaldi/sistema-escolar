import { useEffect, useState } from 'react';

import { Users, BookOpen, GraduationCap, UserCheck, Clock } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { api } from '../services/api';
import { Card } from '../components/ui';

const COLORS = ['#2563eb', '#7c3aed', '#059669', '#d97706', '#dc2626', '#0891b2', '#db2777'];

export default function Dashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getDashboard(), api.getAlumnosPorCurso(), api.getCalificacionesResumen()])
      .then(([res, cursos, cal]) => setData({ ...res, alumnosPorCurso: cursos, calificaciones: cal }))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-4 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" /></div>;
  if (!data) return <div className="text-center py-20 text-gray-400">Error al cargar datos</div>;

  const cursoData = (data.alumnosPorCurso || []).map((c: any) => ({
    name: c.nombre || `${c.anio}°${c.division}`,
    alumnos: c.alumnos || c._count?.alumnos || 0,
  }));

  const { fecha, fechaHoy, presentes, ausentes } = data.asistenciaHoy ?? {};
  const esUltimoDiaHabil = fecha && fechaHoy && fecha !== fechaHoy;

  const pieData = [
    { name: 'Presentes', value: presentes ?? 0 },
    { name: 'Ausentes', value: ausentes ?? 0 },
  ];

  return (
    <div className="space-y-4 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Resumen general del sistema escolar</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card title="Alumnos" value={data?.totales?.alumnos ?? 0} icon={<Users size={24} />} color="blue" to="/alumnos" />
        <Card title="Docentes" value={data?.totales?.docentes ?? 0} icon={<GraduationCap size={24} />} color="purple" to="/docentes" />
        <Card title="Cursos" value={data?.totales?.cursos ?? 0} icon={<BookOpen size={24} />} color="orange" to="/cursos" />
        <Card title={`Asistencia ${fecha ?? ''}`} value={presentes ?? 0} icon={<UserCheck size={24} />} color="green" to="/asistencias" />
        <Card title="Módulos" value={`${data?.modulos?.eficiencia ?? 0}%`} icon={<Clock size={24} />} color="purple" to="/modulos" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-3">
            <h2 className="font-semibold text-gray-800 mb-1">Alumnos por Curso</h2>
            <p className="text-xs text-gray-400 mb-2">Distribución de alumnos en cada curso</p>
            {cursoData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={cursoData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#94a3b8' }} />
                  <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} allowDecimals={false} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} labelStyle={{ fontWeight: 600, color: '#1e293b' }} />
                  <Bar dataKey="alumnos" fill="#2563eb" radius={[6, 6, 0, 0]} maxBarSize={60} />
                </BarChart>
              </ResponsiveContainer>
            ) : <div className="text-center py-12 text-gray-400 text-sm">Sin datos</div>}
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
            <h2 className="font-semibold text-gray-800 mb-1">Módulos por Materia</h2>
            <p className="text-xs text-gray-400 mb-2">Previstos vs dictados (últimos 30 días)</p>
            {data?.modulos?.porMateria?.length > 0 ? (
              <ResponsiveContainer width="100%" height={330}>
                <BarChart data={data.modulos.porMateria} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="nombre" tick={{ fontSize: 12, fill: '#94a3b8' }} />
                  <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} allowDecimals={false} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} labelStyle={{ fontWeight: 600, color: '#1e293b' }} />
                  <Bar dataKey="previstos" fill="#2563eb" radius={[4, 4, 0, 0]} maxBarSize={40} name="Previstos" />
                  <Bar dataKey="dictados" fill="#059669" radius={[4, 4, 0, 0]} maxBarSize={40} name="Dictados" />
                </BarChart>
              </ResponsiveContainer>
            ) : <div className="text-center py-8 text-gray-400 text-sm">Sin datos</div>}
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
            <div className="flex items-center gap-2">
              <h2 className="font-semibold text-gray-800 mb-1">Asistencia {fecha ?? ''}</h2>
              {esUltimoDiaHabil && (
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 ring-1 ring-amber-600/20">
                  Últ. día hábil
                </span>
              )}
            </div>
            <p className="text-xs text-gray-400 mb-2">Distribución del día</p>
            {pieData.some(d => d.value > 0) ? (
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" startAngle={90} endAngle={-270}>
                    {pieData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                  </Pie>
                  <Legend />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : <div className="text-center py-6 text-gray-400 text-sm">Sin registros hoy</div>}
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
            <h2 className="font-semibold text-gray-800 mb-2">Resumen Calificaciones</h2>
            {data?.calificaciones ? (
              <div className="space-y-1">
                {[
                  { label: 'Promedio General', value: data.calificaciones.promedioGeneral ?? '-', color: 'text-gray-800' },
                  { label: 'Nota Máxima', value: data.calificaciones.notaMaxima ?? '-', color: 'text-emerald-600' },
                  { label: 'Nota Mínima', value: data.calificaciones.notaMinima ?? '-', color: 'text-red-500' },
                  { label: 'Total Calificaciones', value: data.calificaciones.totalCalificaciones, color: 'text-gray-800' },
                ].map(item => (
                  <div key={item.label} className="flex items-center justify-between py-1">
                    <span className="text-sm text-gray-500">{item.label}</span>
                    <span className={`font-bold text-lg ${item.color}`}>{item.value}</span>
                  </div>
                ))}
              </div>
            ) : <div className="text-center py-4 text-gray-400 text-sm">Sin datos</div>}
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
            <h2 className="font-semibold text-gray-800 mb-1">Módulos por Factor</h2>
            <p className="text-xs text-gray-400 mb-2">Distribución según causa de ausencia</p>
            {data?.modulos?.porFactor?.length > 0 ? (
              <div className="space-y-1">
                {data.modulos.porFactor.map((f: any) => (
                  <div key={f.factor} className="flex items-center justify-between py-1.5 border-b border-gray-100 last:border-0">
                    <span className="text-sm text-gray-500 capitalize">{f.factor}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-400">{f.count} registros</span>
                      <span className="font-bold text-sm text-gray-800">{f.dictados} mód.</span>
                    </div>
                  </div>
                ))}
                {data.modulos.totalPrevistos > 0 && (
                  <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                    <span className="text-sm font-semibold text-gray-700">Eficiencia</span>
                    <span className="font-bold text-lg text-emerald-600">{data.modulos.eficiencia}%</span>
                  </div>
                )}
              </div>
            ) : <div className="text-center py-6 text-gray-400 text-sm">Sin datos</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
