'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface ResultadoImportacion {
  creados: number;
  actualizados: number;
  errores: string[];
}

export default function ExcelPage() {
  const router = useRouter();
  const [subiendo, setSubiendo] = useState(false);
  const [resultado, setResultado] = useState<ResultadoImportacion | null>(null);

  async function handleImportar(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setSubiendo(true);
    setResultado(null);

    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch('/api/admin/excel/importar', { method: 'POST', body: formData });
    const data = await res.json();
    setResultado(data);
    setSubiendo(false);
    router.refresh();
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-forest-800">Excel</h1>
      <p className="mt-1 text-sm text-forest-500">
        Exportá todos los productos a un archivo Excel, o importá un archivo para crear/actualizar
        productos en lote (se matchea por SKU).
      </p>

      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        <div className="card p-6">
          <h2 className="font-display text-lg font-semibold text-forest-800">Exportar</h2>
          <p className="mt-1 text-sm text-forest-500">Descargá el catálogo completo en formato .xlsx.</p>
          <a href="/api/admin/excel/exportar" className="btn-primary mt-4 inline-flex">
            ⬇ Descargar Excel
          </a>
        </div>

        <div className="card p-6">
          <h2 className="font-display text-lg font-semibold text-forest-800">Importar</h2>
          <p className="mt-1 text-sm text-forest-500">
            Subí un archivo .xlsx con las columnas: sku, nombre, categoria, descripcion_larga,
            beneficios, precio_1kg, precio_500g, precio_250g, precio_unidad, stock_actual,
            stock_minimo, palabras_clave, activo, destacado, en_promocion.
          </p>
          <label className="btn-secondary mt-4 inline-flex cursor-pointer">
            {subiendo ? 'Importando...' : '⬆ Subir Excel'}
            <input type="file" accept=".xlsx,.xls" className="hidden" onChange={handleImportar} disabled={subiendo} />
          </label>
        </div>
      </div>

      {resultado && (
        <div className="card mt-6 p-5">
          <p className="text-sm text-forest-700">
            <strong>{resultado.creados}</strong> productos creados, <strong>{resultado.actualizados}</strong>{' '}
            actualizados.
          </p>
          {resultado.errores.length > 0 && (
            <div className="mt-3">
              <p className="text-sm font-semibold text-terracotta-600">Errores:</p>
              <ul className="mt-1 list-inside list-disc text-sm text-terracotta-500">
                {resultado.errores.map((e, i) => (
                  <li key={i}>{e}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
