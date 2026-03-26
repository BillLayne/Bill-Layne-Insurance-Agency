// ============================================================================
// CLOUDFLARE WORKER: Gemini API Proxy for Roof Health Audit
// Bill Layne Insurance — billlayne.com / MyRoofage.com
// ============================================================================
//
// DEPLOYMENT INSTRUCTIONS:
// 1. Go to dash.cloudflare.com → Workers & Pages → Create Worker
// 2. Paste this entire file
// 3. Go to Settings → Variables → Add secret: GEMINI_API_KEY = your-api-key
// 4. Deploy
// 5. Update WORKER_URL in js/roof-health-audit.js with your worker URL
//
// ============================================================================

// ---------------------------------------------------------------------------
// Allowed origins for CORS
// ---------------------------------------------------------------------------
const ALLOWED_ORIGINS = [
  'https://billlayne.com',
  'https://www.billlayne.com',
  'https://billlayneinsurance.com',
  'https://www.billlayneinsurance.com',
  'http://localhost:8080',
];

// ---------------------------------------------------------------------------
// Rate-limit: 50 requests per day per IP (in-memory, resets on worker restart)
// ---------------------------------------------------------------------------
const rateLimitMap = new Map();
const RATE_LIMIT_MAX = 50;
const RATE_LIMIT_WINDOW_MS = 24 * 60 * 60 * 1000; // 24 hours

function isRateLimited(ip) {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
    rateLimitMap.set(ip, { windowStart: now, count: 1 });
    return false;
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return true;
  }

  entry.count++;
  return false;
}

// ---------------------------------------------------------------------------
// CORS helpers
// ---------------------------------------------------------------------------
function getCorsHeaders(request) {
  const origin = request.headers.get('Origin') || '';
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : '';

  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
  };
}

function jsonResponse(body, status, request) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...getCorsHeaders(request),
    },
  });
}

// ---------------------------------------------------------------------------
// System instruction for Gemini (roof analysis expert)
// ---------------------------------------------------------------------------
const SYSTEM_INSTRUCTION = `You are the Lead Underwriting AI for Bill Layne Insurance and MyRoofage.com. You are a specialized expert in Residential Property & Casualty (P&C) risk assessment with a focus on roof longevity and carrier eligibility.

Task: Analyze multiple uploaded photos of a residential roof from various angles to provide a "Roof Health Audit." You must identify visual markers of wear and tear that impact insurance insurability. Synthesize information from all provided images for the most accurate assessment.

CRITICAL ACCURACY RULES: You must ONLY report what you can visually confirm in the photos. Never guess or assume conditions you cannot see. For each of your Top 3 Findings, cite which specific photo and which area of the roof shows the issue. If a photo is too blurry or distant to assess a criteria, say so and lower your confidence level accordingly. If you cannot determine the roof material from the photos, say Unknown rather than guessing. Always state limitations of a photo-only assessment. Your score must be justified by visible evidence only.

Analysis Criteria:
- Granular Loss: Are the shingles "bald" or showing reflective spots?
- Physical Damage: Are there curled, cracked, or missing shingles?
- Environmental Factors: Presence of moss, algae, or heavy debris/overhanging trees.
- Flashing & Vents: Visible rust or gaps in the chimney/valley flashing.
- Estimated Age Range: Based on wear, estimate if the roof is <5, 5-12, or 15+ years old.

Scoring Rubric:
- 85-95 = New or near-new roof, no visible defects in clear photos (never 100 due to photo limitations).
- 70-84 = Good condition, 1 minor issue detected.
- 50-69 = Fair condition, 2-3 moderate issues detected.
- Below 50 = Poor/Severe condition, major visible damage or end-of-life.
- Never give exactly 50 or round numbers (e.g., use 73 or 61) to show genuine analysis.

North Carolina Carrier Eligibility:
Roofs under 10 years are eligible for most standard carriers (Nationwide, Travelers, NC Grange Mutual, Progressive, Alamance Farmers).
Roofs 10-15 years may require inspection photos for underwriting.
Roofs 15+ years are typically ACV-only or may need surplus lines.
3-tab shingles over 20 years are almost always non-renewable.
Architectural shingles last 25-30 years.
Metal roofs can be insurable 40+ years.

Tone: Professional, educational (10th-grade level), and supportive. Avoid alarmist language, but be direct about insurance risks. Keep the entire audit under 150 words for mobile readability.`;

// ---------------------------------------------------------------------------
// Response schema for structured Gemini output
// ---------------------------------------------------------------------------
const RESPONSE_SCHEMA = {
  type: 'OBJECT',
  properties: {
    conditionScore: { type: 'INTEGER', description: 'Condition Score 1-100' },
    insuranceVerdict: { type: 'STRING' },
    topFindings: { type: 'ARRAY', items: { type: 'STRING' } },
    nextBestAction: { type: 'STRING' },
    estimatedAgeRange: { type: 'STRING' },
    roofMaterial: { type: 'STRING' },
    confidenceLevel: { type: 'STRING' },
    visualEvidence: { type: 'ARRAY', items: { type: 'STRING' } },
    photosAnalyzed: { type: 'INTEGER' },
    limitationsNoted: { type: 'STRING' },
  },
  required: [
    'conditionScore',
    'insuranceVerdict',
    'topFindings',
    'nextBestAction',
    'estimatedAgeRange',
    'roofMaterial',
    'confidenceLevel',
    'visualEvidence',
    'photosAnalyzed',
    'limitationsNoted',
  ],
};

// ---------------------------------------------------------------------------
// Gemini API endpoint
// ---------------------------------------------------------------------------
const GEMINI_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

// ---------------------------------------------------------------------------
// Main request handler
// ---------------------------------------------------------------------------
export default {
  async fetch(request, env) {
    // ---- Preflight (OPTIONS) ----
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: getCorsHeaders(request),
      });
    }

    // ---- Only POST /analyze is accepted ----
    const url = new URL(request.url);
    if (url.pathname !== '/analyze') {
      return jsonResponse({ error: 'Not found. POST to /analyze' }, 404, request);
    }

    if (request.method !== 'POST') {
      return jsonResponse({ error: 'Method not allowed. Use POST.' }, 405, request);
    }

    // ---- CORS origin check ----
    const origin = request.headers.get('Origin') || '';
    if (!ALLOWED_ORIGINS.includes(origin)) {
      return jsonResponse({ error: 'Origin not allowed' }, 403, request);
    }

    // ---- Rate limiting ----
    const clientIP = request.headers.get('CF-Connecting-IP') || 'unknown';
    if (isRateLimited(clientIP)) {
      return jsonResponse(
        { error: 'Rate limit exceeded. Maximum 50 analyses per day.' },
        429,
        request,
      );
    }

    // ---- Parse request body ----
    let body;
    try {
      body = await request.json();
    } catch {
      return jsonResponse({ error: 'Invalid JSON body' }, 400, request);
    }

    const { images, prompt } = body;

    if (!images || !Array.isArray(images) || images.length === 0) {
      return jsonResponse(
        { error: 'Missing or empty "images" array. Provide at least one image.' },
        400,
        request,
      );
    }

    if (images.length > 10) {
      return jsonResponse({ error: 'Too many images. Maximum 10 per request.' }, 400, request);
    }

    // ---- Build Gemini request parts ----
    const parts = [];

    // Add each image as an inline_data part
    for (const img of images) {
      if (!img.data || !img.mimeType) {
        return jsonResponse(
          { error: 'Each image must have "data" (base64) and "mimeType" fields.' },
          400,
          request,
        );
      }
      parts.push({
        inlineData: {
          mimeType: img.mimeType,
          data: img.data,
        },
      });
    }

    // Add the user prompt (or a default)
    parts.push({
      text: prompt || 'Analyze this roof and provide a Roof Health Audit.',
    });

    // ---- Build Gemini API payload ----
    const geminiPayload = {
      system_instruction: {
        parts: [{ text: SYSTEM_INSTRUCTION }],
      },
      contents: [
        {
          parts,
        },
      ],
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: RESPONSE_SCHEMA,
      },
    };

    // ---- Call Gemini API ----
    const apiKey = env.GEMINI_API_KEY;
    if (!apiKey) {
      return jsonResponse(
        { error: 'Server configuration error: API key not set.' },
        500,
        request,
      );
    }

    try {
      const geminiResponse = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(geminiPayload),
      });

      if (!geminiResponse.ok) {
        const errorText = await geminiResponse.text();
        console.error('Gemini API error:', geminiResponse.status, errorText);
        return jsonResponse(
          {
            error: 'Gemini API error',
            status: geminiResponse.status,
            detail: errorText,
          },
          502,
          request,
        );
      }

      const geminiData = await geminiResponse.json();
      return jsonResponse(geminiData, 200, request);
    } catch (err) {
      console.error('Fetch error:', err);
      return jsonResponse(
        { error: 'Failed to reach Gemini API', detail: err.message },
        502,
        request,
      );
    }
  },
};
