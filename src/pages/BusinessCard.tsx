import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Download, Printer, RotateCw, Share2, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  renderFront, renderBack, type FrontStyle, canvasToBlob, buildVCard, downloadBlob, CARD, FULL_W, CARD_INFO,
} from "@/lib/businessCard/render";


export default function BusinessCard() {
  const [front, setFront] = useState<HTMLCanvasElement | null>(null);
  const [back, setBack] = useState<HTMLCanvasElement | null>(null);
  const [style, setStyle] = useState<FrontStyle>("editorial");
  const [flipped, setFlipped] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const stage = useRef<HTMLDivElement>(null);
  const reduce = typeof window !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    document.title = "Business Card | Soul Train's Eatery";
    renderBack().then(setBack);
  }, []);

  useEffect(() => {
    renderFront(style).then(setFront);
  }, [style]);

  const onMove = (e: React.PointerEvent) => {
    if (reduce || !stage.current) return;
    const r = stage.current.getBoundingClientRect();
    setTilt({ x: ((e.clientY - r.top) / r.height - 0.5) * -14, y: ((e.clientX - r.left) / r.width - 0.5) * 18 });
  };

  const save = async (c: HTMLCanvasElement | null, side: string) => {
    if (!c) return;
    downloadBlob(await canvasToBlob(c), `soul-trains-eatery-card-${side}-300dpi.png`);
  };

  const saveContact = () =>
    downloadBlob(new Blob([buildVCard()], { type: "text/vcard;charset=utf-8" }), "Soul-Trains-Eatery.vcf");

  const share = async () => {
    const url = `${window.location.origin}/card`;
    if (navigator.share) {
      try { await navigator.share({ title: CARD_INFO.name, text: CARD_INFO.tagline, url }); } catch { /* cancelled */ }
    } else {
      await navigator.clipboard.writeText(url);
      toast.success("Card link copied");
    }
  };

  const face = (c: HTMLCanvasElement | null, label: string) => (
    <div className="absolute inset-0 overflow-hidden rounded-xl [backface-visibility:hidden]" aria-label={label} role="img">
      {c && (
        <img
          src={c.toDataURL("image/png")}
          alt=""
          className="absolute max-w-none"
          style={{ width: `${(FULL_W / CARD.trimW) * 100}%`, left: `-${(CARD.bleed / CARD.trimW) * 100}%`, top: `-${(CARD.bleed / CARD.trimH) * 100}%` }}
        />
      )}
      {/* moving light glint */}
      <div
        className="pointer-events-none absolute inset-0 mix-blend-overlay transition-opacity"
        style={{ background: `radial-gradient(circle at ${50 + tilt.y * 3}% ${50 - tilt.x * 3}%, hsl(var(--gold-light) / 0.45), transparent 55%)` }}
      />
    </div>
  );

  return (
    <main className="min-h-screen bg-foreground text-background print:bg-transparent">
      <nav className="mx-auto flex max-w-5xl items-center px-5 pt-[calc(1rem+env(safe-area-inset-top))] print:hidden">
        <Link to="/" className="inline-flex min-h-11 items-center gap-2 text-sm text-background/70 transition-colors hover:text-gold focus-visible:text-gold focus-visible:outline-none">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" /> soultrainseatery.com
        </Link>
      </nav>
      <section className="mx-auto flex max-w-5xl flex-col items-center px-5 pb-10 pt-6 md:pt-12 print:hidden">
        <p className="text-xs uppercase tracking-[0.3em] text-gold">Soul Train's Eatery</p>
        <h1 className="mt-3 text-center font-elegant text-3xl md:text-5xl">Our card, in your pocket</h1>
        <p className="mt-3 max-w-md text-center text-sm text-background/70">
          Tap the card to flip it. Save our number straight to your phone, or share it with whoever's planning the party.
        </p>

        <div role="radiogroup" aria-label="Card design" className="mt-8 grid w-full max-w-[360px] grid-cols-2 gap-1 rounded-full border border-background/20 p-1">
          {([["editorial", "Editorial"], ["centered", "Centered"]] as const).map(([k, label]) => (
            <button
              key={k}
              role="radio"
              aria-checked={style === k}
              onClick={() => { setStyle(k); setFlipped(false); }}
              className={`min-h-11 rounded-full text-sm font-medium transition-colors ${style === k ? "bg-gold text-gold-foreground" : "text-background/75 hover:text-background"}`}
            >
              {label}
            </button>
          ))}
        </div>

        <div
          ref={stage}
          onPointerMove={onMove}
          onPointerLeave={() => setTilt({ x: 0, y: 0 })}
          className="mt-6 w-full max-w-[560px] [perspective:1400px]"
        >
          <button
            type="button"
            onClick={() => setFlipped((f) => !f)}
            aria-label={flipped ? "Show front of card" : "Show back of card"}
            className="relative block aspect-[7/4] w-full rounded-xl transition-transform duration-700 ease-[cubic-bezier(.2,.8,.2,1)] [transform-style:preserve-3d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-4 focus-visible:ring-offset-foreground"
            style={{
              transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y + (flipped ? 180 : 0)}deg)`,
              boxShadow: "0 40px 80px -20px hsl(0 0% 0% / 0.7), 0 12px 24px -8px hsl(0 0% 0% / 0.5)",
            }}
          >
            {face(front, "Front of business card")}
            <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)]">{face(back, "Back of business card")}</div>
            {!front && <div className="absolute inset-0 animate-pulse rounded-xl bg-background/10" />}
          </button>
        </div>

        <button type="button" onClick={() => setFlipped((f) => !f)} className="inline-flex items-center rounded-md text-sm font-medium text-background/85 transition-colors hover:bg-background/10 hover:text-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold mt-5 h-11 px-4">
          <RotateCw className="mr-2 h-4 w-4" /> Flip card
        </button>

        <div className="mt-6 grid w-full max-w-[560px] grid-cols-1 gap-3 sm:grid-cols-2">
          <Button size="lg" onClick={saveContact} className="h-12 bg-gold text-gold-foreground hover:bg-gold-light">
            <UserPlus className="mr-2 h-4 w-4" /> Save to contacts
          </Button>
          <button type="button" onClick={share} className="inline-flex items-center rounded-md text-sm font-medium text-background/85 transition-colors hover:bg-background/10 hover:text-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold h-12 justify-center border border-background/25">
            <Share2 className="mr-2 h-4 w-4" /> Share card
          </button>
        </div>

        <div className="mt-10 w-full max-w-[560px] border-t border-background/15 pt-6">
          <p className="text-xs uppercase tracking-[0.25em] text-background/60">Print-ready files · 3.5 × 2 in · 300 DPI · bleed included</p>
          <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
            <button type="button" onClick={() => save(front, "front")} className="inline-flex items-center rounded-md text-sm font-medium text-background/85 transition-colors hover:bg-background/10 hover:text-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold h-11 px-3 justify-start">
              <Download className="mr-2 h-4 w-4" /> Front (PNG)
            </button>
            <button type="button" onClick={() => save(back, "back")} className="inline-flex items-center rounded-md text-sm font-medium text-background/85 transition-colors hover:bg-background/10 hover:text-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold h-11 px-3 justify-start">
              <Download className="mr-2 h-4 w-4" /> Back (PNG)
            </button>
            <button type="button" onClick={() => window.print()} className="inline-flex items-center rounded-md text-sm font-medium text-background/85 transition-colors hover:bg-background/10 hover:text-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold h-11 px-3 justify-start">
              <Printer className="mr-2 h-4 w-4" /> Save as PDF
            </button>
          </div>
        </div>
      </section>

      <footer className="mx-auto max-w-5xl px-5 pb-[calc(2rem+env(safe-area-inset-bottom))] text-center print:hidden">
        <Link to="/menu" className="inline-flex min-h-11 items-center text-sm font-medium text-gold underline-offset-4 hover:underline">
          Explore menus &amp; request a quote
        </Link>
        <p className="mt-2 text-xs text-background/60">Soul Train's Eatery · Charleston, SC</p>
      </footer>

      {/* Print layout: one card face per page */}
      <div className="hidden print:block">
        <style>{`@page { size: 3.75in 2.25in; margin: 0; } html, body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }`}</style>
        {[front, back].map((c, i) => c && (
          <img key={i} src={c.toDataURL("image/png")} alt="" style={{ width: "3.75in", height: "2.25in", display: "block", breakAfter: "page" }} />
        ))}
      </div>
    </main>
  );
}
