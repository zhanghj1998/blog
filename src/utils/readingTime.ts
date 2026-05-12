export function readingTime(text: string): number {
  // Chinese: ~400 chars/min, English: ~200 words/min
  // Strip markdown formatting and count characters
  const cleaned = text.replace(/[#*`\[\]()>!|_~=\-+]/g, "").trim();
  // Count CJK characters
  const cjk = (cleaned.match(/[一-鿿㐀-䶿]/g) || []).length;
  // Count remaining "words" (split by whitespace)
  const nonCjk = cleaned.replace(/[一-鿿㐀-䶿]/g, "");
  const words = nonCjk.split(/\s+/).filter(Boolean).length;

  const minutes = Math.ceil(cjk / 400 + words / 200);
  return Math.max(1, minutes);
}
