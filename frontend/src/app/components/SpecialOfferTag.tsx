import type { SpecialOffer } from '../utils/specialOffers';
import { buildWhatsAppLink } from '../utils/specialOffers';

interface SpecialOfferTagProps {
  offer: SpecialOffer;
}

export function SpecialOfferTag({ offer }: SpecialOfferTagProps) {
  return (
    <article className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-5 sm:py-6 text-center">
      <h4 className="text-sm sm:text-base font-medium text-slate-700 leading-snug">
        {offer.title}
      </h4>
      <p className="mt-2 text-2xl sm:text-3xl font-bold text-teal-950">
        {offer.price}
      </p>
      {offer.subtitle && (
        <p className="mt-1 text-xs text-slate-500">
          {offer.subtitle}
        </p>
      )}
      <a
        href={buildWhatsAppLink(offer)}
        target="_blank"
        rel="noopener noreferrer"
        className="btn-outline-xs mt-4"
      >
        Enquire Now
      </a>
    </article>
  );
}
