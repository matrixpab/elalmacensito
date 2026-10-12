import Link from 'next/link';
import Image from 'next/image';
import type { Producto } from '@/lib/types';
import { formatearPrecio } from '@/lib/whatsapp';

export default function ProductCard({ producto }: { producto: Producto }) {
  const precioDesde =
    producto.precio_250g ?? producto.precio_unidad ?? producto.precio_500g ?? producto.precio_1kg;

  const sinStock = producto.stock_actual <= 0;

  return (
    <Link
      href={`/producto/${producto.slug}`}
      className="card group flex flex-col overflow-hidden transition hover:-translate-y-1 hover:shadow-soft"
    >
      <div className="relative aspect-square w-full overflow-hidden bg-forest-50">
        {producto.imagen_principal ? (
          <Image
            src={producto.imagen_principal}
            alt={producto.nombre}
            fill
            className="object-cover transition duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, 25vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-4xl">🌿</div>
        )}
        {producto.en_promocion && <span className="badge absolute left-3 top-3">Promo</span>}
        {sinStock && (
          <span className="absolute right-3 top-3 rounded-full bg-forest-800/80 px-3 py-1 text-xs font-semibold text-white">
            Sin stock
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-4">
        {producto.categoria && (
          <span className="text-xs font-medium uppercase tracking-wide text-forest-400">
            {producto.categoria.nombre}
          </span>
        )}
        <h3 className="font-display text-base font-semibold text-forest-800">{producto.nombre}</h3>
        {precioDesde && (
          <p className="mt-auto pt-2 text-sm text-forest-600">
            Desde <span className="font-bold text-forest-800">{formatearPrecio(precioDesde)}</span>
          </p>
        )}
      </div>
    </Link>
  );
}
