import type { MetadataRoute } from 'next';
import { getCategorias, getTodosLosProductos } from '@/lib/data/queries';
import { SITE_URL } from '@/lib/site';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categorias, productos] = await Promise.all([
    getCategorias().catch(() => []),
    getTodosLosProductos().catch(() => []),
  ]);

  const estaticas: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: 'daily', priority: 1 },
    { url: `${SITE_URL}/carrito`, changeFrequency: 'monthly', priority: 0.3 },
  ];

  const deCategorias: MetadataRoute.Sitemap = categorias.map((c) => ({
    url: `${SITE_URL}/categoria/${c.slug}`,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  const deProductos: MetadataRoute.Sitemap = productos.map((p) => ({
    url: `${SITE_URL}/producto/${p.slug}`,
    lastModified: p.updated_at,
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  return [...estaticas, ...deCategorias, ...deProductos];
}
