import { ColorResult, TypographyResult, ElementEvidence } from '@/lib/types';

interface EvidencePanelProps {
  colors: {
    primary: ColorResult;
    secondary: ColorResult;
    background: ColorResult;
  };
  typography: {
    heading: TypographyResult;
    body: TypographyResult;
  };
}

function EvidenceItem({ evidence, label }: { evidence: ElementEvidence[]; label: string }) {
  if (!evidence.length) return null;

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium text-neutral-600">{label}</h4>
      <div className="space-y-1">
        {evidence.map((ev, i) => (
          <div
            key={i}
            className="text-xs p-2 rounded bg-neutral-50 border border-neutral-100 font-mono"
          >
            <div className="flex items-center gap-2">
              <span className="text-neutral-400">&lt;{ev.tag}&gt;</span>
              {ev.text && (
                <span className="text-neutral-600 truncate max-w-[200px]">
                  "{ev.text}"
                </span>
              )}
            </div>
            <div className="mt-1 text-neutral-400">
              {Object.entries(ev.styles).map(([k, v]) => (
                <span key={k} className="mr-2">
                  {k}: {v}
                </span>
              ))}
            </div>
            <div className="mt-1 text-neutral-300">
              x:{Math.round(ev.rect.x)} y:{Math.round(ev.rect.y)}{' '}
              {Math.round(ev.rect.width)}×{Math.round(ev.rect.height)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function EvidencePanel({ colors, typography }: EvidencePanelProps) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Evidence</h3>
      <p className="text-sm text-neutral-500">
        Sampled elements that contributed to token detection
      </p>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <EvidenceItem evidence={colors.primary.evidence} label="Primary Color" />
        <EvidenceItem evidence={colors.secondary.evidence} label="Secondary Color" />
        <EvidenceItem evidence={colors.background.evidence} label="Background" />
        <EvidenceItem evidence={typography.heading.evidence} label="Heading Font" />
        <EvidenceItem evidence={typography.body.evidence} label="Body Font" />
      </div>
    </div>
  );
}
