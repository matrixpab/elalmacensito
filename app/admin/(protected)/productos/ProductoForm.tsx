'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { crearProducto, actualizarProducto, type ProductoFormInput } from '@/lib/admin/actions';
import type { Categoria, Producto } from '@/lib/types';
import { formatearPrecio } from '@/lib/whatsapp';

interface Props {
  categorias: Categoria[];
  producto?: Producto;
}

function listaATexto(lista: string[] | undefined): string {
  return (lista ?? []).join(', ');
}

function textoALista(texto: string): string[] {
  return texto
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);
}

export default function ProductoForm({ categorias, producto }: Props) {
  const router = useRouter();
  const esEdicion = Boolean(producto);

  const [form, setForm] = useState({
    nombre: producto?.nombre ?? '',
    categoria_id: producto?.categoria_id ?? categorias[0]?.id ?? '',
    descripcion_larga: producto?.descripcion_larga ?? '',
    beneficios: listaATexto(producto?.beneficios),
    precio_1kg: producto?.precio_1kg?.toString() ?? '',
    precio_500g: producto?.precio_500g?.toString() ?? '',
    precio_250g: producto?.precio_250g?.toString() ?? '',
    precio_unidad: producto?.precio_unidad?.toString() ?? '',
    stock_actual: producto?.stock_actual?.toString() ?? '10',
    stock_minimo: producto?.stock_minimo?.toString() ?? '3',
    sku: producto?.sku ?? '',
    meta_title: producto?.meta_title ?? '',
    meta_description: producto?.meta_description ?? '',
    palabras_clave: listaATexto(producto?.palabras_clave),
    activo: producto?.activo ?? true,
    destacado: producto?.destacado ?? false,
    en_promocion: producto?.en_promocion ?? false,
  });

  const [imagenPrincipal, setImagenPrincipal] = useState<string | null>(producto?.imagen_principal ?? null);
  const [imagenesSecundarias, setImagenesSecundarias] = useState<string[]>(
    producto?.imagenes_secundarias ?? []
  );

  const [subiendo, setSubiendo] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [urlManual, setUrlManual] = useState('');

  // Subir imagen desde la computadora usando el endpoint persistente
  async function handleSubirImagen(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setSubiendo(true);
    setError(null);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append('file', file);

        const res = await fetch('/api/admin/upload', {
          method: 'POST',
          body: formData,
        });

        const data = await res.json();
        if (!res.ok || data.error) {
          setError(data.error || 'Error al subir la imagen.');
          setSubiendo(false);
          return;
        }

        if (!imagenPrincipal && i === 0) {
          setImagenPrincipal(data.url);
        } else {
          setImagenesSecundarias((prev) => [...prev, data.url]);
        }
      }
      setSubiendo(false);
    } catch {
      setError('Error al conectar con el servidor para subir la imagen.');
      setSubiendo(false);
    }
  }

  function agregarUrlManual() {
    if (!urlManual.trim()) return;
    if (!imagenPrincipal) {
      setImagenPrincipal(urlManual.trim());
    } else {
      setImagenesSecundarias((prev) => [...prev, urlManual.trim()]);
    }
    setUrlManual('');
  }

  function quitarImagenPrincipal() {
    if (imagenesSecundarias.length > 0) {
      setImagenPrincipal(imagenesSecundarias[0]);
      setImagenesSecundarias((prev) => prev.slice(1));
    } else {
      setImagenPrincipal(null);
    }
  }

  function quitarSecundaria(idx: number) {
    setImagenesSecundarias((prev) => prev.filter((_, i) => i !== idx));
  }

  function hacerPrincipal(idx: number) {
    const seleccionada = imagenesSecundarias[idx];
    const anteriores = imagenesSecundarias.filter((_, i) => i !== idx);
    if (imagenPrincipal) {
      setImagenesSecundarias([...anteriores, imagenPrincipal]);
    } else {
      setImagenesSecundarias(anteriores);
    }
    setImagenPrincipal(seleccionada);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.nombre.trim()) {
      setError('El nombre del producto es obligatorio.');
      return;
    }

    // Validar precios no negativos
    const p1 = form.precio_1kg ? Number(form.precio_1kg) : null;
    const p5 = form.precio_500g ? Number(form.precio_500g) : null;
    const p2 = form.precio_250g ? Number(form.precio_250g) : null;
    const pu = form.precio_unidad ? Number(form.precio_unidad) : null;

    if (
      (p1 !== null && (isNaN(p1) || p1 < 0)) ||
      (p5 !== null && (isNaN(p5) || p5 < 0)) ||
      (p2 !== null && (isNaN(p2) || p2 < 0)) ||
      (pu !== null && (isNaN(pu) || pu < 0))
    ) {
      setError('Los precios deben ser números mayores o iguales a 0.');
      return;
    }

    if (!p1 && !p5 && !p2 && !pu) {
      setError('Ingresá al menos un precio para alguna presentación (1 kg, 500 g, 250 g o Unidad).');
      return;
    }

    setGuardando(true);
    setError(null);

    const input: ProductoFormInput = {
      nombre: form.nombre.trim(),
      categoria_id: form.categoria_id,
      descripcion_larga: form.descripcion_larga.trim(),
      beneficios: textoALista(form.beneficios),
      imagen_principal: imagenPrincipal,
      imagenes_secundarias: imagenesSecundarias,
      precio_1kg: p1,
      precio_500g: p5,
      precio_250g: p2,
      precio_unidad: pu,
      stock_actual: Math.max(0, Number(form.stock_actual) || 0),
      stock_minimo: Math.max(0, Number(form.stock_minimo) || 0),
      sku: form.sku.trim(),
      meta_title: form.meta_title.trim(),
      meta_description: form.meta_description.trim(),
      palabras_clave: textoALista(form.palabras_clave),
      activo: form.activo,
      destacado: form.destacado,
      en_promocion: form.en_promocion,
    };

    const res = esEdicion
      ? await actualizarProducto(producto!.id, input)
      : await crearProducto(input);

    if (res.error) {
      setError(res.error);
      setGuardando(false);
      return;
    }

    router.push('/admin/productos');
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-xl bg-red-50 p-4 border border-red-200 text-sm font-semibold text-red-700">
          ⚠️ {error}
        </div>
      )}

      {/* 1. INFORMACIÓN BÁSICA Y CATEGORÍA */}
      <div className="bg-white p-6 rounded-2xl border border-forest-100 shadow-xs space-y-4">
        <h2 className="font-display text-lg font-bold text-forest-900 border-b border-forest-50 pb-2">
          1. Datos Principales
        </h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-forest-800">
              Nombre del Producto *
            </label>
            <input
              type="text"
              required
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              className="w-full rounded-xl border border-forest-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-forest-200"
              placeholder="Ej: Manzanilla Flor Entera"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-forest-800">
              Categoría *
            </label>
            <select
              required
              value={form.categoria_id}
              onChange={(e) => setForm({ ...form, categoria_id: e.target.value })}
              className="w-full rounded-xl border border-forest-200 px-3.5 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-forest-200"
            >
              {categorias.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-forest-800">
              Código SKU (Opcional)
            </label>
            <input
              type="text"
              value={form.sku}
              onChange={(e) => setForm({ ...form, sku: e.target.value })}
              className="w-full rounded-xl border border-forest-200 px-3.5 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-forest-200"
              placeholder="Ej: HIERBA-001"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-forest-800">
              Descripción Completa
            </label>
            <textarea
              rows={3}
              value={form.descripcion_larga}
              onChange={(e) => setForm({ ...form, descripcion_larga: e.target.value })}
              className="w-full rounded-xl border border-forest-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-forest-200"
              placeholder="Propiedades medicinales, origen, aroma, modo de preparación..."
            />
          </div>

          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-forest-800">
              Etiquetas / Beneficios (separados por coma)
            </label>
            <input
              type="text"
              value={form.beneficios}
              onChange={(e) => setForm({ ...form, beneficios: e.target.value })}
              className="w-full rounded-xl border border-forest-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-forest-200"
              placeholder="Digestiva, Relajante, Cosecha Seleccionada, 100% Pura"
            />
          </div>
        </div>
      </div>

      {/* 2. SUBIDA DE FOTOGRAFÍAS */}
      <div className="bg-white p-6 rounded-2xl border border-forest-100 shadow-xs space-y-4">
        <h2 className="font-display text-lg font-bold text-forest-900 border-b border-forest-50 pb-2 flex items-center justify-between">
          <span>2. Fotografías del Producto</span>
          <span className="text-xs font-semibold text-forest-500">Múltiples fotos soportadas</span>
        </h2>

        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <label className="cursor-pointer inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-forest-700 hover:bg-forest-800 text-white font-bold text-xs sm:text-sm shadow transition">
              <span>📁 Subir desde tu computadora</span>
              <input
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={handleSubirImagen}
                disabled={subiendo}
              />
            </label>

            <div className="flex items-center gap-2 flex-1 min-w-[240px]">
              <input
                type="text"
                value={urlManual}
                onChange={(e) => setUrlManual(e.target.value)}
                placeholder="O pegar URL de imagen..."
                className="flex-1 rounded-xl border border-forest-200 px-3 py-2 text-xs"
              />
              <button
                type="button"
                onClick={agregarUrlManual}
                className="px-3 py-2 rounded-xl bg-forest-100 hover:bg-forest-200 text-forest-800 font-bold text-xs"
              >
                Agregar
              </button>
            </div>
          </div>

          {subiendo && (
            <p className="text-xs text-emerald-700 font-semibold animate-pulse">
              ⏳ Subiendo imágenes al servidor...
            </p>
          )}

          {/* Galería de imágenes cargadas */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
            {/* Imagen Principal */}
            {imagenPrincipal ? (
              <div className="relative rounded-2xl overflow-hidden border-2 border-emerald-500 aspect-square bg-forest-50 group shadow-sm">
                <Image src={imagenPrincipal} alt="Principal" fill className="object-cover" />
                <span className="absolute top-2 left-2 bg-emerald-600 text-white text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full shadow">
                  ★ Principal
                </span>
                <button
                  type="button"
                  onClick={quitarImagenPrincipal}
                  className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white p-1 rounded-full text-xs shadow"
                  title="Eliminar"
                >
                  ✕
                </button>
              </div>
            ) : (
              <div className="rounded-2xl border-2 border-dashed border-forest-200 aspect-square flex flex-col items-center justify-center text-center p-3 text-forest-400">
                <span className="text-3xl mb-1">📷</span>
                <span className="text-xs font-semibold">Sin imagen principal</span>
              </div>
            )}

            {/* Imágenes secundarias */}
            {imagenesSecundarias.map((url, idx) => (
              <div
                key={url + idx}
                className="relative rounded-2xl overflow-hidden border border-forest-200 aspect-square bg-forest-50 group hover:border-forest-400 transition"
              >
                <Image src={url} alt={`Secundaria ${idx}`} fill className="object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2 p-2">
                  <button
                    type="button"
                    onClick={() => hacerPrincipal(idx)}
                    className="px-2 py-1 bg-white text-forest-900 text-[10px] font-bold rounded-lg shadow hover:bg-emerald-50"
                    title="Hacer Principal"
                  >
                    Hacer Principal
                  </button>
                  <button
                    type="button"
                    onClick={() => quitarSecundaria(idx)}
                    className="p-1 bg-red-600 text-white rounded-lg text-xs shadow hover:bg-red-700"
                    title="Eliminar"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. PRECIOS POR PRESENTACIÓN (ARS $ 12.500) */}
      <div className="bg-white p-6 rounded-2xl border border-forest-100 shadow-xs space-y-4">
        <div className="border-b border-forest-50 pb-2">
          <h2 className="font-display text-lg font-bold text-forest-900">
            3. Precios y Presentaciones (ARS)
          </h2>
          <p className="text-xs text-forest-600">
            Administrá cada tamaño por separado. El catálogo y el carrito calcularán el precio automáticamente.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="p-4 rounded-xl bg-forest-50/60 border border-forest-100">
            <label className="block text-xs font-bold uppercase tracking-wider text-forest-800 mb-1">
              Precio 1 Kilo (1 kg)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-sm font-bold text-forest-500">$</span>
              <input
                type="number"
                min="0"
                step="50"
                value={form.precio_1kg}
                onChange={(e) => setForm({ ...form, precio_1kg: e.target.value })}
                className="w-full pl-8 pr-3 py-2 text-sm font-bold rounded-lg border border-forest-200 bg-white"
                placeholder="16000"
              />
            </div>
            {form.precio_1kg && (
              <p className="text-[11px] font-bold text-emerald-800 mt-1">
                {formatearPrecio(Number(form.precio_1kg))}
              </p>
            )}
          </div>

          <div className="p-4 rounded-xl bg-forest-50/60 border border-forest-100">
            <label className="block text-xs font-bold uppercase tracking-wider text-forest-800 mb-1">
              Precio 500 Gramos (500 g)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-sm font-bold text-forest-500">$</span>
              <input
                type="number"
                min="0"
                step="50"
                value={form.precio_500g}
                onChange={(e) => setForm({ ...form, precio_500g: e.target.value })}
                className="w-full pl-8 pr-3 py-2 text-sm font-bold rounded-lg border border-forest-200 bg-white"
                placeholder="8500"
              />
            </div>
            {form.precio_500g && (
              <p className="text-[11px] font-bold text-emerald-800 mt-1">
                {formatearPrecio(Number(form.precio_500g))}
              </p>
            )}
          </div>

          <div className="p-4 rounded-xl bg-forest-50/60 border border-forest-100">
            <label className="block text-xs font-bold uppercase tracking-wider text-forest-800 mb-1">
              Precio 250 Gramos (250 g)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-sm font-bold text-forest-500">$</span>
              <input
                type="number"
                min="0"
                step="50"
                value={form.precio_250g}
                onChange={(e) => setForm({ ...form, precio_250g: e.target.value })}
                className="w-full pl-8 pr-3 py-2 text-sm font-bold rounded-lg border border-forest-200 bg-white"
                placeholder="4500"
              />
            </div>
            {form.precio_250g && (
              <p className="text-[11px] font-bold text-emerald-800 mt-1">
                {formatearPrecio(Number(form.precio_250g))}
              </p>
            )}
          </div>

          <div className="p-4 rounded-xl bg-forest-50/60 border border-forest-100">
            <label className="block text-xs font-bold uppercase tracking-wider text-forest-800 mb-1">
              Precio Unidad / Paquete
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-sm font-bold text-forest-500">$</span>
              <input
                type="number"
                min="0"
                step="50"
                value={form.precio_unidad}
                onChange={(e) => setForm({ ...form, precio_unidad: e.target.value })}
                className="w-full pl-8 pr-3 py-2 text-sm font-bold rounded-lg border border-forest-200 bg-white"
                placeholder="3200"
              />
            </div>
            {form.precio_unidad && (
              <p className="text-[11px] font-bold text-emerald-800 mt-1">
                {formatearPrecio(Number(form.precio_unidad))}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* 4. STOCK & ESTADO */}
      <div className="bg-white p-6 rounded-2xl border border-forest-100 shadow-xs space-y-4">
        <h2 className="font-display text-lg font-bold text-forest-900 border-b border-forest-50 pb-2">
          4. Inventario y Publicación
        </h2>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-forest-800">
              Stock Actual (Unidades / Paquetes)
            </label>
            <input
              type="number"
              min="0"
              value={form.stock_actual}
              onChange={(e) => setForm({ ...form, stock_actual: e.target.value })}
              className="w-full rounded-xl border border-forest-200 px-3.5 py-2.5 text-sm"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-forest-800">
              Alerta de Stock Mínimo
            </label>
            <input
              type="number"
              min="0"
              value={form.stock_minimo}
              onChange={(e) => setForm({ ...form, stock_minimo: e.target.value })}
              className="w-full rounded-xl border border-forest-200 px-3.5 py-2.5 text-sm"
            />
          </div>

          <div className="sm:col-span-2 flex flex-wrap items-center gap-6 pt-5">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.activo}
                onChange={(e) => setForm({ ...form, activo: e.target.checked })}
                className="h-4 w-4 rounded text-forest-700"
              />
              <span className="text-xs font-bold uppercase tracking-wider text-forest-900">
                Publicado en la tienda
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.destacado}
                onChange={(e) => setForm({ ...form, destacado: e.target.checked })}
                className="h-4 w-4 rounded text-emerald-700"
              />
              <span className="text-xs font-bold uppercase tracking-wider text-forest-900">
                Destacado (Home)
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.en_promocion}
                onChange={(e) => setForm({ ...form, en_promocion: e.target.checked })}
                className="h-4 w-4 rounded text-amber-600"
              />
              <span className="text-xs font-bold uppercase tracking-wider text-forest-900">
                En Promoción
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Botones de acción final */}
      <div className="flex items-center justify-end gap-4 pt-4">
        <Link
          href="/admin/productos"
          className="px-6 py-3 rounded-full text-xs font-bold text-stone-600 hover:bg-stone-100 transition"
        >
          Cancelar
        </Link>
        <button
          type="submit"
          disabled={guardando || subiendo}
          className="px-8 py-3.5 rounded-full bg-forest-700 hover:bg-forest-800 text-white font-bold text-sm shadow-md hover:shadow-lg transition transform active:scale-95 disabled:opacity-50"
        >
          {guardando ? 'Guardando en la tienda...' : esEdicion ? 'Actualizar Producto' : 'Crear Producto'}
        </button>
      </div>
    </form>
  );
}