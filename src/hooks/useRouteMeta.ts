import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const SITE = "https://www.soultrainseatery.com";

/** Per-route head tags for core pages. SEO landing pages manage their own via useDocumentHead. */
const ROUTE_META: Record<string, { title: string; description: string }> = {
  "/": {
    title: "Soul Train's Eatery | Charleston Catering",
    description: "Family-run Southern catering for weddings, military functions, corporate events and gatherings across Charleston's Lowcountry.",
  },
  "/about": {
    title: "About Our Family | Soul Train's Eatery",
    description: "Meet the family behind Soul Train's Eatery and our passion for authentic Southern cooking that brings Charleston together.",
  },
  "/menu": {
    title: "Catering Menu | Soul Train's Eatery",
    description: "Explore our Southern catering menu: proteins, sides, desserts and wedding packages for Charleston events of every size.",
  },
  "/request-quote": {
    title: "Request a Catering Quote | Soul Train's Eatery",
    description: "Tell us about your wedding, military function or event and get a stress-free catering quote from Soul Train's Eatery.",
  },
  "/reviews": {
    title: "Customer Reviews | Soul Train's Eatery",
    description: "See what Charleston families, couples and organizations say about catering from Soul Train's Eatery.",
  },
  "/gallery": {
    title: "Event Gallery | Soul Train's Eatery",
    description: "Photos of weddings, buffets, desserts and formal events catered by Soul Train's Eatery across the Lowcountry.",
  },
  "/faq": {
    title: "Catering FAQ | Soul Train's Eatery",
    description: "Answers about booking, payments, menus, military base events and service areas for Soul Train's Eatery catering.",
  },
  "/privacy-policy": {
    title: "Privacy Policy | Soul Train's Eatery",
    description: "How Soul Train's Eatery collects, uses and protects your information.",
  },
  "/terms-conditions": {
    title: "Terms & Conditions | Soul Train's Eatery",
    description: "Catering terms, payment schedule and cancellation policy for Soul Train's Eatery.",
  },
};

const upsertMeta = (attr: "name" | "property", key: string, content: string) => {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
};

export const useRouteMeta = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    const path = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
    const meta = ROUTE_META[path];
    if (!meta) return;
    const url = `${SITE}${path === "/" ? "/" : path}`;
    document.title = meta.title;
    upsertMeta("name", "description", meta.description);
    upsertMeta("property", "og:title", meta.title);
    upsertMeta("property", "og:description", meta.description);
    upsertMeta("property", "og:url", url);
    upsertMeta("name", "twitter:title", meta.title);
    upsertMeta("name", "twitter:description", meta.description);
    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", url);
  }, [pathname]);
};
