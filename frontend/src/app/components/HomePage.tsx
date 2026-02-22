import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ChevronRight, ChevronLeft } from 'lucide-react';
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
  const navigate = useNavigate();
  const banners = getBanners();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
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
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 py-3 sm:py-4 md:py-6">
        <div className="relative group rounded-xl sm:rounded-2xl overflow-hidden shadow-lg">
          <Link to="/category/food" className="block active:opacity-90 transition-opacity">
            <img
              src={banners.home || '/assets/images/banner-grains-pulses.png'}
              alt="Banner"
              className="w-full h-auto object-cover max-h-[160px] sm:max-h-[240px] md:max-h-[300px] object-center"
            />
          </Link>
          <button
            className="absolute left-1 sm:left-2 top-1/2 -translate-y-1/2 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/90 shadow flex items-center justify-center active:scale-95 transition-all touch-manipulation md:opacity-0 md:group-hover:opacity-100"
            aria-label="Previous"
          >
            <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-700" />
          </button>
          <button
            className="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/90 shadow flex items-center justify-center active:scale-95 transition-all touch-manipulation md:opacity-0 md:group-hover:opacity-100"
            aria-label="Next"
          >
            <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-700" />
          </button>
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
                <div className="flex items-center text-white group-hover:text-blue-200 transition-colors">
                  <span className="text-xs sm:text-base md:text-lg">Shop Now</span>
                  <ChevronRight className="w-3 h-3 sm:w-5 sm:h-5 md:w-6 md:h-6 ml-1 sm:ml-2 group-hover:translate-x-2 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-slate-50 py-6 sm:py-8 md:py-16">
        <div className="max-w-7xl mx-auto px-3 sm:px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8 text-center">
            <div className="p-4 md:p-6">
              <div className="w-14 h-14 md:w-16 md:h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                <svg className="w-7 h-7 md:w-8 md:h-8 text-yellow-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg md:text-xl mb-2">Quality Products</h3>
              <p className="text-sm md:text-base text-gray-600">Handpicked items with guaranteed quality</p>
            </div>

            <div className="p-4 md:p-6">
              <div className="w-14 h-14 md:w-16 md:h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                <svg className="w-7 h-7 md:w-8 md:h-8 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg md:text-xl mb-2">Best Prices</h3>
              <p className="text-sm md:text-base text-gray-600">Competitive pricing on all products</p>
            </div>

            <div className="p-4 md:p-6">
              <div className="w-14 h-14 md:w-16 md:h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                <svg className="w-7 h-7 md:w-8 md:h-8 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg md:text-xl mb-2">Fast Delivery</h3>
              <p className="text-sm md:text-base text-gray-600">Quick and reliable shipping</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
