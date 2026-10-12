import { getStoreCategorias, getStoreProductos, getStoreHistorialPrecios } from '@/lib/data/store';
import PreciosMasivosForm from './PreciosMasivosForm';

export default async function PreciosMasivosPage() {
  const [categorias, productos, historial] = await Promise.all([
    getStoreCategorias(),
    getStoreProductos(),
    getStoreHistorialPrecios(),
  ]);

  const productosSimples = productos
    .filter((p) => p.activo)
    .map((p) => ({ id: p.id, nombre: p.nombre, sku: p.sku || '' }));

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-forest-800">Actualización masiva de precios</h1>
      <p className="mt-1 text-sm text-forest-500">
        Aumentá precios por porcentaje general, por categoría o por selección de productos. Vas a ver
        una vista previa antes de confirmar.
      </p>

      <PreciosMasivosForm categorias={categorias} productos={productosSimples} />

      <div className="card mt-10 p-5">
        <h2 className="mb-4 font-display text-lg font-semibold text-forest-800">
          Historial de cambios
        </h2>
        {historial.length === 0 ? (
          <p className="text-sm text-forest-500">Todavía no hay cambios registrados.</p>
        ) : (
          <div className="divide-y divide-forest-50 text-sm">
            {historial.map((h) => (
              <div key={h.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium text-forest-800">{h.descripcion}</p>
                  <p className="text-xs text-forest-400">
                    {new Date(h.created_at).toLocaleString('es-AR')} {h.usuario_email ? `· ${h.usuario_email}` : ''}
                  </p>
                </div>
                <span className="rounded-full bg-forest-50 px-3 py-1 text-xs font-semibold text-forest-600">
                  {h.tipo}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
