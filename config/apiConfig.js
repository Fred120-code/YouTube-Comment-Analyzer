// Centralise la récupération des clés depuis .env

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY || null;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || null;
const MAX_COMMENTS = process.env.MAX_COMMENTS ? parseInt(process.env.MAX_COMMENTS, 10) : 200;

export { YOUTUBE_API_KEY, GEMINI_API_KEY, MAX_COMMENTS };
