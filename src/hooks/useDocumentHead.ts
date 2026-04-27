import { useEffect } from "react";

interface DocumentHeadOptions {
  title: string;
  description: string;
  canonical?: string;
  jsonLd?: object | object[];
  ogImage?: string;
}

const setMeta = (selector: string, attr: "name" | "property", key: string, content: string) => {
  let el = document.head.querySelector<HTMLMetaElement>(selector);
  const previous = el?.getAttribute("content") ?? null;
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
  return { el, previous };
};

/**
 * Lightweight head manager for SEO landing pages.
 * Sets <title>, meta description, canonical link, and injects JSON-LD.
 * Cleans up JSON-LD on unmount to avoid duplicate schema across SPA navigations.
 */
export const useDocumentHead = ({ title, description, canonical, jsonLd, ogImage }: DocumentHeadOptions) => {
  useEffect(() => {
    // Title
    const previousTitle = document.title;
    document.title = title.length > 60 ? title.slice(0, 57) + "..." : title;

    // Meta description
    let metaDesc = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    const previousDesc = metaDesc?.getAttribute("content") ?? null;
    if (!metaDesc) {
      metaDesc = document.createElement("meta");
      metaDesc.setAttribute("name", "description");
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute("content", description.length > 160 ? description.slice(0, 157) + "..." : description);

    // Canonical
    let linkCanonical: HTMLLinkElement | null = null;
    let previousCanonical: string | null = null;
    if (canonical) {
      linkCanonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
      previousCanonical = linkCanonical?.getAttribute("href") ?? null;
      if (!linkCanonical) {
        linkCanonical = document.createElement("link");
        linkCanonical.setAttribute("rel", "canonical");
        document.head.appendChild(linkCanonical);
      }
      linkCanonical.setAttribute("href", canonical);
    }

    // JSON-LD (tagged for cleanup)
    const ldScripts: HTMLScriptElement[] = [];
    if (jsonLd) {
      const items = Array.isArray(jsonLd) ? jsonLd : [jsonLd];
      items.forEach((item) => {
        const script = document.createElement("script");
        script.type = "application/ld+json";
        script.dataset.seoLd = "page";
        script.text = JSON.stringify(item);
        document.head.appendChild(script);
        ldScripts.push(script);
      });
    }

    return () => {
      document.title = previousTitle;
      if (previousDesc !== null) metaDesc?.setAttribute("content", previousDesc);
      if (linkCanonical && previousCanonical !== null) linkCanonical.setAttribute("href", previousCanonical);
      ldScripts.forEach((s) => s.remove());
    };
  }, [title, description, canonical, JSON.stringify(jsonLd)]);
};
