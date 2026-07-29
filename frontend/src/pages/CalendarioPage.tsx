import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { DataTable, FormModal, Button, Badge, Toast, ConfirmModal } from '../components/ui';


const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
const ANIOS = [2026, 2027, 2028];

const badgeVariant: Record<string, 'warning' | 'danger' | 'default'> = {
  feriado: 'warning',
  paro: 'danger',
};

export function CalendarioPage() {
  const [registros, setRegistros] = useState<any[]>([]);
  const [cursos, setCursos] = useState<any[]>([]);
  const [mes, setMes] = useState(new Date().getMonth());
  const [anio, setAnio] = useState(new Date().getFullYear());
  const [showForm, setShowForm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    api.getAllCursos().then(c => setCursos(c.filter((x: any) => x.estado === 'activo')));
  }, []);

  const load = () => {
    const desde = `${anio}-${String(mes + 1).padStart(2, '0')}-01`;
    const hastaRaw = new Date(anio, mes + 1, 0);
    const hasta = hastaRaw.toISOString().split('T')[0];
    api.getDiasSinClases({ desde, hasta }).then(setRegistros).catch(() => {});
  };

  useEffect(() => { load(); }, [mes, anio]);

  const guardar = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const fecha = fd.get('fecha') as string;
    const tipo = fd.get('tipo') as string;
    const descripcion = fd.get('descripcion') as string;
    const cursoId = fd.get('cursoId') as string;
    if (!fecha || !tipo) return;
    try {
      await api.crearDiaSinClases({
        fecha: new Date(fecha + 'T12:00:00').toISOString(),
        tipo,
        descripcion: descripcion || undefined,
        cursoId: tipo === 'paro' && cursoId ? Number(cursoId) : undefined,
      });
      setToast({ message: 'Día registrado', type: 'success' });
      setShowForm(false);
      load();
    } catch (err: any) {
      setToast({ message: err.message, type: 'error' });
    }
  };

  const eliminar = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.eliminarDiaSinClases(deleteTarget.id);
      setToast({ message: 'Eliminado', type: 'success' });
      setDeleteTarget(null);
      load();
    } catch (err: any) {
      setToast({ message: err.message, type: 'error' });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Calendario Escolar</h1>
          <p className="text-slate-500 text-sm mt-1">Feriados, paros y días sin clases</p>
        </div>
        <Button onClick={() => setShowForm(true)} variant="primary">+ Agregar día</Button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <div className="flex flex-wrap items-center gap-3">
          <select value={mes} onChange={e => setMes(Number(e.target.value))} className="border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none bg-white">
            {MESES.map((m, i) => <option key={i} value={i}>{m}</option>)}
          </select>
          <select value={anio} onChange={e => setAnio(Number(e.target.value))} className="border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none bg-white">
            {ANIOS.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
      </div>

      <DataTable columns={[
        { key: 'fecha', label: 'Fecha', render: (v: string) => new Date(v).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' }) },
        { key: 'tipo', label: 'Tipo', render: (v: string) => <Badge variant={badgeVariant[v] ?? 'default'}>{v === 'feriado' ? 'Feriado' : 'Paro'}</Badge> },
        { key: 'descripcion', label: 'Descripción', render: (v: string) => v ?? '-' },
        { key: 'curso', label: 'Curso', render: (_: any, r: any) => r.curso ? `${r.curso.anio}°${r.curso.division} - ${r.curso.turno}` : 'Todos' },
      ]} data={registros} onDelete={r => setDeleteTarget(r)} />

      {showForm && <FormModal title="Agregar día sin clases" onClose={() => setShowForm(false)}>
        <form onSubmit={guardar}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Fecha</label>
            <input type="date" name="fecha" required className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Tipo</label>
            <select name="tipo" required className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white" onChange={e => { const s = document.getElementById('cursoField'); if (s) s.style.display = e.target.value === 'paro' ? 'block' : 'none'; }}>
              <option value="feriado">Feriado</option>
              <option value="paro">Paro</option>
            </select>
          </div>
          <div id="cursoField" style={{ display: 'none' }} className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Curso (opcional — vacío = todos)</label>
            <select name="cursoId" className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white">
              <option value="">Todos los cursos</option>
              {cursos.map(c => <option key={c.id} value={c.id}>{c.anio}°{c.division} - {c.turno} ({c.orientacion})</option>)}
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Descripción (opcional)</label>
            <input name="descripcion" className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <Button type="submit" variant="primary">Guardar</Button>
        </form>
      </FormModal>}

      {deleteTarget && <ConfirmModal title="Eliminar día" message={`¿Eliminar ${deleteTarget.tipo} del ${new Date(deleteTarget.fecha).toLocaleDateString('es-AR')}?`} onConfirm={eliminar} onCancel={() => setDeleteTarget(null)} loading={deleting} />}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
