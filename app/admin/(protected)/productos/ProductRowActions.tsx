'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { duplicarProducto, eliminarProducto, toggleActivoProducto } from '@/lib/admin/actions';

export default function ProductRowActions({ id, activo }: { id: string; activo: boolean }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex flex-wrap gap-2 text-xs">
      <Link href={`/admin/productos/${id}`} className="rounded-full bg-forest-50 px-3 py-1 font-semibold text-forest-700 hover:bg-forest-100">
        Editar
      </Link>
      <button
        disabled={isPending}
        onClick={() =>
          startTransition(async () => {
            await toggleActivoProducto(id, !activo);
            router.refresh();
          })
        }
        className="rounded-full bg-forest-50 px-3 py-1 font-semibold text-forest-700 hover:bg-forest-100 disabled:opacity-50"
      >
        {activo ? 'Desactivar' : 'Activar'}
      </button>
      <button
        disabled={isPending}
        onClick={() =>
          startTransition(async () => {
            await duplicarProducto(id);
            router.refresh();
          })
        }
        className="rounded-full bg-forest-50 px-3 py-1 font-semibold text-forest-700 hover:bg-forest-100 disabled:opacity-50"
      >
        Duplicar
      </button>
      <button
        disabled={isPending}
        onClick={() =>
          startTransition(async () => {
            if (!confirm('¿Eliminar este producto? Esta acción no se puede deshacer.')) return;
            await eliminarProducto(id);
            router.refresh();
          })
        }
        className="rounded-full bg-terracotta-50 px-3 py-1 font-semibold text-terracotta-600 hover:bg-terracotta-100 disabled:opacity-50"
      >
        Eliminar
      </button>
    </div>
  );
}
