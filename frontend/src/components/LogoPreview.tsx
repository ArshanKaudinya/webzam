import { LogoResult } from '@/lib/types';

interface LogoPreviewProps {
  logo: LogoResult | null;
}

export function LogoPreview({ logo }: LogoPreviewProps) {
  if (!logo) {
    return (
      <div className="p-6 rounded-lg border border-neutral-200 bg-neutral-50 text-center text-neutral-400">
        No logo detected
      </div>
    );
  }

  const isSvg = logo.type === 'svg';

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm text-neutral-500 uppercase tracking-wide">Logo</span>
        <span className="text-xs text-neutral-400">
          {Math.round(logo.confidence * 100)}% confidence
        </span>
      </div>

      <div className="p-6 rounded-lg border border-neutral-200 bg-white flex items-center justify-center min-h-[100px]">
        {isSvg ? (
          <div
            className="max-w-[200px] max-h-[100px]"
            dangerouslySetInnerHTML={{ __html: logo.value }}
          />
        ) : (
          <img
            src={logo.value}
            alt="Logo"
            className="max-w-[200px] max-h-[100px] object-contain"
          />
        )}
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className="text-neutral-500">{logo.reason}</span>
        {!isSvg && (
          <a
            href={logo.value}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            Download {logo.type.toUpperCase()}
          </a>
        )}
      </div>
    </div>
  );
}
