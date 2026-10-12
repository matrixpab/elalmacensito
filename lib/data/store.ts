'use server';

import fs from 'fs';
import path from 'path';
import type { Categoria, Producto, Configuracion, Pedido } from '@/lib/types';
import { MOCK_CATEGORIAS, MOCK_PRODUCTOS, MOCK_CONFIGURACION } from '@/lib/data/mock-data';

export interface HistorialPrecioItem {
  id: string;
  descripcion: string;
  tipo: string;
  created_at: string;
  usuario_email?: string;
}

interface StoreData {
  categorias: Categoria[];
  productos: Producto[];
  configuracion: Configuracion;
  pedidos: Pedido[];
  historial_precios?: HistorialPrecioItem[];
}

const STORE_PATH = path.join(process.cwd(), 'data', 'store.json');

function ensureDataDirectory() {
  const dir = path.dirname(STORE_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

export async function readStore(): Promise<StoreData> {
  ensureDataDirectory();
  if (!fs.existsSync(STORE_PATH)) {
    const initialData: StoreData = {
      categorias: MOCK_CATEGORIAS,
      productos: MOCK_PRODUCTOS,
      configuracion: {
        ...MOCK_CONFIGURACION,
        whatsapp_numero: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '5491162037583',
      },
      pedidos: [],
      historial_precios: [],
    };
    fs.writeFileSync(STORE_PATH, JSON.stringify(initialData, null, 2), 'utf8');
    return initialData;
  }

  try {
    const content = fs.readFileSync(STORE_PATH, 'utf8');
    const parsed = JSON.parse(content) as StoreData;
    if (!parsed.historial_precios) parsed.historial_precios = [];
    return parsed;
  } catch (err) {
    console.error('Error reading store.json, restoring initial data:', err);
    const fallback: StoreData = {
      categorias: MOCK_CATEGORIAS,
      productos: MOCK_PRODUCTOS,
      configuracion: MOCK_CONFIGURACION,
      pedidos: [],
    };
    return fallback;
  }
}

export async function writeStore(data: StoreData): Promise<void> {
  ensureDataDirectory();
  fs.writeFileSync(STORE_PATH, JSON.stringify(data, null, 2), 'utf8');
}

// ==========================================
// CATEGORIAS
// ==========================================

export async function getStoreCategorias(): Promise<Categoria[]> {
  const store = await readStore();
  return store.categorias.sort((a, b) => a.orden - b.orden);
}

export async function getStoreCategoriaPorSlug(slug: string): Promise<Categoria | null> {
  const store = await readStore();
  return store.categorias.find((c) => c.slug === slug) ?? null;
}

export async function getStoreCategoriaPorId(id: string): Promise<Categoria | null> {
  const store = await readStore();
  return store.categorias.find((c) => c.id === id) ?? null;
}

export async function saveStoreCategoria(categoria: Omit<Categoria, 'id' | 'created_at'> & { id?: string }): Promise<Categoria> {
  const store = await readStore();
  const id = categoria.id || 'cat-' + Date.now();
  const now = new Date().toISOString();

  const existingIndex = store.categorias.findIndex((c) => c.id === id);
  const newCat: Categoria = {
    id,
    nombre: categoria.nombre,
    slug: categoria.slug,
    descripcion: categoria.descripcion || null,
    imagen_url: categoria.imagen_url || null,
    orden: Number(categoria.orden) || (store.categorias.length + 1),
    activa: categoria.activa ?? true,
    created_at: existingIndex >= 0 ? store.categorias[existingIndex].created_at : now,
  };

  if (existingIndex >= 0) {
    store.categorias[existingIndex] = newCat;
  } else {
    store.categorias.push(newCat);
  }

  await writeStore(store);
  return newCat;
}

export async function deleteStoreCategoria(id: string): Promise<{ error: string | null }> {
  const store = await readStore();
  const productosAsociados = store.productos.filter((p) => p.categoria_id === id);
  if (productosAsociados.length > 0) {
    return {
      error: `No se puede eliminar la categoría porque tiene ${productosAsociados.length} productos asociados. Primero reasigna o elimina los productos.`,
    };
  }

  store.categorias = store.categorias.filter((c) => c.id !== id);
  await writeStore(store);
  return { error: null };
}

// ==========================================
// PRODUCTOS
// ==========================================

export async function getStoreProductos(): Promise<Producto[]> {
  const store = await readStore();
  const catMap = new Map(store.categorias.map((c) => [c.id, c]));
  return store.productos.map((p) => ({
    ...p,
    categoria: catMap.get(p.categoria_id),
  }));
}

export async function getStoreProductoPorSlug(slug: string): Promise<Producto | null> {
  const store = await readStore();
  const prod = store.productos.find((p) => p.slug === slug);
  if (!prod) return null;
  const cat = store.categorias.find((c) => c.id === prod.categoria_id);
  return { ...prod, categoria: cat };
}

export async function getStoreProductoPorId(id: string): Promise<Producto | null> {
  const store = await readStore();
  const prod = store.productos.find((p) => p.id === id);
  if (!prod) return null;
  const cat = store.categorias.find((c) => c.id === prod.categoria_id);
  return { ...prod, categoria: cat };
}

export async function saveStoreProducto(producto: Omit<Producto, 'id' | 'created_at' | 'updated_at'> & { id?: string }): Promise<Producto> {
  const store = await readStore();
  const id = producto.id || 'prod-' + Date.now();
  const now = new Date().toISOString();

  const existingIndex = store.productos.findIndex((p) => p.id === id);
  const newProd: Producto = {
    ...producto,
    id,
    created_at: existingIndex >= 0 ? store.productos[existingIndex].created_at : now,
    updated_at: now,
  };

  if (existingIndex >= 0) {
    store.productos[existingIndex] = newProd;
  } else {
    store.productos.unshift(newProd);
  }

  await writeStore(store);
  const cat = store.categorias.find((c) => c.id === newProd.categoria_id);
  return { ...newProd, categoria: cat };
}

export async function deleteStoreProducto(id: string): Promise<{ error: string | null }> {
  const store = await readStore();
  store.productos = store.productos.filter((p) => p.id !== id);
  await writeStore(store);
  return { error: null };
}

export async function duplicateStoreProducto(id: string): Promise<Producto | null> {
  const store = await readStore();
  const original = store.productos.find((p) => p.id === id);
  if (!original) return null;

  const now = new Date().toISOString();
  const newId = 'prod-' + Date.now();
  const newNombre = original.nombre + ' (Copia)';
  const newSlug = original.slug + '-copia-' + Math.floor(Math.random() * 1000);

  const copy: Producto = {
    ...original,
    id: newId,
    nombre: newNombre,
    slug: newSlug,
    sku: original.sku ? original.sku + '-COP' : '',
    created_at: now,
    updated_at: now,
  };

  store.productos.unshift(copy);
  await writeStore(store);
  const cat = store.categorias.find((c) => c.id === copy.categoria_id);
  return { ...copy, categoria: cat };
}

export async function bulkUpdatePrecios(updates: { id: string; precio_1kg?: number | null; precio_500g?: number | null; precio_250g?: number | null; precio_unidad?: number | null }[]): Promise<void> {
  const store = await readStore();
  const now = new Date().toISOString();
  const map = new Map(updates.map((u) => [u.id, u]));

  for (const prod of store.productos) {
    const upd = map.get(prod.id);
    if (upd) {
      if (upd.precio_1kg !== undefined) prod.precio_1kg = upd.precio_1kg;
      if (upd.precio_500g !== undefined) prod.precio_500g = upd.precio_500g;
      if (upd.precio_250g !== undefined) prod.precio_250g = upd.precio_250g;
      if (upd.precio_unidad !== undefined) prod.precio_unidad = upd.precio_unidad;
      prod.updated_at = now;
    }
  }

  await writeStore(store);
}

// ==========================================
// CONFIGURACION
// ==========================================

export async function getStoreConfiguracion(): Promise<Configuracion> {
  const store = await readStore();
  return store.configuracion;
}

export async function updateStoreConfiguracion(config: Partial<Configuracion>): Promise<Configuracion> {
  const store = await readStore();
  store.configuracion = {
    ...store.configuracion,
    ...config,
    updated_at: new Date().toISOString(),
  };
  await writeStore(store);
  return store.configuracion;
}

export async function getStoreHistorialPrecios(): Promise<HistorialPrecioItem[]> {
  const store = await readStore();
  return store.historial_precios || [];
}

export async function addStoreHistorialPrecio(item: Omit<HistorialPrecioItem, 'id' | 'created_at'>): Promise<void> {
  const store = await readStore();
  if (!store.historial_precios) {
    store.historial_precios = [];
  }
  store.historial_precios.unshift({
    ...item,
    id: 'hp-' + Date.now(),
    created_at: new Date().toISOString(),
  });
  if (store.historial_precios.length > 50) {
    store.historial_precios = store.historial_precios.slice(0, 50);
  }
  await writeStore(store);
}
