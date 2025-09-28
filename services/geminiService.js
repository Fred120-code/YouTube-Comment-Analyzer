import { GEMINI_API_KEY } from "../config/apiConfig.js";
import { commentsToPromptString } from "../utils/formatter.js";

export async function analyzeComments(comments = []) {

    const promptComments = commentsToPromptString(comments);

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

 
  const result = fallbackLocalAnalysis(comments);
  return result;
}

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
