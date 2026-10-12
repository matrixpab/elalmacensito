/**
 * Diccionario de sinonimos / grupos tematicos para el buscador inteligente.
 * Cada clave es un termino de busqueda habitual del cliente; el valor es la
 * lista de palabras clave de producto que deben matchear.
 *
 * Ejemplo del pedido: "te digestivo" -> manzanilla, poleo, menta, cedron.
 */
export const GRUPOS_BUSQUEDA: Record<string, string[]> = {
  'te digestivo': ['manzanilla', 'poleo', 'menta', 'cedron', 'boldo', 'melisa'],
  'digestivo': ['manzanilla', 'poleo', 'menta', 'cedron', 'boldo', 'melisa'],
  'para dormir': ['manzanilla', 'tilo', 'melisa', 'pasionaria', 'valeriana', 'lavanda'],
  'relajante': ['manzanilla', 'tilo', 'melisa', 'pasionaria', 'valeriana', 'lavanda'],
  'para el higado': ['boldo', 'diente de leon', 'cardo mariano', 'alcachofa'],
  'higado': ['boldo', 'diente de leon', 'cardo mariano', 'alcachofa'],
  'para la garganta': ['eucalipto', 'tomillo', 'jengibre', 'propoleo', 'malva'],
  'garganta': ['eucalipto', 'tomillo', 'jengibre', 'propoleo', 'malva'],
  'resfrio': ['eucalipto', 'tomillo', 'jengibre', 'sauco', 'malva'],
  'para el mate': ['peperina', 'cedron', 'burrito', 'menta', 'boldo'],
  'yerbas saborizadas': ['peperina', 'cedron', 'burrito', 'menta'],
  'antiinflamatorio': ['curcuma', 'jengibre', 'harpagofito'],
  'dulce': ['stevia'],
  'energia': ['guarana', 'ginseng', 'mate'],
  'diuretico': ['cola de caballo', 'diente de leon', 'hibiscus'],
  'te frio': ['hibiscus', 'menta', 'cedron'],
};

const ALIAS: Record<string, string[]> = {
  hibiscus: ['flor de jamaica', 'hibisco'],
  cedron: ['cedrón'],
  boldo: ['boldo'],
};

export function expandirTerminoBusqueda(termino: string): string[] {
  const normalizado = normalizarTexto(termino);
  const terminos = new Set<string>([normalizado]);

  for (const [clave, relacionados] of Object.entries(GRUPOS_BUSQUEDA)) {
    if (normalizarTexto(clave).includes(normalizado) || normalizado.includes(normalizarTexto(clave))) {
      relacionados.forEach((r) => terminos.add(normalizarTexto(r)));
    }
  }

  for (const [base, alias] of Object.entries(ALIAS)) {
    if (alias.some((a) => normalizarTexto(a) === normalizado)) {
      terminos.add(normalizarTexto(base));
    }
  }

  return Array.from(terminos);
}

export function normalizarTexto(texto: string): string {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim();
}
