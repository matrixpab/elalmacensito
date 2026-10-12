'use server';

import { revalidatePath } from 'next/cache';
import {
  saveStoreCategoria,
  deleteStoreCategoria,
  getStoreCategoriaPorId,
  saveStoreProducto,
  deleteStoreProducto,
  duplicateStoreProducto,
  bulkUpdatePrecios,
  updateStoreConfiguracion,
  readStore,
  writeStore,
  addStoreHistorialPrecio,
} from '@/lib/data/store';
import type { Categoria, Producto, EstadoPedido } from '@/lib/types';
import { verifyAdminOrThrow } from './auth';

function slugify(texto: string): string {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// ==========================================
// CATEGORIAS
// ==========================================

export interface CategoriaFormInput {
  id?: string;
  nombre: string;
  slug?: string;
  descripcion?: string | null;
  imagen_url?: string | null;
  orden?: number;
  activa?: boolean;
}

export async function guardarCategoria(input: CategoriaFormInput) {
  try {
    await verifyAdminOrThrow();
    const slug = input.slug?.trim() ? slugify(input.slug) : slugify(input.nombre);
    const cat = await saveStoreCategoria({
      id: input.id,
      nombre: input.nombre.trim(),
      slug,
      descripcion: input.descripcion?.trim() || null,
      imagen_url: input.imagen_url || null,
      orden: Number(input.orden) || 1,
      activa: input.activa ?? true,
    });

    revalidatePath('/admin/categorias');
    revalidatePath('/');
    revalidatePath(`/categoria/${slug}`);
    return { error: null, categoria: cat };
  } catch (err: any) {
    return { error: err?.message || 'Error al guardar la categoría' };
  }
}

export async function eliminarCategoriaAction(id: string) {
  try {
    await verifyAdminOrThrow();
    const res = await deleteStoreCategoria(id);
    if (res.error) return res;

    revalidatePath('/admin/categorias');
    revalidatePath('/');
    return { error: null };
  } catch (err: any) {
    return { error: err?.message || 'Error al eliminar categoría' };
  }
}

export async function toggleActivoCategoria(id: string, activa: boolean) {
  try {
    await verifyAdminOrThrow();
    const cat = await getStoreCategoriaPorId(id);
    if (!cat) return { error: 'Categoría no encontrada' };

    await saveStoreCategoria({
      ...cat,
      activa,
    });

    revalidatePath('/admin/categorias');
    revalidatePath('/');
    return { error: null };
  } catch (err: any) {
    return { error: err?.message || 'Error al actualizar estado' };
  }
}

// ==========================================
// PRODUCTOS
// ==========================================

export interface ProductoFormInput {
  id?: string;
  nombre: string;
  slug?: string;
  categoria_id: string;
  descripcion_larga: string;
  beneficios: string[];
  imagen_principal: string | null;
  imagenes_secundarias: string[];
  precio_1kg: number | null;
  precio_500g: number | null;
  precio_250g: number | null;
  precio_unidad: number | null;
  stock_actual: number;
  stock_minimo: number;
  sku: string;
  meta_title?: string;
  meta_description?: string;
  palabras_clave?: string[];
  activo: boolean;
  destacado: boolean;
  en_promocion: boolean;
}

export async function crearProducto(input: ProductoFormInput) {
  try {
    await verifyAdminOrThrow();
    const slug = input.slug?.trim() ? slugify(input.slug) : slugify(input.nombre);
    const prod = await saveStoreProducto({
      ...input,
      slug,
      meta_title: input.meta_title || `${input.nombre} | El Almacencito`,
      meta_description: input.meta_description || input.descripcion_larga.slice(0, 155),
      palabras_clave: input.palabras_clave || [],
    });

    revalidatePath('/admin/productos');
    revalidatePath('/');
    revalidatePath(`/producto/${slug}`);
    return { error: null, producto: prod };
  } catch (err: any) {
    return { error: err?.message || 'Error al crear producto' };
  }
}

export async function actualizarProducto(id: string, input: ProductoFormInput) {
  try {
    await verifyAdminOrThrow();
    const slug = input.slug?.trim() ? slugify(input.slug) : slugify(input.nombre);
    const prod = await saveStoreProducto({
      ...input,
      id,
      slug,
      meta_title: input.meta_title || `${input.nombre} | El Almacencito`,
      meta_description: input.meta_description || input.descripcion_larga.slice(0, 155),
      palabras_clave: input.palabras_clave || [],
    });

    revalidatePath('/admin/productos');
    revalidatePath(`/producto/${slug}`);
    revalidatePath('/');
    return { error: null, producto: prod };
  } catch (err: any) {
    return { error: err?.message || 'Error al actualizar producto' };
  }
}

export async function eliminarProducto(id: string) {
  try {
    await verifyAdminOrThrow();
    await deleteStoreProducto(id);
    revalidatePath('/admin/productos');
    revalidatePath('/');
    return { error: null };
  } catch (err: any) {
    return { error: err?.message || 'Error al eliminar producto' };
  }
}

export async function duplicarProducto(id: string) {
  try {
    await verifyAdminOrThrow();
    const copy = await duplicateStoreProducto(id);
    if (!copy) return { error: 'Producto no encontrado' };

    revalidatePath('/admin/productos');
    return { error: null, producto: copy };
  } catch (err: any) {
    return { error: err?.message || 'Error al duplicar producto' };
  }
}

export async function toggleActivoProducto(id: string, activo: boolean) {
  try {
    await verifyAdminOrThrow();
    const store = await readStore();
    const prod = store.productos.find((p) => p.id === id);
    if (!prod) return { error: 'Producto no encontrado' };

    prod.activo = activo;
    prod.updated_at = new Date().toISOString();
    await writeStore(store);

    revalidatePath('/admin/productos');
    revalidatePath('/');
    return { error: null };
  } catch (err: any) {
    return { error: err?.message || 'Error al actualizar estado' };
  }
}

export async function actualizarPreciosMasivos(
  updates: {
    id: string;
    precio_1kg?: number | null;
    precio_500g?: number | null;
    precio_250g?: number | null;
    precio_unidad?: number | null;
  }[]
) {
  try {
    await verifyAdminOrThrow();
    await bulkUpdatePrecios(updates);
    revalidatePath('/admin/productos');
    revalidatePath('/admin/precios-masivos');
    revalidatePath('/');
    return { error: null };
  } catch (err: any) {
    return { error: err?.message || 'Error al actualizar precios' };
  }
}

export async function actualizarStockAction(id: string, stock: number) {
  try {
    await verifyAdminOrThrow();
    const store = await readStore();
    const prod = store.productos.find((p) => p.id === id);
    if (!prod) return { error: 'Producto no encontrado' };

    prod.stock_actual = Math.max(0, stock);
    prod.updated_at = new Date().toISOString();
    await writeStore(store);

    revalidatePath('/admin/stock');
    revalidatePath('/admin/productos');
    return { error: null };
  } catch (err: any) {
    return { error: err?.message || 'Error al actualizar stock' };
  }
}

export async function actualizarEstadoPedido(id: string, estado: EstadoPedido) {
  try {
    await verifyAdminOrThrow();
    const store = await readStore();
    const pedido = store.pedidos.find((p) => p.id === id);
    if (pedido) {
      pedido.estado = estado;
      await writeStore(store);
    }
    revalidatePath('/admin/pedidos');
    return { error: null };
  } catch (err: any) {
    return { error: err?.message || 'Error al actualizar pedido' };
  }
}

export async function guardarConfiguracionAction(config: {
  whatsapp_numero: string;
  envios_info: string;
  ga4_id?: string | null;
  google_ads_id?: string | null;
  gsc_verification?: string | null;
}) {
  try {
    await verifyAdminOrThrow();
    await updateStoreConfiguracion(config);
    revalidatePath('/admin/configuracion');
    revalidatePath('/');
    return { error: null };
  } catch (err: any) {
    return { error: err?.message || 'Error al guardar configuración' };
  }
}
// ==========================================
// AUMENTO MASIVO DE PRECIOS
// ==========================================

export interface PreviewAumento {
  id: string;
  nombre: string;
  precio_1kg: number | null;
  nuevo_precio_1kg: number | null;
  precio_500g: number | null;
  nuevo_precio_500g: number | null;
  precio_250g: number | null;
  nuevo_precio_250g: number | null;
  precio_unidad: number | null;
  nuevo_precio_unidad: number | null;
}

function calcularNuevoPrecio(precio: number | null, porcentaje: number): number | null {
  if (precio === null || precio === undefined) return null;
  const factor = 1 + porcentaje / 100;
  return Math.max(0, Math.round(precio * factor));
}

export async function previsualizarAumento(
  tipo: 'porcentaje_general' | 'porcentaje_categoria' | 'porcentaje_seleccion',
  porcentaje: number,
  categoriaId?: string,
  seleccionados?: string[]
): Promise<PreviewAumento[]> {
  const store = await readStore();
  let productos = store.productos.filter((p) => p.activo);

  if (tipo === 'porcentaje_categoria' && categoriaId) {
    productos = productos.filter((p) => p.categoria_id === categoriaId);
  } else if (tipo === 'porcentaje_seleccion' && seleccionados && seleccionados.length > 0) {
    const ids = new Set(seleccionados);
    productos = productos.filter((p) => ids.has(p.id));
  }

  return productos.map((p) => ({
    id: p.id,
    nombre: p.nombre,
    precio_1kg: p.precio_1kg,
    nuevo_precio_1kg: calcularNuevoPrecio(p.precio_1kg, porcentaje),
    precio_500g: p.precio_500g,
    nuevo_precio_500g: calcularNuevoPrecio(p.precio_500g, porcentaje),
    precio_250g: p.precio_250g,
    nuevo_precio_250g: calcularNuevoPrecio(p.precio_250g, porcentaje),
    precio_unidad: p.precio_unidad,
    nuevo_precio_unidad: calcularNuevoPrecio(p.precio_unidad, porcentaje),
  }));
}

export async function aplicarAumentoMasivo(
  tipo: 'porcentaje_general' | 'porcentaje_categoria' | 'porcentaje_seleccion',
  porcentaje: number,
  categoriaId?: string,
  seleccionados?: string[]
): Promise<{ productosAfectados: number }> {
  await verifyAdminOrThrow();
  const previews = await previsualizarAumento(tipo, porcentaje, categoriaId, seleccionados);
  if (previews.length === 0) {
    return { productosAfectados: 0 };
  }

  const updates = previews.map((p) => ({
    id: p.id,
    precio_1kg: p.nuevo_precio_1kg,
    precio_500g: p.nuevo_precio_500g,
    precio_250g: p.nuevo_precio_250g,
    precio_unidad: p.nuevo_precio_unidad,
  }));

  await bulkUpdatePrecios(updates);

  let descripcion = `Aumento del ${porcentaje}% general (${previews.length} productos)`;
  if (tipo === 'porcentaje_categoria') {
    const store = await readStore();
    const cat = store.categorias.find((c) => c.id === categoriaId);
    descripcion = `Aumento del ${porcentaje}% en ${cat ? cat.nombre : 'categoría'} (${previews.length} productos)`;
  } else if (tipo === 'porcentaje_seleccion') {
    descripcion = `Aumento del ${porcentaje}% en selección (${previews.length} productos)`;
  }

  await addStoreHistorialPrecio({
    descripcion,
    tipo: tipo === 'porcentaje_general' ? 'general' : tipo === 'porcentaje_categoria' ? 'categoria' : 'seleccion',
    usuario_email: 'admin@elalmacencito.com.ar',
  });

  revalidatePath('/admin/precios-masivos');
  revalidatePath('/admin/productos');
  revalidatePath('/');

  return { productosAfectados: previews.length };
}

export async function actualizarConfiguracion(config: {
  whatsapp_numero: string;
  envios_info: string;
  ga4_id?: string | null;
  google_ads_id?: string | null;
  gsc_verification?: string | null;
}) {
  return guardarConfiguracionAction(config);
}
