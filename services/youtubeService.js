import { google } from "googleapis";
import { YOUTUBE_API_KEY } from "../config/apiConfig.js";

/**
 * getComments(videoId, maxComments)
 * - Récupère jusqu'à maxComments commentaires top-level pour une vidéo donnée.
 * - Utilise la méthode commentThreads.list (part=snippet).
 */
export async function getComments(videoId, maxComments = 200) {
  if (!YOUTUBE_API_KEY) {
    throw new Error("YOUTUBE_API_KEY manquante. Ajoute-la dans ton .env");
  }
  if (!videoId) {
    throw new Error("videoId manquant");
  }

  const youtube = google.youtube({ version: "v3", auth: YOUTUBE_API_KEY });
  const comments = [];
  let nextPageToken = undefined;

  try {
    do {
      const res = await youtube.commentThreads.list({
        part: "snippet",
        videoId,
        pageToken: nextPageToken,
        maxResults: 100, // max autorisé par la plupart des appels de liste
        textFormat: "plainText",
      });

      const items = res.data.items || [];
      for (const item of items) {
        const top = item.snippet && item.snippet.topLevelComment && item.snippet.topLevelComment.snippet;
        if (top && top.textDisplay) comments.push(top.textDisplay);
        if (comments.length >= maxComments) break;
      }

      nextPageToken = res.data.nextPageToken;
    } while (nextPageToken && comments.length < maxComments);

    return comments;
  } catch (err) {
    // Erreurs typiques : quota, video non trouvée, clé invalide, etc.
    console.error("Erreur lors de la récupération des commentaires YouTube :", err.message || err);
    throw err;
  }
}
