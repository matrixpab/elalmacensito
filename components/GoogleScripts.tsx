import Script from 'next/script';

export default function GoogleScripts({
  ga4Id,
  googleAdsId,
}: {
  ga4Id: string | null;
  googleAdsId: string | null;
}) {
  const ids = [ga4Id, googleAdsId].filter(Boolean) as string[];
  if (ids.length === 0) return null;

  const idPrincipal = ids[0];

  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${idPrincipal}`}
      />
      <Script id="gtag-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          ${ga4Id ? `gtag('config', '${ga4Id}');` : ''}
          ${googleAdsId ? `gtag('config', '${googleAdsId}');` : ''}
          window.gtag = gtag;
        `}
      </Script>
    </>
  );
}
