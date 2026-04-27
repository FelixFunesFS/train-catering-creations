import type { SeoPageData } from "./types";

const BASE_URL = "https://www.soultrainseatery.com";
const PHONE = "+1-843-970-0265";
const EMAIL = "soultrainseatery@gmail.com";

const localBusinessNode = () => ({
  "@type": "LocalBusiness",
  "@id": `${BASE_URL}/#business`,
  name: "Soul Train's Eatery",
  image: `${BASE_URL}/images/logo-red.svg`,
  url: BASE_URL,
  telephone: PHONE,
  email: EMAIL,
  priceRange: "$$",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Charleston",
    addressRegion: "SC",
    addressCountry: "US",
  },
  areaServed: [
    { "@type": "City", name: "Charleston" },
    { "@type": "City", name: "Mount Pleasant" },
    { "@type": "City", name: "Daniel Island" },
    { "@type": "City", name: "North Charleston" },
    { "@type": "City", name: "Summerville" },
    { "@type": "Place", name: "Charleston Lowcountry" },
  ],
});

export const buildSeoSchema = (page: SeoPageData) => {
  const canonical = `${BASE_URL}${page.slug}`;

  const imageUrls = [page.heroImage, ...(page.gallery?.map((g) => g.src) ?? [])]
    .filter(Boolean)
    .map((src) => (src.startsWith("http") ? src : `${BASE_URL}${src.startsWith("/") ? "" : "/"}${src}`));

  const serviceNode = {
    "@type": "Service",
    name: page.eyebrow,
    serviceType: page.eyebrow,
    description: page.metaDescription,
    provider: { "@id": `${BASE_URL}/#business` },
    image: imageUrls,
    areaServed: page.localProof.venues?.length
      ? page.localProof.venues.map((v) => ({ "@type": "Place", name: v }))
      : [{ "@type": "Place", name: "Charleston Lowcountry" }],
    url: canonical,
  };

  const faqNode = {
    "@type": "FAQPage",
    mainEntity: page.faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };

  const breadcrumbNode = {
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: BASE_URL },
      { "@type": "ListItem", position: 2, name: page.eyebrow, item: canonical },
    ],
  };

  return {
    "@context": "https://schema.org",
    "@graph": [localBusinessNode(), serviceNode, faqNode, breadcrumbNode],
  };
};
