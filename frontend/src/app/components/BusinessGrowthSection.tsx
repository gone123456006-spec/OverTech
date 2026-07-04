import { Check, Rocket, Settings } from 'lucide-react';

const FEATURES = ['Innovative Solutions', 'Reliable Support', 'Result Driven'];

const HERO_IMAGE = '/assets/images/iamge com.png';

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
    </svg>
  );
}

function HeroVisual() {
  return (
    <div className="relative mx-auto w-full max-w-2xl sm:max-w-3xl lg:max-w-none lg:ml-auto scale-105 sm:scale-100 lg:scale-[1.15] xl:scale-[1.25] lg:origin-right">
      <img
        src={HERO_IMAGE}
        alt="Hover Technology business growth — dashboard, e-commerce and jewellery solutions"
        className="w-full h-auto object-contain drop-shadow-2xl"
      />
    </div>
  );
}

export function BusinessGrowthSection() {
  return (
    <section>
      {/* Hero — dark gradient, curved top + wave bottom */}
      <div className="relative overflow-hidden rounded-t-[2rem] sm:rounded-t-[2.75rem] md:rounded-t-[3.25rem] bg-gradient-to-br from-[#052e2b] via-[#064a44] to-[#0a3530">
        <div className="pointer-events-none absolute -top-24 -left-24 h-64 w-64 rounded-full bg-lime-400/5 blur-3xl" aria-hidden />
        <div className="pointer-events-none absolute top-1/2 right-0 h-72 w-72 rounded-full bg-teal-400/10 blur-3xl" aria-hidden />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-20 md:pt-14 md:pb-28 lg:pb-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-12 items-center">
            {/* Left */}
            <div className="text-left order-2 lg:order-1">
              <div className="inline-flex items-center gap-2 rounded-full border border-lime-400/35 bg-white/5 backdrop-blur-sm px-3.5 py-1.5 mb-6">
                <Rocket className="h-4 w-4 text-lime-400" strokeWidth={2.25} />
                <span className="text-xs sm:text-sm font-medium text-white/95">Your Growth. Our Technology.</span>
              </div>

              <h2 className="text-3xl sm:text-4xl md:text-[2.75rem] lg:text-5xl font-bold leading-tight tracking-tight mb-4">
                <span className="text-lime-400">Hover</span>{' '}
                <span className="text-white">Technology</span>
              </h2>

              <p className="relative inline-block text-lg sm:text-xl md:text-2xl font-semibold text-white mb-5">
                Your Business Growth Partner
                <span
                  className="absolute -bottom-1 left-0 h-2.5 w-full rounded-sm bg-lime-400/90 -skew-x-6 -z-0"
                  aria-hidden
                />
              </p>

              <p className="text-sm sm:text-base text-white/80 leading-relaxed max-w-lg mb-8">
                We deliver smart digital solutions that help your brand grow, engage, and scale in the digital world.
              </p>

              <div className="flex flex-col sm:flex-row sm:flex-wrap gap-4 sm:gap-6">
                {FEATURES.map((item) => (
                  <div key={item} className="flex items-center gap-2.5">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-lime-400 text-teal-950">
                      <Check className="h-4 w-4" strokeWidth={3} />
                    </span>
                    <span className="text-sm font-medium text-white">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right */}
            <div className="order-1 lg:order-2">
              <HeroVisual />
            </div>
          </div>
        </div>

        {/* Wave to white */}
        <svg
          className="absolute bottom-0 left-0 w-full block h-12 sm:h-16 md:h-20"
          viewBox="0 0 1440 80"
          preserveAspectRatio="none"
          aria-hidden
        >
          <path
            fill="#ffffff"
            d="M0,40 C240,80 480,0 720,40 C960,80 1200,0 1440,40 L1440,80 L0,80 Z"
          />
        </svg>
      </div>

      {/* White content */}
      <div className="bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12 md:pt-8 md:pb-16 text-center">
          <p className="text-base md:text-lg text-slate-700 mb-4 leading-relaxed">
            Welcome to Hover Technology. Are you looking to scale your business with advanced{' '}
            <span className="font-semibold text-teal-900">Jewellery Software</span> or precision{' '}
            <span className="font-semibold text-teal-900">Jewellery Tags</span>?
          </p>
          <p className="text-base md:text-lg text-slate-700 leading-relaxed">
            Do you need professional{' '}
            <span className="font-semibold text-teal-900">Digital Branding</span>, targeted{' '}
            <span className="font-semibold text-teal-900">WhatsApp Marketing</span>, or a{' '}
            <span className="font-semibold text-teal-900">Custom E-Commerce Application</span>?
          </p>

          <div className="mt-8 md:mt-10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white border border-slate-200 rounded-2xl px-4 py-4 md:px-6 md:py-5 text-left shadow-sm max-w-3xl mx-auto">
            <div className="flex items-start sm:items-center gap-3 text-sm md:text-base text-slate-700 flex-1">
              <div className="w-10 h-10 rounded-full bg-teal-50 border border-teal-100 flex items-center justify-center flex-shrink-0">
                <Settings className="w-5 h-5 text-teal-900" />
              </div>
              <span>We provide end-to-end solutions to accelerate your business growth.</span>
            </div>
            <a
              href="https://wa.me/917991163225"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary shrink-0 self-start sm:self-center px-6 py-2.5 text-sm sm:text-base gap-2"
            >
              <WhatsAppIcon className="h-5 w-5" />
              Chat on WhatsApp
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
