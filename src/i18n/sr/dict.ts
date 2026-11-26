/**
 * Builds a dictionary from [English, Serbian] pairs written in reading order.
 * A repeated English text is fine when its translation is the same; a different
 * translation for the same text is a mistake and throws (tests load every dictionary).
 */
export function dict(pairs: [string, string][]): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [en, sr] of pairs) {
    if (en in out && out[en] !== sr) throw new Error(`Two Serbian translations for "${en}": "${out[en]}" and "${sr}"`);
    out[en] = sr;
  }
  return out;
}
