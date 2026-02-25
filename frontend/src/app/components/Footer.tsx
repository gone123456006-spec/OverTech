

export function Footer() {
    return (
        <footer className="bg-white py-6 mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
                <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-6">
                    <p className="text-sm md:text-base text-slate-600 font-medium">
                        © {new Date().getFullYear()} HoverTeck. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}
