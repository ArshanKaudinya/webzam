import { TypographySample, TypographyResult, ElementEvidence } from '../types';

// Normalize font family string
function normalizeFont(fontFamily: string): string {
  // Take the first font in the stack, clean quotes
  const first = fontFamily.split(',')[0].trim();
  return first.replace(/["']/g, '');
}

interface FontCluster {
  font: string;
  score: number;
  samples: ElementEvidence[];
}

function clusterFonts(samples: TypographySample[], weightByFontSize: boolean): FontCluster[] {
  const clusters: Map<string, FontCluster> = new Map();

  for (const sample of samples) {
    const font = normalizeFont(sample.fontFamily);
    if (!font) continue;

    // Weight by font size for headings
    const fontSize = parseFloat(sample.fontSize) || 16;
    const weight = weightByFontSize ? fontSize / 16 : 1;

    const existing = clusters.get(font);
    const evidence: ElementEvidence = {
      tag: sample.tag,
      text: sample.text.slice(0, 40),
      rect: sample.rect,
      styles: {
        fontFamily: sample.fontFamily,
        fontSize: sample.fontSize,
        fontWeight: sample.fontWeight
      }
    };

    if (existing) {
      existing.score += weight;
      if (existing.samples.length < 5) {
        existing.samples.push(evidence);
      }
    } else {
      clusters.set(font, {
        font,
        score: weight,
        samples: [evidence]
      });
    }
  }

  return Array.from(clusters.values()).sort((a, b) => b.score - a.score);
}

export function analyzeTypography(
  headingSamples: TypographySample[],
  bodySamples: TypographySample[]
): { heading: TypographyResult; body: TypographyResult } {

  // Cluster heading fonts, weighted by font size
  const headingClusters = clusterFonts(headingSamples, true);
  const headingTop = headingClusters[0];
  const headingConfidence = headingTop && headingClusters[1]
    ? Math.min(headingTop.score / headingClusters[1].score, 1)
    : headingTop ? 0.8 : 0;

  // Cluster body fonts, equal weight
  const bodyClusters = clusterFonts(bodySamples, false);
  const bodyTop = bodyClusters[0];
  const bodyConfidence = bodyTop && bodyClusters[1]
    ? Math.min(bodyTop.score / bodyClusters[1].score, 1)
    : bodyTop ? 0.8 : 0;

  return {
    heading: {
      fontFamily: headingTop?.font || 'sans-serif',
      confidence: Math.round(headingConfidence * 100) / 100,
      evidence: headingTop?.samples.slice(0, 3) || []
    },
    body: {
      fontFamily: bodyTop?.font || 'sans-serif',
      confidence: Math.round(bodyConfidence * 100) / 100,
      evidence: bodyTop?.samples.slice(0, 3) || []
    }
  };
}
