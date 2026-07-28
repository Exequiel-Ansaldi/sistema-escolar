import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { DataTable, FormModal, Input, Button, Badge, Toast } from '../components/ui';
import { FileText } from 'lucide-react';

export function AsistenciasPage() {
  const [alumnos, setAlumnos] = useState<any[]>([]);
  const [asistencias, setAsistencias] = useState<any[]>([]);
  const [alumnoId, setAlumnoId] = useState('');
  const [anioFilter, setAnioFilter] = useState('');
  const [divisionFilter, setDivisionFilter] = useState('');
  const [turnoFilter, setTurnoFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [searchAlumno, setSearchAlumno] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [dniFilter, setDniFilter] = useState('');
  const [nombreFilter, setNombreFilter] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    api.getAlumnos().then(setAlumnos);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!fecha) return;
      try { const d = await api.buscarAsistencias('', fecha); if (!cancelled) setAsistencias(d); }
      catch (err: any) { if (!cancelled) { setToast({ message: err.message, type: 'error' }); setAsistencias([]); } }
    })();
    return () => { cancelled = true; };
  }, [fecha, refreshKey]);

  const aniosDisponibles = [...new Set(asistencias.map(a => a.curso?.anio).filter(Boolean))].sort();
  const divisionesDisponibles = [...new Set(asistencias
    .filter(a => !anioFilter || a.curso?.anio === Number(anioFilter))
    .map(a => a.curso?.division).filter(Boolean))].sort();
  const turnosDisponibles = [...new Set(asistencias
    .filter(a => (!anioFilter || a.curso?.anio === Number(anioFilter)) && (!divisionFilter || a.curso?.division === divisionFilter))
    .map(a => a.curso?.turno).filter(Boolean))].sort();

  const registrar = async () => {
    const form = document.getElementById('asistenciaForm') as HTMLFormElement;
    const fd = new FormData(form);
    if (!alumnoId) { setToast({ message: 'Seleccioná un alumno', type: 'error' }); return; }
    const justificada = fd.get('justificada') === 'on';
    const observacion = fd.get('observacion') as string;
    await api.createAsistencia({ alumnoId: Number(alumnoId), justificada, observacion: observacion || undefined, fecha: new Date(fecha).toISOString() });
    setToast({ message: 'Inasistencia registrada', type: 'success' });
    setShowForm(false); setRefreshKey(k => k + 1);
  };

  const filtered = asistencias.filter(a => {
    const nombre = `${a.alumno?.apellido ?? ''} ${a.alumno?.nombre ?? ''}`.toLowerCase();
    const dni = String(a.alumno?.dni ?? '');
    return nombre.includes(nombreFilter.toLowerCase()) && dni.includes(dniFilter) &&
      (!anioFilter || a.curso?.anio === Number(anioFilter)) &&
      (!divisionFilter || a.curso?.division === divisionFilter) &&
      (!turnoFilter || a.curso?.turno === turnoFilter);
  });

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Asistencias</h1>
          <p className="text-slate-500 text-sm mt-1">Registro y consulta de asistencias por curso y fecha</p>
        </div>
        <Button onClick={() => { setAlumnoId(''); setShowForm(true); }} variant="primary">+ Registrar</Button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <div className="flex flex-wrap items-center gap-3">
          <input value={dniFilter} onChange={e => setDniFilter(e.target.value)} placeholder="DNI" className="w-32 border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 outline-none" />
          <input value={nombreFilter} onChange={e => setNombreFilter(e.target.value)} placeholder="Nombre" className="w-44 border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 outline-none" />
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
          <input type="date" value={fecha} onChange={e => setFecha(e.target.value)} className="border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none" />
        </div>
      </div>

      <DataTable columns={[
        { key: 'alumno', label: 'Alumno', render: (_: any, r: any) => `${r.alumno?.apellido}, ${r.alumno?.nombre}` },
        { key: 'estado', label: 'Estado', render: (v: string) => {
          if (v === 'presente') return <Badge variant="success">Presente</Badge>;
          if (v === 'no_corresponde') return <Badge variant="default">No corresponde</Badge>;
          return <Badge variant={v === 'justificado' ? 'warning' : 'danger'}>{v}</Badge>;
        }},
        { key: 'observacion', label: 'Observación', render: (v: string) => v ?? '-' },
        { key: 'pdf', label: '', render: (_: any, r: any) => (
          <button onClick={() => api.exportPdfAsistencia(r.alumnoId, fecha, fecha)} className="text-slate-400 hover:text-blue-600 transition-colors" title="Exportar PDF"><FileText size={16} /></button>
        )},
      ]} data={filtered} />

      {showForm && <FormModal title="Marcar inasistencia" onClose={() => setShowForm(false)}>
        <form id="asistenciaForm" onSubmit={e => { e.preventDefault(); registrar(); }}>
          <div className="mb-4 relative">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Alumno</label>
            <input
              value={alumnoId ? (alumnos.find(a => a.id === Number(alumnoId))?.apellido + ', ' + alumnos.find(a => a.id === Number(alumnoId))?.nombre || searchAlumno) : searchAlumno}
              onChange={e => { setSearchAlumno(e.target.value); setAlumnoId(''); setShowDropdown(true); }}
              onFocus={() => setShowDropdown(true)}
              onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
              placeholder="Buscá por nombre o DNI..."
              className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow"
            />
            {showDropdown && (
              <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                {alumnos
                  .filter((a: any) => a.estado === 'activo')
                  .filter((a: any) => {
                    const q = searchAlumno.toLowerCase();
                    return !q || `${a.apellido} ${a.nombre}`.toLowerCase().includes(q) || `${a.nombre} ${a.apellido}`.toLowerCase().includes(q) || String(a.dni).includes(q);
                  })
                  .map((a: any) => (
                    <button
                      key={a.id}
                      type="button"
                      onMouseDown={() => { setAlumnoId(String(a.id)); setSearchAlumno(`${a.apellido}, ${a.nombre}`); setShowDropdown(false); }}
                      className="w-full text-left px-3.5 py-2.5 text-sm text-gray-700 hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-0"
                    >
                      <span className="font-medium">{a.apellido}, {a.nombre}</span>
                      <span className="text-gray-400 ml-2">DNI {a.dni}</span>
                    </button>
                  ))}
                {alumnos.filter(a => a.estado === 'activo').filter(a => {
                  const q = searchAlumno.toLowerCase();
                  return !q || `${a.apellido} ${a.nombre}`.toLowerCase().includes(q) || String(a.dni).includes(q);
                }).length === 0 && (
                  <div className="px-3.5 py-2.5 text-sm text-gray-400">Sin resultados</div>
                )}
              </div>
            )}
          </div>
          <label className="flex items-center gap-2 mt-3">
            <input type="checkbox" name="justificada" className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
            <span className="text-sm text-slate-700">Justificada</span>
          </label>
          <Input label="Observación" name="observacion" />
          <Button type="submit" variant="primary">Guardar</Button>
        </form>
      </FormModal>}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
