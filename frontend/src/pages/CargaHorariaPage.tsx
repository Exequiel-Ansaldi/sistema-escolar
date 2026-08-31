import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { FormModal, Select, Input, Button, Toast, Pagination } from '../components/ui';
import { Pencil, Trash2, Plus } from 'lucide-react';

const PAGE_SIZE = 1;

export function CargaHorariaPage() {
  const [cursos, setCursos] = useState<any[]>([]);
  const [materias, setMaterias] = useState<any[]>([]);
  const [grupos, setGrupos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [anioFilter, setAnioFilter] = useState('');
  const [divisionFilter, setDivisionFilter] = useState('');
  const [turnoFilter, setTurnoFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [formDesde, setFormDesde] = useState('');
  const [formHasta, setFormHasta] = useState('');
  const [formDivisiones, setFormDivisiones] = useState<string[]>([]);
  const [formTurnos, setFormTurnos] = useState<string[]>([]);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    Promise.all([api.getAllCursos(), api.getAllMaterias()]).then(([c, m]) => {
      setCursos(c.filter((x: any) => x.estado === 'activo'));
      setMaterias(m);
    });
  }, []);

  const load = () => {
    setLoading(true);
    api.getCargaHorariaGrupos(page, PAGE_SIZE, anioFilter || undefined, divisionFilter || undefined, turnoFilter || undefined)
      .then(r => { setGrupos(r.data); setTotalPages(r.totalPages ?? 1); })
      .catch((err: any) => setToast({ message: err.message, type: 'error' }))
      .finally(() => setLoading(false));
  };

  useEffect(() => { if (cursos.length > 0) load(); }, [cursos, page, anioFilter, divisionFilter, turnoFilter]);

  const aniosDisponibles = [...new Set(cursos.map(c => c.anio))].sort();
  const divisionesDisponibles = [...new Set(cursos
    .filter(c => !anioFilter || c.anio === Number(anioFilter))
    .map(c => c.division))].sort();
  const turnosDisponibles = ['mañana', 'tarde', 'noche'];

  const divisionesEnRango = [...new Set(cursos
    .filter(c => (!formDesde || c.anio >= Number(formDesde)) && (!formHasta || c.anio <= Number(formHasta)))
    .map(c => c.division))].sort();
  const turnosEnRango = [...new Set(cursos
    .filter(c => (!formDesde || c.anio >= Number(formDesde)) && (!formHasta || c.anio <= Number(formHasta)))
    .filter(c => formDivisiones.length === 0 || formDivisiones.includes(c.division))
    .map(c => c.turno))].sort();

  const cursosDestino = cursos.filter(c =>
    c.estado === 'activo' &&
    (!formDesde || c.anio >= Number(formDesde)) &&
    (!formHasta || c.anio <= Number(formHasta)) &&
    (formDivisiones.length === 0 || formDivisiones.includes(c.division)) &&
    (formTurnos.length === 0 || formTurnos.includes(c.turno))
  );

  const save = async (body: any) => {
    const materiaId = editing ? editing.materiaId : Number(body.materiaId);
    const modulosPorSemana = Number(body.modulosPorSemana);
    if (!materiaId) { setToast({ message: 'Seleccioná una materia', type: 'error' }); return; }
    if (!modulosPorSemana) { setToast({ message: 'Completá los módulos por semana', type: 'error' }); return; }
    try {
      if (editing) {
        await api.updateCargaHoraria(editing.cursoId, materiaId, { modulosPorSemana });
        setToast({ message: 'Módulos actualizados', type: 'success' });
        setShowForm(false); setEditing(null);
        load();
        return;
      }
      if (!formDesde || !formHasta) { setToast({ message: 'Elegí el rango de años desde/hasta', type: 'error' }); return; }
      if (Number(formDesde) > Number(formHasta)) { setToast({ message: 'El año "desde" no puede ser mayor que "hasta"', type: 'error' }); return; }
      if (formDivisiones.length === 0) { setToast({ message: 'Elegí al menos una división', type: 'error' }); return; }
      if (formTurnos.length === 0) { setToast({ message: 'Elegí al menos un turno', type: 'error' }); return; }
      if (cursosDestino.length === 0) { setToast({ message: 'No hay cursos que coincidan con el rango elegido', type: 'error' }); return; }

      const cursoIds = cursosDestino.map(c => c.id);
      let resultado;
      try {
        resultado = await api.asignarMateriaCursoMasivo({ cursoIds, materiaId, modulosPorSemana });
      } catch (err: any) {
        setToast({ message: `Error al asignar la materia: ${err.message}`, type: 'error' });
        return;
      }
      const { asignados, omitidos } = resultado;
      if (asignados === 0 && omitidos === 0) {
        setToast({ message: 'No se pudo asignar la materia', type: 'error' });
      } else {
        const partes = [`Asignada en ${asignados} ${asignados === 1 ? 'curso' : 'cursos'}`];
        if (omitidos > 0) partes.push(`${omitidos} ya la tenían`);
        setToast({ message: partes.join(' · '), type: 'success' });
      }
      setShowForm(false);
      load();
    } catch (err: any) { setToast({ message: err.message, type: 'error' }); }
  };

  const quitar = async (row: any) => {
    try {
      await api.quitarMateriaCurso(row.cursoId, row.materiaId);
      setToast({ message: 'Materia quitada', type: 'success' });
      load();
    } catch (err: any) { setToast({ message: err.message, type: 'error' }); }
  };

  const cursosFiltrados = cursos.filter(c =>
    (!anioFilter || c.anio === Number(anioFilter)) &&
    (!divisionFilter || c.division === divisionFilter) &&
    (!turnoFilter || c.turno === turnoFilter)
  );

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Carga Horaria</h1>
          <p className="text-slate-500 text-sm mt-1">Asignación de materias y carga horaria por curso</p>
        </div>
        {cursos.length > 0 && <Button onClick={() => { setEditing(null); setFormDesde(''); setFormHasta(''); setFormDivisiones([]); setFormTurnos([]); setShowForm(true); }} variant="primary"><Plus size={16} /> Agregar materia</Button>}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <div className="flex flex-wrap items-center gap-3">
          <select value={anioFilter} onChange={e => { setAnioFilter(e.target.value); setPage(1); }} className="border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none bg-white">
            <option value="">Todos los años</option>
            {aniosDisponibles.map(a => <option key={a} value={a}>{a}°</option>)}
          </select>
          <select value={divisionFilter} onChange={e => { setDivisionFilter(e.target.value); setPage(1); }} className="border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none bg-white">
            <option value="">Todas las divisiones</option>
            {divisionesDisponibles.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <select value={turnoFilter} onChange={e => { setTurnoFilter(e.target.value); setPage(1); }} className="border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none bg-white">
            <option value="">Todos los turnos</option>
            {turnosDisponibles.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>

      {cursosFiltrados.length === 0 && (anioFilter || divisionFilter || turnoFilter) ? (
        <div className="text-center py-12 text-gray-400 text-sm bg-white rounded-xl border border-gray-200 shadow-sm">No hay cursos que coincidan con los filtros</div>
      ) : loading ? (
        <div className="text-center py-12 text-gray-400 animate-pulse bg-white rounded-xl border border-gray-200 shadow-sm">Cargando...</div>
      ) : grupos.length === 0 ? (
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
              {grupos.map((curso: any, gi: number) => {
                const cursoLabel = `${curso.anio}°${curso.division} - ${curso.turno}`;
                const items = curso.materias?.length > 0 ? curso.materias : [{ _placeholder: true }];
                const isLastGroup = gi === grupos.length - 1;
                return items.map((item: any, ri: number) => {
                  const isLastRow = ri === items.length - 1;
                  return (
                    <tr key={`${curso.id}-${ri}`} className={`transition-colors hover:bg-blue-50/40 ${gi % 2 === 0 ? 'bg-white' : 'bg-gray-50/40'} ${isLastRow && !isLastGroup ? 'border-b-2 border-gray-200' : 'border-b border-gray-100'}`}>
                      {ri === 0 ? (
                        <td rowSpan={items.length} className="px-5 py-3 font-medium align-top text-gray-800">{cursoLabel}</td>
                      ) : null}
                      <td className="px-5 py-3 text-gray-700">
                        {item._placeholder ? <span className="text-gray-300 italic">Sin materias</span> : item.materia?.nombre ?? '-'}
                      </td>
                      <td className="px-5 py-3 text-gray-700">{item._placeholder ? <span className="text-gray-300">—</span> : item.modulosPorSemana}</td>
                      <td className="px-5 py-3 text-gray-700">{item._placeholder ? <span className="text-gray-300">—</span> : item.cargaHoraria}</td>
                      <td className="px-5 py-3">
                        {!item._placeholder && (
                          <div className="flex items-center justify-end gap-1">
                            <button onClick={() => { setEditing({ ...item, curso }); setShowForm(true); }} className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all" title="Editar"><Pencil size={16} /></button>
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
      {grupos.length > 0 && <Pagination page={page} totalPages={totalPages} onPageChange={p => setPage(p)} />}

      {showForm && <FormModal title={editing ? 'Editar carga horaria' : 'Asignar materia a cursos'} onClose={() => { setShowForm(false); setEditing(null); }}>
        <form onSubmit={e => { e.preventDefault(); save(Object.fromEntries(new FormData(e.currentTarget))); }}>
          {editing ? (
            <>
              <p className="text-sm text-slate-500 mb-4">Curso: <strong>{editing.curso ? `${editing.curso.anio}°${editing.curso.division} - ${editing.curso.turno}` : '-'}</strong></p>
              <p className="text-sm text-slate-500 mb-4">Materia: <strong>{editing.materia?.nombre}</strong></p>
            </>
          ) : (
            <div className="mb-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Rango de años a cargar</label>
                <div className="flex items-center gap-2">
                  <select value={formDesde} onChange={e => { setFormDesde(e.target.value); setFormDivisiones([]); setFormTurnos([]); }} className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                    <option value="">Desde</option>
                    {aniosDisponibles.map(a => <option key={a} value={a}>{a}°</option>)}
                  </select>
                  <span className="text-slate-400">→</span>
                  <select value={formHasta} onChange={e => { setFormHasta(e.target.value); setFormDivisiones([]); setFormTurnos([]); }} className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                    <option value="">Hasta</option>
                    {aniosDisponibles.map(a => <option key={a} value={a}>{a}°</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Divisiones</label>
                <div className="flex flex-wrap gap-3">
                  {divisionesEnRango.length > 0 ? divisionesEnRango.map(d => (
                    <label key={d} className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                      <input type="checkbox" checked={formDivisiones.includes(d)} onChange={e => setFormDivisiones(prev => e.target.checked ? [...prev, d] : prev.filter(x => x !== d))} className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                      {d}
                    </label>
                  )) : <span className="text-sm text-slate-300 italic">Elegí un rango de años</span>}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Turnos</label>
                <div className="flex flex-wrap gap-3">
                  {turnosEnRango.length > 0 ? turnosEnRango.map(t => (
                    <label key={t} className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                      <input type="checkbox" checked={formTurnos.includes(t)} onChange={e => setFormTurnos(prev => e.target.checked ? [...prev, t] : prev.filter(x => x !== t))} className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                      {t}
                    </label>
                  )) : <span className="text-sm text-slate-300 italic">Elegí al menos una división</span>}
                </div>
              </div>
            </div>
          )}
          <Select label="Materia" name="materiaId">
            <option value="">Seleccionar...</option>
            {editing
              ? materias.filter(m => m.id === editing.materiaId).map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)
              : materias.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)
            }
          </Select>
          <Input label="Módulos por semana (c/u = 40 min)" name="modulosPorSemana" type="number" required min={1} defaultValue={editing?.modulosPorSemana} />
          {!editing && cursosDestino.length > 0 && (
            <p className="text-sm text-slate-500 -mt-2 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2">
              Se asignará a <strong>{cursosDestino.length} {cursosDestino.length === 1 ? 'curso' : 'cursos'}</strong>:{' '}
              {cursosDestino.slice(0, 8).map(c => `${c.anio}°${c.division}`).join(', ')}{cursosDestino.length > 8 ? '…' : ''}
              <span className="text-slate-400"> ({cursosDestino.map(c => c.turno)})</span>
            </p>
          )}
          {!editing && cursosDestino.length === 0 && (
            <p className="text-sm text-slate-400 -mt-2">Elegí el rango de años y las divisiones para ver los cursos a cargar.</p>
          )}
          <Button type="submit" variant="primary">{editing ? 'Actualizar' : 'Guardar'}</Button>
        </form>
      </FormModal>}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
