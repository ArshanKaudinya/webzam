import { VibeSlice, VibeResult } from '../types';

const VIBE_PROMPT = `You are a brand strategist and design analyst. Analyze this website's content deeply and extract comprehensive brand intelligence.

## Website Content Extracted:

**Page Title:** {pageTitle}

**Meta Description:** {metaDescription}

**Hero Headline:** {heroH1}

**Subheading/Tagline:** {heroSubheading}

**Primary Call-to-Action:** {primaryCTA}

**All CTA Buttons:** {ctaTexts}

**Navigation Labels:** {navLabels}

**All Page Headings:**
{allHeadings}

**Feature Descriptions:**
{featureDescriptions}

**Testimonials/Reviews:**
{testimonials}

**Social Proof (Clients/Stats):**
{socialProof}

**Pricing Information:**
{pricingHints}

**Footer Links:** {footerLinks}

---

## Your Analysis Task:

Provide a thorough brand analysis covering these dimensions:

### 1. Brand Voice & Tone
- What is the primary emotional tone? (e.g., authoritative, friendly, provocative, aspirational)
- What communication style do they use? (formal/informal, technical/accessible, direct/subtle)
- What personality traits come through?

### 2. Target Audience
- Who is the primary audience? Be specific about demographics, psychographics, and needs
- What pain points or desires does this brand address?
- What level of sophistication/expertise does the audience have?

### 3. Value Proposition & Positioning
- What unique value does this brand offer?
- How do they differentiate from competitors?
- What transformation or outcome do they promise?

### 4. Brand Personality
- If this brand were a person, describe their personality
- What archetype fits? (e.g., The Innovator, The Sage, The Hero, The Creator)

### 5. Visual & Aesthetic Language
- What design philosophy is evident? (minimalist, bold, playful, premium, etc.)
- What era or movement does it reference?
- What mood does it create?

### 6. Industry & Market Position
- What industry/sector is this?
- Is this B2B or B2C?
- What price tier does this suggest? (budget, mid-market, premium, luxury)

---

## Response Format (JSON only):

{
  "tone": {
    "primary": "single word primary tone",
    "secondary": "single word secondary tone",
    "voice_characteristics": ["list", "of", "3-5", "voice", "traits"]
  },
  "audience": {
    "primary_segment": "specific description of main audience",
    "demographics": "age range, profession, location hints",
    "psychographics": "values, interests, lifestyle",
    "sophistication_level": "novice | intermediate | expert | mixed"
  },
  "value_proposition": {
    "core_promise": "one sentence value prop",
    "key_benefits": ["benefit 1", "benefit 2", "benefit 3"],
    "differentiator": "what makes them unique"
  },
  "personality": {
    "archetype": "brand archetype name",
    "traits": ["trait1", "trait2", "trait3", "trait4", "trait5"],
    "human_description": "2-3 sentence description if brand were a person"
  },
  "aesthetic": {
    "style": ["list", "of", "aesthetic", "descriptors"],
    "mood": "emotional mood created",
    "design_era": "modern/retro/timeless/futuristic",
    "polish_level": "startup | established | enterprise | premium"
  },
  "market": {
    "industry": "industry name",
    "business_model": "B2B | B2C | B2B2C | Marketplace",
    "price_tier": "budget | mid-market | premium | luxury",
    "competitive_position": "challenger | leader | niche | disruptor"
  },
  "summary": {
    "one_liner": "single sentence brand summary",
    "elevator_pitch": "2-3 sentence pitch capturing essence",
    "keywords": ["5-8", "keywords", "that", "define", "this", "brand"]
  }
}

Respond with ONLY the JSON object. No markdown, no explanation, no preamble.`;

function buildPrompt(slice: VibeSlice): string {
  const formatList = (items: string[] | undefined, fallback = 'Not found'): string => {
    if (!items || items.length === 0) return fallback;
    return items.map(item => `- ${item}`).join('\n');
  };

  const formatInline = (items: string[] | undefined, fallback = 'Not found'): string => {
    if (!items || items.length === 0) return fallback;
    return items.join(', ');
  };

  return VIBE_PROMPT
    .replace('{pageTitle}', slice.pageTitle || 'Not found')
    .replace('{metaDescription}', slice.metaDescription || 'Not found')
    .replace('{heroH1}', slice.heroH1 || 'Not found')
    .replace('{heroSubheading}', slice.heroSubheading || 'Not found')
    .replace('{primaryCTA}', slice.primaryCTA || 'Not found')
    .replace('{ctaTexts}', formatInline(slice.ctaTexts))
    .replace('{navLabels}', formatInline(slice.navLabels))
    .replace('{allHeadings}', formatList(slice.allHeadings))
    .replace('{featureDescriptions}', formatList(slice.featureDescriptions))
    .replace('{testimonials}', formatList(slice.testimonials))
    .replace('{socialProof}', formatList(slice.socialProof))
    .replace('{pricingHints}', formatList(slice.pricingHints))
    .replace('{footerLinks}', formatInline(slice.footerLinks));
}

function parseVibeResponse(text: string): any {
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (e) {
    console.error('Failed to parse vibe response:', e);
  }
  return null;
}

export async function analyzeVibe(
  slice: VibeSlice,
  provider: string | undefined,
  anthropicKey: string | undefined,
  openaiKey: string | undefined
): Promise<VibeResult> {

  const emptyResult: VibeResult = {
    tone: { primary: '', secondary: '', voice_characteristics: [] },
    audience: { primary_segment: '', demographics: '', psychographics: '', sophistication_level: '' },
    value_proposition: { core_promise: '', key_benefits: [], differentiator: '' },
    personality: { archetype: '', traits: [], human_description: '' },
    aesthetic: { style: [], mood: '', design_era: '', polish_level: '' },
    market: { industry: '', business_model: '', price_tier: '', competitive_position: '' },
    summary: { one_liner: '', elevator_pitch: '', keywords: [] },
    confidence: 0,
    provider: 'none'
  };

  if (!provider || provider === 'none') {
    return emptyResult;
  }

  const prompt = buildPrompt(slice);

  try {
    let responseText = '';

    if (provider === 'anthropic' && anthropicKey) {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': anthropicKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 4000,
          messages: [{ role: 'user', content: prompt }]
        })
      });

      if (!response.ok) {
        throw new Error(`Anthropic API error: ${response.status}`);
      }

      const data = await response.json() as { content: Array<{ text: string }> };
      responseText = data.content?.[0]?.text || '';
    } else if (provider === 'openai' && openaiKey) {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openaiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          max_tokens: 4000,
          messages: [{ role: 'user', content: prompt }]
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json() as { choices: Array<{ message: { content: string } }> };
      responseText = data.choices?.[0]?.message?.content || '';
    } else {
      return emptyResult;
    }

    const parsed = parseVibeResponse(responseText);

    if (!parsed) {
      return { ...emptyResult, provider };
    }

    return {
      tone: parsed.tone || emptyResult.tone,
      audience: parsed.audience || emptyResult.audience,
      value_proposition: parsed.value_proposition || emptyResult.value_proposition,
      personality: parsed.personality || emptyResult.personality,
      aesthetic: parsed.aesthetic || emptyResult.aesthetic,
      market: parsed.market || emptyResult.market,
      summary: parsed.summary || emptyResult.summary,
      confidence: parsed.tone?.primary ? 0.85 : 0.4,
      provider
    };

  } catch (err) {
    console.error('Vibe analysis error:', err);
    return { ...emptyResult, provider };
  }
}
