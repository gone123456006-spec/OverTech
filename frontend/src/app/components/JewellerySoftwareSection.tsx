import { useState } from 'react';
import {
  BarChart3,
  Check,
  Cloud,
  Gift,
  Headphones,
  Play,
  Shield,
} from 'lucide-react';

const FEATURES = [
  'GST Billing & Tax Compliance',
  'Stock (Manual + Barcode + RFID)',
  'Karigar & Badhaki (Gold Loan) Management',
  'Samridhi Scheme + Advance Management',
  'Purchase, Sales & Customer Ledger',
  'Bulk SMS + WhatsApp API',
  'Cloud Backup & Staff Commission',
];

const TRUST_FOOTER = [
  { icon: Shield, title: '100% Secure & Reliable', sub: 'Trusted by 1000+ Businesses' },
  { icon: Cloud, title: 'Cloud Backup & Safe', sub: 'Your data is always protected' },
  { icon: Headphones, title: '24/7 Support Available', sub: 'We are here when you need us' },
  { icon: BarChart3, title: 'Built for Growth & Success', sub: 'Scale your business faster' },
];

const YOUTUBE_EMBED = 'https://www.youtube.com/embed/OKnNHZrRdDE?autoplay=1&rel=0';

export function JewellerySoftwareSection() {
  const [playing, setPlaying] = useState(false);

  return (
    <section className="relative py-10 sm:py-14 bg-[#f4f7f8] border-t border-slate-200 overflow-hidden">
      {/* Decorative dots */}
      <div className="pointer-events-none absolute top-8 right-8 w-24 h-24 opacity-30" aria-hidden>
        <div className="grid grid-cols-4 gap-1.5">
          {Array.from({ length: 16 }).map((_, i) => (
            <span key={i} className="w-1.5 h-1.5 rounded-full bg-teal-300" />
          ))}
        </div>
      </div>
      <div className="pointer-events-none absolute bottom-12 left-6 w-20 h-20 opacity-25" aria-hidden>
        <div className="grid grid-cols-4 gap-1.5">
          {Array.from({ length: 12 }).map((_, i) => (
            <span key={i} className="w-1.5 h-1.5 rounded-full bg-teal-300" />
          ))}
        </div>
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#0f2744] tracking-tight">
            Hover Technology Pvt Ltd
          </h2>
          <div className="mt-4 sm:mt-5 inline-flex items-center gap-2 rounded-full bg-lime-300 px-4 sm:px-6 py-2 sm:py-2.5 text-sm sm:text-base font-semibold text-teal-950 shadow-sm">
            <Gift className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
            Special Offer: 1 Month Free Demo (Limited Time)
          </div>
        </div>

        {/* Main card */}
        <div className="rounded-2xl sm:rounded-3xl border border-slate-200/80 bg-white shadow-[0_8px_40px_rgba(15,39,68,0.08)] overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* Left — features */}
            <div className="p-5 sm:p-7 md:p-8 lg:p-9">
              <h3 className="text-xl sm:text-2xl font-bold text-teal-900 mb-2">Comprehensive Features</h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-4 max-w-lg">
                All the tools you need to run and grow your jewellery business in one powerful software.
              </p>

              <ul className="space-y-3.5 sm:space-y-4">
                {FEATURES.map((text) => (
                  <li key={text} className="flex items-center gap-3">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-lime-400 text-teal-950">
                      <Check className="h-3 w-3" strokeWidth={3} />
                    </span>
                    <span className="text-sm sm:text-base text-slate-700 font-medium leading-snug">{text}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Right — video / mockup */}
            <div className="bg-gradient-to-br from-[#0a3530] via-[#064a44] to-[#052e2b] pt-7 sm:pt-8 md:pt-9 px-3 sm:px-4 md:px-5 pb-4 sm:pb-5 flex flex-col">
              <div className="mb-6 sm:mb-7 min-w-0">
                <p className="text-sm font-bold text-white leading-tight truncate">
                  Simple Billing Jewellery Software
                </p>
                <p className="text-[10px] sm:text-xs text-teal-100/80 mt-0.5">
                  Hover Technology (The New Generation Era)
                </p>
              </div>

              {/* Video area — plays inline on the website */}
              <div className="relative mt-3 sm:mt-4 rounded-xl overflow-hidden bg-black border border-white/10 aspect-[16/10] max-h-[200px] sm:max-h-[220px] lg:max-h-[240px] w-full">
                {playing ? (
                  <iframe
                    className="absolute inset-0 w-full h-full border-0"
                    src={YOUTUBE_EMBED}
                    title="Jewellery billing software demo"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                  />
                ) : (
                  <>
                    <img
                      src="/assets/images/jewellery-software-hero.png"
                      alt="Jewellery billing software demo"
                      className="absolute inset-0 w-full h-full object-cover object-top opacity-90"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#052e2b]/80 via-transparent to-transparent" />
                    <button
                      type="button"
                      onClick={() => setPlaying(true)}
                      className="absolute inset-0 flex items-center justify-center group cursor-pointer"
                      aria-label="Play jewellery software demo video"
                    >
                      <span className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-white shadow-xl transition-transform group-hover:scale-105">
                        <Play className="h-5 w-5 sm:h-6 sm:w-6 text-teal-900 fill-teal-900 ml-0.5" />
                      </span>
                    </button>
                  </>
                )}
              </div>

              {/* Footer trust bar */}
              <div className="mt-14 sm:mt-16 lg:mt-[4.5rem] grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
                {TRUST_FOOTER.map(({ icon: Icon, title, sub }) => (
                  <div
                    key={title}
                    className="rounded-lg bg-white/95 px-2 py-2 sm:px-2.5 sm:py-2.5 text-center sm:text-left"
                  >
                    <Icon className="h-3.5 w-3.5 text-teal-800 mx-auto sm:mx-0 mb-0.5" strokeWidth={2} />
                    <p className="text-[9px] sm:text-[10px] font-bold text-teal-900 leading-tight">{title}</p>
                    <p className="text-[8px] sm:text-[9px] text-slate-500 leading-tight mt-0.5 hidden sm:block">{sub}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
