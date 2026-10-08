import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const SITE = "https://www.soultrainseatery.com";

/** Per-route head tags for core pages. SEO landing pages manage their own via useDocumentHead. */
const ROUTE_META: Record<string, { title: string; description: string; image?: string }> = {
  "/": {
    image: "/og/home.jpg",
    title: "Soul Train's Eatery | Charleston Catering",
    description: "Family-run Southern catering for weddings, military functions, corporate events and gatherings across Charleston's Lowcountry.",
  },
  "/about": {
    image: "/og/about.jpg",
    title: "About Our Family | Soul Train's Eatery",
    description: "Meet the family behind Soul Train's Eatery and our passion for authentic Southern cooking that brings Charleston together.",
  },
  "/menu": {
    image: "/og/menu.jpg",
    title: "Catering Menu | Soul Train's Eatery",
    description: "Explore our Southern catering menu: proteins, sides, desserts and wedding packages for Charleston events of every size.",
  },
  "/request-quote": {
    image: "/og/quote.jpg",
    title: "Request a Catering Quote | Soul Train's Eatery",
    description: "Tell us about your wedding, military function or event and get a stress-free catering quote from Soul Train's Eatery.",
  },
  "/reviews": {
    image: "/og/reviews.jpg",
    title: "Customer Reviews | Soul Train's Eatery",
    description: "See what Charleston families, couples and organizations say about catering from Soul Train's Eatery.",
  },
  "/gallery": {
    image: "/og/gallery.jpg",
    title: "Event Gallery | Soul Train's Eatery",
    description: "Photos of weddings, buffets, desserts and formal events catered by Soul Train's Eatery across the Lowcountry.",
  },
  "/faq": {
    image: "/og/faq.jpg",
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
    const isPrivate = path.startsWith("/admin") || path.startsWith("/staff");
    const isNoIndex = isPrivate || path.startsWith("/portfolio");
    upsertMeta("name", "robots", isNoIndex ? "noindex, nofollow" : "index, follow");
    const privateMeta = path.startsWith("/staff")
      ? { title: "Staff & Team Schedule | Soul Train's Eatery", description: "Sign-in for Soul Train's Eatery event crew: schedules, prep sheets and event details." }
      : { title: "Admin Portal | Soul Train's Eatery", description: "Secure sign-in for Soul Train's Eatery administrators to manage catering events and payments." };
    const meta: { title: string; description: string; image?: string } | undefined = isPrivate ? privateMeta : ROUTE_META[path];
    if (!meta) return;
    const url = `${SITE}${path === "/" ? "/" : path}`;
    document.title = meta.title;
    upsertMeta("name", "description", meta.description);
    upsertMeta("property", "og:title", meta.title);
    upsertMeta("property", "og:description", meta.description);
    upsertMeta("property", "og:url", url);
    upsertMeta("name", "twitter:title", meta.title);
    upsertMeta("name", "twitter:description", meta.description);
    const image = `${SITE}${meta.image ?? "/og/home.jpg"}`;
    upsertMeta("property", "og:image", image);
    upsertMeta("name", "twitter:image", image);
    upsertMeta("name", "twitter:card", "summary_large_image");
    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", url);
  }, [pathname]);
};
