import { ArrowRight, Phone, Shield } from 'lucide-react';
import type { SpecialOffer } from '../utils/specialOffers';
import { buildWhatsAppLink } from '../utils/specialOffers';

const TAG_THEMES = [
  {
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-600',
    accent: 'text-blue-600',
    line: 'bg-blue-500',
    button: 'border-blue-500 text-blue-600 hover:bg-blue-50',
  },
  {
    iconBg: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
    accent: 'text-emerald-600',
    line: 'bg-emerald-500',
    button: 'border-emerald-500 text-emerald-600 hover:bg-emerald-50',
  },
  {
    iconBg: 'bg-violet-50',
    iconColor: 'text-violet-600',
    accent: 'text-violet-600',
    line: 'bg-violet-500',
    button: 'border-violet-500 text-violet-600 hover:bg-violet-50',
  },
] as const;

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
    </svg>
  );
}

function TagIcon({ index, className }: { index: number; className?: string }) {
  if (index % 3 === 1) return <WhatsAppIcon className={className} />;
  if (index % 3 === 2) return <Shield className={className} strokeWidth={2} />;
  return <Phone className={className} strokeWidth={2} />;
}

interface SpecialOfferTagProps {
  offer: SpecialOffer;
  index?: number;
}

export function SpecialOfferTag({ offer, index = 0 }: SpecialOfferTagProps) {
  const theme = TAG_THEMES[index % TAG_THEMES.length];

  return (
    <article className="flex min-w-0 w-full flex-col items-center rounded-xl sm:rounded-2xl border border-slate-200 bg-white px-1.5 py-3 sm:px-5 sm:py-7 text-center shadow-[0_4px_20px_rgba(15,39,68,0.06)] hover:shadow-[0_8px_28px_rgba(15,39,68,0.1)] transition-shadow">
      <div
        className={`mb-2 sm:mb-4 flex h-8 w-8 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-full ${theme.iconBg}`}
      >
        <TagIcon index={index} className={`h-4 w-4 sm:h-6 sm:w-6 ${theme.iconColor}`} />
      </div>

      <h4 className="w-full text-[9px] sm:text-sm md:text-base font-semibold text-slate-800 leading-tight line-clamp-2 min-h-[2.2em] sm:min-h-0">
        {offer.title}
      </h4>

      <span className={`mt-1.5 sm:mt-3 h-0.5 w-6 sm:w-10 shrink-0 rounded-full ${theme.line}`} aria-hidden />

      <p className={`mt-1.5 sm:mt-3 text-sm sm:text-2xl md:text-3xl font-bold leading-none whitespace-nowrap ${theme.accent}`}>
        {offer.price}
      </p>

      {offer.subtitle && (
        <p className="mt-0.5 sm:mt-1 text-[8px] sm:text-xs text-slate-500 uppercase tracking-wide whitespace-nowrap">
          {offer.subtitle}
        </p>
      )}

      <a
        href={buildWhatsAppLink(offer)}
        target="_blank"
        rel="noopener noreferrer"
        className={`mt-2 sm:mt-5 inline-flex w-full max-w-full items-center justify-center gap-0.5 sm:gap-1 rounded-full border bg-white px-1.5 py-1 sm:px-4 sm:py-2 text-[8px] sm:text-xs font-semibold whitespace-nowrap transition-colors ${theme.button}`}
      >
        <span>Enquire Now</span>
        <ArrowRight className="h-2.5 w-2.5 sm:h-3.5 sm:w-3.5 shrink-0" />
      </a>
    </article>
  );
}
