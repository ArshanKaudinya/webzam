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

export interface ScanSummary {
  id: string;
  url: string;
  created_at: string;
}
