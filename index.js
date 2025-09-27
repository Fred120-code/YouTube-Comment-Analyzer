import "dotenv/config"; 
import { getComments } from "./services/youtubeService.js";
import { analyzeComments } from "./services/geminiService.js";
import { cleanComments } from "./utils/formatter.js";
import { MAX_COMMENTS } from "./config/apiConfig.js";

async function main() {
  const videoId = process.argv[2];
  if (!videoId) {
    console.log("Usage: node index.js VIDEO_ID");
    process.exit(1);
  }

  try {
    console.log("Récupération des commentaires...");
    const rawComments = await getComments(videoId, MAX_COMMENTS);
    console.log(`Commentaires récupérés: ${rawComments.length}`);

    console.log("Nettoyage et préparation...");
    const comments = cleanComments(rawComments, 120); // limiter à 120 commentaires pour l'exemple

    console.log("Envoi à l'analyseur (Gemini ou fallback local)...");
    const result = await analyzeComments(comments);

    console.log("\n===== Résultat =====");
    console.log("Verdict :", result.verdict);
    if (result.score !== undefined) console.log("Score  :", result.score);
    if (result.explanation) console.log("Explication :", result.explanation);
    console.log("====================\n");
  } catch (err) {
    console.error("Erreur générale :", err.message || err);
  }
}

main();
