'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';

const LINKS = [
  { href: '/admin', label: '📊 Dashboard / Resumen' },
  { href: '/admin/productos', label: '📦 Productos' },
  { href: '/admin/categorias', label: '🌿 Categorías' },
  { href: '/admin/precios-masivos', label: '💵 Precios Rápidos' },
  { href: '/admin/stock', label: '📈 Control de Stock' },
  { href: '/admin/pedidos', label: '🛒 Pedidos Recibidos' },
  { href: '/admin/excel', label: '📑 Importar / Exportar Excel' },
  { href: '/admin/configuracion', label: '⚙️ Configuración' },
];

export default function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();

  async function cerrarSesion() {
    try {
      await fetch('/api/admin/auth/logout', { method: 'POST' });
    } catch {
      // ignore
    }
    router.replace('/admin/login');
    router.refresh();
  }

  return (
    <aside className="w-full shrink-0 border-b border-forest-100 bg-white lg:min-h-screen lg:w-64 lg:border-b-0 lg:border-r shadow-xs">
      <div className="p-5 border-b border-forest-50 flex items-center gap-3">
        <div className="relative h-10 w-10 overflow-hidden rounded-full ring-2 ring-forest-600/20 shrink-0">
          <Image src="/logo.png" alt="El Almacencito" fill className="object-cover" />
        </div>
        <div>
          <span className="font-display text-base font-extrabold text-forest-900 block leading-tight">
            El Almacencito
          </span>
          <p className="text-[11px] text-forest-500 font-semibold uppercase tracking-wider">
            Panel Administrador
          </p>
        </div>
      </div>

      <nav className="flex flex-wrap gap-1 p-3 lg:flex-col">
        {LINKS.map((link) => {
          const isActive = pathname === link.href || (link.href !== '/admin' && pathname.startsWith(link.href));
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold transition ${
                isActive
                  ? 'bg-forest-700 text-white shadow-sm'
                  : 'text-forest-700 hover:bg-forest-50'
              }`}
            >
              {link.label}
            </Link>
          );
        })}

        <div className="my-3 border-t border-forest-100 pt-3 flex flex-col gap-1 w-full">
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 transition"
          >
            <span>↗ Ver Tienda Pública</span>
          </Link>

          <button
            onClick={cerrarSesion}
            className="flex items-center gap-2 rounded-xl px-3.5 py-2 text-left text-xs font-semibold text-red-600 hover:bg-red-50 transition"
          >
            <span>🚪 Cerrar Sesión</span>
          </button>
        </div>
      </nav>
    </aside>
  );
}