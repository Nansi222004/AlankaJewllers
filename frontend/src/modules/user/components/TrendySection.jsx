import { Link } from 'react-router-dom';
import trendingHeritage from '@assets/trending_heritage.png';
import trendingModern from '@assets/trending_modern.png';

{/* Trendy Products / Editorial Split Section */}
<section className="py-24 bg-white overflow-hidden">
    <div className="container mx-auto px-4 md:px-6">

        {/* Item 1: Image Left, Text Right */}
        <div className="flex flex-col md:flex-row items-center gap-12 md:gap-24 mb-24">
            {/* Image Side */}
            <div className="w-full md:w-1/2 relative group">
                <div className="absolute top-4 left-4 w-full h-full bg-[#F0DDE3] rounded-[2rem] -z-10 group-hover:rotate-2 transition-transform duration-500"></div>
                <div className="relative rounded-[2rem] overflow-hidden shadow-2xl aspect-[4/5]">
                    <img src={trendingHeritage} alt="Trendy Necklace" className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700" />
                </div>
            </div>
            {/* Text Side */}
            <div className="w-full md:w-1/2 text-center md:text-left space-y-6">
                <span className="text-[#9A6676] text-sm font-bold uppercase tracking-[0.2em]">Trending Now</span>
                <h2 className="text-4xl md:text-5xl font-serif italic text-[#702F46] leading-tight">
                    Elevate your everyday look with <span className="not-italic font-display border-b-2 border-[#E8BFCC]">Timeless Elegance</span>.
                </h2>
                <p className="text-gray-600 font-serif italic text-lg leading-relaxed">
                    Our latest collection brings you designs that blend heritage with contemporary chic. Perfect for the modern woman who values authenticity and grace.
                </p>
                <div className="pt-4 space-y-3">
                    <div className="flex items-center gap-3 text-[#702F46] justify-center md:justify-start">
                        <div className="w-6 h-6 rounded-full bg-[#F0DDE3] flex items-center justify-center text-xs">✓</div>
                        <span className="font-medium tracking-wide">Handcrafted with precision</span>
                    </div>
                    <div className="flex items-center gap-3 text-[#702F46] justify-center md:justify-start">
                        <div className="w-6 h-6 rounded-full bg-[#F0DDE3] flex items-center justify-center text-xs">✓</div>
                        <span className="font-medium tracking-wide">Ethically sourced materials</span>
                    </div>
                </div>
                <Link to="/products" className="inline-block mt-8 bg-[#702F46] text-white px-8 py-4 rounded-full font-bold uppercase tracking-widest hover:bg-[#754655] hover:scale-105 transition-all duration-300 shadow-lg">
                    Shop Collection
                </Link>
            </div>
        </div>

        {/* Item 2: Text Left, Image Right */}
        <div className="flex flex-col md:flex-row-reverse items-center gap-12 md:gap-24">
            {/* Image Side */}
            <div className="w-full md:w-1/2 relative group">
                <div className="absolute top-4 right-4 w-full h-full bg-[#E8BFCC] rounded-[2rem] -z-10 group-hover:-rotate-2 transition-transform duration-500"></div>
                <div className="relative rounded-[2rem] overflow-hidden shadow-2xl aspect-[4/5]">
                    <img src={trendingModern} alt="Designer Earrings" className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700" />
                </div>
            </div>
            {/* Text Side */}
            <div className="w-full md:w-1/2 text-center md:text-left space-y-6">
                <span className="text-[#9A6676] text-sm font-bold uppercase tracking-[0.2em]">Just Arrived</span>
                <h2 className="text-4xl md:text-5xl font-serif italic text-[#702F46] leading-tight">
                    We are committed to <span className="not-italic font-display border-b-2 border-[#E8BFCC]">Empowering Your Style</span>.
                </h2>
                <p className="text-gray-600 font-serif italic text-lg leading-relaxed">
                    Discover jewelry that tells your story. From bold statements to subtle whispers, find pieces that resonate with your unique journey and celebrate your moments.
                </p>
                <div className="pt-4 space-y-3">
                    <div className="flex items-center gap-3 text-[#702F46] justify-center md:justify-start">
                        <div className="w-6 h-6 rounded-full bg-[#F0DDE3] flex items-center justify-center text-xs">✓</div>
                        <span className="font-medium tracking-wide">Unique, one-of-a-kind designs</span>
                    </div>
                    <div className="flex items-center gap-3 text-[#702F46] justify-center md:justify-start">
                        <div className="w-6 h-6 rounded-full bg-[#F0DDE3] flex items-center justify-center text-xs">✓</div>
                        <span className="font-medium tracking-wide">Lifetime plating guarantee</span>
                    </div>
                </div>
                <Link to="/products" className="inline-block mt-8 px-8 py-4 rounded-full border-2 border-[#702F46] text-[#702F46] font-bold uppercase tracking-widest hover:bg-[#702F46] hover:text-white transition-all duration-300 shadow-lg">
                    Discover More
                </Link>
            </div>
        </div>

    </div>
</section>

