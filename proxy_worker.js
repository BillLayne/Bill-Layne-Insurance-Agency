// ==========================================================
// Cloudflare Worker — Transparent Reverse Proxy for Gemini
// ==========================================================
// This Worker sits between your insurance website and Google's API.
// It receives ALL requests from the @google/genai SDK,
// swaps in the real API key, forwards to Google, and
// returns the response. Your key never touches the browser.
// ==========================================================

export default {
  async fetch(request, env) {

    // ---- CORS: Only allow YOUR site(s) ----
    const ALLOWED_ORIGINS = [
      "https://billlayneinsurance.com",        // production
      "https://www.billlayneinsurance.com",     // www variant
      "https://billlayne.github.io",            // GitHub Pages
      // "http://127.0.0.1:5500",               // uncomment for local dev
      // "http://localhost:5500",                // uncomment for local dev
    ];

    const origin = request.headers.get("Origin") || "";
    const isAllowed = ALLOWED_ORIGINS.includes(origin);
    const corsOrigin = isAllowed ? origin : ALLOWED_ORIGINS[0];

    const corsHeaders = {
      "Access-Control-Allow-Origin": corsOrigin,
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS, DELETE, PATCH",
      "Access-Control-Allow-Headers": "Content-Type, x-goog-api-key, x-goog-api-client",
      "Access-Control-Expose-Headers": "*",
      "Access-Control-Max-Age": "86400",
    };

    // Handle CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    try {
      // ---- Build the Google API URL ----
      const url = new URL(request.url);
      const googleUrl = new URL(
        url.pathname + url.search,
        "https://generativelanguage.googleapis.com"
      );

      // Replace any dummy key with the real one
      if (googleUrl.searchParams.has("key")) {
        googleUrl.searchParams.set("key", env.GEMINI_API_KEY);
      } else {
        googleUrl.searchParams.append("key", env.GEMINI_API_KEY);
      }

      // ---- Forward headers (strip the dummy API key header) ----
      const forwardHeaders = new Headers(request.headers);
      forwardHeaders.delete("x-goog-api-key");
      forwardHeaders.set("x-goog-api-key", env.GEMINI_API_KEY);

      // ---- Forward the request to Google ----
      const googleResponse = await fetch(googleUrl.toString(), {
        method: request.method,
        headers: forwardHeaders,
        body: request.method !== "GET" && request.method !== "HEAD"
          ? request.body
          : undefined,
      });

      // ---- Check if this is a streaming (SSE) response ----
      const contentType = googleResponse.headers.get("content-type") || "";
      const isStreaming = contentType.includes("text/event-stream");

      if (isStreaming) {
        // Stream SSE responses through
        const responseHeaders = new Headers(googleResponse.headers);
        Object.entries(corsHeaders).forEach(([k, v]) =>
          responseHeaders.set(k, v)
        );

        return new Response(googleResponse.body, {
          status: googleResponse.status,
          headers: responseHeaders,
        });
      }

      // ---- Standard JSON response ----
      const responseBody = await googleResponse.arrayBuffer();
      const responseHeaders = new Headers(googleResponse.headers);
      Object.entries(corsHeaders).forEach(([k, v]) =>
        responseHeaders.set(k, v)
      );

      return new Response(responseBody, {
        status: googleResponse.status,
        headers: responseHeaders,
      });

    } catch (err) {
      return new Response(
        JSON.stringify({ error: "Proxy error", message: err.message }),
        {
          status: 502,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }
  },
};
