import { getStoreProductos } from '@/lib/data/store';

export default async function StockPage() {
  const productos = await getStoreProductos();

  const sinStock = productos.filter((p) => p.stock_actual <= 0);
  const bajoMinimo = productos.filter((p) => p.stock_actual > 0 && p.stock_actual <= p.stock_minimo);

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-forest-800">Control de Stock</h1>
      <p className="mt-1 text-sm text-forest-500">
        Monitoreá el nivel de inventario de todos los productos y recibí alertas de reposición.
      </p>

      {sinStock.length > 0 && (
        <div className="card mt-6 border-l-4 border-terracotta-500 p-5 bg-terracotta-50/30">
          <h2 className="font-display text-lg font-semibold text-terracotta-600 flex items-center gap-2">
            <span>⚠️</span> Sin stock ({sinStock.length})
          </h2>
          <ul className="mt-3 divide-y divide-forest-50 text-sm">
            {sinStock.map((p) => (
              <li key={p.id} className="flex justify-between py-2 items-center">
                <span className="font-medium text-forest-800">{p.nombre}</span>
                <span className="text-forest-500 text-xs bg-white px-2 py-1 rounded border border-forest-100">{p.categoria?.nombre || 'General'}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {bajoMinimo.length > 0 && (
        <div className="card mt-6 border-l-4 border-amber-400 p-5 bg-amber-50/30">
          <h2 className="font-display text-lg font-semibold text-amber-800 flex items-center gap-2">
            <span>⚡</span> Stock bajo el mínimo ({bajoMinimo.length})
          </h2>
          <ul className="mt-3 divide-y divide-forest-50 text-sm">
            {bajoMinimo.map((p) => (
              <li key={p.id} className="flex justify-between py-2 items-center">
                <span className="font-medium text-forest-800">{p.nombre}</span>
                <span className="text-forest-600 font-semibold text-xs bg-white px-2 py-1 rounded border border-forest-100">
                  {p.stock_actual} / mín. {p.stock_minimo}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="card mt-6 overflow-x-auto p-5">
        <h2 className="mb-4 font-display text-lg font-semibold text-forest-800">Inventario general</h2>
        <table className="w-full min-w-[600px] text-left text-sm">
          <thead className="border-b border-forest-100 text-forest-500">
            <tr>
              <th className="px-3 py-2">Producto</th>
              <th className="px-3 py-2">Categoría</th>
              <th className="px-3 py-2">SKU</th>
              <th className="px-3 py-2">Stock actual</th>
              <th className="px-3 py-2">Stock mínimo</th>
              <th className="px-3 py-2">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-forest-50">
            {productos.map((p) => {
              const esCritico = p.stock_actual <= 0;
              const esBajo = p.stock_actual > 0 && p.stock_actual <= p.stock_minimo;
              return (
                <tr key={p.id} className="hover:bg-forest-50/50">
                  <td className="px-3 py-2.5 font-medium text-forest-800">{p.nombre}</td>
                  <td className="px-3 py-2.5 text-forest-500">{p.categoria?.nombre || 'General'}</td>
                  <td className="px-3 py-2.5 text-xs text-forest-400 font-mono">{p.sku || '—'}</td>
                  <td className="px-3 py-2.5">
                    <span className={`font-semibold ${esCritico ? 'text-terracotta-600' : esBajo ? 'text-amber-600' : 'text-forest-800'}`}>
                      {p.stock_actual}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-forest-500">{p.stock_minimo}</td>
                  <td className="px-3 py-2.5">
                    {esCritico ? (
                      <span className="rounded-full bg-terracotta-100 px-2 py-0.5 text-xs font-semibold text-terracotta-700">Sin stock</span>
                    ) : esBajo ? (
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">Stock bajo</span>
                    ) : (
                      <span className="rounded-full bg-forest-100 px-2 py-0.5 text-xs font-semibold text-forest-700">Óptimo</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
