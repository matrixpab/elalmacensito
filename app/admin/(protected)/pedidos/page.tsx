import { readStore } from '@/lib/data/store';
import PedidoEstadoSelect from './PedidoEstadoSelect';
import { formatearPrecio } from '@/lib/whatsapp';
import type { ItemCarrito } from '@/lib/types';

export default async function PedidosPage() {
  const store = await readStore();
  const pedidos = store.pedidos || [];

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-forest-800">Gestión de Pedidos</h1>
      <p className="mt-1 text-sm text-forest-500">
        Revisá los pedidos recibidos, estados de preparación y detalles de clientes.
      </p>

      <div className="mt-6 space-y-4">
        {pedidos.length === 0 ? (
          <div className="card p-10 text-center">
            <span className="text-4xl">📦</span>
            <p className="mt-3 text-forest-700 font-semibold">Todavía no hay pedidos registrados</p>
            <p className="text-xs text-forest-500 mt-1">
              Los pedidos que tus clientes confirmen por WhatsApp se registrarán aquí.
            </p>
          </div>
        ) : (
          pedidos.map((pedido) => (
            <div key={pedido.id} className="card p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-display font-semibold text-forest-800">{pedido.cliente_nombre}</p>
                  <p className="text-sm text-forest-500">
                    {pedido.cliente_ciudad} · {new Date(pedido.fecha).toLocaleString('es-AR')}
                  </p>
                  {pedido.cliente_telefono && (
                    <p className="text-xs text-forest-400 mt-0.5">Tel: {pedido.cliente_telefono}</p>
                  )}
                </div>
                <PedidoEstadoSelect id={pedido.id} estadoActual={pedido.estado} />
              </div>

              <ul className="mt-4 divide-y divide-forest-50 text-sm">
                {(pedido.items as ItemCarrito[]).map((item, i) => (
                  <li key={i} className="flex justify-between py-1.5">
                    <span>
                      {item.nombre} ({item.unidad}) x{item.cantidad}
                    </span>
                    <span className="font-medium text-forest-700">
                      {formatearPrecio(item.precio * item.cantidad)}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="mt-3 flex justify-between items-center pt-2 border-t border-forest-100">
                <span className="text-xs text-forest-400">ID: {pedido.id}</span>
                <span className="font-bold text-forest-800">
                  Total: {formatearPrecio(pedido.subtotal)}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
