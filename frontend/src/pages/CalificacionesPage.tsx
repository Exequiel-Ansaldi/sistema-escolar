import { useEffect, useState, useCallback } from 'react';
import { api } from '../services/api';
import { DataTable, FormModal, Select, Input, Button, Toast, Pagination } from '../components/ui';
import { Calculator, BarChart3, BookOpen, FileText } from 'lucide-react';

export function CalificacionesPage() {
  const [alumnos, setAlumnos] = useState<any[]>([]);
  const [materias, setMaterias] = useState<any[]>([]);
  const [calificaciones, setCalificaciones] = useState<any[]>([]);
  const [alumnoId, setAlumnoId] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [promedio, setPromedio] = useState<any>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [dniFilter, setDniFilter] = useState('');
  const [nombreFilter, setNombreFilter] = useState('');

  useEffect(() => {
    api.getAllAlumnos().then(a => setAlumnos(a.filter((x: any) => x.estado === 'activo')));
    api.getAllMaterias().then(setMaterias);
  }, []);

  const [promTrimestre, setPromTrimestre] = useState<any[]>([]);
  const [promMateria, setPromMateria] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const load = useCallback(async () => {
    if (!alumnoId) return;
    const [cal, prom, promT, promM] = await Promise.all([
      api.getCalificaciones(Number(alumnoId), page),
      api.getPromedio(Number(alumnoId)),
      api.getPromedioPorTrimestre(Number(alumnoId)),
      api.getPromedioPorMateria(Number(alumnoId)),
    ]);
    setCalificaciones(cal.data ?? []); setTotalPages(cal.totalPages ?? 1); setPromedio(prom); setPromTrimestre(promT); setPromMateria(promM);
  }, [alumnoId, page]);

  useEffect(() => { setPage(1); }, [alumnoId]);
  useEffect(() => { load(); }, [load]);

  const alumnosFiltrados = alumnos.filter(a => {
    const nombre = `${a.apellido} ${a.nombre}`.toLowerCase();
    const dni = String(a.dni ?? '');
    return nombre.includes(nombreFilter.toLowerCase()) && dni.includes(dniFilter);
  });

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Calificaciones</h1>
          <p className="text-slate-500 text-sm mt-1">Consultá y registrá calificaciones por alumno</p>
        </div>
        <div className="flex gap-2">
          {alumnoId && <Button onClick={() => api.exportPdfCalificaciones(Number(alumnoId))} variant="ghost"><FileText size={16} /> PDF</Button>}
          <Button onClick={() => setShowForm(true)} variant="primary">+ Nueva</Button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <div className="flex flex-wrap items-center gap-3">
          <input value={dniFilter} onChange={e => setDniFilter(e.target.value)} placeholder="DNI" className="w-full sm:w-32 border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 outline-none" />
          <input value={nombreFilter} onChange={e => setNombreFilter(e.target.value)} placeholder="Nombre" className="w-full sm:w-44 border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 outline-none" />
          <select value={alumnoId} onChange={e => { setAlumnoId(e.target.value); }} className="border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none bg-white">
            <option value="">Alumno</option>
            {alumnosFiltrados.map(a => <option key={a.id} value={a.id}>{a.apellido}, {a.nombre}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {promedio && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-blue-50 text-blue-600"><Calculator size={24} /></div>
            <div>
              <div className="text-sm text-slate-500">Promedio General</div>
              <div className="text-2xl font-bold text-slate-800">{promedio._avg?.nota?.toFixed(2) ?? '-'} <span className="text-sm font-normal text-slate-400">({promedio._count} calif.)</span></div>
            </div>
          </div>
        )}
        {promTrimestre.map(t => (
          <div key={t.trimestre} className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600"><BarChart3 size={24} /></div>
            <div>
              <div className="text-sm text-slate-500">{t.trimestre}° Trimestre</div>
              <div className="text-2xl font-bold text-slate-800">{t._avg?.nota?.toFixed(2) ?? '-'} <span className="text-sm font-normal text-slate-400">({t._count} calif.)</span></div>
            </div>
          </div>
        ))}
      </div>

      {promMateria.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2"><BookOpen size={16} /> Promedio por Materia</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {promMateria.map(m => (
              <div key={m.materia?.id} className="flex items-center justify-between px-4 py-3 bg-slate-50 rounded-lg">
                <span className="text-sm text-slate-700">{m.materia?.nombre ?? '?'}</span>
                <span className="text-sm font-semibold text-slate-800">{m.promedio?.toFixed(2) ?? '-'} <span className="text-xs font-normal text-slate-400">({m.count})</span></span>
              </div>
            ))}
          </div>
        </div>
      )}

      <DataTable columns={[
        { key: 'materia', label: 'Materia', render: (_: any, r: any) => r.materia?.nombre },
        { key: 'nota', label: 'Nota' },
        { key: 'trimestre', label: 'Trimestre', render: (v: number) => `${v}°` },
        { key: 'fecha', label: 'Fecha', render: (v: string) => new Date(v).toLocaleDateString() },
        { key: 'observacion', label: 'Observación' },
      ]} data={calificaciones} />

      {calificaciones.length > 0 && <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />}

      {showForm && <FormModal title="Nueva Calificación" onClose={() => setShowForm(false)}>
        <form onSubmit={async e => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          await api.createCalificacion({ alumnoId: Number(alumnoId), materiaId: Number(fd.get('materiaId')), nota: Number(fd.get('nota')), trimestre: Number(fd.get('trimestre')), observacion: fd.get('observacion') as string });
          setToast({ message: 'Calificación registrada', type: 'success' }); setShowForm(false); load();
        }}>
          <Select label="Materia" name="materiaId">
            {materias.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
          </Select>
          <Input label="Nota (1-10)" name="nota" type="number" min={1} max={10} required />
          <Select label="Trimestre" name="trimestre">
            <option value={1}>1° Trimestre</option>
            <option value={2}>2° Trimestre</option>
            <option value={3}>3° Trimestre</option>
          </Select>
          <Input label="Observación" name="observacion" />
          <Button type="submit" variant="primary">Guardar</Button>
        </form>
      </FormModal>}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
