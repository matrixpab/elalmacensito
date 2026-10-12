import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import ProductDetail from '@/components/ProductDetail';
import { getProductoPorSlug } from '@/lib/data/queries';
import { SITE_NAME, SITE_URL } from '@/lib/site';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const producto = await getProductoPorSlug(slug);
  if (!producto) return {};

  const titulo = producto.meta_title || `${producto.nombre} | ${SITE_NAME}`;
  const descripcion = producto.meta_description || producto.descripcion_larga.slice(0, 155);

  return {
    title: titulo,
    description: descripcion,
    alternates: { canonical: `/producto/${producto.slug}` },
    openGraph: {
      title: titulo,
      description: descripcion,
      images: producto.imagen_principal ? [{ url: producto.imagen_principal }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: titulo,
      description: descripcion,
    },
  };
}

export default async function ProductoPage({ params }: Props) {
  const { slug } = await params;
  const producto = await getProductoPorSlug(slug);
  if (!producto) notFound();

  const precio =
    producto.precio_250g ?? producto.precio_unidad ?? producto.precio_500g ?? producto.precio_1kg ?? 0;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: producto.nombre,
    description: producto.meta_description || producto.descripcion_larga,
    sku: producto.sku,
    image: producto.imagen_principal ? [producto.imagen_principal] : undefined,
    category: producto.categoria?.nombre,
    offers: {
      '@type': 'Offer',
      priceCurrency: 'ARS',
      price: precio,
      availability:
        producto.stock_actual > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      url: `${SITE_URL}/producto/${producto.slug}`,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductDetail producto={producto} />
    </>
  );
}
