import { LogoCandidate, LogoResult } from '../types';

// Parse srcset to get highest resolution URL
function getHighestResSrc(srcset: string | undefined, src: string | undefined): string | undefined {
  if (!srcset) return src;

  const entries = srcset.split(',').map(entry => {
    const parts = entry.trim().split(/\s+/);
    const url = parts[0];
    const descriptor = parts[1] || '1x';

    // Parse width descriptor (e.g., "800w") or pixel density (e.g., "2x")
    let width = 0;
    if (descriptor.endsWith('w')) {
      width = parseInt(descriptor);
    } else if (descriptor.endsWith('x')) {
      width = parseFloat(descriptor) * 100; // Normalize density to comparable scale
    }

    return { url, width };
  });

  // Sort by width descending and take first
  entries.sort((a, b) => b.width - a.width);
  return entries[0]?.url || src;
}

// Determine image type from URL
function getImageType(url: string): 'png' | 'jpg' | 'svg' | 'unknown' {
  const lower = url.toLowerCase();
  if (lower.includes('.svg')) return 'svg';
  if (lower.includes('.png')) return 'png';
  if (lower.includes('.jpg') || lower.includes('.jpeg')) return 'jpg';
  return 'unknown';
}

export function analyzeLogo(candidates: LogoCandidate[], pageUrl: string): LogoResult | null {
  if (candidates.length === 0) {
    return null;
  }

  // Sort candidates by priority:
  // 1. SVGs in header
  // 2. Images in header with logo-related alt text
  // 3. Other header images
  // 4. Non-header candidates
  const scored = candidates.map(c => {
    let score = 0;

    // Header location bonus
    if (c.inHeader) score += 10;

    // SVG bonus (preferred)
    if (c.type === 'svg') score += 5;

    // Logo-related alt text bonus
    if (c.alt && /logo|brand/i.test(c.alt)) score += 3;

    // Reasonable size bonus (not too tiny, not too large)
    const area = c.rect.width * c.rect.height;
    if (area > 500 && area < 50000) score += 2;

    // Top-left position bonus (where logos typically are)
    if (c.rect.x < 200 && c.rect.y < 150) score += 2;

    return { candidate: c, score };
  });

  scored.sort((a, b) => b.score - a.score);

  const best = scored[0];
  if (!best || best.score < 5) {
    return null;
  }

  const c = best.candidate;

  if (c.type === 'svg' && c.svgContent) {
    return {
      type: 'svg',
      value: c.svgContent,
      confidence: Math.min(best.score / 15, 1),
      reason: c.inHeader ? 'SVG found in header/nav' : 'SVG found near top of page'
    };
  }

  // For images, resolve the best URL
  const resolvedSrc = getHighestResSrc(c.srcset, c.src);
  if (!resolvedSrc) {
    return null;
  }

  // Make URL absolute if needed
  let absoluteUrl = resolvedSrc;
  if (resolvedSrc.startsWith('/')) {
    try {
      const base = new URL(pageUrl);
      absoluteUrl = `${base.origin}${resolvedSrc}`;
    } catch {
      // Keep relative URL if parsing fails
    }
  } else if (!resolvedSrc.startsWith('http')) {
    try {
      absoluteUrl = new URL(resolvedSrc, pageUrl).href;
    } catch {
      // Keep as-is
    }
  }

  const imgType = getImageType(absoluteUrl);

  return {
    type: imgType,
    value: absoluteUrl,
    confidence: Math.min(best.score / 15, 1),
    reason: c.inHeader
      ? `Image found in header${c.alt ? ` with alt="${c.alt}"` : ''}`
      : 'Image found near top of page'
  };
}
