const axios = require("axios");

/**
 * Fetch real Google search results using SerpApi
 * @param {string} searchQuery - Search query string
 * @returns {Promise<Array<{title: string, url: string, description: string, source: string}>>}
 */
async function searchSerpApi(searchQuery) {
  const apiKey = process.env.SERPAPI_KEY;

  if (!apiKey) {
    console.warn("SERPAPI_KEY is not defined in backend .env file.");
    return [];
  }

  try {
    const response = await axios.get("https://serpapi.com/search.json", {
      params: {
        engine: "google",
        q: searchQuery,
        api_key: apiKey,
        num: 10,
      },
      timeout: 10000,
    });

    const results = [];
    const seenUrls = new Set();

    // 1. Process organic search results
    const organic = response.data?.organic_results || [];
    for (const item of organic) {
      const url = item.link || item.url;
      const title = item.title;
      const description = item.snippet || item.snippet_highlighted_words?.join(" ") || "";
      const source = item.displayed_link || item.source || "";

      if (url && !seenUrls.has(url.toLowerCase())) {
        seenUrls.add(url.toLowerCase());
        results.push({
          title: title || "Learning Resource",
          url,
          description: description || "",
          source,
        });
      }
    }

    // 2. Process video results if present
    const videos = response.data?.video_results || [];
    for (const item of videos) {
      const url = item.link || item.url;
      const title = item.title;
      const description = item.snippet || "";
      const source = item.displayed_link || "YouTube";

      if (url && !seenUrls.has(url.toLowerCase())) {
        seenUrls.add(url.toLowerCase());
        results.push({
          title: title || "Video Tutorial",
          url,
          description: description || "",
          source,
        });
      }
    }

    return results;
  } catch (error) {
    console.error("SerpApi Request Error:", error.response?.data?.error || error.message);
    return [];
  }
}

module.exports = { searchSerpApi };
