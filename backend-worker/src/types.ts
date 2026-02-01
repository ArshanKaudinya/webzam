// Core types for Webzam scanner

export interface Env {
  DB: D1Database;
  BROWSER: Fetcher;
  VIBE_PROVIDER?: string;
  ANTHROPIC_API_KEY?: string;
  OPENAI_API_KEY?: string;
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ElementEvidence {
  tag: string;
  text?: string;
  rect: Rect;
  styles: Record<string, string>;
}

export interface ColorResult {
  hex: string;
  confidence: number;
  evidence: ElementEvidence[];
}

export interface TypographyResult {
  fontFamily: string;
  confidence: number;
  evidence: ElementEvidence[];
}

export interface LogoResult {
  type: 'svg' | 'png' | 'jpg' | 'unknown';
  value: string;
  confidence: number;
  reason: string;
}

export interface VibeSlice {
  heroH1: string | null;
  heroSubheading: string | null;
  primaryCTA: string | null;
  navLabels: string[];
}

export interface VibeResult {
  tone: string;
  audience: string[];
  positioning: string;
  aesthetic_style: string[];
  summary: string;
  confidence: number;
  provider: string;
}

export interface ScanResult {
  id: string;
  url: string;
  scannedAt: string;
  colors: {
    primary: ColorResult;
    secondary: ColorResult;
    background: ColorResult;
  };
  typography: {
    heading: TypographyResult;
    body: TypographyResult;
  };
  logo: LogoResult | null;
  vibe: VibeResult;
  vibeSlice: VibeSlice;
  error?: string;
}

export interface ScanRecord {
  id: string;
  url: string;
  created_at: string;
  result_json: string;
}

// Raw extraction data from browser
export interface RawExtractionData {
  ctaCandidates: CTACandidate[];
  headingSamples: TypographySample[];
  bodySamples: TypographySample[];
  backgroundSamples: BackgroundSample[];
  logoCandidates: LogoCandidate[];
  vibeSlice: VibeSlice;
}

export interface CTACandidate {
  tag: string;
  text: string;
  backgroundColor: string;
  color: string;
  borderColor: string;
  borderRadius: string;
  padding: string;
  rect: Rect;
  area: number;
  isAboveFold: boolean;
}

export interface TypographySample {
  tag: string;
  text: string;
  fontFamily: string;
  fontSize: string;
  fontWeight: string;
  rect: Rect;
}

export interface BackgroundSample {
  tag: string;
  backgroundColor: string;
  rect: Rect;
  area: number;
}

export interface LogoCandidate {
  type: 'svg' | 'img';
  src?: string;
  srcset?: string;
  svgContent?: string;
  alt?: string;
  rect: Rect;
  inHeader: boolean;
}
