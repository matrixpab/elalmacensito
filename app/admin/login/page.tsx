'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setCargando(true);
    setError(null);

    try {
      const res = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        setError(data.error || 'Email o contraseña incorrectos.');
        setCargando(false);
        return;
      }

      router.replace('/admin');
      router.refresh();
    } catch {
      setError('Error al conectar con el servidor.');
      setCargando(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-forest-50 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl border border-forest-100">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="relative h-16 w-16 overflow-hidden rounded-full ring-2 ring-forest-600/30 shadow-md mb-3">
            <Image src="/logo.png" alt="El Almacencito" fill className="object-cover" priority />
          </div>
          <h1 className="font-display text-2xl font-extrabold text-forest-900">
            Panel Administrador
          </h1>
          <p className="text-xs text-forest-600 mt-1">
            Gestión completa de productos, categorías, imágenes y precios
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-forest-700">
              Email Administrador
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-forest-200 px-3.5 py-2.5 text-sm focus:border-forest-500 focus:outline-none focus:ring-2 focus:ring-forest-200"
              placeholder="admin@elalmacencito.com.ar"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-forest-700">
              Contraseña
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-forest-200 px-3.5 py-2.5 text-sm focus:border-forest-500 focus:outline-none focus:ring-2 focus:ring-forest-200"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 p-3 border border-red-200 text-xs text-red-600 font-medium">
              ⚠️ {error}
            </div>
          )}

          <button
            type="submit"
            disabled={cargando}
            className="w-full rounded-full bg-forest-700 hover:bg-forest-800 text-white py-3 text-sm font-bold shadow-md hover:shadow-lg transition disabled:opacity-50 active:scale-98"
          >
            {cargando ? 'Verificando...' : 'Ingresar al Panel'}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-forest-100 text-center">
          <p className="text-[11px] text-forest-500">
            🔒 Acceso restringido únicamente para administradores autorizados.
          </p>
        </div>
      </div>
    </div>
  );
}
