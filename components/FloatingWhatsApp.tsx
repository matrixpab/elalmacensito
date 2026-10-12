'use client';

import WhatsAppIcon from './WhatsAppIcon';
import { construirLinkWhatsapp } from '@/lib/whatsapp';

export default function FloatingWhatsApp({ numero }: { numero?: string }) {
  const whatsappUrl = construirLinkWhatsapp(
    numero || '5491162037583',
    '¡Hola El Almacencito! Quisiera armar un pedido y consultar sobre disponibilidad y envíos de sus hierbas medicinales y productos naturales.'
  );

  return (
    <aside aria-label="Contacto por WhatsApp" className="fixed bottom-6 right-6 z-50 flex items-center group">
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Contactar por WhatsApp para armar pedido o consultas"
        className="relative flex items-center gap-3 bg-[#25D366] hover:bg-[#20ba5a] text-white pl-4 pr-5 py-3 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-105 active:scale-95 ring-4 ring-white/70"
      >
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
        </span>
        <WhatsAppIcon className="w-6 h-6 shrink-0" />
        <div className="flex flex-col text-left leading-tight">
          <span className="text-[11px] font-medium text-emerald-100 uppercase tracking-wider">
            WhatsApp Directo
          </span>
          <span className="text-sm font-bold tracking-tight">
            Armá tu pedido
          </span>
        </div>
      </a>
    </aside>
  );
}
