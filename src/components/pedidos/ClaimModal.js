import React, { useEffect, useMemo, useState } from 'react';
import Swal from 'sweetalert2';
import { BACKEND_URL } from '../../utils/config';
import { readJsonResponse } from '../../utils/api';

const allCategoryOptions = [
  { value: 'delay', label: 'Demora' },
  { value: 'incomplete', label: 'Pedido incompleto' },
  { value: 'damaged', label: 'Producto dañado' },
  { value: 'return', label: 'Devolución' },
  { value: 'cancellation', label: 'Cancelación' }
];

export default function ClaimModal({ order, onSubmitted, allowedCategories = [] }) {
  const [submitting, setSubmitting] = useState(false);
  const categoryOptions = useMemo(
    () => allCategoryOptions.filter((option) => allowedCategories.includes(option.value)),
    [allowedCategories]
  );
  const [form, setForm] = useState({ category: categoryOptions[0]?.value || 'delay', description: '' });

  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      category: categoryOptions.some((option) => option.value === prev.category)
        ? prev.category
        : categoryOptions[0]?.value || 'delay'
    }));
  }, [categoryOptions, order?.status]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.description.trim()) {
      Swal.fire('Validación', 'Escribe una descripción breve del reclamo.', 'warning');
      return;
    }

    if (!categoryOptions.length) {
      Swal.fire('Reclamo no disponible', 'Este pedido no tiene motivos de reclamo habilitados.', 'info');
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers.Authorization = `Bearer ${token}`;

      const res = await fetch(`${BACKEND_URL}/api/claims`, {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify({
          deliveryId: order._id,
          category: form.category,
          description: form.description
        })
      });
      const data = await readJsonResponse(res);
      if (!res.ok) throw new Error(data?.message || 'No se pudo registrar el reclamo');
      Swal.fire('Éxito', 'Reclamo registrado correctamente.', 'success');
      setForm({ category: categoryOptions[0]?.value || 'delay', description: '' });
      onSubmitted?.();
    } catch (error) {
      Swal.fire('Error', error.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form data-claim-modal onSubmit={handleSubmit} className="mt-4 rounded-2xl border border-gray-200 bg-gray-50 p-4 space-y-3">
      <div>
        <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-gray-500">Categoría</label>
        <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm">
          {categoryOptions.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-gray-500">Descripción breve</label>
        <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows="3" className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm" placeholder="Describe el problema del pedido." />
      </div>
      <button type="submit" disabled={submitting || !categoryOptions.length} className="w-full rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
        {submitting ? 'Enviando...' : 'Enviar reclamo'}
      </button>
    </form>
  );
}
