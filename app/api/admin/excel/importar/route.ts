import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import { createClient } from '@/lib/supabase/server';

function slugify(texto: string): string {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

interface FilaExcel {
  sku: string;
  nombre: string;
  categoria: string;
  descripcion_larga?: string;
  beneficios?: string;
  precio_1kg?: number | string;
  precio_500g?: number | string;
  precio_250g?: number | string;
  precio_unidad?: number | string;
  stock_actual?: number | string;
  stock_minimo?: number | string;
  palabras_clave?: string;
  activo?: string;
  destacado?: string;
  en_promocion?: string;
}

function numeroONull(valor: unknown): number | null {
  if (valor === undefined || valor === null || valor === '') return null;
  const n = Number(valor);
  return Number.isFinite(n) ? n : null;
}

function esSi(valor: unknown): boolean {
  return String(valor ?? '').trim().toUpperCase() === 'SI';
}

export async function POST(request: Request) {
  const supabase = await createClient();

  const formData = await request.formData();
  const file = formData.get('file') as File | null;
  if (!file) return NextResponse.json({ error: 'No se recibió ningún archivo.' }, { status: 400 });

  const arrayBuffer = await file.arrayBuffer();
  const libro = XLSX.read(arrayBuffer, { type: 'array' });
  const hoja = libro.Sheets[libro.SheetNames[0]];
  const filas = XLSX.utils.sheet_to_json<FilaExcel>(hoja);

  const { data: categorias } = await supabase.from('categorias').select('id, nombre');
  const categoriaPorNombre = new Map(
    (categorias ?? []).map((c) => [c.nombre.trim().toLowerCase(), c.id])
  );

  let creados = 0;
  let actualizados = 0;
  const errores: string[] = [];

  for (const fila of filas) {
    if (!fila.sku || !fila.nombre) {
      errores.push(`Fila sin SKU o nombre: ${JSON.stringify(fila)}`);
      continue;
    }

    const categoriaId = categoriaPorNombre.get(String(fila.categoria ?? '').trim().toLowerCase());
    if (!categoriaId) {
      errores.push(`SKU ${fila.sku}: categoría "${fila.categoria}" no encontrada.`);
      continue;
    }

    const payload = {
      nombre: fila.nombre,
      slug: slugify(fila.nombre),
      categoria_id: categoriaId,
      descripcion_larga: fila.descripcion_larga ?? '',
      beneficios: String(fila.beneficios ?? '')
        .split(',')
        .map((b) => b.trim())
        .filter(Boolean),
      precio_1kg: numeroONull(fila.precio_1kg),
      precio_500g: numeroONull(fila.precio_500g),
      precio_250g: numeroONull(fila.precio_250g),
      precio_unidad: numeroONull(fila.precio_unidad),
      stock_actual: numeroONull(fila.stock_actual) ?? 0,
      stock_minimo: numeroONull(fila.stock_minimo) ?? 5,
      sku: fila.sku,
      meta_title: `${fila.nombre} | El Almacencito`,
      meta_description: (fila.descripcion_larga ?? '').slice(0, 155),
      palabras_clave: String(fila.palabras_clave ?? '')
        .split(',')
        .map((k) => k.trim())
        .filter(Boolean),
      activo: fila.activo === undefined ? true : esSi(fila.activo),
      destacado: esSi(fila.destacado),
      en_promocion: esSi(fila.en_promocion),
    };

    const { data: existente } = await supabase
      .from('productos')
      .select('id')
      .eq('sku', fila.sku)
      .maybeSingle();

    if (existente) {
      const { error } = await supabase.from('productos').update(payload).eq('id', existente.id);
      if (error) errores.push(`SKU ${fila.sku}: ${error.message}`);
      else actualizados++;
    } else {
      const { error } = await supabase.from('productos').insert(payload);
      if (error) errores.push(`SKU ${fila.sku}: ${error.message}`);
      else creados++;
    }
  }

  return NextResponse.json({ creados, actualizados, errores });
}
