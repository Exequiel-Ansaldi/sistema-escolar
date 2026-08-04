import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { DataTable, FormModal, Select, Input, Button, Badge, Toast, ConfirmModal, Pagination } from '../components/ui';

const FACTORES = ['', 'ausencia', 'licencia', 'paro', 'asamblea', 'feriado', 'otro'];

function getMonday(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

function formatSemana(s: string): string {
  const d = new Date(s);
  const fin = new Date(d);
  fin.setDate(fin.getDate() + 4);
  const opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' };
  return `${d.toLocaleDateString('es', opts)} - ${fin.toLocaleDateString('es', opts)}`;
}

const MONTHS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

export function ModulosPage() {
  const [cursos, setCursos] = useState<any[]>([]);
  const [docentes, setDocentes] = useState<any[]>([]);
  const [materias, setMaterias] = useState<any[]>([]);
  const [registros, setRegistros] = useState<any[]>([]);
  const [totales, setTotales] = useState({ previstos: 0, dictados: 0 });
  const [loading, setLoading] = useState(false);
  const [anioFilter, setAnioFilter] = useState('');
  const [divisionFilter, setDivisionFilter] = useState('');
  const [turnoFilter, setTurnoFilter] = useState('');
  const [materiaFilter, setMateriaFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const now = new Date();
  const [mesActual, setMesActual] = useState(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`);

  useEffect(() => {
    Promise.all([api.getAllCursos(), api.getAllDocentes(), api.getAllMaterias()]).then(([c, d, m]) => {
      setCursos(c.filter((x: any) => x.estado === 'activo'));
      setDocentes(d.filter((x: any) => x.estado === 'activo'));
      setMaterias(m);
    });
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        const r = await api.getModulosSemana(mesActual, page, 10, {
          anio: anioFilter || undefined,
          division: divisionFilter || undefined,
          turno: turnoFilter || undefined,
          materiaId: materiaFilter ? Number(materiaFilter) : undefined,
        });
        if (!cancelled) {
          setRegistros(r.data ?? []);
          setTotalPages(r.totalPages ?? 1);
          setTotales({ previstos: r.totalPrevistos ?? 0, dictados: r.totalDictados ?? 0 });
        }
      } catch (err: any) { if (!cancelled) { setToast({ message: err.message, type: 'error' }); setRegistros([]); } }
      finally { if (!cancelled) setLoading(false); }
    })();
    return () => { cancelled = true; };
  }, [mesActual, page, refreshKey, anioFilter, divisionFilter, turnoFilter, materiaFilter]);

  const aniosDisponibles = [...new Set(cursos.map(c => c.anio).filter(Boolean))].sort();
  const divisionesDisponibles = [...new Set(cursos
    .filter(c => !anioFilter || c.anio === Number(anioFilter))
    .map(c => c.division).filter(Boolean))].sort();
  const turnosDisponibles = [...new Set(cursos
    .filter(c => (!anioFilter || c.anio === Number(anioFilter)) && (!divisionFilter || c.division === divisionFilter))
    .map(c => c.turno).filter(Boolean))].sort();

  const onFilterChange = (setter: (v: string) => void) => (v: string) => { setPage(1); setter(v); };

  const [y, m] = mesActual.split('-').map(Number);
  const prevMonth = () => { setPage(1); setMesActual(m === 1 ? `${y - 1}-12` : `${y}-${String(m - 1).padStart(2, '0')}`); };
  const nextMonth = () => { setPage(1); setMesActual(m === 12 ? `${y + 1}-01` : `${y}-${String(m + 1).padStart(2, '0')}`); };

  const save = async (body: any) => {
    const data = {
      docenteId: Number(body.docenteId), cursoId: Number(body.cursoId), materiaId: Number(body.materiaId),
      semanaInicio: new Date(body.semanaInicio).toISOString(),
      modulosPrevistos: Number(body.modulosPrevistos),
      modulosDictados: Number(body.modulosDictados),
      factor: body.factor || null,
      observacion: body.observacion || null,
    };
    try {
      if (editing) await api.updateModuloSemana(editing.id, data);
      else await api.upsertModuloSemana(data);
      setToast({ message: editing ? 'Registro actualizado' : 'Registro creado', type: 'success' });
      setShowForm(false); setEditing(null); setRefreshKey(k => k + 1);
    } catch (err: any) { setToast({ message: err.message, type: 'error' }); }
  };

  const executeDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try { await api.deleteModuloSemana(deleteTarget.id); setToast({ message: 'Registro eliminado', type: 'success' }); setDeleteTarget(null); setRefreshKey(k => k + 1); } catch (err: any) { setToast({ message: err.message, type: 'error' }); } finally { setDeleting(false); }
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Módulos Semanales</h1>
          <p className="text-slate-500 text-sm mt-1">Registro semanal de módulos (40 min c/u) por curso</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => { setEditing(null); setShowForm(true); }} variant="primary">+ Registrar</Button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Button onClick={prevMonth} variant="secondary">&lt;</Button>
            <span className="font-semibold text-slate-700 min-w-[140px] text-center">{MONTHS[m - 1]} {y}</span>
            <Button onClick={nextMonth} variant="secondary">&gt;</Button>
          </div>
          <span className="text-slate-300">|</span>
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
          {materias.length > 0 && (
            <select value={materiaFilter} onChange={e => onFilterChange(setMateriaFilter)(e.target.value)} className="border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none bg-white">
              <option value="">Todas las materias</option>
              {materias.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
            </select>
          )}
        </div>
      </div>

      {totales.previstos > 0 && (
        <div className="bg-blue-50 rounded-xl border border-blue-200 p-4 flex items-center justify-between">
          <span className="text-sm text-blue-800 font-medium">Totales del mes</span>
          <div className="flex gap-6 text-sm">
            <span className="text-blue-700">Previstos: <strong>{totales.previstos}</strong></span>
            <span className="text-blue-700">Dictados: <strong>{totales.dictados}</strong></span>
            <span className="text-blue-700">
              Eficiencia: <strong>{totales.previstos ? Math.round((totales.dictados / totales.previstos) * 100) : 0}%</strong>
            </span>
          </div>
        </div>
      )}

      <DataTable columns={[
        { key: 'semanaInicio', label: 'Semana', render: (v: string) => formatSemana(v) },
        { key: 'curso', label: 'Curso', render: (_: any, r: any) => r.curso ? `${r.curso.anio}°${r.curso.division} - ${r.curso.turno}` : '-' },
        { key: 'materia', label: 'Materia', render: (_: any, r: any) => r.materia?.nombre },
        { key: 'docente', label: 'Docente', render: (_: any, r: any) => r.docente ? `${r.docente.apellido}, ${r.docente.nombre}` : '-' },
        { key: 'modulosPrevistos', label: 'Previstos' },
        { key: 'modulosDictados', label: 'Dictados' },
        { key: 'factor', label: 'Factor', render: (v: string) => v ? <Badge variant={v === 'ausencia' || v === 'licencia' ? 'danger' : 'warning'}>{v}</Badge> : <Badge variant="success">normal</Badge> },
        { key: 'observacion', label: 'Obs.', render: (v: string) => v ?? '-' },
      ]} data={registros} loading={loading} onEdit={(r) => { setEditing(r); setShowForm(true); }} onDelete={(r) => setDeleteTarget(r)} />
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      {showForm && <FormModal title={editing ? 'Editar Registro' : 'Registrar Módulos Semanales'} onClose={() => { setShowForm(false); setEditing(null); }}>
        <form onSubmit={e => { e.preventDefault(); const form = new FormData(e.currentTarget); const fecha = form.get('semanaInicio') as string; form.set('semanaInicio', getMonday(new Date(fecha)).toISOString().split('T')[0]); save(Object.fromEntries(form)); }}>
          <Select label="Curso" name="cursoId" defaultValue={editing?.cursoId ?? ''}>
            <option value="">Seleccionar...</option>
            {cursos.map(c => <option key={c.id} value={c.id}>{c.anio}°{c.division} - {c.turno}</option>)}
          </Select>
          <Select label="Docente" name="docenteId" defaultValue={editing?.docenteId ?? ''}>
            <option value="">Seleccionar...</option>
            {docentes.map(d => <option key={d.id} value={d.id}>{d.apellido}, {d.nombre}</option>)}
          </Select>
          <Select label="Materia" name="materiaId" defaultValue={editing?.materiaId ?? ''}>
            <option value="">Seleccionar...</option>
            {materias.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
          </Select>
          <Input label="Semana (cualquier día)" name="semanaInicio" type="date" defaultValue={editing?.semanaInicio?.split('T')[0] ?? new Date().toISOString().split('T')[0]} required />
          <Input label="Módulos Previstos" name="modulosPrevistos" type="number" min={0} defaultValue={editing?.modulosPrevistos ?? ''} required />
          <Input label="Módulos Dictados" name="modulosDictados" type="number" min={0} defaultValue={editing?.modulosDictados ?? ''} required />
          <Select label="Factor (si no se dictaron todos)" name="factor" defaultValue={editing?.factor ?? ''}>
            <option value="">Normal</option>
            {FACTORES.filter(f => f).map(f => <option key={f} value={f}>{f}</option>)}
          </Select>
          <Input label="Observación" name="observacion" defaultValue={editing?.observacion ?? ''} />
          <Button type="submit" variant="primary">Guardar</Button>
        </form>
      </FormModal>}

      {deleteTarget && (
        <ConfirmModal title="Eliminar registro" message="¿Estás seguro de eliminar este registro semanal de módulos?" onConfirm={executeDelete} onCancel={() => setDeleteTarget(null)} loading={deleting} />
      )}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
