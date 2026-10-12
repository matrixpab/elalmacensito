'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { Categoria, Producto } from '@/lib/types';
import { formatearPrecio } from '@/lib/whatsapp';
import { duplicarProducto, eliminarProducto, toggleActivoProducto } from '@/lib/admin/actions';

interface Props {
  productos: Producto[];
  categorias: Categoria[];
}

export default function ProductosManager({ productos: initialProductos, categorias }: Props) {
  const [productos, setProductos] = useState<Producto[]>(initialProductos);
  const [busqueda, setBusqueda] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState('todas');
  const [estadoFiltro, setEstadoFiltro] = useState('todos');

  const [cargandoId, setCargandoId] = useState<string | null>(null);
  const [productoEliminar, setProductoEliminar] = useState<Producto | null>(null);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);

  // Filtrado
  const productosFiltrados = productos.filter((p) => {
    const coincideTexto =
      p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      (p.sku && p.sku.toLowerCase().includes(busqueda.toLowerCase()));

    const coincideCategoria =
      categoriaFiltro === 'todas' || p.categoria_id === categoriaFiltro;

    const coincideEstado =
      estadoFiltro === 'todos' ||
      (estadoFiltro === 'activos' && p.activo) ||
      (estadoFiltro === 'inactivos' && !p.activo);

    return coincideTexto && coincideCategoria && coincideEstado;
  });

  async function handleToggleActivo(p: Producto) {
    setCargandoId(p.id);
    const nuevoEstado = !p.activo;

    setProductos((prev) =>
      prev.map((item) => (item.id === p.id ? { ...item, activo: nuevoEstado } : item))
    );

    const res = await toggleActivoProducto(p.id, nuevoEstado);
    if (res.error) {
      // Revertir
      setProductos((prev) =>
        prev.map((item) => (item.id === p.id ? { ...item, activo: p.activo } : item))
      );
      alert(res.error);
    }
    setCargandoId(null);
  }

  async function handleDuplicar(id: string) {
    setCargandoId(id);
    const res = await duplicarProducto(id);
    if (res.error) {
      alert(res.error);
      setCargandoId(null);
      return;
    }
    if (res.producto) {
      setProductos((prev) => [res.producto!, ...prev]);
      setMensajeExito(`Producto duplicado: "${res.producto.nombre}"`);
      setTimeout(() => setMensajeExito(null), 3500);
    }
    setCargandoId(null);
  }

  async function confirmarEliminar() {
    if (!productoEliminar) return;
    setCargandoId(productoEliminar.id);

    const res = await eliminarProducto(productoEliminar.id);
    if (res.error) {
      alert(res.error);
      setCargandoId(null);
      setProductoEliminar(null);
      return;
    }

    setProductos((prev) => prev.filter((item) => item.id !== productoEliminar.id));
    setMensajeExito(`Producto "${productoEliminar.nombre}" eliminado.`);
    setTimeout(() => setMensajeExito(null), 3500);
    setProductoEliminar(null);
    setCargandoId(null);
  }

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-forest-100 shadow-xs">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
            Inventario & Catálogo
          </span>
          <h1 className="mt-2 font-display text-2xl font-extrabold text-forest-900">
            Administración de Productos
          </h1>
          <p className="text-xs sm:text-sm text-forest-600 mt-1">
            Gestioná precios por kilo o unidad, fotografías, duplicá ítems y controlá el stock.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/admin/precios-masivos"
            className="inline-flex items-center gap-2 rounded-full border border-forest-200 bg-white hover:bg-forest-50 text-forest-800 px-4 py-2.5 text-xs sm:text-sm font-bold shadow-xs transition"
          >
            <span>💵</span>
            <span>Precios Rápidos</span>
          </Link>
          <Link
            href="/admin/productos/nuevo"
            className="inline-flex items-center gap-2 rounded-full bg-forest-700 hover:bg-forest-800 text-white px-5 py-2.5 text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition transform active:scale-95"
          >
            <span>+</span>
            <span>Nuevo Producto</span>
          </Link>
        </div>
      </div>

      {mensajeExito && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-emerald-800 text-sm font-medium flex items-center justify-between shadow-xs">
          <span>✓ {mensajeExito}</span>
          <button onClick={() => setMensajeExito(null)} className="text-emerald-600 hover:text-emerald-900 font-bold">✕</button>
        </div>
      )}

      {/* Barra de Filtros y Búsqueda */}
      <div className="bg-white p-4 rounded-2xl border border-forest-100 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Input de búsqueda */}
        <div className="relative w-full md:w-80">
          <span className="absolute left-3.5 top-2.5 text-stone-400 text-sm">🔍</span>
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por nombre o SKU..."
            className="w-full pl-9 pr-3.5 py-2 text-xs sm:text-sm rounded-xl border border-forest-200 focus:outline-none focus:ring-2 focus:ring-forest-200"
          />
        </div>

        {/* Filtros por Categoría y Estado */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-forest-700 hidden sm:inline">Categoría:</span>
            <select
              value={categoriaFiltro}
              onChange={(e) => setCategoriaFiltro(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl border border-forest-200 bg-white font-medium text-forest-900"
            >
              <option value="todas">Todas las categorías ({productos.length})</option>
              {categorias.map((c) => {
                const count = productos.filter((p) => p.categoria_id === c.id).length;
                return (
                  <option key={c.id} value={c.id}>
                    {c.nombre} ({count})
                  </option>
                );
              })}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-forest-700 hidden sm:inline">Estado:</span>
            <select
              value={estadoFiltro}
              onChange={(e) => setEstadoFiltro(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl border border-forest-200 bg-white font-medium text-forest-900"
            >
              <option value="todos">Todos</option>
              <option value="activos">Publicados</option>
              <option value="inactivos">Inactivos / Borrador</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabla de Productos */}
      <div className="bg-white rounded-2xl border border-forest-100 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-forest-50/70 border-b border-forest-100 text-forest-800 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-4">Producto</th>
                <th className="py-3.5 px-4">Categoría</th>
                <th className="py-3.5 px-4">Precios por Presentación (ARS)</th>
                <th className="py-3.5 px-4 text-center">Stock</th>
                <th className="py-3.5 px-4 text-center">Estado</th>
                <th className="py-3.5 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-forest-50">
              {productosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-forest-500">
                    <p className="text-3xl mb-2">🌿</p>
                    <p className="font-semibold">No se encontraron productos con esos filtros.</p>
                  </td>
                </tr>
              ) : (
                productosFiltrados.map((p) => {
                  const cat = categorias.find((c) => c.id === p.categoria_id);
                  const tieneStockBajo = p.stock_actual <= p.stock_minimo;
                  return (
                    <tr key={p.id} className="hover:bg-cream-50/40 transition">
                      {/* Foto y Nombre */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="relative h-12 w-12 rounded-xl overflow-hidden bg-forest-50 border border-forest-100 shrink-0">
                            {p.imagen_principal ? (
                              <Image src={p.imagen_principal} alt={p.nombre} fill className="object-cover" />
                            ) : (
                              <div className="flex h-full items-center justify-center text-xl">🌿</div>
                            )}
                          </div>
                          <div>
                            <Link
                              href={`/producto/${p.slug}`}
                              target="_blank"
                              className="font-bold text-forest-900 hover:text-emerald-700 transition block text-sm"
                            >
                              {p.nombre} ↗
                            </Link>
                            <div className="flex items-center gap-2 mt-0.5">
                              {p.sku && <span className="font-mono text-[10px] text-stone-400">SKU: {p.sku}</span>}
                              {p.destacado && (
                                <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded-full border border-amber-200">
                                  ★ Home
                                </span>
                              )}
                              {p.en_promocion && (
                                <span className="text-[10px] font-bold text-red-700 bg-red-50 px-1.5 py-0.2 rounded-full border border-red-200">
                                  🔥 Promo
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Categoría */}
                      <td className="py-3.5 px-4 text-forest-700 font-medium">
                        {cat ? (
                          <span className="inline-block px-2.5 py-1 rounded-full text-xs font-semibold bg-forest-50 text-forest-800">
                            {cat.nombre}
                          </span>
                        ) : (
                          '—'
                        )}
                      </td>

                      {/* Precios por presentación */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap gap-2 text-xs">
                          {p.precio_1kg && (
                            <span className="inline-block bg-cream-50 px-2 py-0.5 rounded-lg border border-forest-100 font-medium">
                              1kg: <strong className="text-forest-900">{formatearPrecio(p.precio_1kg)}</strong>
                            </span>
                          )}
                          {p.precio_500g && (
                            <span className="inline-block bg-cream-50 px-2 py-0.5 rounded-lg border border-forest-100 font-medium">
                              500g: <strong className="text-forest-900">{formatearPrecio(p.precio_500g)}</strong>
                            </span>
                          )}
                          {p.precio_250g && (
                            <span className="inline-block bg-cream-50 px-2 py-0.5 rounded-lg border border-forest-100 font-medium">
                              250g: <strong className="text-forest-900">{formatearPrecio(p.precio_250g)}</strong>
                            </span>
                          )}
                          {p.precio_unidad && (
                            <span className="inline-block bg-cream-50 px-2 py-0.5 rounded-lg border border-forest-100 font-medium">
                              U: <strong className="text-forest-900">{formatearPrecio(p.precio_unidad)}</strong>
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Stock */}
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold ${
                            p.stock_actual <= 0
                              ? 'bg-red-100 text-red-700'
                              : tieneStockBajo
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-50 text-emerald-800'
                          }`}
                        >
                          {p.stock_actual} u.
                        </span>
                      </td>

                      {/* Estado */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleActivo(p)}
                          disabled={cargandoId === p.id}
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold transition ${
                            p.activo
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
                          }`}
                          title="Toca para cambiar estado"
                        >
                          {p.activo ? '✓ Publicado' : '○ Borrador'}
                        </button>
                      </td>

                      {/* Acciones */}
                      <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                        <Link
                          href={`/admin/productos/${p.id}`}
                          className="inline-flex items-center px-2.5 py-1.5 rounded-lg border border-forest-200 text-forest-700 hover:bg-forest-50 font-semibold text-xs transition"
                        >
                          Editar
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDuplicar(p.id)}
                          disabled={cargandoId === p.id}
                          className="inline-flex items-center px-2.5 py-1.5 rounded-lg border border-forest-200 text-forest-700 hover:bg-forest-50 font-semibold text-xs transition disabled:opacity-50"
                          title="Duplicar producto para ahorrar tiempo"
                        >
                          Duplicar
                        </button>
                        <button
                          type="button"
                          onClick={() => setProductoEliminar(p)}
                          className="inline-flex items-center px-2.5 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 font-semibold text-xs transition"
                        >
                          ✕
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de confirmación para eliminar */}
      {productoEliminar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 border border-red-100">
            <h3 className="font-display text-lg font-bold text-red-700">
              ¿Eliminar producto &quot;{productoEliminar.nombre}&quot;?
            </h3>
            <p className="mt-2 text-xs text-stone-600 leading-relaxed">
              Esta acción eliminará el producto del catálogo y ya no estará disponible para la compra.
            </p>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setProductoEliminar(null)}
                className="px-4 py-2 text-xs font-bold text-stone-600 hover:bg-stone-100 rounded-xl"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmarEliminar}
                className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-full shadow"
              >
                Sí, Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}