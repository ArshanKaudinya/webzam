import { LogoCandidate, LogoResult } from '../types';

/**
 * Parse srcset attribute to get the highest resolution image URL.
 * Handles both width descriptors (e.g., "800w") and pixel density (e.g., "2x").
 */
function getBestImageUrl(srcset: string | undefined, fallbackSrc: string | undefined): string | undefined {
  if (!srcset) return fallbackSrc;

  const entries = srcset.split(',').map(entry => {
    const [url, descriptor = '1x'] = entry.trim().split(/\s+/);

    let priority = 0;
    if (descriptor.endsWith('w')) {
      priority = parseInt(descriptor);
    } else if (descriptor.endsWith('x')) {
      priority = parseFloat(descriptor) * 1000;
    }

    return { url, priority };
  });

  entries.sort((a, b) => b.priority - a.priority);
  return entries[0]?.url || fallbackSrc;
}

/**
 * Determine image format from URL path.
 */
function getImageFormat(url: string): 'svg' | 'png' | 'jpg' | 'unknown' {
  const path = url.toLowerCase().split('?')[0];
  if (path.endsWith('.svg')) return 'svg';
  if (path.endsWith('.png')) return 'png';
  if (path.endsWith('.jpg') || path.endsWith('.jpeg')) return 'jpg';
  return 'unknown';
}

/**
 * Convert a relative URL to absolute using the page URL as base.
 */
function resolveUrl(src: string, pageUrl: string): string {
  if (src.startsWith('http://') || src.startsWith('https://')) {
    return src;
  }

  try {
    return new URL(src, pageUrl).href;
  } catch {
    return src;
  }
}

/**
 * Score a logo candidate based on various heuristics.
 * Higher score = more likely to be the main logo.
 */
function scoreCandidate(candidate: LogoCandidate): number {
  let score = 0;

  // Location: header/nav is primary logo placement
  if (candidate.inHeader) score += 10;

  // Format: SVGs are preferred for logos (scalable, crisp)
  if (candidate.type === 'svg') score += 5;

  // Alt text: logo-related keywords indicate intentional logo markup
  if (candidate.alt && /logo|brand|company/i.test(candidate.alt)) score += 3;

  // Size: reasonable dimensions for a logo (not icons, not hero images)
  const area = candidate.rect.width * candidate.rect.height;
  if (area > 500 && area < 50000) score += 2;

  // Position: top-left corner is typical logo placement
  if (candidate.rect.x < 200 && candidate.rect.y < 150) score += 2;

  return score;
}

/**
 * Analyze logo candidates and return the best match.
 *
 * Returns a LogoResult where:
 * - type: indicates the image format (svg, png, jpg, unknown)
 * - value: either inline SVG markup (for <svg> elements) or a URL (for <img> elements)
 */
export function analyzeLogo(candidates: LogoCandidate[], pageUrl: string): LogoResult | null {
  if (candidates.length === 0) {
    return null;
  }

  // Score and sort candidates
  const scored = candidates
    .map(candidate => ({ candidate, score: scoreCandidate(candidate) }))
    .sort((a, b) => b.score - a.score);

  const best = scored[0];

  // Require minimum confidence threshold
  if (!best || best.score < 5) {
    return null;
  }

  const { candidate } = best;
  const confidence = Math.min(best.score / 15, 1);

  // Inline SVG: return the actual SVG markup
  if (candidate.type === 'svg' && candidate.svgContent) {
    return {
      type: 'svg',
      value: candidate.svgContent,
      confidence,
      reason: candidate.inHeader ? 'SVG in header' : 'SVG near top of page'
    };
  }

  // Image element: return the resolved URL
  const imageUrl = getBestImageUrl(candidate.srcset, candidate.src);
  if (!imageUrl) {
    return null;
  }

  const absoluteUrl = resolveUrl(imageUrl, pageUrl);
  const format = getImageFormat(absoluteUrl);

  return {
    type: format,
    value: absoluteUrl,
    confidence,
    reason: candidate.inHeader
      ? `Image in header${candidate.alt ? ` (${candidate.alt})` : ''}`
      : 'Image near top of page'
  };
}
