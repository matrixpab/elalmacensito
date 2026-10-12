import type { Metadata } from 'next';
import './globals.css';
import { CartProvider } from '@/components/CartProvider';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import FloatingWhatsApp from '@/components/FloatingWhatsApp';
import GoogleScripts from '@/components/GoogleScripts';
import { getCategorias, getConfiguracion } from '@/lib/data/queries';
import { SITE_NAME, SITE_URL, SITE_DESCRIPTION } from '@/lib/site';

export async function generateMetadata(): Promise<Metadata> {
  const config = await getConfiguracion().catch(() => null);

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: `${SITE_NAME} | Hierbas Medicinales, Yuyos y Productos Naturales`,
      template: `%s | ${SITE_NAME}`,
    },
    description: SITE_DESCRIPTION,
    keywords: [
      'hierbas medicinales',
      'hierbas naturales',
      'yuyos medicinales',
      'venta de hierbas medicinales',
      'comprar hierbas medicinales',
      'hierbas por kilo',
      'yuyos por kilo',
      'especias naturales',
      'infusiones naturales',
      'té de hierbas',
      'mezclas para mate',
      'hierbas para mate',
      'productos naturales',
      'dietética online',
      'almacén natural',
      'alimentación saludable',
      'frutos secos',
      'hierbas aromáticas',
      'hierbas medicinales en Argentina',
      'dietética online Argentina',
      'comprar yuyos online',
      'productos naturales Argentina',
    ],
    openGraph: {
      type: 'website',
      locale: 'es_AR',
      siteName: SITE_NAME,
      title: `${SITE_NAME} | Hierbas Medicinales, Yuyos y Productos Naturales`,
      description: SITE_DESCRIPTION,
      url: SITE_URL,
      images: [{ url: '/logo.png', width: 800, height: 800, alt: SITE_NAME }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${SITE_NAME} | Hierbas Medicinales, Yuyos y Productos Naturales`,
      description: SITE_DESCRIPTION,
      images: ['/logo.png'],
    },
    verification: config?.gsc_verification ? { google: config.gsc_verification } : undefined,
    alternates: { canonical: SITE_URL },
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [categorias, config] = await Promise.all([
    getCategorias().catch(() => []),
    getConfiguracion().catch(() => null),
  ]);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Store',
    name: SITE_NAME,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    image: `${SITE_URL}/logo.png`,
    address: { '@type': 'PostalAddress', addressCountry: 'AR' },
  };

  return (
    <html lang="es-AR">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-screen font-sans text-forest-900 antialiased">
        <GoogleScripts
          ga4Id={config?.ga4_id ?? process.env.NEXT_PUBLIC_GA4_ID ?? null}
          googleAdsId={config?.google_ads_id ?? process.env.NEXT_PUBLIC_GOOGLE_ADS_ID ?? null}
        />
        <CartProvider>
          <Header categorias={categorias} />
          <main>{children}</main>
          <Footer categorias={categorias} />
          <FloatingWhatsApp numero={config?.whatsapp_numero || '5491162037583'} />
        </CartProvider>
      </body>
    </html>
  );
}
