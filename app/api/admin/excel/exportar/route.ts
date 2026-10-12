import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = await createClient();
  const { data: productos, error } = await supabase
    .from('productos')
    .select('*, categoria:categorias(nombre)')
    .order('nombre');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  const filas = (productos ?? []).map((p) => ({
    sku: p.sku,
    nombre: p.nombre,
    categoria: p.categoria?.nombre ?? '',
    descripcion_larga: p.descripcion_larga,
    beneficios: (p.beneficios ?? []).join(', '),
    precio_1kg: p.precio_1kg ?? '',
    precio_500g: p.precio_500g ?? '',
    precio_250g: p.precio_250g ?? '',
    precio_unidad: p.precio_unidad ?? '',
    stock_actual: p.stock_actual,
    stock_minimo: p.stock_minimo,
    palabras_clave: (p.palabras_clave ?? []).join(', '),
    activo: p.activo ? 'SI' : 'NO',
    destacado: p.destacado ? 'SI' : 'NO',
    en_promocion: p.en_promocion ? 'SI' : 'NO',
  }));

  const hoja = XLSX.utils.json_to_sheet(filas);
  const libro = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(libro, hoja, 'Productos');
  const buffer = XLSX.write(libro, { type: 'buffer', bookType: 'xlsx' });

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="productos-el-almacencito.xlsx"',
    },
  });
}
