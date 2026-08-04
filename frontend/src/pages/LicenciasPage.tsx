import { useEffect, useState, useCallback } from 'react';
import { api } from '../services/api';
import { DataTable, FormModal, Input, Select, Button, Badge, Toast, ConfirmModal, Pagination } from '../components/ui';
import { AlertCircle } from 'lucide-react';

export function LicenciasPage() {
  const [docentes, setDocentes] = useState<any[]>([]);
  const [licencias, setLicencias] = useState<any[]>([]);
  const [docenteId, setDocenteId] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [deleting, setDeleting] = useState(false);
  const [formError, setFormError] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [dniFilter, setDniFilter] = useState('');
  const [nombreFilter, setNombreFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => { api.getAllDocentes().then(d => setDocentes(d.filter((x: any) => x.estado === 'activo'))); }, []);

  const load = useCallback(async () => {
    if (!docenteId) return;
    try { const r = await api.getLicencias(Number(docenteId), page); setLicencias(r.data ?? []); setTotalPages(r.totalPages ?? 1); }
    catch (err: any) { setToast({ message: err.message, type: 'error' }); setLicencias([]); }
  }, [docenteId, page]);

  useEffect(() => { setPage(1); }, [docenteId]);
  useEffect(() => { load(); }, [load]);

  const save = async (body: any) => {
    if (!docenteId) { setFormError('Seleccioná un docente'); return; }
    setFormError('');
    const data = { ...body, docenteId: Number(docenteId), fechaInicio: new Date(body.fechaInicio).toISOString(), fechaFin: new Date(body.fechaFin).toISOString() };
    try {
      if (editing) { await api.updateLicencia(editing.id, data); setToast({ message: 'Licencia actualizada', type: 'success' }); }
      else { await api.createLicencia({ ...data, estado: 'pendiente' }); setToast({ message: 'Licencia registrada', type: 'success' }); }
      setShowForm(false); setEditing(null); setFormError(''); load();
    } catch (err: any) { setFormError(err.message); }
  };

  const confirmDelete = (row: any) => setDeleteTarget(row);

  const executeDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try { await api.deleteLicencia(deleteTarget.id); setToast({ message: 'Licencia eliminada', type: 'success' }); setDeleteTarget(null); load(); } finally { setDeleting(false); }
  };

  const badgeVariant = (v: string) => v === 'aprobada' ? 'success' as const : v === 'rechazada' ? 'danger' as const : v === 'finalizada' ? 'default' as const : 'warning' as const;

  const docentesFiltrados = docentes.filter(d => {
    const nombre = `${d.apellido} ${d.nombre}`.toLowerCase();
    const dni = String(d.dni ?? '');
    return nombre.includes(nombreFilter.toLowerCase()) && dni.includes(dniFilter);
  });

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Licencias</h1>
          <p className="text-slate-500 text-sm mt-1">Gestión de licencias docentes</p>
        </div>
        <Button onClick={() => { setEditing(null); setShowForm(true); }} variant="primary">+ Nueva</Button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <div className="flex flex-wrap items-center gap-3">
          <input value={dniFilter} onChange={e => setDniFilter(e.target.value)} placeholder="DNI" className="w-full sm:w-32 border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 outline-none" />
          <input value={nombreFilter} onChange={e => setNombreFilter(e.target.value)} placeholder="Nombre" className="w-full sm:w-44 border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 outline-none" />
          <select value={docenteId} onChange={e => setDocenteId(e.target.value)} className="border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none bg-white">
            <option value="">Docente</option>
            {docentesFiltrados.map(d => <option key={d.id} value={d.id}>{d.apellido}, {d.nombre}</option>)}
          </select>
        </div>
      </div>

      <DataTable columns={[
        { key: 'fechaInicio', label: 'Inicio', render: (v: string) => new Date(v).toLocaleDateString() },
        { key: 'fechaFin', label: 'Fin', render: (v: string) => new Date(v).toLocaleDateString() },
        { key: 'motivo', label: 'Motivo' },
        { key: 'estado', label: 'Estado', render: (v: string) => <Badge variant={badgeVariant(v)}>{v}</Badge> },
      ]} data={licencias} onEdit={(r) => { setEditing(r); setShowForm(true); }} onDelete={confirmDelete} />

      {licencias.length > 0 && <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />}

      {showForm && <FormModal title={editing ? 'Editar Licencia' : 'Nueva Licencia'} onClose={() => { setShowForm(false); setEditing(null); setFormError(''); }}>
        <form onSubmit={e => { e.preventDefault(); save(Object.fromEntries(new FormData(e.currentTarget))); }}>
          {formError && <div className="flex items-start gap-2.5 p-3 mb-4 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700"><AlertCircle size={16} className="mt-0.5 shrink-0" /><span>{formError}</span></div>}
          <Input label="Fecha Inicio" name="fechaInicio" type="date" defaultValue={editing?.fechaInicio?.split('T')[0] ?? new Date().toISOString().split('T')[0]} required />
          <Input label="Fecha Fin" name="fechaFin" type="date" defaultValue={editing?.fechaFin?.split('T')[0] ?? new Date().toISOString().split('T')[0]} required />
          <Input label="Motivo" name="motivo" defaultValue={editing?.motivo ?? ''} required />
          <Select label="Estado" name="estado" defaultValue={editing?.estado ?? 'pendiente'}>
            <option value="pendiente">Pendiente</option>
            <option value="aprobada">Aprobada</option>
            <option value="rechazada">Rechazada</option>
          </Select>
          <Input label="Observación" name="observacion" defaultValue={editing?.observacion ?? ''} />
          <Button type="submit" variant="primary">Guardar</Button>
        </form>
      </FormModal>}

      {deleteTarget && (
        <ConfirmModal title="Eliminar licencia" message="¿Estás seguro de eliminar esta licencia? Esta acción no se puede deshacer." onConfirm={executeDelete} onCancel={() => setDeleteTarget(null)} loading={deleting} />
      )}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
