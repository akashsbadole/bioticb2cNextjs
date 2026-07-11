/**
 * Check if a honeypot field was filled (indicating a bot).
 * Call this in API routes that accept form submissions.
 * Returns true if the field was filled (likely spam).
 */
export function isHoneypotFilled(formData: FormData | Record<string, unknown>): boolean {
  const website =
    formData instanceof FormData
      ? formData.get("website")
      : (formData as Record<string, unknown>).website;
  return typeof website === "string" && website.length > 0;
}
