import type { Categoria, Producto } from '@/lib/types';
import { expandirTerminoBusqueda, normalizarTexto } from './search-synonyms';

export interface ResultadoBusqueda {
  productos: Producto[];
  categorias: Categoria[];
}

/**
 * Buscador inteligente 100% client-side sobre el catalogo ya cargado:
 * matchea por nombre, categoria, palabras clave y grupos tematicos
 * (sinonimos), por ejemplo "te digestivo" -> manzanilla, poleo, menta, cedron.
 */
export function buscarEnCatalogo(
  termino: string,
  productos: Producto[],
  categorias: Categoria[]
): ResultadoBusqueda {
  const terminoNormalizado = normalizarTexto(termino);
  if (!terminoNormalizado) return { productos: [], categorias: [] };

  const terminosExpandidos = expandirTerminoBusqueda(termino);

  const productosMatch = productos.filter((p) => {
    const campos = [
      p.nombre,
      p.descripcion_larga,
      p.categoria?.nombre ?? '',
      ...(p.palabras_clave ?? []),
    ]
      .map(normalizarTexto)
      .join(' ');

    return terminosExpandidos.some((t) => campos.includes(t));
  });

  const categoriasMatch = categorias.filter((c) =>
    terminosExpandidos.some((t) => normalizarTexto(c.nombre).includes(t))
  );

  return { productos: productosMatch, categorias: categoriasMatch };
}
