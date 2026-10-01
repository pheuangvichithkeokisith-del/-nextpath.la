import React, { useState } from 'react';
import { FeedbackData } from '../types/questionnaire';
import {
  Heart,
  Star,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  MessageSquare,
} from 'lucide-react';

interface FeedbackPageProps {
  sessionId: string;
  hasActiveReport: boolean;
  onSubmitFeedback: (data: FeedbackData) => void;
  onNavigateHome: () => void;
  onNavigateReport: () => void;
}

const RATING_DESCRIPTIONS = [
  'ຍັງບໍ່ຄ່ອຍກົງກັບຂ້ອຍປານໃດ',
  'ກົງບາງສ່ວນ ແຕ່ຍັງມີບາງຈຸດທີ່ບໍ່ແມ່ນ',
  'ກົງປານກາງ ຊ່ວຍໃຫ້ເຫັນບາງມຸມມອງ',
  'ກົງກັບຂ້ອຍຫຼາຍ ສອດຄ່ອງກັບຄວາມຮູ້ສຶກ',
  'ກົງຫຼາຍທີ່ສຸດ! ເຮັດໃຫ້ເຂົ້າໃຈຕົນເອງຊັດເຈນຂຶ້ນ',
];

export const FeedbackPage: React.FC<FeedbackPageProps> = ({
  sessionId,
  hasActiveReport,
  onSubmitFeedback,
  onNavigateHome,
  onNavigateReport,
}) => {
  const [rating, setRating] = useState<number>(4);
  const [feltComfortable, setFeltComfortable] = useState<boolean>(true);
  const [comments, setComments] = useState<string>('');
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // If user visits feedback with no session / report
  if (!sessionId || !hasActiveReport) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-[#FDF3F0] text-[#7A3E2D] flex items-center justify-center mx-auto">
          <AlertCircle className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-[#2D4C3E]">ຍັງບໍ່ພົບເຊດຊັນການສຳຫຼວດ</h1>
          <p className="text-sm text-[#2D4C3E]/75 leading-relaxed">
            ທ່ານຈຳເປັນຕ້ອງຕອບແບບສຳຫຼວດເພື່ອເບິ່ງຜົນສະທ້ອນກ່ອນ ຈຶ່ງຈະສາມາດສົ່ງຄຳຕິຊົມກ່ຽວກັບຜົນໄດ້.
          </p>
        </div>
        <button
          onClick={onNavigateHome}
          className="px-8 py-3.5 rounded-2xl bg-[#2D4C3E] text-[#F9F8F5] text-sm font-semibold hover:bg-[#233c31] transition-all shadow-md inline-flex items-center gap-2 cursor-pointer"
        >
          <span>ກັບຄືນໜ້າຫຼັກ</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      onSubmitFeedback({
        sessionId,
        accuracyRating: rating,
        feltComfortable,
        comments,
        submittedAt: new Date().toISOString(),
      });
      setIsSubmitted(true);
    } catch {
      setErrorMessage('ເກີດຂໍ້ຂັດຂ້ອງໃນການບັນທຶກຄຳຕິຊົມ ກະລຸນາລອງໃໝ່');
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      {/* Back button */}
      <button
        onClick={onNavigateReport}
        className="inline-flex items-center gap-2 text-sm text-[#2D4C3E]/70 hover:text-[#2D4C3E] mb-6 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>ກັບຄືນໜ້າຜົນສະທ້ອນ (Report)</span>
      </button>

      {isSubmitted ? (
        /* Success State */
        <div className="bg-[#FFFFFF] border border-[#E5E1D8] rounded-3xl p-8 sm:p-10 shadow-xs text-center space-y-6 animate-in fade-in duration-300">
          <div className="w-16 h-16 rounded-2xl bg-[#EBF2EE] text-[#2D4C3E] flex items-center justify-center mx-auto shadow-xs">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-[#2D4C3E]">
              ຂອບໃຈຫຼາຍໆ ສຳລັບຄຳຕິຊົມຂອງທ່ານ!
            </h1>
            <p className="text-sm text-[#2D4C3E]/80 leading-relaxed max-w-md mx-auto">
              ສຽງຂອງທ່ານມີຄ່າຫຼາຍ ແລະ ຈະຊ່ວຍໃຫ້ Next-path ພັດທະນາໃຫ້ເປັນພື້ນທີ່ທີ່ອົບອຸ່ນ ແລະ ເໝາະສົມກັບໄວໜຸ່ມລາວຫຼາຍຍິ່ງຂຶ້ນ.
            </p>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={onNavigateReport}
              className="w-full sm:w-auto px-6 py-3 rounded-xl border border-[#E5E1D8] text-sm font-medium text-[#2D4C3E] hover:bg-[#F4EFEA] transition-colors cursor-pointer"
            >
              ກັບໄປອ່ານຜົນສະທ້ອນ
            </button>
            <button
              onClick={onNavigateHome}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#2D4C3E] text-[#F9F8F5] text-sm font-semibold hover:bg-[#233c31] transition-all cursor-pointer"
            >
              ກັບຄືນໜ້າຫຼັກ (Home)
            </button>
          </div>
        </div>
      ) : (
        /* Feedback Form */
        <div className="bg-[#FFFFFF] border border-[#E5E1D8] rounded-3xl p-6 sm:p-10 shadow-xs space-y-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F9F3EB] text-[#8D5B28] text-xs font-medium mb-3">
              <Heart className="w-3.5 h-3.5 fill-current" />
              <span>ຄຳຕິຊົມ ແລະ ຄວາມຄິດເຫັນ (Feedback)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#2D4C3E]">
              ຜົນສະທ້ອນນີ້ເປັນແນວໃດແດ່ສຳລັບທ່ານ?
            </h1>
            <p className="text-sm text-[#2D4C3E]/75 mt-1 leading-relaxed">
              ພວກເຮົາຢາກຟັງຄວາມຮູ້ສຶກຂອງທ່ານ ເພື່ອປັບປຸງປະສົບການໃຫ້ດີຂຶ້ນເລື້ອຍໆ.
            </p>
          </div>

          {errorMessage && (
            <div className="p-4 rounded-2xl bg-[#FDF3F0] text-[#7A3E2D] text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Rating 1-5 */}
            <div className="space-y-3">
              <label className="block text-sm font-bold text-[#2D4C3E]">
                1. ຜົນສະທ້ອນນີ້ຕົງກັບຄວາມເປັນຕົວທ່ານຫຼາຍປານໃດ?
              </label>

              <div className="flex items-center gap-2 sm:gap-3">
                {[1, 2, 3, 4, 5].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setRating(num)}
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-base transition-all cursor-pointer ${
                      rating === num
                        ? 'bg-[#2D4C3E] text-[#F9F8F5] shadow-md scale-105'
                        : 'bg-[#F9F8F5] border border-[#E5E1D8] text-[#2D4C3E]/80 hover:bg-[#F4EFEA]'
                    }`}
                    aria-label={`ໃຫ້ຄະແນນ ${num} ຈາກ 5`}
                  >
                    {num}
                  </button>
                ))}
              </div>

              <p className="text-xs sm:text-sm text-[#8D5B28] font-medium pt-1">
                {RATING_DESCRIPTIONS[rating - 1]}
              </p>
            </div>

            {/* Felt safe & comfortable checkbox */}
            <div className="pt-2 border-t border-[#E5E1D8]">
              <label className="flex items-start gap-3 p-4 rounded-2xl bg-[#F9F8F5] border border-[#E5E1D8] cursor-pointer hover:bg-[#F4EFEA] transition-colors select-none">
                <input
                  type="checkbox"
                  checked={feltComfortable}
                  onChange={(e) => setFeltComfortable(e.target.checked)}
                  className="mt-1 w-5 h-5 rounded border-[#8D5B28] text-[#2D4C3E] focus:ring-[#8D5B28] cursor-pointer accent-[#2D4C3E]"
                />
                <div>
                  <span className="font-semibold text-sm text-[#2D4C3E] block">
                    ຂ້ອຍຮູ້ສຶກສະບາຍໃຈ ແລະ ບໍ່ຮູ້ສຶກກົດດັນໃນຂະນະທີ່ຕອບຄຳຖາມ
                  </span>
                  <span className="text-xs text-[#2D4C3E]/70 mt-0.5 block leading-relaxed">
                    ການສຳຫຼວດນີ້ໃຫ້ຄວາມຮູ້ສຶກຄືພື້ນທີ່ປອດໄພສຳລັບຄິດກັບຕົນເອງ
                  </span>
                </div>
              </label>
            </div>

            {/* Textarea comments */}
            <div className="space-y-2">
              <label htmlFor="feedback-comments" className="block text-sm font-bold text-[#2D4C3E]">
                2. ຄວາມຄິດເຫັນ ຫຼື ຂໍ້ສະເໜີແນະເພີ່ມເຕີມ (ບໍ່ບັງຄັບ)
              </label>
              <textarea
                id="feedback-comments"
                rows={4}
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="ບອກເລົ່າຄວາມຮູ້ສຶກ ຫຼື ສິ່ງທີ່ຢາກໃຫ້ Next-path ເພີ່ມຕື່ມ..."
                className="w-full p-4 rounded-2xl bg-[#F9F8F5] border border-[#E5E1D8] text-sm text-[#2D4C3E] focus:bg-[#FFFFFF] focus:outline-none focus:ring-2 focus:ring-[#8D5B28] placeholder:text-[#2D4C3E]/40 leading-relaxed"
              />
            </div>

            {/* Submit Action */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-xs text-[#2D4C3E]/60 text-center sm:text-left">
                ຄຳຕິຊົມຖືກສົ່ງແບບບໍ່ລະບຸຕົວຕົນ (Anonymous)
              </span>

              <button
                type="submit"
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-[#2D4C3E] text-[#F9F8F5] text-sm font-semibold hover:bg-[#233c31] transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#2D4C3E]"
              >
                <span>ສົ່ງຄຳຕິຊົມ</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
