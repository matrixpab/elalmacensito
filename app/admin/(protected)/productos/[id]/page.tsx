import { notFound } from 'next/navigation';
import { getStoreCategorias, getStoreProductoPorId } from '@/lib/data/store';
import ProductoForm from '../ProductoForm';

interface Props {
  params: Promise<{ id: string }>;
}

export const metadata = {
  title: 'Editar Producto | Panel Administrador',
};

export default async function EditarProductoPage({ params }: Props) {
  const { id } = await params;
  const [categorias, producto] = await Promise.all([
    getStoreCategorias(),
    getStoreProductoPorId(id),
  ]);

  if (!producto) notFound();

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-forest-900">Editar Producto</h1>
        <p className="text-xs sm:text-sm text-forest-600 mt-1">
          Modificá precios, stock, imágenes y detalles de &quot;{producto.nombre}&quot;.
        </p>
      </div>
      <ProductoForm categorias={categorias} producto={producto} />
    </div>
  );
}