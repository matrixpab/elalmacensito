'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { Categoria, Producto } from '@/lib/types';
import { guardarCategoria, eliminarCategoriaAction, toggleActivoCategoria } from '@/lib/admin/actions';

interface Props {
  categorias: Categoria[];
  productos: Producto[];
}

export default function CategoriasManager({ categorias: initialCategorias, productos }: Props) {
  const [categorias, setCategorias] = useState<Categoria[]>(initialCategorias);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [categoriaEditando, setCategoriaEditando] = useState<Categoria | null>(null);

  // Form State
  const [nombre, setNombre] = useState('');
  const [slug, setSlug] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [imagenUrl, setImagenUrl] = useState('');
  const [orden, setOrden] = useState(1);
  const [activa, setActiva] = useState(true);

  const [subiendoImg, setSubiendoImg] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);

  // Modal de confirmación para eliminar
  const [categoriaEliminar, setCategoriaEliminar] = useState<Categoria | null>(null);
  const [eliminando, setEliminando] = useState(false);

  function abrirCrear() {
    setCategoriaEditando(null);
    setNombre('');
    setSlug('');
    setDescripcion('');
    setImagenUrl('');
    setOrden(categorias.length + 1);
    setActiva(true);
    setErrorMsg(null);
    setModalAbierto(true);
  }

  function abrirEditar(c: Categoria) {
    setCategoriaEditando(c);
    setNombre(c.nombre);
    setSlug(c.slug);
    setDescripcion(c.descripcion || '');
    setImagenUrl(c.imagen_url || '');
    setOrden(c.orden);
    setActiva(c.activa);
    setErrorMsg(null);
    setModalAbierto(true);
  }

  function handleNombreChange(val: string) {
    setNombre(val);
    if (!categoriaEditando) {
      // Auto-generar slug amigable
      const clean = val
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setSlug(clean);
    }
  }

  async function handleSubirImagen(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setSubiendoImg(true);
    setErrorMsg(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        setErrorMsg(data.error || 'Error al subir la imagen.');
        setSubiendoImg(false);
        return;
      }

      setImagenUrl(data.url);
      setSubiendoImg(false);
    } catch {
      setErrorMsg('Error de red al subir la imagen.');
      setSubiendoImg(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nombre.trim()) {
      setErrorMsg('El nombre es obligatorio.');
      return;
    }

    setGuardando(true);
    setErrorMsg(null);

    const res = await guardarCategoria({
      id: categoriaEditando?.id,
      nombre,
      slug,
      descripcion,
      imagen_url: imagenUrl,
      orden: Number(orden),
      activa,
    });

    if (res.error) {
      setErrorMsg(res.error);
      setGuardando(false);
      return;
    }

    if (categoriaEditando) {
      setCategorias((prev) =>
        prev.map((c) => (c.id === categoriaEditando.id ? res.categoria! : c)).sort((a, b) => a.orden - b.orden)
      );
      setMensajeExito(`Categoría "${nombre}" actualizada correctamente.`);
    } else {
      setCategorias((prev) => [...prev, res.categoria!].sort((a, b) => a.orden - b.orden));
      setMensajeExito(`Categoría "${nombre}" creada con éxito.`);
    }

    setGuardando(false);
    setModalAbierto(false);
    setTimeout(() => setMensajeExito(null), 3500);
  }

  async function handleToggleActiva(c: Categoria) {
    const nuevoEstado = !c.activa;
    setCategorias((prev) =>
      prev.map((cat) => (cat.id === c.id ? { ...cat, activa: nuevoEstado } : cat))
    );

    const res = await toggleActivoCategoria(c.id, nuevoEstado);
    if (res.error) {
      // Revertir
      setCategorias((prev) =>
        prev.map((cat) => (cat.id === c.id ? { ...cat, activa: c.activa } : cat))
      );
      alert('Error: ' + res.error);
    }
  }

  async function confirmarEliminar() {
    if (!categoriaEliminar) return;

    setEliminando(true);
    const res = await eliminarCategoriaAction(categoriaEliminar.id);

    if (res.error) {
      alert(res.error);
      setEliminando(false);
      setCategoriaEliminar(null);
      return;
    }

    setCategorias((prev) => prev.filter((c) => c.id !== categoriaEliminar.id));
    setMensajeExito(`Categoría "${categoriaEliminar.nombre}" eliminada.`);
    setEliminando(false);
    setCategoriaEliminar(null);
    setTimeout(() => setMensajeExito(null), 3500);
  }

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-forest-100 shadow-xs">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
            Catálogo & Menú
          </span>
          <h1 className="mt-2 font-display text-2xl font-extrabold text-forest-900">
            Administración de Categorías
          </h1>
          <p className="text-xs sm:text-sm text-forest-600 mt-1">
            Creá, ordená y gestioná las secciones de tu tienda. Se sincronizan en vivo con el sitio público.
          </p>
        </div>

        <button
          onClick={abrirCrear}
          className="inline-flex items-center gap-2 rounded-full bg-forest-700 hover:bg-forest-800 text-white px-5 py-3 text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition transform active:scale-95 shrink-0"
        >
          <span className="text-base">+</span>
          <span>Nueva Categoría</span>
        </button>
      </div>

      {mensajeExito && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-emerald-800 text-sm font-medium flex items-center justify-between shadow-xs">
          <span>✓ {mensajeExito}</span>
          <button onClick={() => setMensajeExito(null)} className="text-emerald-600 hover:text-emerald-900 font-bold">✕</button>
        </div>
      )}

      {/* Listado de Categorías */}
      <div className="bg-white rounded-2xl border border-forest-100 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-forest-50/70 border-b border-forest-100 text-forest-800 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-4">Orden</th>
                <th className="py-3.5 px-4">Imagen</th>
                <th className="py-3.5 px-4">Nombre & Slug</th>
                <th className="py-3.5 px-4">Descripción</th>
                <th className="py-3.5 px-4 text-center">Productos</th>
                <th className="py-3.5 px-4 text-center">Estado</th>
                <th className="py-3.5 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-forest-50">
              {categorias.map((c) => {
                const count = productos.filter((p) => p.categoria_id === c.id).length;
                return (
                  <tr key={c.id} className="hover:bg-cream-50/40 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-forest-700">
                      #{c.orden}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="relative h-12 w-12 rounded-xl overflow-hidden bg-forest-50 border border-forest-100 shrink-0">
                        {c.imagen_url ? (
                          <Image src={c.imagen_url} alt={c.nombre} fill className="object-cover" />
                        ) : (
                          <div className="flex h-full items-center justify-center text-xl">🌿</div>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <Link
                        href={`/categoria/${c.slug}`}
                        target="_blank"
                        className="font-bold text-forest-900 hover:text-emerald-700 transition block text-sm"
                      >
                        {c.nombre} ↗
                      </Link>
                      <span className="text-[11px] font-mono text-stone-400">/{c.slug}</span>
                    </td>

                    <td className="py-3.5 px-4 text-stone-600 max-w-xs truncate">
                      {c.descripcion || <span className="text-stone-300 italic">Sin descripción</span>}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-block px-2.5 py-0.5 rounded-full font-bold text-xs bg-forest-100 text-forest-800">
                        {count} prod.
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggleActiva(c)}
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold transition ${
                          c.activa
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
                        }`}
                        title="Toca para cambiar estado"
                      >
                        {c.activa ? '✓ Activa' : '○ Inactiva'}
                      </button>
                    </td>

                    <td className="py-3.5 px-4 text-right space-x-2">
                      <button
                        type="button"
                        onClick={() => abrirEditar(c)}
                        className="inline-flex items-center px-3 py-1.5 rounded-lg border border-forest-200 text-forest-700 hover:bg-forest-50 font-semibold text-xs transition"
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => setCategoriaEliminar(c)}
                        className="inline-flex items-center px-2.5 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 font-semibold text-xs transition"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Crear / Editar Categoría */}
      {modalAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-forest-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 bg-forest-900 text-white flex items-center justify-between">
              <h2 className="font-display text-lg font-bold">
                {categoriaEditando ? `Editar: ${categoriaEditando.nombre}` : 'Nueva Categoría'}
              </h2>
              <button
                onClick={() => setModalAbierto(false)}
                className="text-white/70 hover:text-white p-1 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-forest-800">
                  Nombre de la Categoría *
                </label>
                <input
                  type="text"
                  required
                  value={nombre}
                  onChange={(e) => handleNombreChange(e.target.value)}
                  className="w-full rounded-xl border border-forest-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-forest-200"
                  placeholder="Ej: Hierbas Medicinales"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-forest-800">
                  Slug / URL Amigable
                </label>
                <div className="flex items-center rounded-xl border border-forest-200 px-3.5 py-2 text-sm bg-forest-50/50">
                  <span className="text-stone-400 select-none">/categoria/</span>
                  <input
                    type="text"
                    required
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="flex-1 bg-transparent focus:outline-none font-mono text-forest-800"
                    placeholder="hierbas-medicinales"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-forest-800">
                  Descripción (Opcional)
                </label>
                <textarea
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  rows={2}
                  className="w-full rounded-xl border border-forest-200 px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-forest-200 resize-none"
                  placeholder="Breve detalle que se mostrará en los banners y encabezados..."
                />
              </div>

              {/* Subida de Imagen desde la computadora */}
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-forest-800">
                  Fotografía / Banner de Portada
                </label>

                <div className="flex items-center gap-4">
                  <div className="relative h-16 w-16 rounded-xl overflow-hidden bg-forest-50 border border-forest-200 shrink-0">
                    {imagenUrl ? (
                      <Image src={imagenUrl} alt="Vista previa" fill className="object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-2xl">📷</div>
                    )}
                  </div>

                  <div className="flex-1 space-y-2">
                    <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-forest-100 hover:bg-forest-200 text-forest-800 font-semibold text-xs transition">
                      <span>📁 Subir desde tu computadora</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleSubirImagen}
                        disabled={subiendoImg}
                      />
                    </label>

                    {subiendoImg && <span className="text-xs text-forest-600 block animate-pulse">Subiendo fotografía...</span>}

                    <input
                      type="text"
                      value={imagenUrl}
                      onChange={(e) => setImagenUrl(e.target.value)}
                      placeholder="O pegar URL directa (/fotos-principal/...)"
                      className="w-full rounded-lg border border-forest-200 px-2.5 py-1 text-xs text-forest-700"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-forest-800">
                    Orden de aparición
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={orden}
                    onChange={(e) => setOrden(Number(e.target.value))}
                    className="w-full rounded-xl border border-forest-200 px-3 py-2 text-sm"
                  />
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="activa"
                    checked={activa}
                    onChange={(e) => setActiva(e.target.checked)}
                    className="h-4 w-4 rounded border-forest-300 text-forest-600 focus:ring-forest-500"
                  />
                  <label htmlFor="activa" className="text-sm font-semibold text-forest-800 cursor-pointer">
                    Publicada en la tienda
                  </label>
                </div>
              </div>

              {errorMsg && (
                <div className="rounded-lg bg-red-50 p-2.5 text-xs text-red-600 font-medium">
                  ⚠️ {errorMsg}
                </div>
              )}

              <div className="pt-3 border-t border-forest-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalAbierto(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-stone-600 hover:bg-stone-100 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardando || subiendoImg}
                  className="px-5 py-2.5 rounded-full bg-forest-700 hover:bg-forest-800 text-white text-xs font-bold shadow transition disabled:opacity-50"
                >
                  {guardando ? 'Guardando...' : categoriaEditando ? 'Guardar Cambios' : 'Crear Categoría'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de confirmación para eliminar */}
      {categoriaEliminar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 border border-red-100">
            <h3 className="font-display text-lg font-bold text-red-700">
              ¿Eliminar categoría &quot;{categoriaEliminar.nombre}&quot;?
            </h3>
            
            {(() => {
              const asociados = productos.filter((p) => p.categoria_id === categoriaEliminar.id).length;
              return asociados > 0 ? (
                <div className="mt-3 bg-red-50 p-3 rounded-xl border border-red-200 text-xs text-red-800">
                  ⚠️ <strong>Atención:</strong> Esta categoría tiene <strong>{asociados} productos</strong> asociados.
                  Para evitar perder productos o dejarlos huérfanos, primero reasigna o elimina esos productos.
                </div>
              ) : (
                <p className="mt-3 text-xs text-stone-600 leading-relaxed">
                  Esta acción eliminará la categoría del catálogo y de los menús. No se podrá deshacer.
                </p>
              );
            })()}

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setCategoriaEliminar(null)}
                className="px-4 py-2 text-xs font-bold text-stone-600 hover:bg-stone-100 rounded-xl"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmarEliminar}
                disabled={eliminando}
                className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-full shadow disabled:opacity-50"
              >
                {eliminando ? 'Eliminando...' : 'Sí, Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}