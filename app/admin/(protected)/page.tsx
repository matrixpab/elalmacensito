import Link from 'next/link';
import { getStoreProductos, getStoreCategorias, readStore } from '@/lib/data/store';

export default async function AdminDashboard() {
  const [productos, categorias, store] = await Promise.all([
    getStoreProductos(),
    getStoreCategorias(),
    readStore(),
  ]);

  const totalProductos = productos.length;
  const productosActivos = productos.filter((p) => p.activo).length;
  const productosInactivos = productos.filter((p) => !p.activo).length;
  const totalCategorias = categorias.length;
  const categoriasActivas = categorias.filter((c) => c.activa).length;

  const sinStock = productos.filter((p) => p.stock_actual <= 0).length;
  const bajoMinimo = productos.filter(
    (p) => p.stock_actual > 0 && p.stock_actual <= p.stock_minimo
  ).length;

  const pedidos = store.pedidos || [];
  const pedidosPendientes = pedidos.filter((p) => p.estado === 'pendiente').length;

  const tarjetas = [
    {
      titulo: 'Total Productos',
      subtitulo: `${productosActivos} activos • ${productosInactivos} borradores`,
      valor: totalProductos,
      href: '/admin/productos',
      color: 'bg-emerald-600',
      icono: '📦',
    },
    {
      titulo: 'Categorías',
      subtitulo: `${categoriasActivas} publicadas en la tienda`,
      valor: totalCategorias,
      href: '/admin/categorias',
      color: 'bg-forest-700',
      icono: '🌿',
    },
    {
      titulo: 'Stock Bajo / Alertas',
      subtitulo: `${sinStock} agotados • ${bajoMinimo} por reponer`,
      valor: sinStock + bajoMinimo,
      href: '/admin/stock',
      color: 'bg-amber-500',
      icono: '⚠️',
    },
    {
      titulo: 'Pedidos Registrados',
      subtitulo: `${pedidosPendientes} pendientes de entrega`,
      valor: pedidos.length,
      href: '/admin/pedidos',
      color: 'bg-[#25D366]',
      icono: '🛒',
    },
  ];

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Encabezado del Dashboard */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-forest-100 shadow-xs">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
            Panel de Control
          </span>
          <h1 className="mt-2 font-display text-2xl sm:text-3xl font-extrabold text-forest-900">
            Resumen General de El Almacencito
          </h1>
          <p className="text-xs sm:text-sm text-forest-600 mt-1">
            Administrá tu catálogo, actualizá precios masivamente y gestioná tus pedidos desde aquí.
          </p>
        </div>

        {/* Accesos rápidos destacados */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/admin/productos/nuevo"
            className="inline-flex items-center gap-1.5 rounded-full bg-forest-700 hover:bg-forest-800 text-white px-4 py-2.5 text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition transform active:scale-95"
          >
            <span>+</span>
            <span>Nuevo Producto</span>
          </Link>
          <Link
            href="/admin/categorias"
            className="inline-flex items-center gap-1.5 rounded-full border border-forest-300 bg-white hover:bg-forest-50 text-forest-800 px-4 py-2.5 text-xs sm:text-sm font-bold shadow-xs transition"
          >
            <span>+</span>
            <span>Nueva Categoría</span>
          </Link>
          <Link
            href="/admin/precios-masivos"
            className="inline-flex items-center gap-1.5 rounded-full bg-amber-500 hover:bg-amber-600 text-white px-4 py-2.5 text-xs sm:text-sm font-bold shadow-xs transition"
          >
            <span>💵</span>
            <span>Precios Rápidos</span>
          </Link>
        </div>
      </div>

      {/* Tarjetas métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {tarjetas.map((t) => (
          <Link
            key={t.titulo}
            href={t.href}
            className="bg-white p-5 rounded-2xl border border-forest-100 shadow-xs hover:shadow-md transition-all transform hover:-translate-y-0.5 group"
          >
            <div className="flex items-center justify-between">
              <span className="text-2xl">{t.icono}</span>
              <span className={`inline-block h-2 w-8 rounded-full ${t.color}`} />
            </div>
            <p className="mt-4 text-3xl font-extrabold text-forest-900 group-hover:text-forest-700 transition">
              {t.valor}
            </p>
            <p className="text-sm font-bold text-forest-800 mt-0.5">{t.titulo}</p>
            <p className="text-xs text-forest-500 mt-1">{t.subtitulo}</p>
          </Link>
        ))}
      </div>

      {/* Grid de 2 columnas: Alertas de Stock y Productos Recientes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Productos con alerta de stock */}
        <div className="bg-white p-6 rounded-2xl border border-forest-100 shadow-xs">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-forest-50">
            <h2 className="font-display text-lg font-bold text-forest-900 flex items-center gap-2">
              <span>⚠️</span>
              <span>Control de Reposición y Stock</span>
            </h2>
            <Link href="/admin/stock" className="text-xs font-bold text-emerald-700 hover:underline">
              Ver todos →
            </Link>
          </div>

          {sinStock + bajoMinimo === 0 ? (
            <div className="py-8 text-center text-forest-500 text-sm">
              <span className="text-3xl block mb-2">🎉</span>
              ¡Excelente! No hay productos agotados ni por debajo del stock mínimo.
            </div>
          ) : (
            <div className="divide-y divide-forest-50">
              {productos
                .filter((p) => p.stock_actual <= p.stock_minimo)
                .slice(0, 5)
                .map((p) => (
                  <div key={p.id} className="py-3 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-forest-900 text-sm">{p.nombre}</p>
                      <p className="text-forest-500">Mínimo requerido: {p.stock_minimo} u.</p>
                    </div>
                    <div className="text-right">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full font-bold ${
                          p.stock_actual <= 0
                            ? 'bg-red-100 text-red-700'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {p.stock_actual <= 0 ? 'Agotado (0 u.)' : `Quedan ${p.stock_actual} u.`}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* Categorías Principales */}
        <div className="bg-white p-6 rounded-2xl border border-forest-100 shadow-xs">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-forest-50">
            <h2 className="font-display text-lg font-bold text-forest-900 flex items-center gap-2">
              <span>🌿</span>
              <span>Categorías del Catálogo</span>
            </h2>
            <Link href="/admin/categorias" className="text-xs font-bold text-emerald-700 hover:underline">
              Administrar →
            </Link>
          </div>

          <div className="divide-y divide-forest-50">
            {categorias.slice(0, 6).map((c) => {
              const count = productos.filter((p) => p.categoria_id === c.id).length;
              return (
                <div key={c.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    <span className="font-bold text-forest-900">{c.nombre}</span>
                    <span className="text-stone-400 font-mono text-[10px]">/{c.slug}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-forest-600 font-medium">{count} productos</span>
                    <span
                      className={`px-2 py-0.5 rounded-full font-semibold text-[10px] ${
                        c.activa ? 'bg-emerald-50 text-emerald-700' : 'bg-stone-100 text-stone-500'
                      }`}
                    >
                      {c.activa ? 'Activa' : 'Inactiva'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}