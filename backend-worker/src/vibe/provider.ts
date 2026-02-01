import { VibeSlice, VibeResult } from '../types';

const VIBE_PROMPT = `Analyze this website content and extract brand vibe information. Return ONLY valid JSON matching this schema:

{
  "tone": "string describing the overall tone (e.g., 'professional', 'playful', 'innovative')",
  "audience": ["array of target audience segments"],
  "positioning": "one sentence describing the brand positioning",
  "aesthetic_style": ["array of aesthetic descriptors like 'minimalist', 'bold', 'tech-forward'"],
  "summary": "2-3 sentence brand summary"
}

Website content:
Hero headline: {heroH1}
Subheading: {heroSubheading}
Primary CTA: {primaryCTA}
Navigation: {navLabels}

Respond with ONLY the JSON object, no markdown or explanation.`;

function buildPrompt(slice: VibeSlice): string {
  return VIBE_PROMPT
    .replace('{heroH1}', slice.heroH1 || 'Not found')
    .replace('{heroSubheading}', slice.heroSubheading || 'Not found')
    .replace('{primaryCTA}', slice.primaryCTA || 'Not found')
    .replace('{navLabels}', slice.navLabels.join(', ') || 'Not found');
}

function parseVibeResponse(text: string): Partial<VibeResult> {
  try {
    // Try to extract JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch {
    // Parsing failed
  }
  return {};
}

export async function analyzeVibe(
  slice: VibeSlice,
  provider: string | undefined,
  anthropicKey: string | undefined,
  openaiKey: string | undefined
): Promise<VibeResult> {

  // Check if we have a valid provider and key
  if (!provider || provider === 'none') {
    return {
      tone: '',
      audience: [],
      positioning: '',
      aesthetic_style: [],
      summary: '',
      confidence: 0,
      provider: 'none'
    };
  }

  const prompt = buildPrompt(slice);

  try {
    if (provider === 'anthropic' && anthropicKey) {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': anthropicKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-haiku-20240307',
          max_tokens: 500,
          messages: [{ role: 'user', content: prompt }]
        })
      });

      if (!response.ok) {
        throw new Error(`Anthropic API error: ${response.status}`);
      }

      const data = await response.json() as { content: Array<{ text: string }> };
      const text = data.content?.[0]?.text || '';
      const parsed = parseVibeResponse(text);

      return {
        tone: parsed.tone || '',
        audience: parsed.audience || [],
        positioning: parsed.positioning || '',
        aesthetic_style: parsed.aesthetic_style || [],
        summary: parsed.summary || '',
        confidence: parsed.tone ? 0.8 : 0.3,
        provider: 'anthropic'
      };
    }

    if (provider === 'openai' && openaiKey) {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openaiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          max_tokens: 500,
          messages: [{ role: 'user', content: prompt }]
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json() as { choices: Array<{ message: { content: string } }> };
      const text = data.choices?.[0]?.message?.content || '';
      const parsed = parseVibeResponse(text);

      return {
        tone: parsed.tone || '',
        audience: parsed.audience || [],
        positioning: parsed.positioning || '',
        aesthetic_style: parsed.aesthetic_style || [],
        summary: parsed.summary || '',
        confidence: parsed.tone ? 0.8 : 0.3,
        provider: 'openai'
      };
    }
  } catch (err) {
    console.error('Vibe analysis error:', err);
  }

  // Fallback if provider is set but key is missing or API failed
  return {
    tone: '',
    audience: [],
    positioning: '',
    aesthetic_style: [],
    summary: '',
    confidence: 0,
    provider: 'none'
  };
}
