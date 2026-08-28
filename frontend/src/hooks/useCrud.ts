import { useState, useEffect, useCallback, useRef } from 'react';
import type { PaginatedResult } from '../services/api';

export function useCrud<T extends { id: number }>(
  fetchFn: (page: number, limit: number, filters?: Record<string, string>) => Promise<PaginatedResult<T>>,
  createFn: (body: any) => Promise<T>,
  updateFn: (id: number, body: any) => Promise<T>,
  deleteFn: (id: number) => Promise<any>,
  initialFilters?: Record<string, string>,
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<T> | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<T | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const filtersRef = useRef(initialFilters ?? {});

  const load = useCallback(async (p?: number, f?: Record<string, string>) => {
    setLoading(true);
    try {
      const res = await fetchFn(p ?? page, 10, f ?? filtersRef.current);
      setData(res.data);
      setTotalPages(res.totalPages);
      setTotal(res.total);
    } finally {
      setLoading(false);
    }
  }, [fetchFn, page]);

  useEffect(() => { load(); }, [load]);

  const changePage = (p: number) => {
    setPage(p);
    load(p);
  };

  const setFilters = (f: Record<string, string>) => {
    filtersRef.current = f;
    setPage(1);
    load(1, f);
  };

  const openCreate = () => { setEditing({}); setShowForm(true); };
  const openEdit = (row: T) => { setEditing(row); setShowForm(true); };
  const closeForm = () => { setEditing(null); setShowForm(false); };

  const [error, setError] = useState<string | null>(null);
  const [deleteMessage, setDeleteMessage] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const clearDeleteMessage = () => setDeleteMessage(null);

  const save = async (body: any) => {
    setError(null);
    try {
      let nuevo: T | undefined;
      if (editing?.id) await updateFn(editing.id, body);
      else nuevo = await createFn(body);
      closeForm();
      load();
      return nuevo;
    } catch (err: any) {
      setError(err.message || 'Error al guardar');
      return undefined;
    }
  };

  const confirmRemove = (row: T) => setPendingDelete(row);
  const cancelDelete = () => { setPendingDelete(null); setDeleting(false); };

  const executeDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await deleteFn(pendingDelete.id);
      setPendingDelete(null);
      setDeleteMessage({ message: 'Eliminado con éxito', type: 'success' });
      load();
    } catch (err: any) {
      setDeleteMessage({ message: err.message || 'Error al eliminar', type: 'error' });
    } finally { setDeleting(false); }
  };

  return { data, loading, editing, showForm, pendingDelete, deleting, openCreate, openEdit, closeForm, save, confirmRemove, cancelDelete, executeDelete, load, error, setError, deleteMessage, clearDeleteMessage, page, totalPages, total, changePage, setFilters };
}