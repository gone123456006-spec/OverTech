import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, ChevronRight, ChevronLeft, Settings, Monitor, MessageSquare, PlusSquare, Coffee, Briefcase, CreditCard, Printer, FileText, Shield, TrendingUp, PlayCircle, Smartphone, Repeat, Star, ShoppingCart } from 'lucide-react';
import { getBanners, addToCart } from '../utils/storage';
import { products } from '../data/products';
import { toast } from 'sonner';
import { OrderConfirmedModal, type OrderConfirmedState } from './OrderConfirmedModal';
import { SpecialOfferCard } from './SpecialOfferCard';
import { SpecialOfferTag } from './SpecialOfferTag';
import {
  SPECIAL_OFFERS_CACHE_KEY,
  SPECIAL_OFFERS_POLL_MS,
  SPECIAL_OFFERS_UPDATED_EVENT,
  fetchSpecialOffers,
  getCachedSpecialOffers,
  sortActiveOffers,
  type SpecialOffer,
} from '../utils/specialOffers';

const categories = [
  {
    id: 'tech',
    name: 'Tech',
    image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    description: 'Latest gadgets & devices'
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
  const location = useLocation();
  const banners = getBanners();

  const orderConfirmed = (location.state as { orderConfirmed?: OrderConfirmedState } | null)?.orderConfirmed;
  const [showOrderConfirmed, setShowOrderConfirmed] = useState(!!orderConfirmed);
  const [offerCards, setOfferCards] = useState<SpecialOffer[]>(() =>
    sortActiveOffers(getCachedSpecialOffers()).filter((o) => o.kind === 'card')
  );
  const [offerTags, setOfferTags] = useState<SpecialOffer[]>(() =>
    sortActiveOffers(getCachedSpecialOffers()).filter((o) => o.kind === 'tag')
  );

  const loadSpecialOffers = useCallback(() => {
    const applyOffers = (offers: SpecialOffer[]) => {
      const active = sortActiveOffers(offers);
      setOfferCards(active.filter((o) => o.kind === 'card'));
      setOfferTags(active.filter((o) => o.kind === 'tag'));
    };

    fetchSpecialOffers()
      .then((data) => applyOffers(data.offers))
      .catch(() => applyOffers(getCachedSpecialOffers()));
  }, []);

  useEffect(() => {
    if (orderConfirmed) {
      setShowOrderConfirmed(true);
    }
  }, [orderConfirmed?.orderId]);

  useEffect(() => {
    loadSpecialOffers();
    const interval = window.setInterval(loadSpecialOffers, SPECIAL_OFFERS_POLL_MS);
    const onUpdated = () => loadSpecialOffers();
    const onStorage = (e: StorageEvent) => {
      if (e.key === SPECIAL_OFFERS_CACHE_KEY) loadSpecialOffers();
    };

    window.addEventListener(SPECIAL_OFFERS_UPDATED_EVENT, onUpdated);
    window.addEventListener('storage', onStorage);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener(SPECIAL_OFFERS_UPDATED_EVENT, onUpdated);
      window.removeEventListener('storage', onStorage);
    };
  }, [loadSpecialOffers]);

  const techProducts = products.filter(p => p.category === 'tech').slice(0, 8);

  const handleAddToCart = (e: React.MouseEvent, productId: string, productName: string) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(productId, 1);
    toast.success(`${productName} added to cart!`);
    window.dispatchEvent(new Event('cartUpdated'));
  };

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
            <div className="relative flex items-center bg-white border border-slate-200 rounded-lg overflow-hidden">
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
                className="m-1 flex-shrink-0 w-8 h-8 sm:w-9 sm:h-9 rounded-full btn-icon touch-manipulation"
              >
                <Search className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Banner A - Hero Banner */}
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 py-3 sm:py-4 md:py-6 relative z-0">
        <div className="relative rounded-lg overflow-hidden border border-slate-200 h-[160px] sm:h-[240px] md:h-[300px]">
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
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center z-10"
            aria-label="Previous"
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" />
          </button>
          <button
            onClick={nextBanner}
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center z-10"
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
                className={`h-2 rounded-full transition-colors ${index === currentBannerIndex
                  ? 'w-6 sm:w-8 bg-teal-900'
                  : 'w-2 bg-white/80'
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
              className="relative h-28 sm:h-40 md:h-56 rounded-lg overflow-hidden border border-slate-200"
            >
              <img
                src={category.image}
                alt={category.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/50 flex flex-col justify-end p-2 sm:p-4 md:p-6">
                <h3 className="text-sm sm:text-xl md:text-2xl text-white mb-0.5 sm:mb-1 font-medium">
                  {category.name}
                </h3>
                <p className="text-white/90 text-xs sm:text-sm mb-1 sm:mb-2 hidden sm:block">
                  {category.description}
                </p>
                <div className="flex items-center text-white text-xs sm:text-sm">
                  <span>Shop Now</span>
                  <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 ml-1" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Featured Tech Section */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-8 sm:py-12 md:py-16 border-t border-slate-200">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-slate-900 mb-2">
            Featured Tech
          </h2>
          <p className="text-sm sm:text-base text-slate-600">Browse our latest technology products</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {techProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-lg overflow-hidden border border-slate-200 flex flex-col"
            >
              <Link to={`/product/${product.id}`} className="block relative aspect-[4/3] overflow-hidden bg-slate-50">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                
                <div className="absolute top-2 left-2 flex flex-col gap-1">
                  {product.stock < 10 && (
                    <span className="px-2 py-0.5 text-[10px] font-medium bg-amber-600 text-white rounded">
                      Low Stock
                    </span>
                  )}
                  {product.rating > 4.5 && (
                    <span className="px-2 py-0.5 text-[10px] font-medium bg-slate-700 text-white rounded">
                      Best Seller
                    </span>
                  )}
                </div>
              </Link>

              <div className="p-3 sm:p-4 flex-1 flex flex-col">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] font-medium text-slate-500 uppercase">
                    Technology
                  </span>
                  <div className="flex items-center gap-1 text-slate-500">
                    <Star className="w-3 h-3 fill-slate-400 stroke-slate-400" />
                    <span className="text-xs text-slate-600">{product.rating}</span>
                  </div>
                </div>

                <Link to={`/product/${product.id}`} className="block mb-3">
                  <h3 className="text-sm sm:text-base font-medium text-slate-900 line-clamp-2 leading-snug">
                    {product.name}
                  </h3>
                </Link>

                <div className="mt-auto pt-2 flex items-center justify-between border-t border-slate-100">
                  <div className="flex flex-col">
                    <span className="text-base sm:text-lg font-semibold text-slate-900">
                      ₹{product.price.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Incl. all taxes
                    </span>
                  </div>
                  
                  <button
                    onClick={(e) => handleAddToCart(e, product.id, product.name)}
                    className="w-10 h-10 btn-icon"
                    aria-label="Add to cart"
                  >
                    <ShoppingCart className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 sm:mt-5 flex justify-start">
          <Link to="/category/tech" className="btn-outline-xs">
            Explore All <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Our Services Section - Jewellery Software */}
      <div className="py-16 sm:py-24 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl font-semibold text-slate-900 mb-6">
              Hover Technology Pvt Ltd
            </h2>

            <div className="mt-6 md:mt-8">
              <span className="inline-block py-2 px-6 rounded-full btn-primary text-base md:text-lg">
                Special Offer: 1 Month Free Demo (Limited Time)
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch bg-white rounded-lg border border-slate-200 overflow-hidden">
            <div className="col-span-1 lg:col-span-7 p-8 md:p-12 flex flex-col justify-center">
              <h3 className="text-2xl md:text-3xl font-semibold text-slate-800 mb-8">
                Comprehensive Features
              </h3>

              <ul className="space-y-4 md:space-y-5">
                {[
                  'GST Billing & Tax Compliance',
                  'Stock (Manual + Barcode + RFID)',
                  'Karigar & Badhaki (Gold Loan) Management',
                  'Samridhi Scheme + Advance Management',
                  'Purchase, Sales & Customer Ledger',
                  'Bulk SMS + WhatsApp API',
                  'Cloud Backup & Staff Commission'
                ].map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <div className="mt-0.5 flex-shrink-0 w-6 h-6 rounded-full bg-slate-100 border border-slate-200 text-slate-600 flex items-center justify-center">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                    </div>
                    <span className="text-slate-600 text-base md:text-lg">{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-10 pt-6 border-t border-slate-100">
                <p className="text-center md:text-left font-medium text-lg md:text-xl text-slate-800">
                  Best for Every Jewellery Shop Owner
                </p>
              </div>
            </div>

            <div className="col-span-1 lg:col-span-5 bg-teal-950 flex flex-col justify-center min-h-[300px] md:min-h-[400px]">
              <div className="w-full h-full overflow-hidden aspect-video lg:aspect-auto">
                <iframe
                  className="w-full h-full border-0"
                  src="https://www.youtube.com/embed/OKnNHZrRdDE?si=Wqpnt2JrH4mny5s6"
                  title="YouTube video player"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                ></iframe>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Business Growth Partner Banner */}
      <section className="border-t border-slate-200">
        <div className="bg-teal-950 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14 text-center">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-3">
              Hover Technology
            </h2>
            <p className="text-base sm:text-lg md:text-2xl text-teal-100/90 font-medium">
              Your Business Growth Partner
            </p>
          </div>
        </div>

        <div className="bg-slate-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14 text-center">
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

            <div className="mt-8 md:mt-10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white border border-slate-200 rounded-2xl px-4 py-4 md:px-6 md:py-5 text-left shadow-sm">
              <div className="flex items-start sm:items-center gap-3 text-sm md:text-base text-slate-700">
                <div className="w-9 h-9 rounded-full bg-teal-50 border border-teal-100 flex items-center justify-center flex-shrink-0">
                  <Settings className="w-4 h-4 text-teal-900" />
                </div>
                <span>We provide end-to-end solutions to accelerate your business growth.</span>
              </div>
              <a
                href="https://wa.me/917991163225"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary-sm shrink-0 self-start sm:self-center px-5"
              >
                Chat on WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>

      <div className="py-12 md:py-16 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-4 gap-3 sm:gap-4">
            {[
              { icon: <Monitor className="w-7 h-7 text-slate-600" />, name: 'CCTV Camera Installation' },
              { icon: <MessageSquare className="w-7 h-7 text-slate-600" />, name: 'Bulk SMS / OTP / Jio-DLT' },
              { icon: <PlusSquare className="w-7 h-7 text-slate-600" />, name: 'Medicine Billing Software' },
              { icon: <Coffee className="w-7 h-7 text-slate-600" />, name: 'Restaurant Billing Software' },
              { icon: <Briefcase className="w-7 h-7 text-slate-600" />, name: 'Jewellery Wholesale Software' },
              { icon: <CreditCard className="w-7 h-7 text-slate-600" />, name: 'Money Counting Machine' },
              { icon: <Printer className="w-7 h-7 text-slate-600" />, name: 'Barcode / Thermal Printer' },
              { icon: <FileText className="w-7 h-7 text-slate-600" />, name: 'POS Roll / Ribbon / Labels' },
              { icon: <Search className="w-7 h-7 text-slate-600" />, name: 'Barcode Scanner / RFID Tags' },
              { icon: <Shield className="w-7 h-7 text-slate-600" />, name: 'Quick Heal Antivirus Protection' },
              { icon: <TrendingUp className="w-7 h-7 text-slate-600" />, name: 'Digital Marketing Services' },
              { icon: <PlayCircle className="w-7 h-7 text-slate-600" />, name: 'YouTube Promotion & Strategy' },
              { icon: <Smartphone className="w-7 h-7 text-slate-600" />, name: 'Custom Mobile Apps' },
              { icon: <Repeat className="w-7 h-7 text-slate-600" />, name: 'Rupees to Gold Converter Tool' },
            ].map((srv, idx) => (
              <div key={idx} className="bg-white p-2 sm:p-4 rounded-lg border border-slate-200 flex flex-col items-center gap-2 sm:gap-3">
                <div className="flex items-center justify-center p-2 sm:p-3 bg-slate-50 rounded-md border border-slate-100">
                  {srv.icon}
                </div>
                <h4 className="text-slate-700 font-medium leading-tight text-[10px] sm:text-sm text-center">{srv.name}</h4>
              </div>
            ))}
          </div>

          {/* Special Offers Section */}
          <div className="mt-16 sm:mt-24 mb-16 sm:mb-20">
            <div className="text-center mb-8 sm:mb-10">
              <h3 className="text-2xl sm:text-3xl font-semibold text-slate-900">Special Offers</h3>
              <p className="text-sm sm:text-base text-slate-600 mt-2">Quality services at competitive prices</p>
            </div>

            <div className="flex flex-col gap-10">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
                {offerCards.map((item, index) => (
                  <SpecialOfferCard key={item.id} offer={item} index={index} />
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 max-w-5xl mx-auto w-full">
                {offerTags.map((tag) => (
                  <SpecialOfferTag key={tag.id} offer={tag} />
                ))}
              </div>
            </div>
          </div>

          <div className="mt-16 sm:mt-20 max-w-4xl mx-auto">
            <div className="bg-white border border-slate-200 rounded-lg p-8 md:p-12 text-center">
              <h3 className="text-2xl md:text-3xl font-semibold text-slate-800 mb-4">Ready to Upgrade Your Operations?</h3>
              <p className="text-base md:text-lg text-slate-600 mb-8 max-w-2xl mx-auto leading-relaxed">
                If your business requires any of our specialized services, please reach out. We guarantee competitive rates and rapid service delivery.
              </p>
              <a href="https://wa.me/917991163225" target="_blank" rel="noopener noreferrer" className="btn-primary gap-3 px-8 py-3 text-base sm:text-lg w-full sm:w-auto">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
                </svg>
                <span>Connect on WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* About Us & Contact Section */}
      <div className="py-16 sm:py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center mb-16">
            <div>
              <h3 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-6 leading-tight">We Are OverTech</h3>
              <p className="text-lg text-slate-600 mb-6 leading-relaxed">
                Founded with a passion for excellence, OverTech aims to revolutionize the shopping experience. We bridge the gap between premium quality and everyday affordability.
              </p>
              <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                Our curated selections from top global brands ensure that you have access to the finest products, right at your fingertips. Join millions of satisfied customers today.
              </p>
            </div>
            <div className="flex justify-center lg:justify-end">
              <div className="w-64 h-64 sm:w-80 sm:h-80 md:w-[400px] md:h-[400px] rounded-lg overflow-hidden border border-slate-200">
                  <img
                    src="/assets/images/iamgeeee11.jpeg"
                    alt="Director"
                    className="w-full h-full object-cover object-center"
                  />
              </div>
            </div>
          </div>

          {/* Contact & Address Information (Matching Image) */}
          <div className="mt-20 pt-16 border-t border-slate-100 flex flex-col items-center">
            <div className="text-center mb-8 w-full px-4">
              <h3 className="text-xl sm:text-2xl font-semibold text-slate-900 mb-4">
                Mob- 9304645986 | 7739536669 | 62002 58895
              </h3>
              <p className="text-sm sm:text-lg mt-4 text-slate-700 flex flex-col sm:flex-row items-center justify-center gap-2">
                <span>Website: hoverteck.com</span>
                <span className="hidden sm:inline mx-2">|</span>
                <span>Email: hovertechnologymuz@gmail.com</span>
              </p>
            </div>

            <div className="w-full bg-teal-950 py-3 sm:py-4 px-4 mb-8">
              <p className="text-white text-center text-sm sm:text-lg font-medium">
                Address : Kanhauli bela muzaffarpur bihar-842001
              </p>
            </div>

            <div className="flex items-center gap-4 sm:gap-6 mt-4">
              <a href="#" className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-teal-900 flex items-center justify-center text-white">
                <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
              </a>
              <a href="#" className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-teal-900 flex items-center justify-center text-white">
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.441 1.441 1.441c.795 0 1.439-.645 1.439-1.441s-.644-1.44-1.439-1.44z" /></svg>
              </a>
              <a href="#" className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-teal-900 flex items-center justify-center text-white">
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.84 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" /></svg>
              </a>
              <a href="https://wa.me/917991163225" target="_blank" rel="noopener noreferrer" className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#25D366] flex items-center justify-center text-white">
                <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" /></svg>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Floating WhatsApp Button */}
      <a
        href="https://wa.me/917991163225"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-24 left-4 z-50 flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 bg-[#25D366] rounded-full hover:bg-[#128C7E] shadow-md"
        aria-label="Chat on WhatsApp"
      >
        <svg
          className="w-5 h-5 sm:w-6 sm:h-6 text-white"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
        </svg>
      </a>

      <OrderConfirmedModal
        isOpen={showOrderConfirmed && !!orderConfirmed}
        orderId={orderConfirmed?.orderId || ''}
        contactMobile={orderConfirmed?.contactMobile || ''}
        onViewOrder={() => {
          if (orderConfirmed?.orderId) {
            setShowOrderConfirmed(false);
            navigate(`/order-confirmation/${orderConfirmed.orderId}`, { replace: true });
          }
        }}
        onContinueShopping={() => {
          setShowOrderConfirmed(false);
          navigate('/', { replace: true, state: null });
        }}
      />
    </div>
  );
}
