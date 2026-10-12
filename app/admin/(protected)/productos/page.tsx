import { getStoreProductos, getStoreCategorias } from '@/lib/data/store';
import ProductosManager from './ProductosManager';

export const metadata = {
  title: 'Productos | Panel Administrador',
};

export default async function AdminProductosPage() {
  const [productos, categorias] = await Promise.all([
    getStoreProductos(),
    getStoreCategorias(),
  ]);

  return <ProductosManager productos={productos} categorias={categorias} />;
}