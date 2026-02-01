import { VibeResult } from '@/lib/types';

interface VibeCardProps {
  vibe: VibeResult;
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-black/10 pb-6">
      <p className="text-xs uppercase tracking-widest text-black/40 mb-3">{label}</p>
      {children}
    </div>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-block px-3 py-1 text-xs border border-black/20 mr-2 mb-2">
      {children}
    </span>
  );
}

export function VibeCard({ vibe }: VibeCardProps) {
  if (vibe.provider === 'none' || vibe.confidence === 0) {
    return (
      <div className="p-12 border border-black/10 text-center text-black/30">
        Brand analysis unavailable — no LLM provider configured
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Tone & Voice */}
      {vibe.tone?.primary && (
        <Section label="Tone & Voice">
          <div className="flex flex-wrap items-baseline gap-4 mb-4">
            <span className="font-serif text-3xl">{vibe.tone.primary}</span>
            {vibe.tone.secondary && (
              <span className="text-black/40">/ {vibe.tone.secondary}</span>
            )}
          </div>
          {vibe.tone.voice_characteristics?.length > 0 && (
            <div>
              {vibe.tone.voice_characteristics.map((trait, i) => (
                <Tag key={i}>{trait}</Tag>
              ))}
            </div>
          )}
        </Section>
      )}

      {/* Audience */}
      {vibe.audience?.primary_segment && (
        <Section label="Target Audience">
          <p className="text-lg mb-4">{vibe.audience.primary_segment}</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
            {vibe.audience.demographics && (
              <div>
                <p className="text-black/40 mb-1">Demographics</p>
                <p>{vibe.audience.demographics}</p>
              </div>
            )}
            {vibe.audience.psychographics && (
              <div>
                <p className="text-black/40 mb-1">Psychographics</p>
                <p>{vibe.audience.psychographics}</p>
              </div>
            )}
            {vibe.audience.sophistication_level && (
              <div>
                <p className="text-black/40 mb-1">Sophistication</p>
                <p className="capitalize">{vibe.audience.sophistication_level}</p>
              </div>
            )}
          </div>
        </Section>
      )}

      {/* Value Proposition */}
      {vibe.value_proposition?.core_promise && (
        <Section label="Value Proposition">
          <p className="font-serif text-xl mb-4">{vibe.value_proposition.core_promise}</p>
          {vibe.value_proposition.key_benefits?.length > 0 && (
            <div className="mb-4">
              <p className="text-black/40 text-sm mb-2">Key Benefits</p>
              <ul className="space-y-1">
                {vibe.value_proposition.key_benefits.map((benefit, i) => (
                  <li key={i} className="text-sm">— {benefit}</li>
                ))}
              </ul>
            </div>
          )}
          {vibe.value_proposition.differentiator && (
            <div>
              <p className="text-black/40 text-sm mb-1">Differentiator</p>
              <p className="text-sm">{vibe.value_proposition.differentiator}</p>
            </div>
          )}
        </Section>
      )}

      {/* Personality */}
      {vibe.personality?.archetype && (
        <Section label="Brand Personality">
          <div className="flex items-baseline gap-4 mb-4">
            <span className="font-serif text-2xl">{vibe.personality.archetype}</span>
          </div>
          {vibe.personality.traits?.length > 0 && (
            <div className="mb-4">
              {vibe.personality.traits.map((trait, i) => (
                <Tag key={i}>{trait}</Tag>
              ))}
            </div>
          )}
          {vibe.personality.human_description && (
            <p className="text-sm text-black/60 italic">
              "{vibe.personality.human_description}"
            </p>
          )}
        </Section>
      )}

      {/* Aesthetic */}
      {vibe.aesthetic?.style?.length > 0 && (
        <Section label="Aesthetic">
          <div className="mb-4">
            {vibe.aesthetic.style.map((style, i) => (
              <Tag key={i}>{style}</Tag>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-6 text-sm">
            {vibe.aesthetic.mood && (
              <div>
                <p className="text-black/40 mb-1">Mood</p>
                <p>{vibe.aesthetic.mood}</p>
              </div>
            )}
            {vibe.aesthetic.design_era && (
              <div>
                <p className="text-black/40 mb-1">Era</p>
                <p className="capitalize">{vibe.aesthetic.design_era}</p>
              </div>
            )}
            {vibe.aesthetic.polish_level && (
              <div>
                <p className="text-black/40 mb-1">Polish</p>
                <p className="capitalize">{vibe.aesthetic.polish_level}</p>
              </div>
            )}
          </div>
        </Section>
      )}

      {/* Market */}
      {vibe.market?.industry && (
        <Section label="Market Position">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
            <div>
              <p className="text-black/40 mb-1">Industry</p>
              <p>{vibe.market.industry}</p>
            </div>
            {vibe.market.business_model && (
              <div>
                <p className="text-black/40 mb-1">Model</p>
                <p>{vibe.market.business_model}</p>
              </div>
            )}
            {vibe.market.price_tier && (
              <div>
                <p className="text-black/40 mb-1">Price Tier</p>
                <p className="capitalize">{vibe.market.price_tier}</p>
              </div>
            )}
            {vibe.market.competitive_position && (
              <div>
                <p className="text-black/40 mb-1">Position</p>
                <p className="capitalize">{vibe.market.competitive_position}</p>
              </div>
            )}
          </div>
        </Section>
      )}

      {/* Provider Attribution */}
      <div className="text-xs text-black/30 text-right">
        Analysis via {vibe.provider} · {Math.round(vibe.confidence * 100)}% confidence
      </div>
    </div>
  );
}
