import { useMemo, useEffect, useRef, type ReactNode } from 'react';
import { DataTable, FormModal, Input, Button, ConfirmModal, Pagination, Toast } from '../components/ui';
import { useCrud } from '../hooks/useCrud';
import { Plus } from 'lucide-react';
import type { PaginatedResult } from '../services/api';

interface CrudPageProps {
  title: string;
  columns: { key: string; label: string; render?: (value: any, row: any) => any }[];
  fields: { key: string; label: string; type?: string; required?: boolean; options?: { value: string | number; label: string }[]; min?: number; max?: string }[];
  fetchFn: (page: number, limit: number, filters?: Record<string, string>) => Promise<PaginatedResult<any>>;
  createFn: (body: any) => Promise<any>;
  updateFn: (id: number, body: any) => Promise<any>;
  deleteFn: (id: number) => Promise<any>;
  renderFilters?: () => ReactNode;
  filterParams?: Record<string, string>;
  onCreated?: (row: any) => void;
}

export function CrudPage({ title, columns, fields, fetchFn, createFn, updateFn, deleteFn, renderFilters, filterParams = {}, onCreated }: CrudPageProps) {
  const { data, loading, editing, showForm, pendingDelete, deleting, openCreate, openEdit, closeForm, save, confirmRemove, cancelDelete, executeDelete, error, page, totalPages, changePage, setFilters, deleteMessage, clearDeleteMessage } = useCrud(fetchFn, createFn, updateFn, deleteFn, filterParams);

  const prevParams = useRef(filterParams);
  useEffect(() => {
    if (JSON.stringify(prevParams.current) !== JSON.stringify(filterParams)) {
      prevParams.current = filterParams;
      setFilters(filterParams);
    }
  }, [filterParams, setFilters]);

  const filters = useMemo(() => renderFilters?.() ?? null, [renderFilters]);

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{title}</h1>
          <p className="text-slate-500 text-sm mt-1">Gestión de {title.toLowerCase()}</p>
        </div>
        <Button onClick={openCreate} variant="primary"><Plus size={16} /> Nuevo</Button>
      </div>
      {filters && <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5"><div className="flex flex-wrap items-center gap-3">{filters}</div></div>}
      <DataTable columns={columns} data={data} loading={loading} onEdit={openEdit} onDelete={confirmRemove} />
      <Pagination page={page} totalPages={totalPages} onPageChange={changePage} />
      {showForm && (
        <FormModal title={editing?.id ? `Editar ${title}` : `Nuevo ${title}`} onClose={closeForm}>
          <form onSubmit={e => { e.preventDefault(); const fd = new FormData(e.currentTarget); const body: any = {}; fields.forEach(f => { const v = fd.get(f.key); if (f.type === 'number') body[f.key] = v ? Number(v) : undefined; else body[f.key] = v || undefined; }); save(body).then(row => { if (row) onCreated?.(row); }); }}>
            {error && <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>}
            {fields.map(f => (
              f.options ? (
                <div key={f.key} className="mb-4"><label className="block text-sm font-medium text-slate-700 mb-1.5">{f.label}</label>
                  <select name={f.key} defaultValue={(editing as any)?.[f.key] ?? ''} required={f.required} className="w-full border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                    <option value="">Seleccionar...</option>
                    {f.options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select></div>
              ) : (
                <Input key={f.key} label={f.label} name={f.key} type={f.type ?? 'text'} defaultValue={(editing as any)?.[f.key] ?? ''} required={f.required} min={f.min} max={f.max} />
              )
            ))}
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="ghost" onClick={closeForm}>Cancelar</Button>
              <Button type="submit" variant="primary">Guardar</Button>
            </div>
          </form>
        </FormModal>
      )}
      {pendingDelete && (
        <ConfirmModal
          title="Eliminar registro"
          message={`¿Estás seguro de eliminar este ${title.toLowerCase()}? Esta acción no se puede deshacer.`}
          onConfirm={executeDelete}
          onCancel={cancelDelete}
          loading={deleting} />
      )}
      {deleteMessage && <Toast message={deleteMessage.message} type={deleteMessage.type} onClose={clearDeleteMessage} />}
    </div>
  );
}
