import { useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  Briefcase,
  ChevronDown,
  ChevronUp,
  Coffee,
  CreditCard,
  FileText,
  MessageSquare,
  Monitor,
  PlayCircle,
  PlusSquare,
  Printer,
  Repeat,
  Search,
  Shield,
  Smartphone,
  TrendingUp,
} from 'lucide-react';

type ServiceItem = {
  Icon: LucideIcon;
  name: string;
  description: string;
};

const SERVICES: ServiceItem[] = [
  {
    Icon: Monitor,
    name: 'CCTV Camera Installation',
    description: 'Professional CCTV setup with remote monitoring, DVR/NVR configuration, and on-site support for shops and offices.',
  },
  {
    Icon: MessageSquare,
    name: 'Bulk SMS / OTP / Jio-DLT',
    description: 'DLT-approved bulk SMS, OTP alerts, and promotional messaging to reach customers instantly and reliably.',
  },
  {
    Icon: PlusSquare,
    name: 'Medicine Billing Software',
    description: 'GST-ready pharmacy billing with stock, expiry tracking, and fast invoice generation for medical stores.',
  },
  {
    Icon: Coffee,
    name: 'Restaurant Billing Software',
    description: 'Table-wise billing, KOT printing, and inventory control built for restaurants and cafés.',
  },
  {
    Icon: Briefcase,
    name: 'Jewellery Wholesale Software',
    description: 'Karigar, badhaki, RFID/barcode stock, and wholesale billing tailored for jewellery businesses.',
  },
  {
    Icon: CreditCard,
    name: 'Money Counting Machine',
    description: 'Accurate note counting machines with fake-note detection for cash-heavy retail counters.',
  },
  {
    Icon: Printer,
    name: 'Barcode / Thermal Printer',
    description: 'Thermal printers for tags, receipts, and labels with installation and after-sales support.',
  },
  {
    Icon: FileText,
    name: 'POS Roll / Ribbon / Labels',
    description: 'Premium POS rolls, ribbons, and label rolls compatible with major printer brands.',
  },
  {
    Icon: Search,
    name: 'Barcode Scanner / RFID Tags',
    description: 'Handheld scanners and RFID tags for faster billing and accurate inventory tracking.',
  },
  {
    Icon: Shield,
    name: 'Quick Heal Antivirus Protection',
    description: 'Licensed Quick Heal antivirus for business PCs with renewal and deployment assistance.',
  },
  {
    Icon: TrendingUp,
    name: 'Digital Marketing Services',
    description: 'SEO, social media, and paid ads to grow your brand visibility and customer reach online.',
  },
  {
    Icon: PlayCircle,
    name: 'YouTube Promotion & Strategy',
    description: 'Channel growth, video SEO, and content strategy to boost views and subscriber engagement.',
  },
  {
    Icon: Smartphone,
    name: 'Mobile Billing',
    description: 'Effortlessly create invoices, manage inventory in real time, and accept secure digital payments directly on Android or iOS devices anytime.',
  },
  {
    Icon: Repeat,
    name: 'Rupees to Gold Converter Tool',
    description: 'Live gold-rate calculator for jewellers to convert rupee amounts to weight instantly at the counter.',
  },
];

const MOBILE_INITIAL_COUNT = 6;

function ServiceCard({ service }: { service: ServiceItem }) {
  const { Icon } = service;

  return (
    <article className="flex flex-col gap-2 sm:flex-row sm:items-start sm:gap-4 rounded-xl sm:rounded-2xl border border-slate-200 bg-white p-2.5 sm:p-5 md:p-6 shadow-[0_2px_12px_rgba(0,0,0,0.05)] sm:shadow-[0_4px_20px_rgba(0,0,0,0.05)] transition-all duration-200 hover:border-teal-800/20 hover:shadow-md h-full min-w-0">
      <div className="flex h-9 w-9 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-lg sm:rounded-xl bg-teal-50 text-teal-900 border border-teal-100 mx-auto sm:mx-0">
        <Icon className="h-4 w-4 sm:h-7 sm:w-7" strokeWidth={1.75} />
      </div>
      <div className="flex-1 min-w-0 text-center sm:text-left">
        <h3 className="text-[10px] sm:text-lg md:text-xl font-bold text-teal-900 mb-1 sm:mb-2 leading-tight line-clamp-3 sm:line-clamp-none">
          {service.name}
        </h3>
        <p className="text-[9px] sm:text-sm text-slate-600 leading-snug sm:leading-relaxed line-clamp-4 sm:line-clamp-none">
          {service.description}
        </p>
      </div>
    </article>
  );
}

export function SmartSolutionsSection() {
  const [showAll, setShowAll] = useState(false);

  return (
    <section className="py-10 sm:py-20 bg-slate-50 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
        <div className="text-center mb-6 sm:mb-14 max-w-3xl mx-auto px-2">
          <h2 className="text-xl sm:text-3xl md:text-4xl font-bold tracking-tight text-slate-900 leading-tight">
            <span className="relative inline-block text-teal-900">
              Smart Solutions
              <span
                className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 h-0.5 w-12 bg-teal-700 rounded-full"
                aria-hidden
              />
            </span>{' '}
            for Every Business Need
          </h2>
          <p className="mt-3 sm:mt-5 text-xs sm:text-base text-slate-600 leading-relaxed">
            From software to marketing, we provide end-to-end solutions to help your business grow faster and smarter.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2 sm:gap-4 md:gap-5 lg:gap-6">
          {SERVICES.map((service, index) => (
            <div
              key={service.name}
              className={
                index >= MOBILE_INITIAL_COUNT && !showAll ? 'hidden sm:block' : undefined
              }
            >
              <ServiceCard service={service} />
            </div>
          ))}
        </div>

        <div className="mt-4 flex justify-center sm:hidden">
          <button
            type="button"
            onClick={() => setShowAll((prev) => !prev)}
            className="inline-flex items-center gap-1.5 rounded-full border border-teal-800/20 bg-white px-5 py-2 text-sm font-semibold text-teal-900 shadow-sm transition-colors hover:bg-teal-50"
          >
            {showAll ? (
              <>
                Show less
                <ChevronUp className="h-4 w-4" />
              </>
            ) : (
              <>
                Show more
                <ChevronDown className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </section>
  );
}
