import QRCode from "qrcode";
import { BRAND_CONTACT } from "@/utils/brandMessaging";

/** Print spec: 3.5" x 2" at 300 DPI plus 0.125" bleed on every side. */
export const CARD = { dpi: 300, trimW: 1050, trimH: 600, bleed: 38 } as const;
export const FULL_W = CARD.trimW + CARD.bleed * 2;
export const FULL_H = CARD.trimH + CARD.bleed * 2;

export const CARD_INFO = {
  ...BRAND_CONTACT,
  founders: 'Chef Dominick "Train" Ward & Tanya Ward',
  website: "www.soultrainseatery.com",
  quoteUrl: "https://www.soultrainseatery.com/request-quote",
  services: "Weddings  ·  Military  ·  Corporate  ·  Social Gatherings",
} as const;

// Artwork palette (fixed print colors, mirrors --primary and --gold tokens)
const INK = "#0a1224";
const INK_2 = "#111d36";
const RUBY = "#d91e43";
const PEARL = "#f6f1e7";
const MUTED = "rgba(246,241,231,0.62)";

const loadImage = (src: string) =>
  new Promise<HTMLImageElement>((res, rej) => {
    const i = new Image();
    i.onload = () => res(i);
    i.onerror = rej;
    i.src = src;
  });

function gold(ctx: CanvasRenderingContext2D, x0: number, y0: number, x1: number, y1: number) {
  const g = ctx.createLinearGradient(x0, y0, x1, y1);
  g.addColorStop(0, "#8a6a1f");
  g.addColorStop(0.28, "#f3dc8b");
  g.addColorStop(0.5, "#c9a03d");
  g.addColorStop(0.72, "#fbe9a8");
  g.addColorStop(1, "#9c7622");
  return g;
}

function base(ctx: CanvasRenderingContext2D) {
  const bg = ctx.createRadialGradient(FULL_W * 0.3, FULL_H * 0.2, 40, FULL_W * 0.5, FULL_H * 0.5, FULL_W * 0.8);
  bg.addColorStop(0, INK_2);
  bg.addColorStop(1, INK);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, FULL_W, FULL_H);
  // linen micro-texture
  ctx.globalAlpha = 0.05;
  ctx.fillStyle = PEARL;
  for (let y = 0; y < FULL_H; y += 3) ctx.fillRect(0, y, FULL_W, 1);
  ctx.globalAlpha = 0.03;
  for (let x = 0; x < FULL_W; x += 4) ctx.fillRect(x, 0, 1, FULL_H);
  ctx.globalAlpha = 1;
  // inset hairline frame
  const m = CARD.bleed + 34;
  ctx.strokeStyle = gold(ctx, 0, 0, FULL_W, FULL_H);
  ctx.lineWidth = 2;
  ctx.strokeRect(m, m, FULL_W - m * 2, FULL_H - m * 2);
  ctx.globalAlpha = 0.35;
  ctx.strokeRect(m + 10, m + 10, FULL_W - (m + 10) * 2, FULL_H - (m + 10) * 2);
  ctx.globalAlpha = 1;
}

function text(
  ctx: CanvasRenderingContext2D, s: string, x: number, y: number,
  font: string, fill: string | CanvasGradient, align: CanvasTextAlign = "center", spacing = 0,
) {
  ctx.font = font;
  ctx.textAlign = align;
  ctx.textBaseline = "alphabetic";
  (ctx as CanvasRenderingContext2D & { letterSpacing?: string }).letterSpacing = `${spacing}px`;
  ctx.shadowColor = "rgba(0,0,0,0.55)";
  ctx.shadowOffsetY = 3;
  ctx.shadowBlur = 6;
  ctx.fillStyle = fill;
  ctx.fillText(s, x, y);
  ctx.shadowColor = "transparent";
  (ctx as CanvasRenderingContext2D & { letterSpacing?: string }).letterSpacing = "0px";
}

async function fonts() {
  try {
    await Promise.all([
      document.fonts.load('600 72px "Playfair Display"'),
      document.fonts.load('italic 400 30px "Playfair Display"'),
      document.fonts.load('500 26px "Inter"'),
    ]);
  } catch { /* fall back to serif */ }
}

export async function renderFront(): Promise<HTMLCanvasElement> {
  await fonts();
  const c = document.createElement("canvas");
  c.width = FULL_W; c.height = FULL_H;
  const ctx = c.getContext("2d")!;
  base(ctx);
  // Left anchor column: crest, gold hairline, est. line
  const lx = CARD.bleed + 200;
  try {
    const logo = await loadImage("/lovable-uploads/e9a7fbdd-021d-4e32-9cdf-9a1f20d396e9.png");
    ctx.shadowColor = "rgba(0,0,0,0.6)"; ctx.shadowBlur = 18; ctx.shadowOffsetY = 6;
    ctx.drawImage(logo, lx - 85, 170, 170, 170);
    ctx.shadowColor = "transparent";
  } catch { /* logo optional */ }
  text(ctx, "EST. CHARLESTON, SC", lx, 420, '600 16px "Inter", sans-serif', gold(ctx, lx - 120, 0, lx + 120, 0), "center", 4);
  text(ctx, "FAMILY-RUN", lx, 452, '500 15px "Inter", sans-serif', MUTED, "center", 4);
  // vertical divider
  const dx = CARD.bleed + 380;
  ctx.fillStyle = gold(ctx, 0, 130, 0, FULL_H - 130);
  ctx.fillRect(dx, 140, 2, FULL_H - 280);

  // Right editorial column (left aligned)
  const rx = dx + 56;
  text(ctx, "Soul Train's", rx, 250, '600 76px "Playfair Display", serif', gold(ctx, rx, 180, rx + 520, 260), "left");
  text(ctx, "Eatery", rx, 330, '600 76px "Playfair Display", serif', gold(ctx, rx, 260, rx + 520, 340), "left");
  text(ctx, "Charleston's Trusted Catering Partner", rx, 390, 'italic 400 30px "Playfair Display", serif', PEARL, "left");
  ctx.fillStyle = RUBY;
  ctx.beginPath(); ctx.arc(rx + 6, 452, 6, 0, Math.PI * 2); ctx.fill();
  text(ctx, CARD_INFO.founders, rx + 26, 460, '500 22px "Inter", sans-serif', PEARL, "left");
  text(ctx, "AUTHENTIC SOUTHERN COOKING", rx, 520, '500 16px "Inter", sans-serif', MUTED, "left", 3);
  text(ctx, "WEDDINGS · MILITARY · CORPORATE · SOCIAL", rx, 552, '500 16px "Inter", sans-serif', MUTED, "left", 3);
  return c;
}

export async function renderBack(): Promise<HTMLCanvasElement> {
  await fonts();
  const c = document.createElement("canvas");
  c.width = FULL_W; c.height = FULL_H;
  const ctx = c.getContext("2d")!;
  base(ctx);

  // QR panel (pearl plate floating above the card)
  const qrSize = 300, px = CARD.bleed + 110, py = (FULL_H - qrSize) / 2 - 10;
  ctx.shadowColor = "rgba(0,0,0,0.6)"; ctx.shadowBlur = 30; ctx.shadowOffsetY = 12;
  ctx.fillStyle = PEARL;
  ctx.beginPath(); ctx.roundRect(px - 22, py - 22, qrSize + 44, qrSize + 44, 18); ctx.fill();
  ctx.shadowColor = "transparent";
  const qr = document.createElement("canvas");
  await QRCode.toCanvas(qr, CARD_INFO.quoteUrl, { width: qrSize, margin: 0, errorCorrectionLevel: "H", color: { dark: INK, light: PEARL } });
  ctx.drawImage(qr, px, py, qrSize, qrSize);
  text(ctx, "SCAN TO REQUEST A QUOTE", px + qrSize / 2, py + qrSize + 66, '600 17px "Inter", sans-serif', gold(ctx, px, 0, px + qrSize, 0), "center", 3);

  // contact column
  const x = px + qrSize + 110;
  text(ctx, "Let's feed your people.", x, 210, 'italic 400 42px "Playfair Display", serif', PEARL, "left");
  ctx.fillStyle = RUBY; ctx.fillRect(x, 236, 80, 3);
  const rows: [string, string][] = [
    ["CALL", CARD_INFO.phone],
    ["EMAIL", CARD_INFO.email],
    ["WEB", CARD_INFO.website],
  ];
  rows.forEach(([label, val], i) => {
    const y = 300 + i * 72;
    text(ctx, label, x, y - 26, '600 15px "Inter", sans-serif', gold(ctx, x, 0, x + 80, 0), "left", 4);
    text(ctx, val, x, y + 6, '500 30px "Inter", sans-serif', PEARL, "left");
  });
  text(ctx, "Proudly serving Charleston's Lowcountry", x, 520, 'italic 400 21px "Playfair Display", serif', MUTED, "left");
  text(ctx, "& surrounding areas", x, 550, 'italic 400 21px "Playfair Display", serif', MUTED, "left");
  return c;
}

export const canvasToBlob = (c: HTMLCanvasElement) =>
  new Promise<Blob>((r) => c.toBlob((b) => r(b!), "image/png"));

export function buildVCard(): string {
  return [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `N:;${CARD_INFO.name};;;`,
    `FN:${CARD_INFO.name}`,
    `ORG:${CARD_INFO.name}`,
    `TITLE:${CARD_INFO.tagline}`,
    `TEL;TYPE=WORK,VOICE:+1${CARD_INFO.phoneRaw}`,
    `EMAIL;TYPE=WORK:${CARD_INFO.email}`,
    `URL:https://${CARD_INFO.website}`,
    "ADR;TYPE=WORK:;;;Charleston;SC;;USA",
    `NOTE:${CARD_INFO.founders}. ${CARD_INFO.serviceArea}.`,
    "END:VCARD",
  ].join("\r\n");
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30_000);
}
