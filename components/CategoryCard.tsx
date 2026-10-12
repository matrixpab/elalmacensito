import Link from 'next/link';
import type { Categoria } from '@/lib/types';

const EMOJIS: Record<string, string> = {
  'hierbas-medicinales': '🌿',
  'hierbas-por-kilo': '⚖️',
  'hierbas-fraccionadas': '🧉',
  especias: '🌶️',
  'yerbas-saborizadas': '🍃',
  blends: '🍵',
  infusiones: '☕',
  'frutos-secos': '🥜',
  promociones: '🏷️',
};

export default function CategoryCard({ categoria }: { categoria: Categoria }) {
  return (
    <Link
      href={`/categoria/${categoria.slug}`}
      className="card flex flex-col items-center gap-3 p-6 text-center transition hover:-translate-y-1 hover:shadow-soft"
    >
      <span className="text-4xl">{EMOJIS[categoria.slug] ?? '🌱'}</span>
      <span className="font-display text-sm font-semibold text-forest-800">{categoria.nombre}</span>
    </Link>
  );
}
