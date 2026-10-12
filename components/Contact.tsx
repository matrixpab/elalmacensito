'use client';

import { construirLinkWhatsapp } from '@/lib/whatsapp';
import { trackWhatsappClick } from '@/lib/analytics';

export default function Contact({ whatsappNumero }: { whatsappNumero: string }) {
  const link = construirLinkWhatsapp(whatsappNumero, 'Hola! Quería hacer una consulta.');

  return (
    <section id="contacto" className="mx-auto max-w-4xl px-6 py-16 text-center">
      <h2 className="section-title">¿Tenés dudas?</h2>
      <p className="mt-3 text-forest-600">Escribinos por WhatsApp, te respondemos a la brevedad.</p>
      <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => trackWhatsappClick('contacto')}
        className="btn-whatsapp mt-6 inline-flex"
      >
        💬 Escribir por WhatsApp
      </a>
    </section>
  );
}
