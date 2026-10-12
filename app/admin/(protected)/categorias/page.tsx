import { getStoreCategorias, getStoreProductos } from '@/lib/data/store';
import CategoriasManager from './CategoriasManager';

export const metadata = {
  title: 'Categorías | Panel Administrador',
};

export default async function CategoriasAdminPage() {
  const [categorias, productos] = await Promise.all([
    getStoreCategorias(),
    getStoreProductos(),
  ]);

  return <CategoriasManager categorias={categorias} productos={productos} />;
}