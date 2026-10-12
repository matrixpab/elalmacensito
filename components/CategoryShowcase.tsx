'use client';

import Image from 'next/image';
import Link from 'next/link';
import { construirLinkWhatsapp } from '@/lib/whatsapp';
import WhatsAppIcon from './WhatsAppIcon';

export interface OpcionCategoria {
  id: string;
  nombre: string;
  descripcion: string;
  slug: string;
  icono: string;
  tag?: string;
}

export interface CategoriaPrincipal {
  id: string;
  slugPrincipal: string;
  titulo: string;
  subtitulo: string;
  descripcion: string;
  imagen: string;
  badge: string;
  colorBorde: string;
  opciones: OpcionCategoria[];
}

const CATEGORIAS_PRINCIPALES: CategoriaPrincipal[] = [
  {
    id: 'hierbas',
    slugPrincipal: 'hierbas-por-kilo',
    titulo: 'Hierbas Naturales',
    subtitulo: 'Venta por Kilo, Medicinales & Fraccionadas',
    descripcion:
      'Hierbas seleccionadas directamente de origen: ideales para el bienestar cotidiano, gastronomía y consumo familiar o comercial.',
    imagen: '/fotos-principal/hierbas.png',
    badge: '🌿 100% Puras y Naturales',
    colorBorde: 'border-forest-200',
    opciones: [
      {
        id: 'h-kilo',
        nombre: 'Hierbas por kilo',
        descripcion: 'Venta a granel con los mejores precios por cantidad para compras mayoristas y consumo continuo.',
        slug: 'hierbas-por-kilo',
        icono: '⚖️',
        tag: 'Por Mayor y Menor',
      },
      {
        id: 'h-med',
        nombre: 'Hierbas medicinales',
        descripcion: 'Manzanilla, boldo, cedrón, burrito, tilo, carqueja y hierbas terapéuticas puras.',
        slug: 'hierbas-medicinales',
        icono: '🌿',
        tag: 'Salud & Bienestar',
      },
      {
        id: 'h-frac',
        nombre: 'Hierbas fraccionadas',
        descripcion: 'Paquetes de 250 g y 500 g sellados, prácticos y listos para disfrutar en casa.',
        slug: 'hierbas-fraccionadas',
        icono: '📦',
        tag: 'Fraccionado 250g / 500g',
      },
      {
        id: 'h-esp',
        nombre: 'Especias & Condimentos',
        descripcion: 'Pimentón, orégano, cúrcuma, provenzal, comino y aromas para tus comidas diarias.',
        slug: 'especias',
        icono: '🌶️',
        tag: 'Sabor & Cocina',
      },
      {
        id: 'h-yerba',
        nombre: 'Yerbas saborizadas',
        descripcion: 'Yerba mate combinada con poleo, menta, burrito, peperina y hierbas digestivas.',
        slug: 'yerbas-saborizadas',
        icono: '🧉',
        tag: 'Para el Mate',
      },
    ],
  },
  {
    id: 'blends',
    slugPrincipal: 'blends',
    titulo: 'Blends Naturales',
    subtitulo: 'En Cálida Armonía',
    descripcion:
      'Combinaciones exclusivas de hierbas y flores deshidratadas formuladas para brindar relax, buena digestión y vitalidad en cada infusión.',
    imagen: '/fotos-principal/blends.png',
    badge: '✨ Fórmulas Exclusivas',
    colorBorde: 'border-amber-200',
    opciones: [
      {
        id: 'b-bienestar',
        nombre: 'Blends de Bienestar',
        descripcion: 'Mezclas digestivas, relajantes, detox, energizantes y reconfortantes para cada hora del día.',
        slug: 'blends',
        icono: '✨',
        tag: 'Fórmulas Propias',
      },
      {
        id: 'b-infusiones',
        nombre: 'Infusiones & Té en Hebras',
        descripcion: 'Variedad de tés en hebras seleccionadas y mezclas herbales para infusionar en tetera o taza.',
        slug: 'infusiones',
        icono: '🫖',
        tag: 'Infusiones Especiales',
      },
      {
        id: 'b-yerba-blends',
        nombre: 'Yerba con Blends Artesanales',
        descripcion: 'Hierbas serranas y flores preparadas especialmente para realzar y suavizar tu mate.',
        slug: 'yerbas-saborizadas',
        icono: '🍃',
        tag: 'Especial Mate',
      },
      {
        id: 'b-promos',
        nombre: 'Packs & Promociones de Blends',
        descripcion: 'Combos degustación y ofertas especiales para descubrir y regalar todos los sabores.',
        slug: 'promociones',
        icono: '🏷️',
        tag: 'Ofertas & Packs',
      },
    ],
  },
  {
    id: 'frutos-secos',
    slugPrincipal: 'frutos-secos',
    titulo: 'Frutos Secos',
    subtitulo: 'Energía Natural y Sabor',
    descripcion:
      'Nueces mariposa, almendras, castañas y semillas de primera cosecha. Frescura garantizada para una alimentación sana y nutritiva.',
    imagen: '/fotos-principal/frutos-secos.png',
    badge: '🥜 Primera Calidad Seleccionada',
    colorBorde: 'border-terracotta-200',
    opciones: [
      {
        id: 'f-seleccionados',
        nombre: 'Frutos secos seleccionados',
        descripcion: 'Nueces mariposa extra light, almendras non pareil, castañas de cajú y maní tostado.',
        slug: 'frutos-secos',
        icono: '🥜',
        tag: 'Calidad Premium',
      },
      {
        id: 'f-mixes',
        nombre: 'Mixes Energéticos & Saludables',
        descripcion: 'Combinaciones balanceadas de frutos secos, pasas y semillas listas para llevar y picar.',
        slug: 'frutos-secos',
        icono: '⚡',
        tag: 'Snack Diario',
      },
      {
        id: 'f-kilo',
        nombre: 'Venta por Kilo & Mayorista',
        descripcion: 'Frutos secos a granel por kilo con precios especiales para comercios y familias.',
        slug: 'frutos-secos',
        icono: '⚖️',
        tag: 'Mayor y Menor',
      },
      {
        id: 'f-promos',
        nombre: 'Promociones & Ofertas de la Semana',
        descripcion: 'Precios de oportunidad y combos combinados con hierbas y blends para ahorrar.',
        slug: 'promociones',
        icono: '🔥',
        tag: 'Ahorro Semanal',
      },
    ],
  },
];

export default function CategoryShowcase() {
  const whatsappBaseNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '5491162037583';

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Título de la sección */}
      <div className="text-center max-w-3xl mx-auto mb-14">
        <span className="inline-block rounded-full bg-forest-100 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-forest-800 shadow-sm">
          Categorías Destacadas
        </span>
        <h2 className="mt-3 font-display text-3xl font-extrabold text-forest-900 sm:text-4xl md:text-5xl">
          Nuestras 3 Líneas Principales
        </h2>
        <p className="mt-3 text-base sm:text-lg text-forest-700">
          Explorá cada línea con sus opciones y variedades para encontrar exactamente lo que buscás.
        </p>
      </div>

      {/* Lista vertical de categorías: Una debajo de la otra */}
      <div className="space-y-16">
        {CATEGORIAS_PRINCIPALES.map((cat, index) => {
          const whatsappUrl = construirLinkWhatsapp(
            whatsappBaseNumber,
            `¡Hola! Quisiera consultar precios y opciones sobre la línea de ${cat.titulo}.`
          );

          return (
            <div
              key={cat.id}
              className={`rounded-3xl border-2 ${cat.colorBorde} bg-white shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl`}
            >
              {/* 1. IMAGEN ENTERA (Sin recortes ni texto estorbando) */}
              <div className="relative w-full bg-forest-950 overflow-hidden">
                <Link
                  href={`/categoria/${cat.slugPrincipal}`}
                  className="block group relative cursor-pointer"
                  title={`Ver catálogo de ${cat.titulo}`}
                >
                  <Image
                    src={cat.imagen}
                    alt={cat.titulo}
                    width={1672}
                    height={940}
                    priority={index === 0}
                    className="w-full h-auto object-contain transition-transform duration-500 ease-out group-hover:scale-[1.01]"
                    sizes="(max-width: 1280px) 100vw, 1280px"
                  />
                  {/* Etiqueta flotante sutil en esquina para indicar acción */}
                  <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-forest-900/90 backdrop-blur-md px-3.5 py-1.5 text-xs font-bold text-cream-50 shadow-md transition-all group-hover:bg-forest-800 group-hover:scale-105">
                      <span>Ver categoría</span>
                      <span>→</span>
                    </span>
                  </div>
                </Link>
              </div>

              {/* 2. BARRA DE TÍTULO Y DESCRIPCIÓN DE LA LÍNEA */}
              <div className="px-6 pt-6 pb-4 sm:px-8 bg-gradient-to-r from-forest-50/70 via-cream-50/50 to-white border-b border-forest-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-forest-100 px-3 py-0.5 text-xs font-bold text-forest-800">
                      {cat.badge}
                    </span>
                    <span className="text-xs uppercase font-extrabold tracking-wider text-terracotta-600">
                      Línea {index + 1} de 3
                    </span>
                  </div>
                  <h3 className="mt-1 font-display text-2xl sm:text-3xl font-extrabold text-forest-900">
                    {cat.titulo}
                  </h3>
                  <p className="mt-1 text-sm text-forest-600 max-w-3xl">
                    {cat.descripcion}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    href={`/categoria/${cat.slugPrincipal}`}
                    className="inline-flex items-center gap-2 rounded-full bg-forest-900 px-5 py-2.5 text-xs sm:text-sm font-bold text-cream-50 shadow hover:bg-forest-800 transition transform hover:-translate-y-0.5"
                  >
                    <span>Ver todos</span>
                    <span>→</span>
                  </Link>
                </div>
              </div>

              {/* 3. OPCIONES DISPONIBLES DENTRO DE ESTA CATEGORÍA */}
              <div className="p-6 sm:p-8 bg-white">
                <div className="mb-5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🌿</span>
                    <h4 className="font-display text-base sm:text-lg font-bold text-forest-900">
                      Opciones disponibles en {cat.titulo}
                    </h4>
                  </div>
                  <span className="text-xs text-forest-500 font-semibold hidden sm:inline">
                    Tocá cualquier opción para ver sus productos
                  </span>
                </div>

                {/* Grid de opciones */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {cat.opciones.map((opcion) => (
                    <Link
                      key={opcion.id}
                      href={`/categoria/${opcion.slug}`}
                      className="group relative flex flex-col justify-between rounded-2xl border border-forest-100 bg-cream-50/40 p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-forest-400 hover:bg-white hover:shadow-md"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-forest-100/70 text-2xl shadow-inner transition-transform group-hover:scale-110">
                            {opcion.icono}
                          </span>
                          {opcion.tag && (
                            <span className="rounded-full bg-white px-2.5 py-0.5 text-[11px] font-bold text-forest-800 shadow-sm border border-forest-100">
                              {opcion.tag}
                            </span>
                          )}
                        </div>

                        <h5 className="mt-3.5 font-display text-base font-bold text-forest-900 group-hover:text-forest-700 transition">
                          {opcion.nombre}
                        </h5>

                        <p className="mt-1.5 text-xs sm:text-sm text-forest-600 leading-relaxed">
                          {opcion.descripcion}
                        </p>
                      </div>

                      <div className="mt-4 flex items-center justify-between pt-3 border-t border-forest-100/70 text-xs font-bold text-forest-800 group-hover:text-terracotta-600 transition">
                        <span>Ver productos</span>
                        <span className="transition-transform group-hover:translate-x-1">→</span>
                      </div>
                    </Link>
                  ))}
                </div>

                {/* Barra de consulta por WhatsApp y pedidos personalizados para esta categoría */}
                <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 rounded-2xl bg-forest-50/60 px-5 py-3.5 border border-forest-100">
                  <div className="flex items-center gap-2.5 text-center sm:text-left">
                    <span className="text-xl">💬</span>
                    <p className="text-xs sm:text-sm text-forest-700">
                      <span className="font-bold text-forest-900">¿Buscás una variedad o cantidad especial?</span>{' '}
                      Consultanos disponibilidad o lista de precios mayorista.
                    </p>
                  </div>
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 inline-flex items-center gap-1.5 rounded-full bg-[#25D366] hover:bg-[#20ba5a] px-4 py-2 text-xs font-bold text-white shadow hover:shadow-md transition"
                  >
                    <span>WhatsApp</span>
                    <span>→</span>
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

