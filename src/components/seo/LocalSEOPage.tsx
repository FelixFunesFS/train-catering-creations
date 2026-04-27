import { Link } from "react-router-dom";
import { Phone, ArrowRight, Heart, Star, Award, Users, Calendar, MapPin, Sparkles, Utensils, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useDocumentHead } from "@/hooks/useDocumentHead";
import { buildCanonical } from "@/data/seoPages/pages";
import { buildSeoSchema } from "@/data/seoPages/schema";
import type { SeoPageData, SeoHighlight } from "@/data/seoPages/types";

const ICON_MAP: Record<SeoHighlight["icon"], typeof Heart> = {
  Utensils,
  Heart,
  Star,
  Award,
  Users,
  Calendar,
  MapPin,
  Sparkles,
};

interface LocalSEOPageProps {
  page: SeoPageData;
}

const getInitials = (name: string) =>
  name
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

export const LocalSEOPage = ({ page }: LocalSEOPageProps) => {
  useDocumentHead({
    title: page.metaTitle,
    description: page.metaDescription,
    canonical: buildCanonical(page.slug),
    ogImage: page.heroImage,
    jsonLd: buildSeoSchema(page),
  });

  return (
    <article className="min-h-screen bg-background">
      {/* HERO with photo */}
      <section className="relative overflow-hidden border-b border-border">
        {/* Background image */}
        <div className="absolute inset-0">
          <img
            src={page.heroImage}
            alt={page.heroImageAlt}
            className="h-full w-full object-cover"
            loading="eager"
            // @ts-expect-error fetchpriority is valid HTML
            fetchpriority="high"
            decoding="async"
          />
          {/* Scrim — keeps headline readable on any photo */}
          <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/85 to-background/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
        </div>

        <div className="relative max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 py-20 lg:py-28">
          <div className="max-w-3xl">
            <Badge variant="secondary" className="mb-5 text-xs uppercase tracking-wider font-medium shadow-sm">
              {page.eyebrow}
            </Badge>
            <h1 className="font-elegant text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-[1.05] tracking-tight drop-shadow-sm">
              {page.headline}
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-foreground/90 leading-relaxed max-w-2xl">
              {page.subheadline}
            </p>

            {/* Trust pills */}
            <div className="mt-8 flex flex-wrap gap-2">
              {page.trustPoints.map((point) => (
                <span
                  key={point}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card/90 backdrop-blur border border-border text-xs sm:text-sm text-foreground/85 shadow-sm"
                >
                  <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                  {point}
                </span>
              ))}
            </div>

            {/* CTAs */}
            <div className="mt-10 flex flex-col sm:flex-row gap-3">
              <Button asChild size="lg" className="text-base shadow-lg">
                <Link to={page.primaryCta.href}>
                  {page.primaryCta.label}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="text-base bg-card/80 backdrop-blur">
                <a href={page.secondaryCta.href}>
                  <Phone className="mr-2 h-4 w-4" />
                  {page.secondaryCta.label}
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* INTRO */}
      <section className="max-w-3xl mx-auto px-6 sm:px-8 lg:px-12 py-12 lg:py-16">
        <p className="text-base sm:text-lg text-foreground/85 leading-relaxed">{page.intro}</p>
      </section>

      {/* HIGHLIGHTS */}
      <section className="bg-muted/20 border-y border-border">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 py-14 lg:py-20">
          <div className="max-w-2xl mb-10">
            <h2 className="font-elegant text-3xl sm:text-4xl font-bold text-foreground">
              What You Get With Soul Train's Eatery
            </h2>
            <p className="mt-3 text-muted-foreground">
              Hospitality, precision, and flavor — every event, every time.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {page.highlights.map((h) => {
              const Icon = ICON_MAP[h.icon];
              return (
                <div
                  key={h.title}
                  className="group p-6 rounded-xl bg-card border border-border hover:border-primary/40 transition-all duration-300 hover:shadow-lg"
                >
                  <div className="w-11 h-11 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/15 transition-colors">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-elegant text-lg font-semibold text-foreground mb-2">
                    {h.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{h.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* GALLERY STRIP — visual proof */}
      {page.gallery && page.gallery.length >= 3 && (
        <section className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 py-14 lg:py-20">
          <div className="max-w-2xl mb-8">
            <h2 className="font-elegant text-3xl sm:text-4xl font-bold text-foreground">
              See the Soul on Every Plate
            </h2>
            <p className="mt-3 text-muted-foreground">
              Real moments from {page.eyebrow.toLowerCase()} we've catered across the Charleston Lowcountry.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
            {/* Large left image spans 2 cols on desktop */}
            <figure className="md:col-span-2 md:row-span-2 relative overflow-hidden rounded-2xl border border-border bg-muted aspect-[4/3] md:aspect-auto group">
              <img
                src={page.gallery[0].src}
                alt={page.gallery[0].alt}
                loading="lazy"
                decoding="async"
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
              />
            </figure>
            {page.gallery.slice(1, 3).map((g, idx) => (
              <figure
                key={idx}
                className="relative overflow-hidden rounded-2xl border border-border bg-muted aspect-[4/3] group"
              >
                <img
                  src={g.src}
                  alt={g.alt}
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.05]"
                />
              </figure>
            ))}
          </div>
        </section>
      )}

      {/* LOCAL PROOF */}
      <section className="bg-muted/10 border-y border-border">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 py-14 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
            <div className="lg:col-span-2">
              <h2 className="font-elegant text-3xl sm:text-4xl font-bold text-foreground">
                {page.localProof.title}
              </h2>
              <p className="mt-4 text-muted-foreground leading-relaxed">{page.localProof.body}</p>
            </div>
            {page.localProof.venues && page.localProof.venues.length > 0 && (
              <div className="rounded-xl bg-card border border-border p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="h-4 w-4 text-primary" />
                  <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
                    Areas & Venues
                  </h3>
                </div>
                <ul className="space-y-2">
                  {page.localProof.venues.map((v) => (
                    <li key={v} className="flex items-start text-sm text-foreground/85">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 mr-3 flex-shrink-0" />
                      {v}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      {page.testimonials.length > 0 && (
        <section className="bg-gradient-to-br from-primary/5 via-background to-primary/5 border-b border-border">
          <div className="max-w-5xl mx-auto px-6 sm:px-8 lg:px-12 py-14 lg:py-20">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {page.testimonials.map((t, i) => (
                <figure
                  key={i}
                  className="p-7 rounded-xl bg-card border border-border shadow-sm"
                >
                  <div className="flex gap-1 mb-3">
                    {Array.from({ length: 5 }).map((_, idx) => (
                      <Star key={idx} className="h-4 w-4 text-primary" fill="currentColor" />
                    ))}
                  </div>
                  <blockquote className="text-base text-foreground/90 italic leading-relaxed">
                    "{t.quote}"
                  </blockquote>
                  <figcaption className="mt-5 flex items-center gap-3">
                    <span
                      className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 text-primary font-semibold text-sm flex items-center justify-center border border-primary/20"
                      aria-hidden
                    >
                      {getInitials(t.author)}
                    </span>
                    <span className="text-sm">
                      <span className="font-semibold text-foreground block">{t.author}</span>
                      <span className="text-muted-foreground">{t.detail}</span>
                    </span>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-6 sm:px-8 lg:px-12 py-14 lg:py-20">
        <h2 className="font-elegant text-3xl sm:text-4xl font-bold text-foreground mb-3">
          Frequently Asked Questions
        </h2>
        <p className="text-muted-foreground mb-8">
          Quick answers about {page.eyebrow.toLowerCase()} with Soul Train's Eatery.
        </p>
        <Accordion type="single" collapsible className="space-y-3">
          {page.faqs.map((faq, idx) => (
            <AccordionItem
              key={idx}
              value={`item-${idx}`}
              className="rounded-xl border border-border bg-card px-5"
            >
              <AccordionTrigger className="text-left font-semibold text-foreground hover:no-underline">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      {/* FINAL CTA with background imagery */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
        {page.ctaBackgroundImage && (
          <div className="absolute inset-0 pointer-events-none" aria-hidden>
            <img
              src={page.ctaBackgroundImage}
              alt=""
              loading="lazy"
              className="h-full w-full object-cover opacity-15"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-primary/85 to-primary/70 mix-blend-multiply" />
          </div>
        )}
        <div className="relative max-w-4xl mx-auto px-6 sm:px-8 lg:px-12 py-14 lg:py-20 text-center">
          <h2 className="font-elegant text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">
            Let's Plan Something Unforgettable
          </h2>
          <p className="mt-4 text-primary-foreground/90 text-base sm:text-lg max-w-2xl mx-auto">
            Family-run, Charleston-rooted, and ready to bring soul to your next event.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild size="lg" variant="secondary" className="text-base shadow-lg">
              <Link to={page.primaryCta.href}>
                {page.primaryCta.label}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="text-base bg-transparent border-primary-foreground/40 text-primary-foreground hover:bg-primary-foreground hover:text-primary"
            >
              <a href={page.secondaryCta.href}>
                <Phone className="mr-2 h-4 w-4" />
                {page.secondaryCta.label}
              </a>
            </Button>
          </div>
          <p className="mt-6 text-sm text-primary-foreground/80">
            Proudly serving Charleston, SC and the surrounding Lowcountry
          </p>
        </div>
      </section>
    </article>
  );
};

export default LocalSEOPage;
