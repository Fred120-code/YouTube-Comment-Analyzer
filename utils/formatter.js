
/**
 * Nettoie un tableau de commentaires :
 * - supprime les commentaires vides,
 * - remplace les sauts de ligne par des espaces,
 * - tronque le nombre de commentaires à maxCount.
 */
export function cleanComments(comments = [], maxCount = 100) {
  if (!Array.isArray(comments)) return [];
  const cleaned = comments
    .map(c => (typeof c === "string" ? c.replace(/\s+/g, " ").trim() : ""))
    .filter(Boolean);
  return cleaned.slice(0, maxCount);
}

/**
 * Concatène les commentaires en une string (séparateur visible).
 * Utile pour envoyer dans un prompt à l'IA.
 */
export function commentsToPromptString(comments = []) {
  return comments.map((c, i) => `Comment ${i + 1}: ${c}`).join("\n---\n");
}
