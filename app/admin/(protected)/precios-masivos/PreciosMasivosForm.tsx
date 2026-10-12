'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { aplicarAumentoMasivo, previsualizarAumento, type PreviewAumento } from '@/lib/admin/actions';
import { formatearPrecio } from '@/lib/whatsapp';
import type { Categoria } from '@/lib/types';

type Tipo = 'porcentaje_general' | 'porcentaje_categoria' | 'porcentaje_seleccion';

interface Props {
  categorias: Categoria[];
  productos: { id: string; nombre: string; sku: string }[];
}

export default function PreciosMasivosForm({ categorias, productos }: Props) {
  const router = useRouter();
  const [tipo, setTipo] = useState<Tipo>('porcentaje_general');
  const [porcentaje, setPorcentaje] = useState('10');
  const [categoriaId, setCategoriaId] = useState(categorias[0]?.id ?? '');
  const [seleccionados, setSeleccionados] = useState<string[]>([]);
  const [preview, setPreview] = useState<PreviewAumento[] | null>(null);
  const [cargando, setCargando] = useState(false);
  const [aplicando, setAplicando] = useState(false);
  const [mensaje, setMensaje] = useState<string | null>(null);

  async function generarPreview() {
    setCargando(true);
    setMensaje(null);
    const resultado = await previsualizarAumento(
      tipo,
      Number(porcentaje),
      tipo === 'porcentaje_categoria' ? categoriaId : undefined,
      tipo === 'porcentaje_seleccion' ? seleccionados : undefined
    );
    setPreview(resultado);
    setCargando(false);
  }

  async function confirmar() {
    setAplicando(true);
    const resultado = await aplicarAumentoMasivo(
      tipo,
      Number(porcentaje),
      tipo === 'porcentaje_categoria' ? categoriaId : undefined,
      tipo === 'porcentaje_seleccion' ? seleccionados : undefined
    );
    setAplicando(false);
    setPreview(null);
    setMensaje(`Se actualizaron ${resultado.productosAfectados} productos.`);
    router.refresh();
  }

  return (
    <div className="card mt-6 p-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-forest-700">Tipo de aumento</label>
          <select
            value={tipo}
            onChange={(e) => {
              setTipo(e.target.value as Tipo);
              setPreview(null);
            }}
            className="w-full rounded-lg border border-forest-200 px-3 py-2 focus:border-forest-400 focus:outline-none"
          >
            <option value="porcentaje_general">Todos los productos</option>
            <option value="porcentaje_categoria">Por categoría</option>
            <option value="porcentaje_seleccion">Productos seleccionados</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-forest-700">Porcentaje (%)</label>
          <input
            type="number"
            value={porcentaje}
            onChange={(e) => {
              setPorcentaje(e.target.value);
              setPreview(null);
            }}
            className="w-full rounded-lg border border-forest-200 px-3 py-2 focus:border-forest-400 focus:outline-none"
          />
          <p className="mt-1 text-xs text-forest-400">Usá negativos para descuentos, ej: -10</p>
        </div>

        {tipo === 'porcentaje_categoria' && (
          <div>
            <label className="mb-1 block text-sm font-medium text-forest-700">Categoría</label>
            <select
              value={categoriaId}
              onChange={(e) => {
                setCategoriaId(e.target.value);
                setPreview(null);
              }}
              className="w-full rounded-lg border border-forest-200 px-3 py-2 focus:border-forest-400 focus:outline-none"
            >
              {categorias.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {tipo === 'porcentaje_seleccion' && (
        <div className="mt-4">
          <label className="mb-1 block text-sm font-medium text-forest-700">Productos</label>
          <div className="max-h-48 overflow-y-auto rounded-lg border border-forest-200 p-3">
            {productos.map((p) => (
              <label key={p.id} className="flex items-center gap-2 py-1 text-sm text-forest-700">
                <input
                  type="checkbox"
                  checked={seleccionados.includes(p.id)}
                  onChange={(e) => {
                    setSeleccionados((prev) =>
                      e.target.checked ? [...prev, p.id] : prev.filter((id) => id !== p.id)
                    );
                    setPreview(null);
                  }}
                  className="h-4 w-4 rounded border-forest-300"
                />
                {p.nombre} <span className="text-forest-400">({p.sku})</span>
              </label>
            ))}
          </div>
        </div>
      )}

      <div className="mt-5 flex gap-3">
        <button onClick={generarPreview} disabled={cargando} className="btn-secondary disabled:opacity-50">
          {cargando ? 'Calculando...' : 'Ver vista previa'}
        </button>
        {preview && preview.length > 0 && (
          <button onClick={confirmar} disabled={aplicando} className="btn-primary disabled:opacity-50">
            {aplicando ? 'Aplicando...' : `Confirmar aumento (${preview.length} productos)`}
          </button>
        )}
      </div>

      {mensaje && <p className="mt-3 text-sm text-forest-600">{mensaje}</p>}

      {preview && (
        <div className="mt-6 overflow-x-auto">
          {preview.length === 0 ? (
            <p className="text-sm text-forest-500">No hay productos para este criterio.</p>
          ) : (
            <table className="w-full min-w-[600px] text-left text-sm">
              <thead className="border-b border-forest-100 text-forest-500">
                <tr>
                  <th className="px-3 py-2">Producto</th>
                  <th className="px-3 py-2">1kg</th>
                  <th className="px-3 py-2">500g</th>
                  <th className="px-3 py-2">250g</th>
                  <th className="px-3 py-2">Unidad</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-forest-50">
                {preview.map((p) => (
                  <tr key={p.id}>
                    <td className="px-3 py-2 font-medium text-forest-800">{p.nombre}</td>
                    {(
                      [
                        ['precio_1kg', 'nuevo_precio_1kg'],
                        ['precio_500g', 'nuevo_precio_500g'],
                        ['precio_250g', 'nuevo_precio_250g'],
                        ['precio_unidad', 'nuevo_precio_unidad'],
                      ] as const
                    ).map(([antes, despues]) => (
                      <td key={antes} className="px-3 py-2">
                        {p[antes] ? (
                          <>
                            <span className="text-forest-400 line-through">{formatearPrecio(p[antes]!)}</span>{' '}
                            <span className="font-semibold text-forest-800">
                              {formatearPrecio(p[despues]!)}
                            </span>
                          </>
                        ) : (
                          '—'
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
