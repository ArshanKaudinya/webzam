import { Env, ScanResult } from './types';
import { extractFromUrl } from './extract';
import { analyzeColors } from './analyze/colors';
import { analyzeTypography } from './analyze/typography';
import { analyzeLogo } from './analyze/logo';
import { analyzeVibe } from './vibe/provider';
import { saveScan, listScans, getScan } from './db';

const VIEWPORT_HEIGHT = 900;

// CORS headers for frontend access
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders
    }
  });
}

function errorResponse(message: string, status = 400): Response {
  return jsonResponse({ error: message }, status);
}

// Generate UUID
function generateId(): string {
  return crypto.randomUUID();
}

// Normalize URL - add https:// if missing
function normalizeUrl(input: string): string {
  let url = input.trim();

  // If no protocol, add https://
  if (!url.match(/^https?:\/\//i)) {
    url = 'https://' + url;
  }

  return url;
}

async function handleScan(request: Request, env: Env): Promise<Response> {
  try {
    const body = await request.json() as { url?: string };
    let url = body.url;

    if (!url || typeof url !== 'string') {
      return errorResponse('Missing or invalid URL', 400);
    }

    // Normalize URL (add https:// if missing)
    url = normalizeUrl(url);

    // Validate URL
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url);
      if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
        throw new Error('Invalid protocol');
      }
    } catch {
      return errorResponse('Invalid URL format', 400);
    }

    // Extract data from page
    const rawData = await extractFromUrl(parsedUrl.href, env);

    // Analyze extracted data
    const colors = analyzeColors(rawData.ctaCandidates, rawData.backgroundSamples, VIEWPORT_HEIGHT);
    const typography = analyzeTypography(rawData.headingSamples, rawData.bodySamples);
    const logo = analyzeLogo(rawData.logoCandidates, parsedUrl.href);
    const vibe = await analyzeVibe(
      rawData.vibeSlice,
      env.VIBE_PROVIDER,
      env.ANTHROPIC_API_KEY,
      env.OPENAI_API_KEY
    );

    // Build result
    const result: ScanResult = {
      id: generateId(),
      url: parsedUrl.href,
      scannedAt: new Date().toISOString(),
      colors,
      typography,
      logo,
      vibe,
      vibeSlice: rawData.vibeSlice
    };

    // Save to database
    await saveScan(env, result);

    return jsonResponse(result);

  } catch (err) {
    console.error('Scan error:', err);
    const message = err instanceof Error ? err.message : 'Unknown error';
    return errorResponse(`Scan failed: ${message}`, 500);
  }
}

async function handleListScans(env: Env): Promise<Response> {
  try {
    const scans = await listScans(env);
    return jsonResponse({ scans });
  } catch (err) {
    console.error('List scans error:', err);
    return errorResponse('Failed to list scans', 500);
  }
}

async function handleGetScan(id: string, env: Env): Promise<Response> {
  try {
    const scan = await getScan(env, id);
    if (!scan) {
      return errorResponse('Scan not found', 404);
    }
    return jsonResponse(scan);
  } catch (err) {
    console.error('Get scan error:', err);
    return errorResponse('Failed to get scan', 500);
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    // Handle CORS preflight
    if (method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Route: POST /scan
    if (method === 'POST' && path === '/scan') {
      return handleScan(request, env);
    }

    // Route: GET /scans
    if (method === 'GET' && path === '/scans') {
      return handleListScans(env);
    }

    // Route: GET /scans/:id
    if (method === 'GET' && path.startsWith('/scans/')) {
      const id = path.slice('/scans/'.length);
      if (id) {
        return handleGetScan(id, env);
      }
    }

    // Health check
    if (method === 'GET' && path === '/') {
      return jsonResponse({ status: 'ok', service: 'webzam-backend' });
    }

    return errorResponse('Not found', 404);
  }
};
