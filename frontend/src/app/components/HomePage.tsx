import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ChevronRight, ChevronLeft, Settings, Monitor, MessageSquare, PlusSquare, Coffee, Briefcase, CreditCard, Printer, FileText, Shield, TrendingUp, PlayCircle, Smartphone, Repeat } from 'lucide-react';
import { getBanners } from '../utils/storage';

const categories = [
  {
    id: 'clothes',
    name: 'Clothes',
    image: 'https://images.unsplash.com/photo-1611312449545-94176309c857?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYXNoaW9uJTIwY2xvdGhlcyUyMGFwcGFyZWx8ZW58MXx8fHwxNzcwMzMxNzQ1fDA&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Latest fashion trends'
  },
  {
    id: 'jewellery',
    name: 'Jewellery',
    image: 'https://images.unsplash.com/photo-1718871186381-6d59524a64f6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxqZXdlbHJ5JTIwZ29sZCUyMGFjY2Vzc29yaWVzfGVufDF8fHx8MTc3MDM5NDAzN3ww&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Elegant accessories'
  },
  {
    id: 'food',
    name: 'Food',
    image: 'https://images.unsplash.com/photo-1610636996379-4d184e2ef20a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmcmVzaCUyMGZvb2QlMjBncm9jZXJpZXN8ZW58MXx8fHwxNzcwMzk0MDM4fDA&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Fresh & organic'
  }
];

export function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const navigate = useNavigate();
  const banners = getBanners();

  const heroBanners = [
    banners.home || '/assets/images/banner-grains-pulses.png',
    'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    'https://images.unsplash.com/photo-1483985988355-763728e1935b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    'https://images.unsplash.com/photo-1607082349566-187342175e2f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080'
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBannerIndex((prev) => (prev + 1) % heroBanners.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [heroBanners.length]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const nextBanner = () => {
    setCurrentBannerIndex((prev) => (prev + 1) % heroBanners.length);
  };

  const prevBanner = () => {
    setCurrentBannerIndex((prev) => (prev - 1 + heroBanners.length) % heroBanners.length);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Search Bar */}
      <div className="bg-slate-50 py-3 px-3 sm:py-4 sm:px-4">
        <div className="max-w-xl mx-auto">
          <form onSubmit={handleSearch}>
            <div className="relative flex items-center bg-white rounded-full shadow-sm overflow-hidden">
              <input
                type="search"
                inputMode="search"
                autoComplete="off"
                placeholder="Search for products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 min-w-0 px-3 py-2 sm:px-4 sm:py-2.5 bg-transparent text-gray-900 placeholder-gray-500 text-sm sm:text-base outline-none border-0 focus:ring-0"
              />
              <button
                type="submit"
                className="m-1 flex-shrink-0 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-blue-700 active:scale-95 transition-all duration-200 text-white flex items-center justify-center touch-manipulation hover:bg-blue-600"
              >
                <Search className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Banner A - Hero Banner */}
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 py-3 sm:py-4 md:py-6 relative z-0">
        <div className="relative group rounded-xl sm:rounded-2xl overflow-hidden shadow-lg h-[160px] sm:h-[240px] md:h-[300px]">
          <div
            className="flex h-full w-full transition-transform duration-700 ease-in-out"
            style={{ transform: `translateX(-${currentBannerIndex * 100}%)` }}
          >
            {heroBanners.map((banner, index) => (
              <Link key={index} to={index === 0 ? "/category/food" : "/category/clothes"} className="w-full h-full flex-shrink-0 block active:opacity-90 transition-opacity">
                <img
                  src={banner}
                  alt={`Banner ${index + 1}`}
                  className="w-full h-full object-cover object-center"
                />
              </Link>
            ))}
          </div>

          <button
            onClick={prevBanner}
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/90 shadow flex items-center justify-center active:scale-95 transition-all touch-manipulation opacity-0 group-hover:opacity-100 backdrop-blur-sm z-10"
            aria-label="Previous"
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" />
          </button>
          <button
            onClick={nextBanner}
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/90 shadow flex items-center justify-center active:scale-95 transition-all touch-manipulation opacity-0 group-hover:opacity-100 backdrop-blur-sm z-10"
            aria-label="Next"
          >
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" />
          </button>

          {/* Indicators */}
          <div className="absolute bottom-2 sm:bottom-4 left-0 right-0 flex justify-center space-x-2 z-10">
            {heroBanners.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentBannerIndex(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${index === currentBannerIndex
                  ? 'w-6 sm:w-8 bg-yellow-400'
                  : 'bg-white/70 hover:bg-white'
                  }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Categories Section */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-6 sm:py-8 md:py-16">
        <div className="text-center mb-6 sm:mb-8 md:mb-12">
          <h2 className="text-xl sm:text-2xl md:text-4xl mb-2 sm:mb-3 md:mb-4">Shop by Category</h2>
          <p className="text-sm sm:text-base md:text-xl text-gray-600 px-2">
            Browse our wide selection of products
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2 sm:gap-4 md:gap-8">
          {categories.map((category) => (
            <Link
              key={category.id}
              to={`/category/${category.id}`}
              className="group relative h-28 sm:h-40 md:h-56 rounded-lg sm:rounded-xl md:rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform active:scale-[0.98] sm:hover:-translate-y-2 touch-manipulation"
            >
              <img
                src={category.image}
                alt={category.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-2 sm:p-4 md:p-6">
                <h3 className="text-sm sm:text-xl md:text-3xl text-white mb-0.5 sm:mb-1 md:mb-2 font-medium">
                  {category.name}
                </h3>
                <p className="text-white/90 text-xs sm:text-sm md:text-lg mb-1 sm:mb-2 md:mb-3 hidden sm:block">
                  {category.description}
                </p>
                <div className="flex items-center text-white group-hover:text-yellow-300 transition-colors">
                  <span className="text-xs sm:text-base md:text-lg">Shop Now</span>
                  <ChevronRight className="w-3 h-3 sm:w-5 sm:h-5 md:w-6 md:h-6 ml-1 sm:ml-2 group-hover:translate-x-2 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Our Services Section - Jewellery Software */}
      <div className="py-16 sm:py-24 bg-gradient-to-b from-white to-yellow-50 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 md:w-96 h-64 md:h-96 bg-yellow-300 rounded-full blur-3xl opacity-20 pointer-events-none transform translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-64 md:w-96 h-64 md:h-96 bg-yellow-400 rounded-full blur-3xl opacity-10 pointer-events-none transform -translate-x-1/2 translate-y-1/2"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-12 md:mb-16">
            <span className="inline-block py-1.5 px-4 rounded-full bg-yellow-100 text-yellow-800 text-sm md:text-base font-bold tracking-wide mb-5 border border-yellow-300/60 shadow-sm animate-pulse">
              🌟 India’s No.1 Jewellery Retail & Wholesale Software 🌟
            </span>
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-slate-800 to-yellow-800 mb-6 tracking-tight">
              Hover Technology Pvt Ltd
            </h2>

            <div className="mt-8 md:mt-10">
              <span className="inline-block py-2.5 px-6 md:px-8 rounded-full bg-gradient-to-r from-yellow-400 via-yellow-500 to-amber-500 text-white font-bold text-lg md:text-xl shadow-xl shadow-yellow-500/20 transform hover:scale-105 transition-transform cursor-default border border-white/20">
                🎁 Special Offer: <span className="text-white/90">1 Month Free Demo</span> (Limited Time)
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 lg:gap-8 items-stretch bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100/60 ring-1 ring-slate-900/5">
            <div className="col-span-1 lg:col-span-7 p-8 md:p-12 lg:p-16 flex flex-col justify-center">
              <h3 className="text-2xl md:text-3xl font-extrabold text-slate-800 mb-8 flex items-center gap-3">
                <span className="text-4xl filter drop-shadow-sm">✨</span>
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-500">
                  Comprehensive Features
                </span>
              </h3>

              <ul className="space-y-5 md:space-y-6">
                {[
                  'GST Billing & Tax Compliance',
                  'Stock (Manual + Barcode + RFID)',
                  'Karigar & Badhaki (Gold Loan) Management',
                  'Samridhi Scheme + Advance Management',
                  'Purchase, Sales & Customer Ledger',
                  'Bulk SMS + WhatsApp API',
                  'Cloud Backup & Staff Commission'
                ].map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-4 group cursor-default">
                    <div className="mt-1 flex-shrink-0 w-7 h-7 md:w-8 md:h-8 rounded-full bg-yellow-50 border border-yellow-200 text-yellow-600 flex items-center justify-center group-hover:bg-yellow-400 group-hover:text-white group-hover:border-transparent transition-all duration-300 shadow-sm">
                      <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                    </div>
                    <span className="text-slate-600 text-lg md:text-xl font-medium group-hover:text-slate-900 transition-colors duration-300 relative top-0.5">{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-12 pt-8 border-t-2 border-slate-50/80">
                <p className="text-center md:text-left font-bold text-xl md:text-2xl text-slate-800 mb-6 group cursor-default flex items-center justify-center md:justify-start gap-2">
                  👉 <span className="underline decoration-4 underline-offset-4 decoration-yellow-400 group-hover:text-slate-900 transition-colors">Best for Every Jewellery Shop Owner</span>
                </p>

              </div>
            </div>

            <div className="col-span-1 lg:col-span-5 relative group overflow-hidden bg-slate-900 flex flex-col justify-center min-h-[300px] md:min-h-[400px] lg:h-auto rounded-xl lg:rounded-none">
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/40 to-transparent mix-blend-multiply z-10 transition-opacity group-hover:opacity-20 duration-500 pointer-events-none"></div>

              <div className="w-full h-full relative z-20 shadow-2xl overflow-hidden aspect-video lg:aspect-auto">
                <iframe
                  className="w-full h-full border-0 absolute top-0 left-0 lg:relative"
                  src="https://www.youtube.com/embed/OKnNHZrRdDE?si=Wqpnt2JrH4mny5s6"
                  title="YouTube video player"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                ></iframe>
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 z-30 bg-gradient-to-t from-slate-900 via-slate-900/80 to-transparent pointer-events-none pt-24 hidden lg:block">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-xl bg-yellow-400/95 text-yellow-900 text-sm font-bold backdrop-blur-sm shadow-xl mb-3 border border-yellow-300/50">
                  <svg className="w-4 h-4 drop-shadow-sm" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                  Demo Video
                </div>
                <h4 className="text-xl md:text-2xl font-bold text-white mb-2 leading-tight drop-shadow-md">See It In Action</h4>
                <p className="text-slate-300 text-sm font-medium">Watch how our software transforms businesses.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Services - Business Growth Partner */}
      <div className="py-16 md:py-24 bg-slate-50 relative border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-extrabold text-slate-800 mb-6 flex flex-col md:flex-row items-center justify-center gap-3">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-500 to-yellow-700">Hover Technology</span>
            </h2>
            <h3 className="text-2xl md:text-3xl font-bold text-slate-600">Your Business Growth Partner</h3>

            <div className="mt-8 max-w-3xl mx-auto bg-white p-6 md:p-10 rounded-2xl shadow-lg border border-slate-100 text-center">
              <p className="text-lg md:text-xl text-slate-700 mb-4 leading-relaxed font-medium">
                Welcome to Hover Technology. <br className="hidden md:block" /> Are you looking to scale your business with advanced <span className="text-yellow-600 font-bold">Jewellery Software</span> or precision <span className="text-yellow-600 font-bold">Jewellery Tags</span>?
              </p>
              <p className="text-lg md:text-xl text-slate-700 mb-8 leading-relaxed">
                Do you need professional <span className="font-bold">Digital Branding</span>, targeted <span className="font-bold text-yellow-600">WhatsApp Marketing</span>, or a highly-optimized <span className="font-bold text-amber-500">Custom E-Commerce Application</span>?
              </p>
              <div className="inline-flex items-center gap-2 py-3 px-8 bg-yellow-50 text-yellow-800 rounded-full font-bold shadow-sm border border-yellow-200">
                <Settings className="w-5 h-5 text-yellow-600" />
                <span>We provide end-to-end premium solutions to accelerate your business growth.</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4 sm:gap-6">
            {[
              { icon: <Monitor className="w-8 h-8 text-slate-700" />, name: 'CCTV Camera Installation' },
              { icon: <MessageSquare className="w-8 h-8 text-blue-500" />, name: 'Bulk SMS / OTP / Jio-DLT' },
              { icon: <PlusSquare className="w-8 h-8 text-red-500" />, name: 'Medicine Billing Software' },
              { icon: <Coffee className="w-8 h-8 text-orange-500" />, name: 'Restaurant Billing Software' },
              { icon: <Briefcase className="w-8 h-8 text-yellow-600" />, name: 'Jewellery Wholesale Software' },
              { icon: <CreditCard className="w-8 h-8 text-green-600" />, name: 'Money Counting Machine' },
              { icon: <Printer className="w-8 h-8 text-slate-600" />, name: 'Barcode / Thermal Printer' },
              { icon: <FileText className="w-8 h-8 text-indigo-500" />, name: 'POS Roll / Ribbon / Labels' },
              { icon: <Search className="w-8 h-8 text-blue-400" />, name: 'Barcode Scanner / RFID Tags' },
              { icon: <Shield className="w-8 h-8 text-red-600" />, name: 'Quick Heal Antivirus Protection' },
              { icon: <TrendingUp className="w-8 h-8 text-purple-500" />, name: 'Digital Marketing Services' },
              { icon: <PlayCircle className="w-8 h-8 text-red-500" />, name: 'YouTube Promotion & Strategy' },
              { icon: <Smartphone className="w-8 h-8 text-sky-500" />, name: 'Custom Mobile Apps' },
              { icon: <Repeat className="w-8 h-8 text-yellow-500" />, name: 'Rupees to Gold Converter Tool' },
            ].map((srv, idx) => (
              <div key={idx} className="bg-white p-2 sm:p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-yellow-300 transition-all duration-300 group flex flex-col items-center gap-2 sm:gap-4 cursor-default transform hover:-translate-y-1">
                <div className="text-xl sm:text-3xl filter drop-shadow-sm group-hover:scale-110 transition-transform flex items-center justify-center p-2 sm:p-4 bg-slate-50 rounded-full group-hover:bg-yellow-50 border border-slate-100">
                  {srv.icon}
                </div>
                <h4 className="text-slate-800 font-semibold group-hover:text-yellow-600 transition-colors leading-tight mt-1 text-[10px] sm:text-base text-center">{srv.name}</h4>
              </div>
            ))}
          </div>

          <div className="mt-16 sm:mt-20 max-w-4xl mx-auto relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-[2rem] transform rotate-1 scale-105 group-hover:rotate-2 transition-transform duration-500 opacity-20"></div>
            <div className="relative bg-white border-2 border-yellow-400 rounded-[2rem] p-8 md:p-12 text-center shadow-2xl">
              <h3 className="text-3xl md:text-4xl font-extrabold text-slate-800 mb-4">Ready to Upgrade Your Operations?</h3>
              <p className="text-lg md:text-xl text-slate-600 mb-8 max-w-2xl mx-auto leading-relaxed">
                If your business requires any of our specialized services, please reach out. We guarantee <span className="font-bold text-slate-800">Competitive Rates</span> and <span className="font-bold text-yellow-600">Rapid Service Delivery</span>.
              </p>
              <a href="https://wa.me/917991163225" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-[#25D366] hover:bg-[#128C7E] text-white font-bold text-lg sm:text-xl rounded-full shadow-lg shadow-[#25D366]/40 transform hover:scale-105 transition-all duration-300 w-full sm:w-auto whitespace-nowrap">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
                </svg>
                <span>Connect on WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* About Us Section */}
      <div className="py-16 sm:py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div>
              <h3 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-6 leading-tight">We Are OverTech</h3>
              <p className="text-lg text-slate-600 mb-6 leading-relaxed">
                Founded with a passion for excellence, OverTech aims to revolutionize the shopping experience. We bridge the gap between premium quality and everyday affordability.
              </p>
              <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                Our curated selections from top global brands ensure that you have access to the finest products, right at your fingertips. Join millions of satisfied customers today.
              </p>
            </div>
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-tr from-yellow-400 to-amber-500 rounded-2xl transform rotate-3 scale-105 group-hover:rotate-6 transition-transform duration-500 opacity-30"></div>
              <img
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080"
                alt="Our Team"
                className="relative rounded-2xl shadow-xl object-cover w-full h-80 md:h-[400px] transform group-hover:-translate-y-2 transition-transform duration-500"
              />
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
