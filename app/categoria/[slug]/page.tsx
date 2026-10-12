import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import ProductCard from '@/components/ProductCard';
import { getCategoriaPorSlug, getProductosPorCategoria } from '@/lib/data/queries';
import { SITE_NAME } from '@/lib/site';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const categoria = await getCategoriaPorSlug(slug);
  if (!categoria) return {};

  const titulo = `${categoria.nombre} | ${SITE_NAME}`;
  const descripcion =
    categoria.descripcion ?? `Comprá ${categoria.nombre.toLowerCase()} naturales. Envíos a todo el país.`;

  return {
    title: titulo,
    description: descripcion,
    alternates: { canonical: `/categoria/${categoria.slug}` },
    openGraph: { title: titulo, description: descripcion },
  };
}

export default async function CategoriaPage({ params }: Props) {
  const { slug } = await params;
  const categoria = await getCategoriaPorSlug(slug);
  if (!categoria) notFound();

  const productos = await getProductosPorCategoria(slug);

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <nav className="mb-4 text-sm text-forest-500">
        <a href="/" className="hover:underline">
          Inicio
        </a>{' '}
        / {categoria.nombre}
      </nav>
      <h1 className="section-title">{categoria.nombre}</h1>
      {categoria.descripcion && <p className="mt-2 max-w-2xl text-forest-600">{categoria.descripcion}</p>}

      {productos.length === 0 ? (
        <p className="mt-10 text-forest-500">Todavía no hay productos cargados en esta categoría.</p>
      ) : (
        <div className="mt-10 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
          {productos.map((p) => (
            <ProductCard key={p.id} producto={p} />
          ))}
        </div>
      )}
    </div>
  );
}
