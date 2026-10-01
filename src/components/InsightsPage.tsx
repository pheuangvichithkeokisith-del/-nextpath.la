import React, { useState, useEffect } from 'react';
import { AdminInsights, apiGetInsights } from '../utils/api';
import {
  BarChart3,
  Users,
  Compass,
  MapPin,
  Sparkles,
  Heart,
  MessageSquare,
  ShieldCheck,
  RotateCw,
  ArrowLeft,
  CheckCircle2,
} from 'lucide-react';

interface InsightsPageProps {
  onBack: () => void;
}

export const InsightsPage: React.FC<InsightsPageProps> = ({ onBack }) => {
  const [insights, setInsights] = useState<AdminInsights | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchStats = async () => {
    setIsLoading(true);
    const data = await apiGetInsights();
    setInsights(data);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
      {/* Top Navigation */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-sm text-[#2D4C3E]/70 hover:text-[#2D4C3E] transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>ກັບຄືນໜ້າຫຼັກ</span>
      </button>

      {/* Header */}
      <div className="bg-[#FFFFFF] border border-[#E5E1D8] rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EBF2EE] text-[#2D4C3E] text-xs font-semibold mb-2">
            <BarChart3 className="w-3.5 h-3.5 text-[#2D4C3E]" />
            <span>ລະບົບຫຼັງບ້ານ SQLite · ສະຖິຕິພາບລວມ (Backend Insights)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#2D4C3E]">
            ມຸມມອງ ແລະ ທ່າແຮງຂອງໄວໜຸ່ມລາວ
          </h1>
          <p className="text-xs sm:text-sm text-[#2D4C3E]/75 mt-1">
            ຂໍ້ມູນສະຫຼຸບແບບບໍ່ລະບຸຕົວຕົນ (Anonymous Aggregate) ທີ່ຖືກບັນທຶກລົງໃນຖານຂໍ້ມູນ SQLite
          </p>
        </div>

        <button
          onClick={fetchStats}
          disabled={isLoading}
          className="px-4 py-2.5 rounded-xl border border-[#E5E1D8] text-xs sm:text-sm font-medium text-[#2D4C3E] hover:bg-[#F4EFEA] transition-all flex items-center gap-2 cursor-pointer shrink-0"
        >
          <RotateCw className={`w-4 h-4 text-[#8D5B28] ${isLoading ? 'animate-spin' : ''}`} />
          <span>ອັບເດດຂໍ້ມູນ</span>
        </button>
      </div>

      {isLoading && !insights ? (
        <div className="p-12 text-center text-[#2D4C3E]/70 space-y-3">
          <div className="w-8 h-8 border-2 border-[#2D4C3E] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm">ກຳລັງໂຫຼດຂໍ້ມູນຈາກຖານຂໍ້ມູນ SQLite...</p>
        </div>
      ) : !insights ? (
        <div className="bg-[#FFFFFF] border border-[#E5E1D8] rounded-2xl p-8 text-center text-sm text-[#2D4C3E]/80">
          ບໍ່ສາມາດດຶງຂໍ້ມູນສະຖິຕິໄດ້ໃນຕອນນີ້.
        </div>
      ) : (
        <div className="space-y-6">
          {/* Key Stat Counters */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-[#FFFFFF] border border-[#E5E1D8] rounded-2xl p-5 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#EBF2EE] text-[#2D4C3E] flex items-center justify-center shrink-0">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-[#2D4C3E]/70 block">ຜູ້ສຳຫຼວດສຳເລັດ</span>
                <span className="text-2xl font-bold text-[#2D4C3E]">
                  {insights.totalReports} <span className="text-xs font-normal">ຄົນ</span>
                </span>
              </div>
            </div>

            <div className="bg-[#FFFFFF] border border-[#E5E1D8] rounded-2xl p-5 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#F9F3EB] text-[#8D5B28] flex items-center justify-center shrink-0">
                <Heart className="w-6 h-6 fill-current" />
              </div>
              <div>
                <span className="text-xs text-[#2D4C3E]/70 block">ຄະແນນຄວາມຕົງໃຈສະເລ່ຍ</span>
                <span className="text-2xl font-bold text-[#8D5B28]">
                  {insights.feedbackStats.avgRating} <span className="text-xs font-normal">/ 5.0</span>
                </span>
              </div>
            </div>

            <div className="bg-[#FFFFFF] border border-[#E5E1D8] rounded-2xl p-5 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#FDF3F0] text-[#7A3E2D] flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-[#2D4C3E]/70 block">ຮູ້ສຶກສະບາຍໃຈບໍ່ກົດດັນ</span>
                <span className="text-2xl font-bold text-[#7A3E2D]">
                  {insights.feedbackStats.comfortablePercentage}%
                </span>
              </div>
            </div>
          </div>

          {/* 2-Column: Dominant Interests & Top Provinces */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Dominant Interests */}
            <div className="bg-[#FFFFFF] border border-[#E5E1D8] rounded-2xl p-6 shadow-xs space-y-4">
              <h2 className="font-bold text-base text-[#2D4C3E] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#8D5B28]" />
                <span>ຮູບແບບຄວາມສົນໃຈຫຼັກ (Dominant Dimensions)</span>
              </h2>

              {insights.dimensionDist.length === 0 ? (
                <p className="text-xs text-[#2D4C3E]/60">ຍັງບໍ່ມີຂໍ້ມູນຜົນສຳຫຼວດພຽງພໍ</p>
              ) : (
                <div className="space-y-3">
                  {insights.dimensionDist.map((item, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-xs font-medium text-[#2D4C3E]">
                        <span>{item.dominant_dimension}</span>
                        <span className="text-[#8D5B28]">{item.count} ຄົນ</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-[#E5E1D8] overflow-hidden">
                        <div
                          className="h-full bg-[#2D4C3E] rounded-full"
                          style={{
                            width: `${Math.min(
                              100,
                              Math.round((item.count / (insights.totalReports || 1)) * 100)
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Geographical Distribution */}
            <div className="bg-[#FFFFFF] border border-[#E5E1D8] rounded-2xl p-6 shadow-xs space-y-4">
              <h2 className="font-bold text-base text-[#2D4C3E] flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#7A3E2D]" />
                <span>ການເຂົ້າຮ່ວມຕາມແຂວງ/ນະຄອນຫຼວງ</span>
              </h2>

              {insights.provinceDist.length === 0 ? (
                <p className="text-xs text-[#2D4C3E]/60">ຍັງບໍ່ມີຂໍ້ມູນການເຂົ້າຮ່ວມ</p>
              ) : (
                <div className="space-y-2.5">
                  {insights.provinceDist.map((p, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-[#F9F8F5] border border-[#E5E1D8] flex items-center justify-between text-xs sm:text-sm"
                    >
                      <span className="font-medium text-[#2D4C3E]">{p.province}</span>
                      <span className="font-bold text-[#8D5B28]">{p.count} ຄັ້ງ</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Recent Voices & Feedback */}
          {insights.recentComments.length > 0 && (
            <div className="bg-[#FFFFFF] border border-[#E5E1D8] rounded-2xl p-6 shadow-xs space-y-4">
              <h2 className="font-bold text-base text-[#2D4C3E] flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#2D4C3E]" />
                <span>ສຽງສະທ້ອນຈາກໄວໜຸ່ມລາວ (Recent Anonymous Thoughts)</span>
              </h2>

              <div className="space-y-3">
                {insights.recentComments.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-[#F9F8F5] border border-[#E5E1D8] space-y-1 text-xs sm:text-sm"
                  >
                    <p className="text-[#2D4C3E] italic">“{item.comments}”</p>
                    <div className="text-[11px] text-[#2D4C3E]/50 flex items-center gap-2 pt-1">
                      <span>ຄະແນນ: {item.rating} / 5</span>
                      <span>·</span>
                      <span>{new Date(item.created_at).toLocaleDateString('lo-LA')}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Privacy Guarantee Note */}
          <div className="p-4 rounded-2xl bg-[#F4EFEA] border border-[#E5E1D8] flex items-start gap-3 text-xs sm:text-sm text-[#2D4C3E]/80">
            <ShieldCheck className="w-5 h-5 text-[#8D5B28] shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>ການຄຸ້ມຄອງຄວາມເປັນສ່ວນຕົວ:</strong> ຂໍ້ມູນທັງໝົດໃນ SQLite ນີ້ເປັນແບບ Anonymous 
              ບໍ່ມີການເກັບຊື່, ເບີໂທ, ອີເມວ ຫຼື ທີ່ຢູ່ IP ໃດໆ ທັງສິ້ນ. ນຳໃຊ້ສະເພາະເພື່ອສະທ້ອນຄວາມຕ້ອງການ ແລະ ທ່າແຮງລວມຂອງໄວໜຸ່ມລາວເທົ່ານັ້ນ.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
