'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { actualizarConfiguracion } from '@/lib/admin/actions';
import type { Configuracion } from '@/lib/types';

export default function ConfiguracionForm({ config }: { config: Configuracion }) {
  const router = useRouter();
  const [form, setForm] = useState({
    whatsapp_numero: config.whatsapp_numero,
    ga4_id: config.ga4_id ?? '',
    google_ads_id: config.google_ads_id ?? '',
    gsc_verification: config.gsc_verification ?? '',
    envios_info: config.envios_info,
  });
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setGuardando(true);
    setMensaje(null);
    const resultado = await actualizarConfiguracion({
      whatsapp_numero: form.whatsapp_numero,
      ga4_id: form.ga4_id || null,
      google_ads_id: form.google_ads_id || null,
      gsc_verification: form.gsc_verification || null,
      envios_info: form.envios_info,
    });
    setGuardando(false);
    setMensaje(resultado.error ? `Error: ${resultado.error}` : 'Configuración guardada.');
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="card mt-6 max-w-xl space-y-4 p-6">
      <div>
        <label className="mb-1 block text-sm font-medium text-forest-700">
          Número de WhatsApp (con código de país, sin +)
        </label>
        <input
          required
          value={form.whatsapp_numero}
          onChange={(e) => setForm({ ...form, whatsapp_numero: e.target.value })}
          placeholder="5491100000000"
          className="w-full rounded-lg border border-forest-200 px-3 py-2 focus:border-forest-400 focus:outline-none"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-forest-700">Google Analytics 4 ID</label>
        <input
          value={form.ga4_id}
          onChange={(e) => setForm({ ...form, ga4_id: e.target.value })}
          placeholder="G-XXXXXXXXXX"
          className="w-full rounded-lg border border-forest-200 px-3 py-2 focus:border-forest-400 focus:outline-none"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-forest-700">Google Ads ID</label>
        <input
          value={form.google_ads_id}
          onChange={(e) => setForm({ ...form, google_ads_id: e.target.value })}
          placeholder="AW-XXXXXXXXX"
          className="w-full rounded-lg border border-forest-200 px-3 py-2 focus:border-forest-400 focus:outline-none"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-forest-700">
          Código de verificación de Google Search Console
        </label>
        <input
          value={form.gsc_verification}
          onChange={(e) => setForm({ ...form, gsc_verification: e.target.value })}
          className="w-full rounded-lg border border-forest-200 px-3 py-2 focus:border-forest-400 focus:outline-none"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-forest-700">Información de envíos</label>
        <textarea
          rows={3}
          value={form.envios_info}
          onChange={(e) => setForm({ ...form, envios_info: e.target.value })}
          className="w-full rounded-lg border border-forest-200 px-3 py-2 focus:border-forest-400 focus:outline-none"
        />
      </div>

      {mensaje && <p className="text-sm text-forest-600">{mensaje}</p>}

      <button type="submit" disabled={guardando} className="btn-primary disabled:opacity-50">
        {guardando ? 'Guardando...' : 'Guardar configuración'}
      </button>
    </form>
  );
}
