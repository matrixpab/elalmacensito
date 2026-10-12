import Link from 'next/link';
import type { Categoria } from '@/lib/types';
import { SITE_NAME } from '@/lib/site';

export default function Footer({ categorias }: { categorias: Categoria[] }) {
  return (
    <footer className="mt-16 border-t border-forest-100 bg-forest-800 text-cream-100">
      <div className="mx-auto grid max-w-7xl gap-8 px-6 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <h3 className="font-display text-xl font-bold text-white">{SITE_NAME}</h3>
          <p className="mt-2 text-sm text-forest-100">Productos que hacen bien.</p>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-forest-200">
            Categorías
          </h4>
          <ul className="space-y-1.5 text-sm">
            {categorias.slice(0, 6).map((c) => (
              <li key={c.id}>
                <Link href={`/categoria/${c.slug}`} className="hover:text-terracotta-200">
                  {c.nombre}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-forest-200">
            Ayuda
          </h4>
          <ul className="space-y-1.5 text-sm">
            <li>
              <Link href="/#envios" className="hover:text-terracotta-200">
                Envíos
              </Link>
            </li>
            <li>
              <Link href="/#faq" className="hover:text-terracotta-200">
                Preguntas frecuentes
              </Link>
            </li>
            <li>
              <Link href="/#contacto" className="hover:text-terracotta-200">
                Contacto
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-forest-200">
            Hierbas medicinales en Argentina
          </h4>
          <p className="text-sm text-forest-100">
            Dietética online Argentina. Comprá yuyos online, productos naturales y hierbas
            medicinales con envíos a todo el país.
          </p>
        </div>
      </div>
      <div className="border-t border-forest-700 py-4 text-center text-xs text-forest-300">
        © {new Date().getFullYear()} {SITE_NAME}. Todos los derechos reservados.
      </div>
    </footer>
  );
}
