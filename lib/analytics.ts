'use client';

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

function gtag(...args: unknown[]) {
  if (typeof window === 'undefined') return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(args);
  if (window.gtag) window.gtag(...(args as [string, ...unknown[]]));
}

interface ProductoEventItem {
  item_id: string;
  item_name: string;
  item_category?: string;
  price?: number;
  quantity?: number;
}

/** GA4: producto visto */
export function trackViewItem(item: ProductoEventItem) {
  gtag('event', 'view_item', {
    currency: 'ARS',
    value: item.price ?? 0,
    items: [item],
  });
}

/** GA4: producto agregado al carrito + conversion de Google Ads (opcional) */
export function trackAddToCart(item: ProductoEventItem) {
  gtag('event', 'add_to_cart', {
    currency: 'ARS',
    value: (item.price ?? 0) * (item.quantity ?? 1),
    items: [item],
  });

  const adsId = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID;
  if (adsId) {
    gtag('event', 'conversion', { send_to: adsId });
  }
}

/** GA4: inicio de checkout (abre el carrito / revisa el pedido) */
export function trackBeginCheckout(items: ProductoEventItem[], value: number) {
  gtag('event', 'begin_checkout', {
    currency: 'ARS',
    value,
    items,
  });
}

/** GA4 + Google Ads: click en boton de WhatsApp */
export function trackWhatsappClick(origen: string) {
  gtag('event', 'whatsapp_click', { origen });

  const adsId = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID;
  const label = process.env.NEXT_PUBLIC_GOOGLE_ADS_LABEL_WHATSAPP;
  if (adsId && label) {
    gtag('event', 'conversion', { send_to: `${adsId}/${label}` });
  }
}

/** GA4 + Google Ads: pedido enviado por WhatsApp */
export function trackPurchaseRequest(items: ProductoEventItem[], value: number) {
  gtag('event', 'purchase_request', {
    currency: 'ARS',
    value,
    items,
  });

  const adsId = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID;
  const label = process.env.NEXT_PUBLIC_GOOGLE_ADS_LABEL_PEDIDO;
  if (adsId && label) {
    gtag('event', 'conversion', { send_to: `${adsId}/${label}`, value, currency: 'ARS' });
  }
}
