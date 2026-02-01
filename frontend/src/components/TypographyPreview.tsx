import { TypographyResult } from '@/lib/types';

interface TypographyPreviewProps {
  heading: TypographyResult;
  body: TypographyResult;
}

export function TypographyPreview({ heading, body }: TypographyPreviewProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs uppercase tracking-widest text-black/40">Heading Font</p>
          <span className="text-xs text-black/40">{Math.round(heading.confidence * 100)}%</span>
        </div>
        <div className="p-6 border border-black/10">
          <p
            className="text-2xl mb-3"
            style={{ fontFamily: heading.fontFamily }}
          >
            {heading.fontFamily.split(',')[0].replace(/['"]/g, '')}
          </p>
          <p
            className="text-lg text-black/60"
            style={{ fontFamily: heading.fontFamily }}
          >
            The quick brown fox jumps over the lazy dog
          </p>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs uppercase tracking-widest text-black/40">Body Font</p>
          <span className="text-xs text-black/40">{Math.round(body.confidence * 100)}%</span>
        </div>
        <div className="p-6 border border-black/10">
          <p
            className="text-base mb-3"
            style={{ fontFamily: body.fontFamily }}
          >
            {body.fontFamily.split(',')[0].replace(/['"]/g, '')}
          </p>
          <p
            className="text-sm text-black/60 leading-relaxed"
            style={{ fontFamily: body.fontFamily }}
          >
            The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor jugs.
          </p>
        </div>
      </div>
    </div>
  );
}
