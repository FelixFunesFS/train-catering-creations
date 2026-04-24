/**
 * Detects common typos in email domains (gmial.com, yaho.com, hotnail.com, etc.)
 * Returns a suggested correction or null when the email looks valid.
 */
const COMMON_DOMAINS = [
  "gmail.com",
  "yahoo.com",
  "hotmail.com",
  "outlook.com",
  "icloud.com",
  "aol.com",
  "live.com",
  "msn.com",
  "comcast.net",
  "me.com",
  "protonmail.com",
];

const KNOWN_TYPOS: Record<string, string> = {
  "gmial.com": "gmail.com",
  "gmai.com": "gmail.com",
  "gmaill.com": "gmail.com",
  "gnail.com": "gmail.com",
  "gmail.co": "gmail.com",
  "gmail.cm": "gmail.com",
  "gmail.con": "gmail.com",
  "yaho.com": "yahoo.com",
  "yahooo.com": "yahoo.com",
  "yahho.com": "yahoo.com",
  "yahoo.co": "yahoo.com",
  "hotnail.com": "hotmail.com",
  "hotmial.com": "hotmail.com",
  "hotmai.com": "hotmail.com",
  "hotmail.co": "hotmail.com",
  "outlok.com": "outlook.com",
  "outloo.com": "outlook.com",
  "iclod.com": "icloud.com",
  "icoud.com": "icloud.com",
  "aol.co": "aol.com",
};

function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (!m) return n;
  if (!n) return m;
  const dp: number[] = Array(n + 1).fill(0).map((_, i) => i);
  for (let i = 1; i <= m; i++) {
    let prev = dp[0];
    dp[0] = i;
    for (let j = 1; j <= n; j++) {
      const tmp = dp[j];
      dp[j] = a[i - 1] === b[j - 1] ? prev : Math.min(prev, dp[j], dp[j - 1]) + 1;
      prev = tmp;
    }
  }
  return dp[n];
}

export function suggestEmailCorrection(email: string): string | null {
  if (!email || !email.includes("@")) return null;
  const [local, domain] = email.toLowerCase().trim().split("@");
  if (!local || !domain) return null;

  if (KNOWN_TYPOS[domain]) {
    return `${local}@${KNOWN_TYPOS[domain]}`;
  }

  // Already a known domain — no suggestion
  if (COMMON_DOMAINS.includes(domain)) return null;

  // Find the closest common domain within edit distance 2
  let best: { domain: string; distance: number } | null = null;
  for (const d of COMMON_DOMAINS) {
    const dist = levenshtein(domain, d);
    if (dist > 0 && dist <= 2 && (!best || dist < best.distance)) {
      best = { domain: d, distance: dist };
    }
  }
  return best ? `${local}@${best.domain}` : null;
}
