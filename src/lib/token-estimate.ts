/**
 * Rough token estimate for a live "≈ N tokens" hint in the UI.
 *
 * This is a heuristic, not a tokenizer: it uses the common ~4-characters-per-
 * token rule of thumb. It is good enough to give the user a sense of prompt
 * size; it is not billing-accurate and intentionally avoids pulling in a heavy
 * tokenizer dependency.
 */
export function estimateTokens(text: string): number {
  if (!text) return 0
  return Math.max(1, Math.round(text.length / 4))
}
