'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import type { Producto, UnidadVenta } from '@/lib/types';
import { formatearPrecio } from '@/lib/whatsapp';
import { useCart } from './CartProvider';
import { trackViewItem } from '@/lib/analytics';

interface OpcionPrecio {
  unidad: UnidadVenta;
  etiqueta: string;
  precio: number;
}

export default function ProductDetail({ producto }: { producto: Producto }) {
  const { agregar } = useCart();
  const [cantidad, setCantidad] = useState(1);
  const [agregado, setAgregado] = useState(false);

  const opciones: OpcionPrecio[] = [
    producto.precio_1kg ? { unidad: '1kg', etiqueta: '1 kg', precio: producto.precio_1kg } : null,
    producto.precio_500g ? { unidad: '500g', etiqueta: '500 g', precio: producto.precio_500g } : null,
    producto.precio_250g ? { unidad: '250g', etiqueta: '250 g', precio: producto.precio_250g } : null,
    producto.precio_unidad
      ? { unidad: 'unidad', etiqueta: 'Unidad', precio: producto.precio_unidad }
      : null,
  ].filter(Boolean) as OpcionPrecio[];

  const [unidadSeleccionada, setUnidadSeleccionada] = useState<UnidadVenta>(
    opciones[0]?.unidad ?? '1kg'
  );

  useEffect(() => {
    trackViewItem({
      item_id: producto.id,
      item_name: producto.nombre,
      item_category: producto.categoria?.nombre,
      price: opciones[0]?.precio,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [producto.id]);

  const opcionActual = opciones.find((o) => o.unidad === unidadSeleccionada) ?? opciones[0];
  const sinStock = producto.stock_actual <= 0;

  const imagenes = [producto.imagen_principal, ...(producto.imagenes_secundarias ?? [])].filter(
    Boolean
  ) as string[];
  const [imagenActiva, setImagenActiva] = useState(0);

  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-6 py-12 lg:grid-cols-2">
      <div>
        <div className="relative aspect-square overflow-hidden rounded-xl2 bg-forest-50 shadow-card">
          {imagenes[imagenActiva] ? (
            <Image
              src={imagenes[imagenActiva]}
              alt={producto.nombre}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
          ) : (
            <div className="flex h-full items-center justify-center text-6xl">🌿</div>
          )}
        </div>
        {imagenes.length > 1 && (
          <div className="mt-4 flex gap-2">
            {imagenes.map((img, i) => (
              <button
                key={img + i}
                onClick={() => setImagenActiva(i)}
                className={`relative h-16 w-16 overflow-hidden rounded-lg ring-2 ${
                  i === imagenActiva ? 'ring-forest-600' : 'ring-transparent'
                }`}
              >
                <Image src={img} alt="" fill className="object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div>
        {producto.categoria && (
          <span className="text-xs font-medium uppercase tracking-wide text-forest-400">
            {producto.categoria.nombre}
          </span>
        )}
        <h1 className="mt-1 font-display text-3xl font-bold text-forest-900">{producto.nombre}</h1>

        {producto.beneficios?.length > 0 && (
          <ul className="mt-4 flex flex-wrap gap-2">
            {producto.beneficios.map((b) => (
              <li key={b} className="badge">
                {b}
              </li>
            ))}
          </ul>
        )}

        <p className="mt-5 text-forest-700">{producto.descripcion_larga}</p>

        {opciones.length > 0 && (
          <div className="mt-6">
            <p className="mb-2 text-sm font-semibold text-forest-800">Presentación</p>
            <div className="flex flex-wrap gap-2">
              {opciones.map((o) => (
                <button
                  key={o.unidad}
                  onClick={() => setUnidadSeleccionada(o.unidad)}
                  className={`rounded-full border-2 px-4 py-2 text-sm font-medium transition ${
                    o.unidad === unidadSeleccionada
                      ? 'border-forest-600 bg-forest-600 text-white'
                      : 'border-forest-200 text-forest-700 hover:border-forest-400'
                  }`}
                >
                  {o.etiqueta} — {formatearPrecio(o.precio)}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 flex items-center gap-4">
          <div className="flex items-center rounded-full border border-forest-200">
            <button
              className="px-3 py-2 text-lg text-forest-700"
              onClick={() => setCantidad((c) => Math.max(1, c - 1))}
            >
              −
            </button>
            <span className="w-8 text-center font-semibold">{cantidad}</span>
            <button
              className="px-3 py-2 text-lg text-forest-700"
              onClick={() => setCantidad((c) => c + 1)}
            >
              +
            </button>
          </div>

          <button
            disabled={sinStock || !opcionActual}
            onClick={() => {
              if (!opcionActual) return;
              agregar({
                producto_id: producto.id,
                nombre: producto.nombre,
                slug: producto.slug,
                unidad: opcionActual.unidad,
                precio: opcionActual.precio,
                cantidad,
                imagen: producto.imagen_principal,
              });
              setAgregado(true);
              setTimeout(() => setAgregado(false), 2000);
            }}
            className="btn-primary flex-1 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {sinStock ? 'Sin stock' : agregado ? '✓ Agregado' : 'Agregar al carrito'}
          </button>
        </div>

        {producto.stock_actual > 0 && producto.stock_actual <= producto.stock_minimo && (
          <p className="mt-3 text-sm text-terracotta-500">¡Últimas unidades disponibles!</p>
        )}
      </div>
    </div>
  );
}
