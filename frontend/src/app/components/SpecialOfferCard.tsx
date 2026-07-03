import { Award, Megaphone, Sparkles, Sun } from 'lucide-react';
import type { SpecialOffer } from '../utils/specialOffers';
import { buildWhatsAppLink } from '../utils/specialOffers';

const CARD_THEMES = [
  {
    top: 'bg-[#fce8ee]',
    bottom: 'bg-[#6b1d3a]',
    text: 'text-[#6b1d3a]',
    textMuted: 'text-[#6b1d3a]/80',
    icon: Sun,
  },
  {
    top: 'bg-[#fff3e6]',
    bottom: 'bg-[#9a4a1f]',
    text: 'text-[#7a3b18]',
    textMuted: 'text-[#7a3b18]/80',
    icon: Sparkles,
  },
  {
    top: 'bg-[#e8f4fc]',
    bottom: 'bg-[#1e3a5f]',
    text: 'text-[#1e3a5f]',
    textMuted: 'text-[#1e3a5f]/80',
    icon: Award,
  },
  {
    top: 'bg-[#f0ebfa]',
    bottom: 'bg-[#4c1d95]',
    text: 'text-[#4c1d95]',
    textMuted: 'text-[#4c1d95]/80',
    icon: Megaphone,
  },
] as const;

const CARD_LABELS = ['Offer', 'Price', 'Deal', 'Save'] as const;

interface SpecialOfferCardProps {
  offer: SpecialOffer;
  index: number;
}

export function SpecialOfferCard({ offer, index }: SpecialOfferCardProps) {
  const theme = CARD_THEMES[index % CARD_THEMES.length];
  const Icon = theme.icon;
  const label = CARD_LABELS[index % CARD_LABELS.length];

  return (
    <article className="group relative flex flex-col rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow min-h-[300px] sm:min-h-[340px]">
      <div className={`relative px-3.5 sm:px-4 pt-3.5 sm:pt-4 pb-10 sm:pb-12 ${theme.top}`}>
        <Icon
          className={`absolute top-3 right-3 w-4 h-4 sm:w-5 sm:h-5 ${theme.text} opacity-90`}
          strokeWidth={1.75}
          aria-hidden="true"
        />

        <p className={`text-[10px] sm:text-xs font-semibold uppercase tracking-wide ${theme.text}`}>
          {label}
        </p>
        <p className={`mt-0.5 text-xl sm:text-2xl md:text-3xl font-bold leading-none ${theme.text}`}>
          {offer.price}
        </p>
        <p className={`mt-2 text-[10px] sm:text-xs leading-snug pr-6 ${theme.textMuted}`}>
          {offer.title} — quality service at competitive rates
        </p>

        <div
          className={`absolute left-1/2 -bottom-5 sm:-bottom-6 h-10 sm:h-12 w-[118%] -translate-x-1/2 rounded-[50%] ${theme.bottom}`}
          aria-hidden="true"
        />
      </div>

      <div className={`relative flex flex-1 flex-col items-center justify-end px-3 pb-3.5 sm:pb-4 pt-2 ${theme.bottom}`}>
        <div className="relative flex w-full flex-1 items-end justify-center min-h-[100px] sm:min-h-[120px]">
          {offer.image ? (
            <img
              src={offer.image}
              alt={offer.title}
              className="max-h-[88px] sm:max-h-[110px] w-auto object-contain drop-shadow-[0_8px_16px_rgba(0,0,0,0.28)] group-hover:scale-[1.03] transition-transform duration-300"
            />
          ) : (
            <span className="text-sm font-medium text-white/90 text-center px-2">{offer.title}</span>
          )}
        </div>

        <a
          href={buildWhatsAppLink(offer)}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary-sm mt-3 w-full max-w-[9.5rem] shadow-[0_4px_10px_rgba(0,0,0,0.15)]"
        >
          Enquire Now
        </a>
      </div>
    </article>
  );
}
