import { CTACandidate, BackgroundSample, ColorResult, ElementEvidence } from '../types';

// Parse color string to RGB
function parseColor(color: string): { r: number; g: number; b: number; a: number } | null {
  if (!color || color === 'transparent' || color === 'rgba(0, 0, 0, 0)') {
    return null;
  }

  // Handle hex
  const hexMatch = color.match(/^#([0-9a-f]{6})$/i);
  if (hexMatch) {
    const hex = hexMatch[1];
    return {
      r: parseInt(hex.slice(0, 2), 16),
      g: parseInt(hex.slice(2, 4), 16),
      b: parseInt(hex.slice(4, 6), 16),
      a: 1
    };
  }

  // Handle rgb/rgba
  const rgbaMatch = color.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+))?\s*\)/);
  if (rgbaMatch) {
    const a = rgbaMatch[4] !== undefined ? parseFloat(rgbaMatch[4]) : 1;
    if (a === 0) return null;
    return {
      r: parseInt(rgbaMatch[1]),
      g: parseInt(rgbaMatch[2]),
      b: parseInt(rgbaMatch[3]),
      a
    };
  }

  return null;
}

// Convert RGB to hex
function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
}

// Calculate color distance (simple RGB Euclidean)
function colorDistance(c1: { r: number; g: number; b: number }, c2: { r: number; g: number; b: number }): number {
  return Math.sqrt(
    Math.pow(c1.r - c2.r, 2) +
    Math.pow(c1.g - c2.g, 2) +
    Math.pow(c1.b - c2.b, 2)
  );
}

// Check if color is near white or black (likely not brand color)
function isNeutral(rgb: { r: number; g: number; b: number }): boolean {
  const avg = (rgb.r + rgb.g + rgb.b) / 3;
  const variance = Math.abs(rgb.r - avg) + Math.abs(rgb.g - avg) + Math.abs(rgb.b - avg);
  // Very low color variance and close to white or black
  return variance < 30 && (avg > 230 || avg < 25);
}

interface ColorCluster {
  hex: string;
  rgb: { r: number; g: number; b: number };
  score: number;
  samples: ElementEvidence[];
}

// Cluster similar colors together
function clusterColors(colors: Array<{ rgb: { r: number; g: number; b: number }; score: number; evidence: ElementEvidence }>): ColorCluster[] {
  const clusters: ColorCluster[] = [];
  const threshold = 40; // RGB distance threshold for clustering

  for (const item of colors) {
    let foundCluster = false;
    for (const cluster of clusters) {
      if (colorDistance(item.rgb, cluster.rgb) < threshold) {
        cluster.score += item.score;
        if (cluster.samples.length < 5) {
          cluster.samples.push(item.evidence);
        }
        foundCluster = true;
        break;
      }
    }
    if (!foundCluster) {
      clusters.push({
        hex: rgbToHex(item.rgb.r, item.rgb.g, item.rgb.b),
        rgb: item.rgb,
        score: item.score,
        samples: [item.evidence]
      });
    }
  }

  return clusters.sort((a, b) => b.score - a.score);
}

export function analyzeColors(
  ctaCandidates: CTACandidate[],
  backgroundSamples: BackgroundSample[],
  viewportHeight: number
): { primary: ColorResult; secondary: ColorResult; background: ColorResult } {

  // Analyze CTA backgrounds for primary color
  const ctaColors: Array<{ rgb: { r: number; g: number; b: number }; score: number; evidence: ElementEvidence }> = [];

  for (const cta of ctaCandidates) {
    const rgb = parseColor(cta.backgroundColor);
    if (!rgb || isNeutral(rgb)) continue;

    // Score based on position (higher = better), area, and button-like signals
    const positionScore = cta.isAboveFold ? (1 - cta.rect.y / viewportHeight) * 2 : 0.5;
    const areaScore = Math.min(cta.area / 10000, 1);
    const buttonLikeScore = cta.borderRadius !== '0px' ? 0.3 : 0;
    const score = positionScore + areaScore + buttonLikeScore;

    ctaColors.push({
      rgb,
      score,
      evidence: {
        tag: cta.tag,
        text: cta.text.slice(0, 50),
        rect: cta.rect,
        styles: {
          backgroundColor: cta.backgroundColor,
          borderRadius: cta.borderRadius
        }
      }
    });
  }

  // Also check text colors and border colors as secondary candidates
  const accentColors: Array<{ rgb: { r: number; g: number; b: number }; score: number; evidence: ElementEvidence }> = [];

  for (const cta of ctaCandidates) {
    const textRgb = parseColor(cta.color);
    if (textRgb && !isNeutral(textRgb)) {
      accentColors.push({
        rgb: textRgb,
        score: cta.isAboveFold ? 0.5 : 0.2,
        evidence: {
          tag: cta.tag,
          text: cta.text.slice(0, 50),
          rect: cta.rect,
          styles: { color: cta.color }
        }
      });
    }

    const borderRgb = parseColor(cta.borderColor);
    if (borderRgb && !isNeutral(borderRgb)) {
      accentColors.push({
        rgb: borderRgb,
        score: cta.isAboveFold ? 0.4 : 0.15,
        evidence: {
          tag: cta.tag,
          text: cta.text.slice(0, 50),
          rect: cta.rect,
          styles: { borderColor: cta.borderColor }
        }
      });
    }
  }

  // Analyze background colors
  const bgColors: Array<{ rgb: { r: number; g: number; b: number }; score: number; evidence: ElementEvidence }> = [];

  for (const bg of backgroundSamples) {
    const rgb = parseColor(bg.backgroundColor);
    if (!rgb) continue;

    // Score by area
    const score = bg.area / 100000;
    bgColors.push({
      rgb,
      score,
      evidence: {
        tag: bg.tag,
        rect: bg.rect,
        styles: { backgroundColor: bg.backgroundColor }
      }
    });
  }

  // Cluster and select
  const primaryClusters = clusterColors(ctaColors);
  const accentClusters = clusterColors(accentColors);
  const bgClusters = clusterColors(bgColors);

  // Primary: top CTA color cluster
  const primary = primaryClusters[0] || accentClusters[0];
  const primaryConfidence = primary
    ? Math.min(primary.score / (primaryClusters[1]?.score || 1), 1)
    : 0;

  // Background: top background cluster
  const background = bgClusters[0];
  const bgConfidence = background
    ? Math.min(background.score / (bgClusters[1]?.score || 1), 1)
    : 0;

  // Secondary: next accent that's different from primary and background
  let secondary: ColorCluster | undefined;
  const allAccents = [...accentClusters, ...primaryClusters.slice(1)];
  for (const cluster of allAccents) {
    const distFromPrimary = primary ? colorDistance(cluster.rgb, primary.rgb) : 999;
    const distFromBg = background ? colorDistance(cluster.rgb, background.rgb) : 999;
    if (distFromPrimary > 50 && distFromBg > 50) {
      secondary = cluster;
      break;
    }
  }

  const secondaryConfidence = secondary
    ? Math.min(secondary.score / ((allAccents.find(c => c !== secondary)?.score) || 1), 1)
    : 0;

  return {
    primary: {
      hex: primary?.hex || '#000000',
      confidence: Math.round(primaryConfidence * 100) / 100,
      evidence: primary?.samples.slice(0, 3) || []
    },
    secondary: {
      hex: secondary?.hex || '#666666',
      confidence: Math.round(secondaryConfidence * 100) / 100,
      evidence: secondary?.samples.slice(0, 3) || []
    },
    background: {
      hex: background?.hex || '#ffffff',
      confidence: Math.round(bgConfidence * 100) / 100,
      evidence: background?.samples.slice(0, 3) || []
    }
  };
}
