import React from 'react';
import { Compass, ShieldCheck, Heart } from 'lucide-react';

interface FooterProps {
  onNavigate: (path: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="mt-20 border-t border-[#E5E1D8] bg-[#F4EFEA]/60 py-12 text-[#2D4C3E]/80">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-8 border-b border-[#E5E1D8]/60">
          {/* Brand Philosophy */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#2D4C3E] text-[#F9F8F5] flex items-center justify-center">
                <Compass className="w-4 h-4 text-[#E5E1D8]" />
              </div>
              <span className="font-semibold text-lg text-[#2D4C3E]">Next-path</span>
            </div>
            <p className="text-sm leading-relaxed text-[#2D4C3E]/75">
              ພື້ນທີ່ປອດໄພສຳລັບໄວໜຸ່ມລາວ ອາຍຸ 15 ປີຂຶ້ນໄປ ໃນການສຳຫຼວດຄວາມສົນໃຈ, ເຂົ້າໃຈຄຸນຄ່າໃນຕົນເອງ ແລະ ທົດລອງເສັ້ນທາງຊີວິດຢ່າງບໍ່ກົດດັນ.
            </p>
          </div>

          {/* Core Principles */}
          <div className="space-y-3 text-sm">
            <h4 className="font-semibold text-[#2D4C3E] flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#8D5B28]" />
              <span>ຄຳໝັ້ນສັນຍາຕໍ່ຜູ້ໃຊ້</span>
            </h4>
            <ul className="space-y-2 text-[#2D4C3E]/75">
              <li>· ບໍ່ແມ່ນບົດສອບເສັງ ແລະ ບໍ່ມີຄຳຕອບຖືກ ຫຼື ຜິດ</li>
              <li>· ບໍ່ຕັດສິນ ຫຼື ບອກວ່າເຈົ້າຕ້ອງເປັນຫຍັງ</li>
              <li>· ບໍ່ຂໍຊື່, ອີເມວ ຫຼື ຂໍ້ມູນລະບຸຕົວຕົນ</li>
              <li>· ຄຳຕອບຖືກເກັບໄວ້ສະເພາະໃນອຸປະກອນຂອງທ່ານ</li>
            </ul>
          </div>

          {/* Quick Links & Feedback */}
          <div className="space-y-3 text-sm">
            <h4 className="font-semibold text-[#2D4C3E]">ເມນູທີ່ເປັນປະໂຫຍດ</h4>
            <div className="flex flex-col space-y-2 text-[#2D4C3E]/75">
              <button
                onClick={() => onNavigate('/')}
                className="text-left hover:text-[#2D4C3E] transition-colors cursor-pointer"
              >
                ໜ້າຫຼັກ (Home)
              </button>
              <button
                onClick={() => onNavigate('/introduction')}
                className="text-left hover:text-[#2D4C3E] transition-colors cursor-pointer"
              >
                ເລີ່ມຕົ້ນສຳຫຼວດຕົນເອງ (Start Exploration)
              </button>
              <button
                onClick={() => onNavigate('/feedback')}
                className="text-left hover:text-[#2D4C3E] transition-colors cursor-pointer"
              >
                ສົ່ງຄຳຕິຊົມ ແລະ ຄວາມຄິດເຫັນ (Feedback)
              </button>
              <button
                onClick={() => onNavigate('/insights')}
                className="text-left hover:text-[#2D4C3E] transition-colors cursor-pointer"
              >
                ສະຖິຕິຫຼັງບ້ານ SQLite (Backend Insights)
              </button>
            </div>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-[#2D4C3E]/60 gap-3">
          <p>Next-path · ສ້າງຂຶ້ນດ້ວຍຄວາມເຂົ້າໃຈ ແລະ ຄວາມຮັກເພື່ອໄວໜຸ່ມລາວ</p>
          <div className="flex items-center gap-1">
            <span>ພື້ນທີ່ສະທ້ອນຄວາມຄິດ</span>
            <Heart className="w-3 h-3 text-[#7A3E2D] inline fill-current" />
            <span>ໂດຍບໍ່ມີການຕັດສິນ</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
