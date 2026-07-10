"use client";

import { useEffect, useId } from "react";
import { useAppStore } from "@/lib/store";

export function CustomScripts() {
  const settings = useAppStore((s) => s.settings);
  const headerId = useId();
  const footerId = useId();

  useEffect(() => {
    if (!settings) return;

    const headerScripts = settings.header_scripts || "";
    const footerScripts = settings.footer_scripts || "";
    const gaId = settings.seo_ga_id || "";
    const fbPixel = settings.seo_fb_pixel || "";

    const existingHeader = document.getElementById(headerId);
    if (existingHeader) existingHeader.remove();
    const existingFooter = document.getElementById(footerId);
    if (existingFooter) existingFooter.remove();

    let headerHtml = headerScripts;

    if (gaId) {
      headerHtml += `
<script async src="https://www.googletagmanager.com/gtag/js?id=${gaId}"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', '${gaId}');
</script>`;
    }

    if (fbPixel) {
      headerHtml += `
<script>
  !function(f,b,e,v,n,t,s)
  {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
  n.callMethod.apply(n,arguments):n.queue.push(arguments)};
  if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
  n.queue=[];t=b.createElement(e);t.async=!0;
  t.src=v;s=b.getElementsByTagName(e)[0];
  s.parentNode.insertBefore(t,s)}(window, document,'script',
  'https://connect.facebook.net/en_US/fbevents.js');
  fbq('init', '${fbPixel}');
  fbq('track', 'PageView');
</script>
<noscript><img height="1" width="1" style="display:none"
  src="https://www.facebook.com/tr?id=${fbPixel}&ev=PageView&noscript=1"
/></noscript>`;
    }

    if (headerHtml) {
      const div = document.createElement("div");
      div.id = headerId;
      div.innerHTML = headerHtml;
      Array.from(div.children).forEach((child) => {
        document.head.appendChild(child.cloneNode(true));
      });
    }

    if (footerScripts) {
      const div = document.createElement("div");
      div.id = footerId;
      div.innerHTML = footerScripts;
      Array.from(div.children).forEach((child) => {
        document.body.appendChild(child.cloneNode(true));
      });
    }

    return () => {
      const hEl = document.getElementById(headerId);
      if (hEl) hEl.remove();
      const fEl = document.getElementById(footerId);
      if (fEl) fEl.remove();
    };
  }, [settings, headerId, footerId]);

  return null;
}
