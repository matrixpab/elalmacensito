'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { actualizarEstadoPedido } from '@/lib/admin/actions';
import type { EstadoPedido } from '@/lib/types';

const ESTADOS: { value: EstadoPedido; label: string }[] = [
  { value: 'pendiente', label: 'Pendiente' },
  { value: 'en_preparacion', label: 'En preparación' },
  { value: 'entregado', label: 'Entregado' },
];

export default function PedidoEstadoSelect({ id, estadoActual }: { id: string; estadoActual: EstadoPedido }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <select
      defaultValue={estadoActual}
      disabled={isPending}
      onChange={(e) =>
        startTransition(async () => {
          await actualizarEstadoPedido(id, e.target.value as EstadoPedido);
          router.refresh();
        })
      }
      className="rounded-full border border-forest-200 px-3 py-1.5 text-xs font-semibold text-forest-700 focus:outline-none"
    >
      {ESTADOS.map((e) => (
        <option key={e.value} value={e.value}>
          {e.label}
        </option>
      ))}
    </select>
  );
}
