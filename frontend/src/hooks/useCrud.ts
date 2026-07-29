import { useState, useEffect, useCallback } from 'react';
import type { PaginatedResult } from '../services/api';

export function useCrud<T extends { id: number }>(
  fetchFn: (page: number, limit: number) => Promise<PaginatedResult<T>>,
  createFn: (body: any) => Promise<T>,
  updateFn: (id: number, body: any) => Promise<T>,
  deleteFn: (id: number) => Promise<any>,
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

  const load = useCallback(async (p?: number) => {
    setLoading(true);
    try {
      const res = await fetchFn(p ?? page, 10);
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

  const openCreate = () => { setEditing({}); setShowForm(true); };
  const openEdit = (row: T) => { setEditing(row); setShowForm(true); };
  const closeForm = () => { setEditing(null); setShowForm(false); };

  const [error, setError] = useState<string | null>(null);

  const save = async (body: any) => {
    setError(null);
    try {
      if (editing?.id) await updateFn(editing.id, body);
      else await createFn(body);
      closeForm();
      load();
    } catch (err: any) {
      setError(err.message || 'Error al guardar');
    }
  };

  const confirmRemove = (row: T) => setPendingDelete(row);
  const cancelDelete = () => { setPendingDelete(null); setDeleting(false); };

  const executeDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    try { await deleteFn(pendingDelete.id); setPendingDelete(null); load(); } finally { setDeleting(false); }
  };

  return { data, loading, editing, showForm, pendingDelete, deleting, openCreate, openEdit, closeForm, save, confirmRemove, cancelDelete, executeDelete, load, error, setError, page, totalPages, total, changePage };
}