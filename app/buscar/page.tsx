import type { Metadata } from 'next';
import ProductCard from '@/components/ProductCard';
import CategoryCard from '@/components/CategoryCard';
import { getCategorias, getTodosLosProductos } from '@/lib/data/queries';
import { buscarEnCatalogo } from '@/lib/search';

export const metadata: Metadata = { title: 'Resultados de búsqueda' };

interface Props {
  searchParams: Promise<{ q?: string }>;
}

export default async function BuscarPage({ searchParams }: Props) {
  const { q = '' } = await searchParams;
  const [productos, categorias] = await Promise.all([getTodosLosProductos(), getCategorias()]);
  const resultado = q ? buscarEnCatalogo(q, productos, categorias) : { productos: [], categorias: [] };

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <h1 className="section-title">Resultados para &ldquo;{q}&rdquo;</h1>

      {resultado.categorias.length > 0 && (
        <div className="mt-8">
          <h2 className="mb-4 font-display text-lg font-semibold text-forest-800">Categorías</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {resultado.categorias.map((c) => (
              <CategoryCard key={c.id} categoria={c} />
            ))}
          </div>
        </div>
      )}

      <div className="mt-10">
        <h2 className="mb-4 font-display text-lg font-semibold text-forest-800">Productos</h2>
        {resultado.productos.length === 0 ? (
          <p className="text-forest-500">
            No encontramos productos para tu búsqueda. Probá con otra palabra, por ejemplo el
            nombre de una hierba o un uso (&ldquo;té digestivo&rdquo;, &ldquo;para dormir&rdquo;).
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
            {resultado.productos.map((p) => (
              <ProductCard key={p.id} producto={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
