import React from 'react';
import { motion } from 'motion/react';
import { Compass, Sparkles, ShieldCheck, HeartHandshake } from 'lucide-react';

interface HeaderProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  hasActiveReport?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ currentPath, onNavigate, hasActiveReport }) => {
  return (
    <header className="sticky top-0 z-40 bg-[#F9F8F5]/90 backdrop-blur-md border-b border-[#E5E1D8] transition-all">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between">
        {/* Brand */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onNavigate('/')}
          className="flex items-center gap-3 text-left group cursor-pointer focus-visible:ring-2 focus-visible:ring-[#8D5B28] rounded-lg p-1"
          aria-label="Next-path ໜ້າຫຼັກ"
        >
          <div className="w-10 h-10 rounded-xl bg-[#2D4C3E] text-[#F9F8F5] flex items-center justify-center shadow-xs transition-transform group-hover:rotate-12 duration-300">
            <Compass className="w-5 h-5 text-[#E5E1D8]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-xl tracking-tight text-[#2D4C3E]">Next-path</span>
              <span className="text-xs text-[#8D5B28] font-medium hidden sm:inline">· ພື້ນທີ່ສຳຫຼວດຕົນເອງ</span>
            </div>
            <p className="text-xs text-[#2D4C3E]/70 line-clamp-1">ສຳລັບໄວໜຸ່ມລາວ (Lao Youth)</p>
          </div>
        </motion.button>

        {/* Navigation Actions */}
        <nav className="flex items-center gap-2 sm:gap-3" aria-label="ເມນູຫຼັກ">
          <button
            onClick={() => onNavigate('/')}
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors cursor-pointer ${
              currentPath === '/'
                ? 'font-semibold text-[#2D4C3E] bg-[#E5E1D8]/60'
                : 'text-[#2D4C3E]/80 hover:text-[#2D4C3E] hover:bg-[#E5E1D8]/30'
            }`}
          >
            ໜ້າຫຼັກ
          </button>

          {hasActiveReport && (
            <button
              onClick={() => onNavigate('/report')}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors cursor-pointer flex items-center gap-1.5 ${
                currentPath === '/report'
                  ? 'font-semibold text-[#2D4C3E] bg-[#E5E1D8]/60'
                  : 'text-[#2D4C3E]/80 hover:text-[#2D4C3E] hover:bg-[#E5E1D8]/30'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-[#8D5B28]" />
              <span>ຜົນສະທ້ອນ</span>
            </button>
          )}

          <button
            onClick={() => onNavigate('/feedback')}
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors cursor-pointer hidden md:flex items-center gap-1.5 ${
              currentPath === '/feedback'
                ? 'font-semibold text-[#2D4C3E] bg-[#E5E1D8]/60'
                : 'text-[#2D4C3E]/80 hover:text-[#2D4C3E] hover:bg-[#E5E1D8]/30'
            }`}
          >
            <HeartHandshake className="w-3.5 h-3.5 text-[#7A3E2D]" />
            <span>ຕິຊົມ</span>
          </button>

          <button
            onClick={() => onNavigate('/insights')}
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors cursor-pointer hidden sm:flex items-center gap-1.5 ${
              currentPath === '/insights'
                ? 'font-semibold text-[#2D4C3E] bg-[#E5E1D8]/60'
                : 'text-[#2D4C3E]/80 hover:text-[#2D4C3E] hover:bg-[#E5E1D8]/30'
            }`}
          >
            <span>ສະຖິຕິຫຼັງບ້ານ</span>
          </button>

          {currentPath !== '/assessment' && currentPath !== '/processing' && (
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => onNavigate('/introduction')}
              className="ml-1 sm:ml-2 px-4 py-2 rounded-xl text-sm font-medium bg-[#2D4C3E] text-[#F9F8F5] hover:bg-[#233c31] transition-all shadow-xs cursor-pointer focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#2D4C3E]"
            >
              ເລີ່ມສຳຫຼວດ
            </motion.button>
          )}
        </nav>
      </div>
    </header>
  );
};
