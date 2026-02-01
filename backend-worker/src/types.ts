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
  // Extended content for deeper analysis
  metaDescription: string | null;
  pageTitle: string | null;
  allHeadings: string[];
  featureDescriptions: string[];
  testimonials: string[];
  footerLinks: string[];
  socialProof: string[];
  pricingHints: string[];
  ctaTexts: string[];
}

export interface VibeTone {
  primary: string;
  secondary: string;
  voice_characteristics: string[];
}

export interface VibeAudience {
  primary_segment: string;
  demographics: string;
  psychographics: string;
  sophistication_level: string;
}

export interface VibeValueProposition {
  core_promise: string;
  key_benefits: string[];
  differentiator: string;
}

export interface VibePersonality {
  archetype: string;
  traits: string[];
  human_description: string;
}

export interface VibeAesthetic {
  style: string[];
  mood: string;
  design_era: string;
  polish_level: string;
}

export interface VibeMarket {
  industry: string;
  business_model: string;
  price_tier: string;
  competitive_position: string;
}

export interface VibeSummary {
  one_liner: string;
  elevator_pitch: string;
  keywords: string[];
}

export interface VibeResult {
  tone: VibeTone;
  audience: VibeAudience;
  value_proposition: VibeValueProposition;
  personality: VibePersonality;
  aesthetic: VibeAesthetic;
  market: VibeMarket;
  summary: VibeSummary;
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
