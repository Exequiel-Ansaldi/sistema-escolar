import { useEffect, useState, useMemo } from 'react';
import { api } from '../services/api';
import { FormModal, Select, Input, Button, Toast, Pagination } from '../components/ui';
import { Pencil, Trash2, Plus } from 'lucide-react';

export function CargaHorariaPage() {
  const [cursos, setCursos] = useState<any[]>([]);
  const [materias, setMaterias] = useState<any[]>([]);
  const [rows, setRows] = useState<any[]>([]);
  const [tableRows, setTableRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [anioFilter, setAnioFilter] = useState('');
  const [divisionFilter, setDivisionFilter] = useState('');
  const [turnoFilter, setTurnoFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;
  const [cursoIdForm, setCursoIdForm] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    Promise.all([api.getAllCursos(), api.getAllMaterias()]).then(([c, m]) => {
      setCursos(c.filter((x: any) => x.estado === 'activo'));
      setMaterias(m);
    });
  }, []);

  useEffect(() => {
    if (cursos.length > 0) load(anioFilter || undefined, divisionFilter || undefined, turnoFilter || undefined);
  }, [cursos]);

  const aniosDisponibles = [...new Set(cursos.map(c => c.anio))].sort();
  const divisionesDisponibles = [...new Set(cursos
    .filter(c => !anioFilter || c.anio === Number(anioFilter))
    .map(c => c.division))].sort();
  const turnosDisponibles = ['mañana', 'tarde', 'noche'];

  const load = async (anio?: string, division?: string, turno?: string) => {
    setLoading(true);
    try {
      const data = await api.getAllCargaHoraria(anio, division, turno);
      setRows(data);
      const cf = cursos.filter(c =>
        (!anio || c.anio === Number(anio)) &&
        (!division || c.division === division) &&
        (!turno || c.turno === turno)
      );
      const merged: any[] = [];
      for (const curso of cf) {
        const records = data.filter(r => r.cursoId === curso.id);
        if (records.length > 0) merged.push(...records);
        else merged.push({ _placeholder: true, curso, cursoId: curso.id, materia: null, materiaId: null, modulosPorSemana: null, cargaHoraria: null });
      }
      setTableRows(merged);
    }
    catch (err: any) { setToast({ message: err.message, type: 'error' }); setRows([]); setTableRows([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(anioFilter || undefined, divisionFilter || undefined, turnoFilter || undefined); }, [anioFilter, divisionFilter, turnoFilter]);

  const save = async (body: any) => {
    const id = editing ? editing.cursoId : Number(cursoIdForm);
    const curso = cursos.find(c => c.id === id);
    if (!curso) { setToast({ message: 'Seleccioná un curso', type: 'error' }); return; }
    const materiaId = editing ? editing.materiaId : Number(body.materiaId);
    const modulosPorSemana = Number(body.modulosPorSemana);
    if (!modulosPorSemana) { setToast({ message: 'Completá los módulos por semana', type: 'error' }); return; }
    try {
      if (editing) {
        await api.updateCargaHoraria(curso.id, materiaId, { modulosPorSemana });
        setToast({ message: 'Módulos actualizados', type: 'success' });
      } else {
        if (!materiaId) { setToast({ message: 'Seleccioná una materia', type: 'error' }); return; }
        const yaExiste = rows.find(r => r.materiaId === materiaId && r.cursoId === curso.id);
        if (yaExiste) { setToast({ message: 'Esa materia ya está asignada a este curso', type: 'error' }); return; }
        await api.asignarMateriaCurso({ cursoId: curso.id, materiaId, cargaHoraria: Math.round(modulosPorSemana * 40 / 60), modulosPorSemana });
        setToast({ message: 'Materia asignada', type: 'success' });
      }
      setShowForm(false); setEditing(null);
      load(anioFilter || undefined, divisionFilter || undefined, turnoFilter || undefined);
    } catch (err: any) { setToast({ message: err.message, type: 'error' }); }
  };

  const quitar = async (row: any) => {
    try {
      await api.quitarMateriaCurso(row.cursoId, row.materiaId);
      setToast({ message: 'Materia quitada', type: 'success' });
      load(anioFilter || undefined, divisionFilter || undefined, turnoFilter || undefined);
    } catch (err: any) { setToast({ message: err.message, type: 'error' }); }
  };

  const cursosFiltrados = cursos.filter(c =>
    (!anioFilter || c.anio === Number(anioFilter)) &&
    (!divisionFilter || c.division === divisionFilter) &&
    (!turnoFilter || c.turno === turnoFilter)
  );

  const grupos = useMemo(() => {
    const map = new Map<number, any[]>();
    for (const r of tableRows) {
      const key = r.curso?.id ?? r.cursoId;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(r);
    }
    return Array.from(map.entries()).map(([cursoId, items]) => ({ cursoId, curso: items[0].curso, items }));
  }, [tableRows]);

  const gruposPaginados = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return grupos.slice(start, start + PAGE_SIZE);
  }, [grupos, page]);

  const totalPages = Math.max(1, Math.ceil(grupos.length / PAGE_SIZE));

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Carga Horaria</h1>
          <p className="text-slate-500 text-sm mt-1">Asignación de materias y carga horaria por curso</p>
        </div>
        {cursos.length > 0 && <Button onClick={() => { setEditing(null); setCursoIdForm(''); setShowForm(true); }} variant="primary"><Plus size={16} /> Agregar materia</Button>}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <div className="flex flex-wrap items-center gap-3">
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

      {cursosFiltrados.length === 0 && (anioFilter || divisionFilter || turnoFilter) ? (
        <div className="text-center py-12 text-gray-400 text-sm bg-white rounded-xl border border-gray-200 shadow-sm">No hay cursos que coincidan con los filtros</div>
      ) : loading ? (
        <div className="text-center py-12 text-gray-400 animate-pulse bg-white rounded-xl border border-gray-200 shadow-sm">Cargando...</div>
      ) : tableRows.length === 0 ? (
        <div className="text-center py-12 text-gray-400 text-sm bg-white rounded-xl border border-gray-200 shadow-sm">
          {cursosFiltrados.length > 0 ? 'Usá "+ Agregar materia" para asignar materias' : 'No hay datos'}
        </div>
      ) : (
        <div className="overflow-hidden bg-white rounded-xl border border-gray-200 shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-5 py-3.5 font-semibold text-gray-600 text-xs uppercase tracking-wider w-48">Curso</th>
                <th className="text-left px-5 py-3.5 font-semibold text-gray-600 text-xs uppercase tracking-wider">Materia</th>
                <th className="text-left px-5 py-3.5 font-semibold text-gray-600 text-xs uppercase tracking-wider w-28">Módulos/sem</th>
                <th className="text-left px-5 py-3.5 font-semibold text-gray-600 text-xs uppercase tracking-wider w-28">Hs. cátedra</th>
                <th className="px-5 py-3.5 w-28" />
              </tr>
            </thead>
            <tbody>
              {gruposPaginados.map((grupo, gi) => {
                const cursoLabel = grupo.curso ? `${grupo.curso.anio}°${grupo.curso.division} - ${grupo.curso.turno}` : '-';
                const isLastGroup = gi === grupos.length - 1;
                return grupo.items.map((item: any, ri: number) => {
                  const isLastRow = ri === grupo.items.length - 1;
                  return (
                    <tr key={`${grupo.cursoId}-${ri}`} className={`transition-colors hover:bg-blue-50/40 ${gi % 2 === 0 ? 'bg-white' : 'bg-gray-50/40'} ${isLastRow && !isLastGroup ? 'border-b-2 border-gray-200' : 'border-b border-gray-100'}`}>
                      {ri === 0 ? (
                        <td rowSpan={grupo.items.length} className={`px-5 py-3 font-medium align-top ${grupo.items[0]._placeholder ? 'text-gray-300' : 'text-gray-800'}`}>{cursoLabel}</td>
                      ) : null}
                      <td className="px-5 py-3 text-gray-700">
                        {item._placeholder ? <span className="text-gray-300 italic">Sin materias</span> : item.materia?.nombre ?? '-'}
                      </td>
                      <td className="px-5 py-3 text-gray-700">{item._placeholder ? <span className="text-gray-300">—</span> : item.modulosPorSemana}</td>
                      <td className="px-5 py-3 text-gray-700">{item._placeholder ? <span className="text-gray-300">—</span> : item.cargaHoraria}</td>
                      <td className="px-5 py-3">
                        {!item._placeholder && (
                          <div className="flex items-center justify-end gap-1">
                            <button onClick={() => { setEditing(item); setShowForm(true); }} className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all" title="Editar"><Pencil size={16} /></button>
                            <button onClick={() => quitar(item)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all" title="Eliminar"><Trash2 size={16} /></button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                });
              })}
            </tbody>
          </table>
        </div>
      )}
      {grupos.length > 0 && <Pagination page={page} totalPages={totalPages} onPageChange={p => { setPage(p); }} />}

      {showForm && <FormModal title={editing ? 'Editar carga horaria' : 'Asignar materia al curso'} onClose={() => { setShowForm(false); setEditing(null); }}>
        <form onSubmit={e => { e.preventDefault(); save(Object.fromEntries(new FormData(e.currentTarget))); }}>
          {editing ? (
            <>
              <p className="text-sm text-slate-500 mb-4">Curso: <strong>{editing.curso ? `${editing.curso.anio}°${editing.curso.division} - ${editing.curso.turno}` : '-'}</strong></p>
              <p className="text-sm text-slate-500 mb-4">Materia: <strong>{editing.materia?.nombre}</strong></p>
            </>
          ) : (
            <Select label="Curso" value={cursoIdForm} onChange={e => setCursoIdForm(e.target.value)}>
              <option value="">Seleccionar curso...</option>
              {cursosFiltrados.map(c => <option key={c.id} value={c.id}>{c.anio}°{c.division} - {c.turno}</option>)}
            </Select>
          )}
          {editing || cursoIdForm ? (
            <>
              <Select label="Materia" name="materiaId">
                <option value="">Seleccionar...</option>
                {editing
                  ? materias.filter(m => m.id === editing.materiaId).map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)
                  : materias.filter(m => !rows.find(r => r.materiaId === m.id && r.cursoId === Number(cursoIdForm))).map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)
                }
              </Select>
              <Input label="Módulos por semana (c/u = 40 min)" name="modulosPorSemana" type="number" required min={1} defaultValue={editing?.modulosPorSemana} />
              <Button type="submit" variant="primary">{editing ? 'Actualizar' : 'Guardar'}</Button>
            </>
          ) : null}
        </form>
      </FormModal>}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
