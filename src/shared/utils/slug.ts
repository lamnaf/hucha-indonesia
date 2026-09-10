const DIACRITICS_MAP: Record<string, string> = {
  à: "a",
  á: "a",
  â: "a",
  ã: "a",
  ä: "a",
  å: "a",
  ç: "c",
  è: "e",
  é: "e",
  ê: "e",
  ë: "e",
  ì: "i",
  í: "i",
  î: "i",
  ï: "i",
  ñ: "n",
  ò: "o",
  ó: "o",
  ô: "o",
  õ: "o",
  ö: "o",
  ù: "u",
  ú: "u",
  û: "u",
  ü: "u",
  ý: "y",
  ÿ: "y",
  æ: "ae",
  œ: "oe",
  ß: "ss",
};

function transliterate(input: string): string {
  let output = input;
  for (const [source, target] of Object.entries(DIACRITICS_MAP)) {
    output = output.replaceAll(source, target);
    output = output.replaceAll(source.toUpperCase(), target.toUpperCase());
  }
  return output
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");
}

/**
 * Generates a URL-safe slug: lowercase, ASCII, hyphen-separated.
 * Non-ASCII/Indonesian diacritics are transliterated to ASCII (blueprint §27).
 */
export function slugify(input: string): string {
  return transliterate(input)
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "");
}
