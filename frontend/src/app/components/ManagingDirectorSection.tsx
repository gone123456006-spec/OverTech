const MD_IMAGE = '/assets/images/prabhakar-kumar-md.png?v=2';

const VISION_PARAGRAPHS = [
  'At Hover Technology, my vision is to empower businesses through smart, scalable, and innovative technology solutions. Our goal is to simplify business operations and accelerate digital transformation for enterprises of all sizes.',
  'We specialize in developing industry-specific software solutions including Jewellery Management Software, Medical/Pharmacy Software, Salon Management Software, Supermarket Software, Hotel & Restaurant Software, and Garments Software. In addition, we build custom mobile applications, responsive websites, and RFID-based solutions tailored to modern business needs.',
  'My core focus is on adopting emerging technologies and transforming them into practical, affordable, and user-friendly solutions for the Indian market. We are committed to delivering secure, reliable, and future-ready systems that help businesses grow efficiently.',
  'At Hover Technology, innovation, quality, and customer satisfaction are at the heart of everything we do. Our long-term vision is to become a trusted technology partner that drives sustainable business growth and contributes to the digital advancement of the nation.',
];

export function ManagingDirectorSection() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start mb-16">
      <div className="order-2 lg:order-1">
        <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 mb-2 leading-tight">
          Hover Technology
        </h3>
        <p className="text-base sm:text-lg font-semibold text-teal-900 mb-6">
          Prabhakar Kumar <span className="font-normal text-slate-500">(Managing Director)</span>
        </p>

        <div className="space-y-4 text-sm sm:text-base text-slate-600 leading-relaxed">
          {VISION_PARAGRAPHS.map((paragraph) => (
            <p key={paragraph.slice(0, 40)}>{paragraph}</p>
          ))}
        </div>
      </div>

      <div className="order-1 lg:order-2 flex justify-center lg:justify-end">
        <div className="w-full max-w-[280px] sm:max-w-xs lg:max-w-sm rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-md">
          <img
            src={MD_IMAGE}
            alt="Prabhakar Kumar — Managing Director, Hover Technology"
            className="w-full aspect-[3/4] object-cover object-top"
          />
          <div className="px-4 py-3 text-center border-t border-slate-100 bg-slate-50">
            <p className="text-sm font-semibold text-slate-900">Prabhakar Kumar</p>
            <p className="text-xs text-slate-500 mt-0.5">Managing Director, Hover Technology</p>
          </div>
        </div>
      </div>
    </div>
  );
}
