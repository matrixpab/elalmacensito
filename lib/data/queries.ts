'use server';

import { createClient } from '@/lib/supabase/server';
import type { Categoria, Producto, Configuracion } from '@/lib/types';
import {
  getStoreCategorias,
  getStoreCategoriaPorSlug,
  getStoreProductos,
  getStoreProductoPorSlug,
  getStoreConfiguracion,
} from './store';

function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return false;
  if (url.includes('your-project') || key.includes('your-anon-key') || url.includes('placeholder')) return false;
  return true;
}

export async function getCategorias(): Promise<Categoria[]> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from('categorias')
        .select('*')
        .eq('activa', true)
        .order('orden', { ascending: true });
      if (!error && data && data.length > 0) return data as Categoria[];
    } catch {
      // Fallback a store
    }
  }
  const categorias = await getStoreCategorias();
  return categorias.filter((c) => c.activa);
}

export async function getCategoriaPorSlug(slug: string): Promise<Categoria | null> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const { data } = await supabase.from('categorias').select('*').eq('slug', slug).single();
      if (data) return data as Categoria;
    } catch {
      // Fallback
    }
  }
  return await getStoreCategoriaPorSlug(slug);
}

export async function getProductosDestacados(limit = 8): Promise<Producto[]> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from('productos')
        .select('*, categoria:categorias(*)')
        .eq('activo', true)
        .eq('destacado', true)
        .limit(limit);
      if (!error && data && data.length > 0) return data as Producto[];
    } catch {
      // Fallback
    }
  }
  const prods = await getStoreProductos();
  return prods.filter((p) => p.activo && p.destacado).slice(0, limit);
}

export async function getProductosEnPromocion(limit = 8): Promise<Producto[]> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from('productos')
        .select('*, categoria:categorias(*)')
        .eq('activo', true)
        .eq('en_promocion', true)
        .limit(limit);
      if (!error && data && data.length > 0) return data as Producto[];
    } catch {
      // Fallback
    }
  }
  const prods = await getStoreProductos();
  return prods.filter((p) => p.activo && p.en_promocion).slice(0, limit);
}

export async function getProductosPorCategoria(categoriaSlug: string): Promise<Producto[]> {
  const prods = await getStoreProductos();
  const cat = await getStoreCategoriaPorSlug(categoriaSlug);
  
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const { data: productos } = await supabase
        .from('productos')
        .select('*, categoria:categorias(*)')
        .eq('activo', true);
      if (productos && productos.length > 0) {
        return productos.filter(
          (p) => p.categoria?.slug === categoriaSlug || p.categoria_id === cat?.id
        ) as Producto[];
      }
    } catch {
      // Fallback
    }
  }

  return prods.filter(
    (p) => p.activo && (p.categoria?.slug === categoriaSlug || p.categoria_id === cat?.id)
  );
}

export async function getProductoPorSlug(slug: string): Promise<Producto | null> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const { data } = await supabase
        .from('productos')
        .select('*, categoria:categorias(*)')
        .eq('slug', slug)
        .eq('activo', true)
        .single();
      if (data) return data as Producto;
    } catch {
      // Fallback
    }
  }
  const prod = await getStoreProductoPorSlug(slug);
  return prod && prod.activo ? prod : null;
}

export async function getTodosLosProductos(): Promise<Producto[]> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const { data } = await supabase
        .from('productos')
        .select('*, categoria:categorias(*)')
        .eq('activo', true);
      if (data && data.length > 0) return data as Producto[];
    } catch {
      // Fallback
    }
  }
  const prods = await getStoreProductos();
  return prods.filter((p) => p.activo);
}

export async function getConfiguracion(): Promise<Configuracion> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const { data } = await supabase.from('configuracion').select('*').eq('id', 1).single();
      if (data) return data as Configuracion;
    } catch {
      // Fallback
    }
  }
  return await getStoreConfiguracion();
}
