'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { useCart } from './CartProvider';
import SearchBar from './SearchBar';
import type { Categoria } from '@/lib/types';
import { construirLinkWhatsapp } from '@/lib/whatsapp';

const getCategoriaIcono = (slug: string) => {
  if (slug.includes('medicinal')) return '🌿';
  if (slug.includes('kilo')) return '⚖️';
  if (slug.includes('fraccionad')) return '📦';
  if (slug.includes('especia')) return '🌶️';
  if (slug.includes('yerba') || slug.includes('saboriz')) return '🧉';
  if (slug.includes('blend')) return '✨';
  if (slug.includes('infusion')) return '🫖';
  if (slug.includes('fruto') || slug.includes('seco')) return '🥜';
  if (slug.includes('promo')) return '🔥';
  return '🌱';
};

export default function Header({ categorias }: { categorias: Categoria[] }) {
  const { cantidadTotal, subtotal } = useCart();
  const [menuAbierto, setMenuAbierto] = useState(false);

  const whatsappUrl = construirLinkWhatsapp(
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '5491100000000',
    '¡Hola! Quisiera realizar una consulta sobre sus productos.'
  );


  return (
    <header className="sticky top-0 z-40 w-full shadow-sm bg-cream-50/95 backdrop-blur-md">
      {/* Top Banner de anuncio */}
      <div className="bg-gradient-to-r from-forest-900 via-forest-800 to-forest-900 text-cream-100 py-1.5 px-4 text-xs sm:text-sm font-medium">
        <div className="mx-auto max-w-7xl flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 overflow-hidden whitespace-nowrap">
            <span className="inline-block rounded-full bg-terracotta-500 px-2 py-0.5 text-[10px] uppercase tracking-wider font-extrabold text-white">
              Envíos Nacionales
            </span>
            <span>🌿 Venta por menor y por mayor a todo el país</span>
          </div>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1 text-emerald-300 hover:text-white transition font-semibold hover:underline"
          >
            <span>💬 Asesoramiento directo</span>
          </a>
        </div>
      </div>

      {/* Header Principal */}
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6">
        {/* Logo & Marca */}
        <Link href="/" className="flex items-center gap-3 shrink-0 group">
          <div className="relative h-12 w-12 overflow-hidden rounded-full ring-2 ring-forest-600/30 transition-transform group-hover:scale-105 shadow-md">
            <Image
              src="/logo.png"
              alt="El Almacencito"
              fill
              className="object-cover"
              priority
            />
          </div>
          <div className="flex flex-col">
            <span className="font-display text-xl font-extrabold tracking-tight text-forest-900 sm:text-2xl leading-none">
              El Almacencito
            </span>
            <span className="text-[11px] font-semibold text-terracotta-600 tracking-wider uppercase">
              Hierbas & Productos Naturales
            </span>
          </div>
        </Link>

        {/* Buscador inteligente en Desktop */}
        <div className="hidden flex-1 max-w-md lg:block">
          <SearchBar categorias={categorias} />
        </div>

        {/* Botones de acción llamativos */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Botón CTA destacado WhatsApp */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md hover:bg-emerald-500 hover:shadow-lg transition-all transform active:scale-95 animate-pulse-subtle"
          >
            <span className="text-base leading-none">💬</span>
            <span>Consultar por WhatsApp</span>
          </a>

          {/* Botón Carrito */}
          <Link
            href="/carrito"
            className="relative flex items-center gap-2 rounded-full border-2 border-forest-700/20 bg-white px-3.5 py-2 text-forest-800 font-bold hover:bg-forest-50 hover:border-forest-600 transition shadow-sm"
            aria-label="Carrito"
          >
            <span className="text-lg leading-none">🛒</span>
            <span className="hidden sm:inline text-xs font-bold text-forest-900">
              {cantidadTotal > 0 ? `$${subtotal.toLocaleString('es-AR')}` : 'Mi Carrito'}
            </span>
            {cantidadTotal > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-terracotta-500 text-[11px] font-extrabold text-white shadow">
                {cantidadTotal}
              </span>
            )}
          </Link>

          {/* Toggle buscador en Mobile */}
          <button
            className="lg:hidden rounded-full p-2.5 text-forest-800 hover:bg-forest-100/60"
            onClick={() => setMenuAbierto((v) => !v)}
            aria-label="Buscar"
          >
            🔍
          </button>
        </div>
      </div>

      {/* Buscador desplegable Mobile */}
      {menuAbierto && (
        <div className="border-t border-forest-100 bg-white px-4 py-3 lg:hidden shadow-inner">
          <SearchBar categorias={categorias} />
        </div>
      )}

      {/* Barra de Navegación por Categorías (Sección Principal y Destacada) */}
      <nav className="w-full bg-forest-900 border-t border-b border-forest-800 shadow-md">
        <div className="mx-auto max-w-7xl">
          <div className="no-scrollbar overflow-x-auto flex items-center gap-2 px-4 py-3 sm:px-6 md:justify-center md:flex-wrap">
            {categorias.map((c) => {
              const isPromo = c.slug === 'promociones';
              const icono = getCategoriaIcono(c.slug);

              if (isPromo) {
                return (
                  <Link
                    key={c.id}
                    href={`/categoria/${c.slug}`}
                    className="shrink-0 flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-500 via-terracotta-500 to-terracotta-600 px-5 py-2 text-sm font-extrabold text-white shadow-lg border border-amber-300/40 hover:brightness-110 transition transform hover:-translate-y-0.5 animate-pulse-subtle"
                  >
                    <span className="text-base">{icono}</span>
                    <span>{c.nombre}</span>
                  </Link>
                );
              }

              return (
                <Link
                  key={c.id}
                  href={`/categoria/${c.slug}`}
                  className="shrink-0 flex items-center gap-2 rounded-full bg-forest-800/90 hover:bg-forest-700 text-white font-bold text-xs sm:text-sm px-4 py-2 border border-forest-700/80 shadow-sm transition transform hover:-translate-y-0.5 hover:shadow-md"
                >
                  <span className="text-base">{icono}</span>
                  <span className="text-white font-semibold">{c.nombre}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

    </header>
  );
}

