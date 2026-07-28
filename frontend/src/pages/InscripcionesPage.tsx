import { useEffect, useState, useCallback } from 'react';
import { api } from '../services/api';
import { FormModal, Toast, Button, Badge, ConfirmModal } from '../components/ui';
import { Users, BookOpen, Trash2 } from 'lucide-react';

export function InscripcionesPage() {
  const [alumnos, setAlumnos] = useState<any[]>([]);
  const [cursos, setCursos] = useState<any[]>([]);
  const [inscripciones, setInscripciones] = useState<any[]>([]);
  const [alumnoId, setAlumnoId] = useState('');
  const [cursoId, setCursoId] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [pendingDelete, setPendingDelete] = useState<{ alumnoId: number; cursoId: number; alumno: string } | null>(null);
  const [dniFilter, setDniFilter] = useState('');
  const [nombreFilter, setNombreFilter] = useState('');
  const [anioFilter, setAnioFilter] = useState('');
  const [divisionFilter, setDivisionFilter] = useState('');
  const [turnoFilter, setTurnoFilter] = useState('');

  const load = useCallback(async () => {
    const [a, c] = await Promise.all([api.getAlumnos(), api.getCursos()]);
    setAlumnos(a.filter((x: any) => x.estado === 'activo'));
    setCursos(c.filter((x: any) => x.estado === 'activo'));
    const ins: any[] = [];
    for (const al of a) {
      if (al.inscripciones) al.inscripciones.forEach((i: any) => ins.push({ ...i, alumno: al }));
    }
    setInscripciones(ins);
  }, []);

  useEffect(() => { load(); }, [load]);

  const aniosDisponibles = [...new Set(cursos.map(c => c.anio))].sort();
  const divisionesDisponibles = [...new Set(cursos
    .filter(c => !anioFilter || c.anio === Number(anioFilter))
    .map(c => c.division))].sort();
  const turnosDisponibles = [...new Set(cursos
    .filter(c => (!anioFilter || c.anio === Number(anioFilter)) && (!divisionFilter || c.division === divisionFilter))
    .map(c => c.turno))].sort();

  const inscribir = async () => {
    if (!alumnoId || !cursoId) { setToast({ message: 'Seleccioná un alumno y un curso', type: 'error' }); return; }
    try {
      await api.inscribir({ alumnoId: Number(alumnoId), cursoId: Number(cursoId) });
      setToast({ message: 'Inscripción registrada con éxito', type: 'success' });
      setAlumnoId(''); setCursoId(''); setShowForm(false); load();
    } catch (err: any) { setToast({ message: err.message, type: 'error' }); }
  };

  const desinscribir = async (aId: number, cId: number) => {
    try { await api.desinscribir(aId, cId); setToast({ message: 'Inscripción eliminada', type: 'success' }); setPendingDelete(null); load(); }
    catch (err: any) { setToast({ message: err.message, type: 'error' }); setPendingDelete(null); }
  };

  const filtered = inscripciones.filter(i => {
    const nombre = `${i.alumno?.apellido ?? ''} ${i.alumno?.nombre ?? ''}`.toLowerCase();
    const dni = String(i.alumno?.dni ?? '');
    return nombre.includes(nombreFilter.toLowerCase()) && dni.includes(dniFilter) &&
      (!anioFilter || i.curso?.anio === Number(anioFilter)) &&
      (!divisionFilter || i.curso?.division === divisionFilter) &&
      (!turnoFilter || i.curso?.turno === turnoFilter);
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Inscripciones</h1>
          <p className="text-slate-500 text-sm mt-1">Inscripción de alumnos a cursos</p>
        </div>
        <Button onClick={() => { setAlumnoId(''); setCursoId(''); setShowForm(true); }} variant="primary"><Users size={16} /> Inscribir</Button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <div className="flex flex-wrap items-center gap-3">
          <input value={dniFilter} onChange={e => setDniFilter(e.target.value)} placeholder="DNI" className="w-full sm:w-32 border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 outline-none" />
          <input value={nombreFilter} onChange={e => setNombreFilter(e.target.value)} placeholder="Nombre" className="w-full sm:w-44 border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 outline-none" />
          <select value={anioFilter} onChange={e => setAnioFilter(e.target.value)} className="border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none bg-white">
            <option value="">Todos los años</option>
            {aniosDisponibles.map(a => <option key={a} value={a}>{a}°</option>)}
          </select>
          <select value={divisionFilter} onChange={e => setDivisionFilter(e.target.value)} className="border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none bg-white">
            <option value="">Todas las divisiones</option>
            {divisionesDisponibles.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <select value={turnoFilter} onChange={e => setTurnoFilter(e.target.value)} className="border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none bg-white">
            <option value="">Todos los turnos</option>
            {turnosDisponibles.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>

      <div className="overflow-hidden bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-semibold text-slate-700 text-sm">Inscripciones Registradas</h2>
          <Badge variant="default">{filtered.length} registros</Badge>
        </div>
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <BookOpen size={40} className="mb-3 text-slate-300" />
            <p className="text-sm font-medium">No hay inscripciones</p>
            <p className="text-xs mt-1">Hacé clic en "Inscribir" para registrar un alumno</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-5 py-3.5 font-semibold text-slate-600 text-xs uppercase tracking-wider">Alumno</th>
                <th className="text-left px-5 py-3.5 font-semibold text-slate-600 text-xs uppercase tracking-wider">Curso</th>
                <th className="text-left px-5 py-3.5 font-semibold text-slate-600 text-xs uppercase tracking-wider">DNI</th>
                <th className="text-left px-5 py-3.5 font-semibold text-slate-600 text-xs uppercase tracking-wider">Fecha</th>
                <th className="text-left px-5 py-3.5 font-semibold text-slate-600 text-xs uppercase tracking-wider">Estado</th>
                <th className="px-5 py-3.5 w-20" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((i, idx) => (
                <tr key={`${i.alumnoId}-${i.cursoId}`} className={`border-b border-slate-100 transition-colors hover:bg-blue-50/40 ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}`}>
                  <td className="px-5 py-3 text-slate-700 font-medium">{i.alumno?.apellido}, {i.alumno?.nombre}</td>
                  <td className="px-5 py-3 text-slate-600">{i.curso?.anio}°{i.curso?.division} - {i.curso?.turno}</td>
                  <td className="px-5 py-3 text-slate-500">{i.alumno?.dni}</td>
                  <td className="px-5 py-3 text-slate-500">{new Date(i.fechaInscripcion).toLocaleDateString()}</td>
                  <td className="px-5 py-3"><Badge variant={i.estado === 'activo' ? 'success' : 'default'}>{i.estado}</Badge></td>
                  <td className="px-5 py-3 text-right">
                    <button onClick={() => setPendingDelete({ alumnoId: i.alumnoId, cursoId: i.cursoId, alumno: `${i.alumno?.apellido}, ${i.alumno?.nombre}` })} className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all" title="Desinscribir"><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showForm && <FormModal title="Nueva Inscripción" onClose={() => setShowForm(false)}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Alumno</label>
            <select value={alumnoId} onChange={e => setAlumnoId(e.target.value)} className="w-full border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm text-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white">
              <option value="">Seleccionar alumno...</option>
              {alumnos.map(a => (
                <option key={a.id} value={a.id} disabled={inscripciones.some(i => i.alumnoId === a.id && i.cursoId === Number(cursoId))}>
                  {a.apellido}, {a.nombre} - {a.dni}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Curso</label>
            <select value={cursoId} onChange={e => setCursoId(e.target.value)} className="w-full border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm text-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white">
              <option value="">Seleccionar curso...</option>
              {cursos.map(c => <option key={c.id} value={c.id}>{c.anio}°{c.division} - {c.turno} {c.orientacion ? `(${c.orientacion})` : ''}</option>)}
            </select>
          </div>
          <div className="flex justify-end pt-2">
            <Button onClick={inscribir} variant="primary"><Users size={16} /> Inscribir</Button>
          </div>
        </div>
      </FormModal>}

      {pendingDelete && (
        <ConfirmModal
          title="Desinscribir alumno"
          message={`¿Estás seguro de desinscribir a ${pendingDelete.alumno}? Esta acción no se puede deshacer.`}
          onConfirm={() => desinscribir(pendingDelete.alumnoId, pendingDelete.cursoId)}
          onCancel={() => setPendingDelete(null)} />
      )}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
