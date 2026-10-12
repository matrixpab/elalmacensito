'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { Categoria } from '@/lib/types';

export default function SearchBar({ categorias }: { categorias: Categoria[] }) {
  const router = useRouter();
  const [q, setQ] = useState('');

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (q.trim()) router.push(`/buscar?q=${encodeURIComponent(q.trim())}`);
      }}
      className="flex items-center gap-2"
    >
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Buscá hierbas, ej: té digestivo"
        className="w-full rounded-full border border-forest-200 bg-white px-4 py-2 text-sm text-forest-800 placeholder:text-forest-400 focus:border-forest-400 focus:outline-none"
        list="categorias-sugeridas"
      />
      <datalist id="categorias-sugeridas">
        {categorias.map((c) => (
          <option key={c.id} value={c.nombre} />
        ))}
      </datalist>
      <button
        type="submit"
        className="rounded-full bg-forest-600 px-4 py-2 text-sm font-semibold text-white hover:bg-forest-700"
      >
        Buscar
      </button>
    </form>
  );
}
