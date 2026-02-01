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

export interface ScanSummary {
  id: string;
  url: string;
  created_at: string;
}
