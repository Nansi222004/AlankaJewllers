import React from 'react';
import AlankarLogo from '@/assets/logo-emblem.webp';

const Loader = ({ fullPage = true }) => {
  return (
    <div
      className={`${fullPage ? 'fixed inset-0 z-[9999] bg-[#FAF7F0]' : 'w-full py-14'
        } flex flex-col items-center justify-center transition-opacity duration-300 select-none animate-[fadeIn_0.25s_ease-out]`}
      role="status"
      aria-label="Loading Alanka Jewellers"
    >
      <div className="flex flex-col items-center justify-center gap-4">
        {/* Crisp Central Logo - Moderate Proportional Size with NO scaling, spinning or glow */}
        <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 flex items-center justify-center">
          <img
            src={AlankarLogo}
            alt="Alanka Jewellers"
            className="max-w-full max-h-full object-contain"
          />
        </div>

        {/* Brand Text */}
        <div className="flex flex-col items-center gap-2">
          <span className="font-serif text-[#171717] font-semibold text-xs tracking-[0.3em] uppercase">
            Alanka Jewellers
          </span>
          {/* Subtle minimal champagne accent line */}
          <div className="w-10 h-[1.5px] bg-[#E5CC85] rounded-full opacity-60" />
        </div>
      </div>
    </div>
  );
};

export default Loader;
