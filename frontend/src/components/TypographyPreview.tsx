import { TypographyResult } from '@/lib/types';

interface TypographyPreviewProps {
  heading: TypographyResult;
  body: TypographyResult;
}

export function TypographyPreview({ heading, body }: TypographyPreviewProps) {
  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-neutral-500 uppercase tracking-wide">Heading Font</span>
          <span className="text-xs text-neutral-400">
            {Math.round(heading.confidence * 100)}% confidence
          </span>
        </div>
        <div className="p-4 rounded-lg border border-neutral-200 bg-neutral-50">
          <p
            className="text-2xl font-semibold"
            style={{ fontFamily: heading.fontFamily }}
          >
            {heading.fontFamily}
          </p>
          <p
            className="text-lg mt-2 text-neutral-600"
            style={{ fontFamily: heading.fontFamily }}
          >
            The quick brown fox jumps over the lazy dog
          </p>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-neutral-500 uppercase tracking-wide">Body Font</span>
          <span className="text-xs text-neutral-400">
            {Math.round(body.confidence * 100)}% confidence
          </span>
        </div>
        <div className="p-4 rounded-lg border border-neutral-200 bg-neutral-50">
          <p
            className="text-base"
            style={{ fontFamily: body.fontFamily }}
          >
            {body.fontFamily}
          </p>
          <p
            className="text-sm mt-2 text-neutral-600"
            style={{ fontFamily: body.fontFamily }}
          >
            The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor jugs.
          </p>
        </div>
      </div>
    </div>
  );
}
