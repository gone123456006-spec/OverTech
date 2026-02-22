import { MapPin } from 'lucide-react';

const SHOP_MAPS_URL = 'https://www.google.com/maps?q=27.5942672,91.869274';

export function Footer() {
    return (
        <footer className="bg-[#0B1F4D] py-4 sm:py-6 mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
                <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-6">
                    <p className="text-sm md:text-base text-white/70 font-medium">
                        © {new Date().getFullYear()} Kiran Rasan. All rights reserved.
                    </p>
                    <a
                        href={SHOP_MAPS_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-sm md:text-base text-blue-200 hover:text-white font-medium underline transition-colors"
                    >
                        <MapPin className="w-4 h-4" />
                        Store Location
                    </a>
                </div>
            </div>
        </footer>
    );
}
