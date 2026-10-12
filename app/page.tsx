import Hero from '@/components/Hero';
import Benefits from '@/components/Benefits';
import Testimonials from '@/components/Testimonials';
import FAQ from '@/components/FAQ';
import ShippingInfo from '@/components/ShippingInfo';
import Contact from '@/components/Contact';
import CategoryShowcase from '@/components/CategoryShowcase';
import ProductCard from '@/components/ProductCard';
import { getConfiguracion, getProductosDestacados } from '@/lib/data/queries';
import Link from 'next/link';

export default async function HomePage() {
  const [config, destacados] = await Promise.all([
    getConfiguracion().catch(() => ({ whatsapp_numero: '5491162037583', envios_info: 'Envíos a todo el país' })),
    getProductosDestacados(8).catch(() => []),
  ]);

  return (
    <>
      <Hero />

      {/* Sección con las categorías principales */}
      <CategoryShowcase />

      {/* Productos Destacados */}
      {destacados && destacados.length > 0 && (
        <section className="bg-cream-100/50 py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  Selección Especial
                </span>
                <h2 className="mt-2 font-display text-2xl sm:text-3xl font-extrabold text-forest-900">
                  Productos Destacados
                </h2>
                <p className="mt-1 text-sm text-forest-600 max-w-xl">
                  Hierbas puras, blends artesanales y productos naturales con la máxima frescura y calidad garantizada.
                </p>
              </div>
              <Link
                href="/categoria/hierbas-medicinales"
                className="btn-secondary text-sm self-start sm:self-auto"
              >
                Ver todo el catálogo →
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 sm:gap-6">
              {destacados.map((producto) => (
                <ProductCard key={producto.id} producto={producto} />
              ))}
            </div>
          </div>
        </section>
      )}

      <Benefits />
      <Testimonials />
      <ShippingInfo texto={config.envios_info} />
      <FAQ />
      <Contact whatsappNumero={config.whatsapp_numero} />
    </>
  );
}
