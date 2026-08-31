import { useEffect, useMemo, useState } from 'react';
import { api } from '../services/api';
import { FormModal, Toast, Button, Badge, ConfirmModal, Pagination } from '../components/ui';
import { Users, BookOpen, Trash2, Check, X, CheckCircle } from 'lucide-react';

export function InscripcionesPage() {
  const [alumnos, setAlumnos] = useState<any[]>([]);
  const [cursos, setCursos] = useState<any[]>([]);
  const [inscripciones, setInscripciones] = useState<any[]>([]);
  const [alumnoId, setAlumnoId] = useState('');
  const [cursoId, setCursoId] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [pendingDelete, setPendingDelete] = useState<{ alumnoId: number; cursoId: number; alumno: string } | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [anioFilter, setAnioFilter] = useState('');
  const [divisionFilter, setDivisionFilter] = useState('');
  const [turnoFilter, setTurnoFilter] = useState('');
  const [fDni, setFDni] = useState('');
  const [fNombre, setFNombre] = useState('');
  const [fAnio, setFAnio] = useState('');
  const [fDivision, setFDivision] = useState('');
  const [exito, setExito] = useState<{ alumno: string; curso: string } | null>(null);

  useEffect(() => {
    api.getAllAlumnos().then(a => setAlumnos(a.filter((x: any) => x.estado === 'activo')));
    api.getAllCursos().then(c => setCursos(c.filter((x: any) => x.estado === 'activo')));
  }, []);

  const load = (p?: number) => {
    api.getInscripciones(p ?? page, 10, {
      anio: anioFilter || undefined,
      division: divisionFilter || undefined,
      turno: turnoFilter || undefined,
    }).then(r => { setInscripciones(r.data ?? []); setTotalPages(r.totalPages ?? 1); }).catch((err: any) => setToast({ message: err.message, type: 'error' }));
  };

  useEffect(() => { load(); }, [page, anioFilter, divisionFilter, turnoFilter]);

  const aniosDisponibles = [...new Set(cursos.map(c => c.anio).filter(Boolean))].sort();
  const divisionesDisponibles = [...new Set(cursos
    .filter(c => !anioFilter || c.anio === Number(anioFilter))
    .map(c => c.division).filter(Boolean))].sort();
  const turnosDisponibles = [...new Set(cursos
    .filter(c => (!anioFilter || c.anio === Number(anioFilter)) && (!divisionFilter || c.division === divisionFilter))
    .map(c => c.turno).filter(Boolean))].sort();
  const hasFilters = Boolean(anioFilter || divisionFilter || turnoFilter);

  const onFilterChange = (setter: (v: string) => void) => (v: string) => { setPage(1); setter(v); };

  const divisionesModal = [...new Set(cursos
    .filter(c => !fAnio || c.anio === Number(fAnio))
    .map(c => c.division).filter(Boolean))].sort();

  const alumnosFiltrados = useMemo(() => alumnos.filter(a => {
    if (fDni.trim() && !String(a.dni).includes(fDni.trim())) return false;
    if (fNombre.trim()) {
      const full = `${a.apellido} ${a.nombre}`.toLowerCase();
      if (!full.includes(fNombre.trim().toLowerCase())) return false;
    }
    const cursoActual = a.inscripciones?.find((i: any) => i.estado === 'activo')?.curso;
    if (fAnio && (!cursoActual || cursoActual.anio !== Number(fAnio))) return false;
    if (fDivision && (!cursoActual || cursoActual.division !== fDivision)) return false;
    if (cursoId && a.inscripciones?.some((i: any) => i.estado === 'activo' && i.cursoId === Number(cursoId))) return false;
    return true;
  }), [alumnos, fDni, fNombre, fAnio, fDivision, cursoId]);

  const resetAlumnoFilters = () => { setFDni(''); setFNombre(''); setFAnio(''); setFDivision(''); setAlumnoId(''); };

  const inscribir = async () => {
    if (!alumnoId || !cursoId) { setToast({ message: 'Seleccioná un alumno y un curso', type: 'error' }); return; }
    try {
      await api.inscribir({ alumnoId: Number(alumnoId), cursoId: Number(cursoId) });
      const alumno = alumnos.find(a => a.id === Number(alumnoId));
      const curso = cursos.find(c => c.id === Number(cursoId));
      setExito({
        alumno: `${alumno?.apellido}, ${alumno?.nombre}`,
        curso: `${curso?.anio}°${curso?.division} - ${curso?.turno}`,
      });
      setAlumnoId(''); setCursoId(''); setShowForm(false); load();
    } catch (err: any) { setToast({ message: err.message, type: 'error' }); }
  };

  const desinscribir = async (aId: number, cId: number) => {
    try { await api.desinscribir(aId, cId); setToast({ message: 'Inscripción eliminada', type: 'success' }); setPendingDelete(null); load(); }
    catch (err: any) { setToast({ message: err.message, type: 'error' }); setPendingDelete(null); }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Inscripciones</h1>
          <p className="text-slate-500 text-sm mt-1">Inscripción de alumnos a cursos</p>
        </div>
        <Button onClick={() => { setAlumnoId(''); setCursoId(''); resetAlumnoFilters(); setShowForm(true); }} variant="primary"><Users size={16} /> Inscribir</Button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <div className="flex flex-wrap items-center gap-3">
          <select value={anioFilter} onChange={e => onFilterChange(setAnioFilter)(e.target.value)} className="border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none bg-white">
            <option value="">Todos los años</option>
            {aniosDisponibles.map(a => <option key={a} value={a}>{a}°</option>)}
          </select>
          <select value={divisionFilter} onChange={e => onFilterChange(setDivisionFilter)(e.target.value)} className="border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none bg-white">
            <option value="">Todas las divisiones</option>
            {divisionesDisponibles.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <select value={turnoFilter} onChange={e => onFilterChange(setTurnoFilter)(e.target.value)} className="border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none bg-white">
            <option value="">Todos los turnos</option>
            {turnosDisponibles.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>

      <div className="overflow-hidden bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-semibold text-slate-700 text-sm">Inscripciones Registradas</h2>
        </div>
        {inscripciones.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <BookOpen size={40} className="mb-3 text-slate-300" />
            <p className="text-sm font-medium">{hasFilters ? 'No hay inscripciones que coincidan con los filtros' : 'No hay inscripciones'}</p>
            <p className="text-xs mt-1">{hasFilters ? 'Probá cambiar los filtros' : 'Hacé clic en "Inscribir" para registrar un alumno'}</p>
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
              {inscripciones.map((i, idx) => (
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
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      {showForm && <FormModal title="Nueva Inscripción" onClose={() => setShowForm(false)}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Buscar alumno</label>
            <div className="grid grid-cols-2 gap-3">
              <input placeholder="Nombre o apellido" value={fNombre} onChange={e => setFNombre(e.target.value)} className="border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none bg-white placeholder:text-slate-400" />
              <input placeholder="DNI" value={fDni} onChange={e => setFDni(e.target.value)} className="border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none bg-white placeholder:text-slate-400" />
              <select value={fAnio} onChange={e => { setFAnio(e.target.value); setFDivision(''); setAlumnoId(''); }} className="border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                <option value="">Todos los años</option>
                {aniosDisponibles.map(a => <option key={a} value={a}>{a}°</option>)}
              </select>
              <select value={fDivision} onChange={e => { setFDivision(e.target.value); setAlumnoId(''); }} className="border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                <option value="">Todas las divisiones</option>
                {divisionesModal.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <button type="button" onClick={resetAlumnoFilters} className="mt-2 inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700">
              <X size={12} /> Limpiar filtros
            </button>
            <div className="mt-3 max-h-56 overflow-y-auto border border-slate-200 rounded-lg divide-y divide-slate-100">
              {alumnosFiltrados.length === 0 ? (
                <p className="px-4 py-6 text-sm text-slate-400 text-center">No hay alumnos que coincidan con los filtros</p>
              ) : alumnosFiltrados.map(a => {
                const selected = Number(alumnoId) === a.id;
                const cursoActual = a.inscripciones?.find((i: any) => i.estado === 'activo')?.curso;
                return (
                  <button key={a.id} type="button" onClick={() => setAlumnoId(selected ? '' : String(a.id))}
                    className={`w-full flex items-center justify-between gap-2 px-4 py-2.5 text-left transition-colors ${selected ? 'bg-emerald-50 text-emerald-800' : 'hover:bg-slate-50 text-slate-700'}`}>
                    <span className="text-sm truncate">
                      <span className="font-medium">{a.apellido}, {a.nombre}</span>
                      <span className="text-slate-400 ml-2">DNI {a.dni}</span>
                    </span>
                    <span className="flex items-center gap-2 shrink-0">
                      {cursoActual ? <Badge variant={selected ? 'success' : 'default'}>{cursoActual.anio}°{cursoActual.division}</Badge> : <span className="text-xs text-slate-400">Sin curso</span>}
                      {selected && <Check size={16} className="text-emerald-600" />}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Curso</label>
            <select value={cursoId} onChange={e => setCursoId(e.target.value)} className="w-full border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm text-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white">
              <option value="">Seleccionar curso...</option>
              {cursos.map(c => <option key={c.id} value={c.id}>{c.anio}°{c.division} - {c.turno} {c.orientacion ? `(${c.orientacion})` : ''}</option>)}
            </select>
          </div>
          <div className="flex justify-end pt-2">
            <Button onClick={inscribir} variant="primary" disabled={!alumnoId || !cursoId}><Users size={16} /> Inscribir</Button>
          </div>
        </div>
      </FormModal>}

      {exito && (
        <FormModal title="Inscripción exitosa" onClose={() => setExito(null)}>
          <div className="flex flex-col items-center gap-4 py-4">
            <CheckCircle size={52} className="text-emerald-500" />
            <p className="text-center text-slate-700">
              <strong>{exito.alumno}</strong> fue inscrito a <strong>{exito.curso}</strong>
            </p>
            <Button variant="primary" onClick={() => setExito(null)}>Listo</Button>
          </div>
        </FormModal>
      )}

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
