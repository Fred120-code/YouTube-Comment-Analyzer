// services/geminiService.js
import { GEMINI_API_KEY } from "../config/apiConfig.js";
import { commentsToPromptString } from "../utils/formatter.js";

/**
 * analyzeComments(comments)
 * - Si GEMINI_API_KEY est présente : on propose un exemple d'appel SDK (commenté)
 *   -> tu devras adapter l'appel au SDK / version exacte que tu as.
 * - Sinon : fallbackLocalAnalysis pour permettre de tester rapidement.
 *
 * Retour : {
 *   verdict: "utile" | "pas utile",
 *   score: number,
 *   explanation: string
 * }
 */

export async function analyzeComments(comments = []) {
  // format minimal
  const promptComments = commentsToPromptString(comments);

  // -------------------------------
  // OPTION 1: (exemple) appeler Gemini via le SDK @google/generative-ai
  // -------------------------------
  // NOTE IMPORTANTE :
  // - L'API et la librairie évoluent : vérifie la doc officielle (Google AI Studio)
  // - Le code ci-dessous est fourni comme **exemple** et peut nécessiter de l'adaptation.
  //
  // Si tu veux tenter l'appel réel, décommente la section et ajuste selon la doc.
  //
  if (GEMINI_API_KEY) {
    try {
      // Exemple d'utilisation du SDK (best-effort)
      // const { GoogleGenerativeAI } = await import("@google/generative-ai");
      // const client = new GoogleGenerativeAI({ apiKey: GEMINI_API_KEY });
      //
      // // Préparer un prompt précis pour évaluer l'utilité de la vidéo
      // const prompt = `
      // Analyse les commentaires suivants et donne :
      // 1) Un verdict simple: "utile" ou "pas utile"
      // 2) Un score approximatif (-10 à +10)
      // 3) Une courte justification (1-2 phrases)
      //
      // Commentaires:
      // ${promptComments}
      // `;
      //
      // // Exemple d'appel (à adapter selon la version du SDK)
      // const model = client.getGenerativeModel({ model: "gemini-pro" }); // ou autre nom de modèle
      // const response = await model.generateContent({ prompt, maxOutputTokens: 400 });
      // // parser la réponse selon la forme renvoyée par le SDK :
      // // const text = response.response?.text?.[0] ?? response.output?.[0]?.content ?? JSON.stringify(response);
      //
      // // Pour l'instant, on renverra text brut si cet appel fonctionne.
      // // return { verdict: 'à lire dans text', raw: text };

      // Si tu arrives ici, mais que tu préfères ne pas activer Gemini tout de suite,
      // on continue vers le fallback local.
    } catch (err) {
      console.warn("Tentative d'appel Gemini échouée (voir message) :", err.message || err);
      // fallback vers l'analyse locale ci-dessous
    }
  }

  // -------------------------------
  // OPTION Fallback local (toujours disponible)
  // -------------------------------
  // Analyse simple basée sur détection de mots positifs/négatifs.
  const result = fallbackLocalAnalysis(comments);
  return result;
}

/**
 * fallbackLocalAnalysis
 * - Comptabilise mots positifs / négatifs dans les commentaires.
 * - Retourne un score simple et verdict.
 * UTILE pour tester sans clé Gemini.
 */
function fallbackLocalAnalysis(comments = []) {
  const positiveWords = [
    "super", "bien", "utile", "clair", "claire", "excellent", "top", "parfait",
    "merci", "merci beaucoup", "helpful", "great", "good", "learned", "love"
  ];
  const negativeWords = [
    "inutile", "pas clair", "pas utile", "mauvais", "nul", "bizarre", "lent",
    "confus", "confusing", "boring", "waste"
  ];

  let score = 0;
  let posCount = 0;
  let negCount = 0;

  const joined = comments.join(" ").toLowerCase();

  for (const p of positiveWords) {
    const re = new RegExp(`\\b${escapeRegex(p)}\\b`, "g");
    const m = (joined.match(re) || []).length;
    posCount += m;
    score += m;
  }

  for (const n of negativeWords) {
    const re = new RegExp(`\\b${escapeRegex(n)}\\b`, "g");
    const m = (joined.match(re) || []).length;
    negCount += m;
    score -= m;
  }

  const verdict = score > 0 ? "utile" : "pas utile";
  const explanation = `Score=${score} (pos:${posCount}, neg:${negCount}). Verdict basé sur mots-clés.`;

  return { verdict, score, explanation, posCount, negCount };
}

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
