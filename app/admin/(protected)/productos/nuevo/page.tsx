import { getStoreCategorias } from '@/lib/data/store';
import ProductoForm from '../ProductoForm';

export const metadata = {
  title: 'Nuevo Producto | Panel Administrador',
};

export default async function NuevoProductoPage() {
  const categorias = await getStoreCategorias();

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-forest-900">Crear Nuevo Producto</h1>
        <p className="text-xs sm:text-sm text-forest-600 mt-1">
          Cargá la información, fotografías desde tu computadora, precios por presentación y stock.
        </p>
      </div>
      <ProductoForm categorias={categorias} />
    </div>
  );
}