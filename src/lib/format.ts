// Shared formatting helpers, safe to use from both server and client components.

const FRACTIONS: [number, string][] = [
  [1 / 8, "⅛"], [1 / 4, "¼"], [1 / 3, "⅓"], [3 / 8, "⅜"], [1 / 2, "½"],
  [5 / 8, "⅝"], [2 / 3, "⅔"], [3 / 4, "¾"], [7 / 8, "⅞"],
];

/** Render a quantity like 1.5 as "1½", rounding awkward decimals sensibly. */
export function formatQuantity(value: number | null): string {
  if (value === null || !Number.isFinite(value) || value <= 0) return "";
  if (value >= 10) return String(Math.round(value));
  const whole = Math.floor(value);
  const rest = value - whole;
  if (rest < 0.06) return String(whole);
  if (rest > 0.94) return String(whole + 1);
  const [, glyph] = FRACTIONS.reduce((best, candidate) =>
    Math.abs(candidate[0] - rest) < Math.abs(best[0] - rest) ? candidate : best,
  );
  return whole > 0 ? `${whole}${glyph}` : glyph;
}

/** Parse "1 1/2", "3/4", "1.5" or "2" into a number. Returns null for blank input. */
export function parseQuantity(input: string): number | null {
  const text = input.trim();
  if (!text) return null;
  const mixed = text.match(/^(\d+)\s+(\d+)\/(\d+)$/);
  if (mixed) return Number(mixed[1]) + Number(mixed[2]) / Number(mixed[3]);
  const fraction = text.match(/^(\d+)\/(\d+)$/);
  if (fraction) return Number(fraction[1]) / Number(fraction[2]);
  const number = Number(text);
  return Number.isFinite(number) && number > 0 ? number : NaN;
}

export function formatMinutes(total: number): string {
  if (!total) return "0 min";
  const hours = Math.floor(total / 60);
  const minutes = total % 60;
  if (!hours) return `${minutes} min`;
  return minutes ? `${hours} h ${minutes} min` : `${hours} h`;
}

/** SQLite stores UTC timestamps without a zone marker. */
export function parseDbDate(value: string): Date {
  return new Date(value.includes("T") ? value : `${value.replace(" ", "T")}Z`);
}

export function timeAgo(value: string): string {
  const seconds = Math.round((Date.now() - parseDbDate(value).getTime()) / 1000);
  const units: [number, Intl.RelativeTimeFormatUnit][] = [
    [60, "second"], [60, "minute"], [24, "hour"], [7, "day"], [4.35, "week"], [12, "month"], [Infinity, "year"],
  ];
  let amount = seconds;
  for (const [size, unit] of units) {
    if (Math.abs(amount) < size) {
      return new Intl.RelativeTimeFormat("en", { numeric: "auto" }).format(-Math.round(amount), unit);
    }
    amount /= size;
  }
  return "";
}

export function formatDate(value: string): string {
  return parseDbDate(value).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export function initials(name: string): string {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]!.toUpperCase()).join("");
}

/** Local calendar date as YYYY-MM-DD. */
export function toISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function splitTags(tags: string): string[] {
  return tags.split(",").map((tag) => tag.trim()).filter(Boolean);
}
