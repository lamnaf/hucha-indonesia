import Script from "next/script";

interface AnalyticsScriptsProps {
  googleAnalyticsId?: string;
  googleTagManagerId?: string;
}

/**
 * Injects Google Analytics 4 and Google Tag Manager snippets into the
 * public site. IDs are sourced from the `analytics` settings group
 * (admin-editable) so scripts only render when configured.
 */
export function AnalyticsScripts({
  googleAnalyticsId = "",
  googleTagManagerId = "",
}: AnalyticsScriptsProps) {
  return (
    <>
      {googleTagManagerId ? (
        <Script
          id="gtm"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${googleTagManagerId}');`,
          }}
        />
      ) : null}
      {googleAnalyticsId ? (
        <Script
          id="gtag"
          strategy="afterInteractive"
          src={`https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId}`}
        />
      ) : null}
      {googleAnalyticsId ? (
        <Script
          id="gtag-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${googleAnalyticsId}');`,
          }}
        />
      ) : null}
    </>
  );
}