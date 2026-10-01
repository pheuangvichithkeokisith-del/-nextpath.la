import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ReflectionReport, ReflectionSignal } from '../types/questionnaire';
import { AiPromptModal } from './AiPromptModal';
import {
  Compass,
  Sparkles,
  Heart,
  ChevronDown,
  ChevronUp,
  Share2,
  Printer,
  Copy,
  Check,
  ArrowRight,
  ExternalLink,
  HelpCircle,
  ShieldCheck,
  Lightbulb,
  MessageSquare,
  BookOpen,
  Hammer,
  Palette,
  Brain,
  HeartHandshake,
  Briefcase,
  Cpu,
  Leaf,
  Info,
  Layers,
  Award,
} from 'lucide-react';

interface RadarVisualizerProps {
  signals: ReflectionSignal[];
  selectedDimensionId?: string | null;
  onSelectDimension?: (id: string) => void;
}

const RadarVisualizer: React.FC<RadarVisualizerProps> = ({
  signals,
  selectedDimensionId,
  onSelectDimension,
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const size = 320;
  const center = size / 2;
  const radius = 95;
  const numAxes = signals.length || 8;
  const levels = [0.25, 0.5, 0.75, 1.0];

  const getCoordinates = (index: number, intensityRatio: number) => {
    const angle = (index * (360 / numAxes) - 90) * (Math.PI / 180);
    const r = intensityRatio * radius;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    };
  };

  const polygonPoints = signals
    .map((s, idx) => {
      const { x, y } = getCoordinates(idx, s.intensity / 100);
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div className="flex flex-col items-center justify-center p-2 sm:p-4 relative">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="overflow-visible max-w-full h-auto"
      >
        {/* Background Rings */}
        {levels.map((lvl, lIdx) => {
          const ringPoints = Array.from({ length: numAxes })
            .map((_, i) => {
              const { x, y } = getCoordinates(i, lvl);
              return `${x},${y}`;
            })
            .join(' ');
          return (
            <polygon
              key={lIdx}
              points={ringPoints}
              fill="none"
              stroke="#E5E1D8"
              strokeWidth="1"
              strokeDasharray={lIdx === levels.length - 1 ? 'none' : '3 3'}
            />
          );
        })}

        {/* Axes */}
        {signals.map((_, idx) => {
          const outer = getCoordinates(idx, 1.0);
          return (
            <line
              key={idx}
              x1={center}
              y1={center}
              x2={outer.x}
              y2={outer.y}
              stroke="#E5E1D8"
              strokeWidth="1"
            />
          );
        })}

        {/* Animated Polygon Area */}
        <motion.polygon
          initial={{ opacity: 0, scale: 0.2 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          points={polygonPoints}
          fill="#2D4C3E"
          fillOpacity="0.22"
          stroke="#2D4C3E"
          strokeWidth="2.5"
          className="transition-all"
        />

        {/* Interactive Dots and Dimension Labels */}
        {signals.map((sig, idx) => {
          const pt = getCoordinates(idx, sig.intensity / 100);
          const labelPt = getCoordinates(idx, 1.28);
          const isSelected = selectedDimensionId === sig.dimensionId;
          const isHovered = hoveredIdx === idx;

          return (
            <g
              key={sig.dimensionId}
              className="cursor-pointer"
              onClick={() => onSelectDimension?.(sig.dimensionId)}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              <circle
                cx={pt.x}
                cy={pt.y}
                r={isSelected || isHovered ? 6.5 : 4.5}
                fill={isSelected ? '#8D5B28' : sig.accentColor || '#2D4C3E'}
                stroke="#FFFFFF"
                strokeWidth="2"
                className="transition-all drop-shadow-xs"
              />
              <text
                x={labelPt.x}
                y={labelPt.y}
                textAnchor="middle"
                dominantBaseline="central"
                className={`text-[10px] sm:text-[11px] font-bold select-none transition-colors ${
                  isSelected || isHovered ? 'fill-[#8D5B28]' : 'fill-[#2D4C3E]/80'
                }`}
              >
                {sig.nameLo} ({sig.intensity}%)
              </text>
            </g>
          );
        })}
      </svg>
      <span className="text-[11px] text-[#2D4C3E]/60 mt-3">
        💡 ກົດທີ່ຈຸດຕ່າງໆ ເພື່ອໄຮໄລ້ຄຸນລັກສະນະນັ້ນ
      </span>
    </div>
  );
};

interface ReportPageProps {
  report: ReflectionReport | null;
  onRetake: () => void;
  onNavigateFeedback: () => void;
}

export const ReportPage: React.FC<ReportPageProps> = ({
  report,
  onRetake,
  onNavigateFeedback,
}) => {
  const [activeTab, setActiveTab] = useState<number>(0);
  const [isEvidenceOpen, setIsEvidenceOpen] = useState<boolean>(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [copiedRoadmap, setCopiedRoadmap] = useState<boolean>(false);
  const [selectedDimensionId, setSelectedDimensionId] = useState<string | null>(null);
  const [copiedScriptIndex, setCopiedScriptIndex] = useState<number | null>(null);

  // Micro-experiment persistence
  const [completedExperiments, setCompletedExperiments] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('nextpath_completed_experiments_v1');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const toggleExperiment = (expId: string) => {
    setCompletedExperiments((prev) => {
      const updated = { ...prev, [expId]: !prev[expId] };
      try {
        localStorage.setItem('nextpath_completed_experiments_v1', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const handleCopyRoadmapMarkdown = async () => {
    if (!report?.portfolioRoadmap) return;
    const r = report.portfolioRoadmap;
    let md = `# ${r.title}\n\n**ຈຸດສຸມ:** ${r.focusArea}\n\n`;
    for (const m of r.milestones) {
      md += `## ${m.period}\n**ເປົ້າໝາຍ:** ${m.objective}\n**ສິ່ງທີ່ຕ້ອງເຮັດ:**\n`;
      for (const t of m.tasks) {
        md += `- ${t}\n`;
      }
      md += `**ຜົນງານທີ່ໄດ້ (Deliverable):** ${m.portfolioDeliverable}\n\n`;
    }
    md += `\n---\n${r.resumeTipLo}\n`;

    try {
      await navigator.clipboard.writeText(md);
      setCopiedRoadmap(true);
      setTimeout(() => setCopiedRoadmap(false), 2500);
    } catch {
      setCopiedRoadmap(true);
      setTimeout(() => setCopiedRoadmap(false), 2500);
    }
  };

  // Stale/Empty State Guard
  if (!report) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-[#F9F3EB] text-[#8D5B28] flex items-center justify-center mx-auto">
          <Compass className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-[#2D4C3E]">ຍັງບໍ່ພົບຜົນສະທ້ອນຕົນເອງ</h1>
          <p className="text-sm text-[#2D4C3E]/75 leading-relaxed">
            ທ່ານອາດຈະຍັງບໍ່ທັນໄດ້ຕອບແບບສຳຫຼວດ ຫຼື ຂໍ້ມູນເຊດຊັນເກົ່າໝົດອາຍຸແລ້ວ. ທ່ານສາມາດເລີ່ມຕົ້ນສຳຫຼວດຕົນເອງໄດ້ເລີຍ.
          </p>
        </div>
        <button
          onClick={onRetake}
          className="px-8 py-3.5 rounded-2xl bg-[#2D4C3E] text-[#F9F8F5] text-sm font-semibold hover:bg-[#233c31] transition-all shadow-md inline-flex items-center gap-2 cursor-pointer"
        >
          <span>ເລີ່ມຕົ້ນສຳຫຼວດຕົນເອງ</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  const {
    demographics,
    overview,
    interestsAndValues,
    workingStyles,
    tensionsAndUncertainties,
    possiblePaths,
    suggestedExperiments,
    transparencyEvidence,
    aiPromptMarkdown,
  } = report;

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Next-path: ຜົນສະທ້ອນຕົນເອງ',
          text: 'ຜົນສະທ້ອນຄວາມສົນໃຈ ແລະ ເສັ້ນທາງຊີວິດຈາກ Next-path ສຳລັບໄວໜຸ່ມລາວ',
          url: window.location.href,
        });
      } catch {
        // Ignored if cancelled
      }
    } else {
      await navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const tabs = [
    { id: 0, label: '1. ພາບລວມຕົນເອງ' },
    { id: 1, label: '2. ສິ່ງທີ່ສົນໃຈ' },
    { id: 2, label: '3. ຮູບແບບການເຮັດວຽກ' },
    { id: 3, label: '4. ຄວາມບໍ່ແນ່ໃຈ' },
    { id: 4, label: '5. ຕົ້ນແບບອາຊີບ (Archetypes)' },
    { id: 5, label: report.careerCluster ? `6. ການທົດລອງ (${report.careerCluster.nameEn.split(',')[0]})` : '6. ການທົດລອງສຳຫຼວດ' },
    { id: 6, label: '7. ວິທີລົມກັບພໍ່ແມ່ (Family Bridge)' },
    { id: 7, label: '8. ແຜນສ້າງ Portfolio (Roadmap)' },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-10">
      {/* Top Banner & Context */}
      <div className="bg-[#FFFFFF] border border-[#E5E1D8] rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#E5E1D8]/60 text-xs sm:text-sm text-[#2D4C3E]/70">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[#2D4C3E]">Next-path</span>
            <span>·</span>
            <span>ຜົນສະທ້ອນຕົນເອງ (Self-reflection Report)</span>
          </div>
          <div className="flex items-center gap-3">
            <span>{demographics.ageStage}</span>
            <span>·</span>
            <span>{demographics.province}</span>
          </div>
        </div>

        {report.careerCluster && (
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EBF2EE] border border-[#2D4C3E]/20 text-[#2D4C3E] text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-[#8D5B28]" />
            <span>ກຸ່ມອາຊີບຫຼັກ: {report.careerCluster.nameLo} ({report.careerCluster.nameEn})</span>
          </div>
        )}

        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#2D4C3E] tracking-tight">
            ແວ່ນແຍງສະທ້ອນຕົວຕົນ ແລະ ເສັ້ນທາງທີ່ໜ້າລອງ
          </h1>
          <p className="text-sm sm:text-base text-[#2D4C3E]/80 mt-2 leading-relaxed">
            {overview.coreEssence}
          </p>
        </div>

        {/* Action Buttons: Print, Share, AI Prompt */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsAiModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-[#2D4C3E] text-[#F9F8F5] text-xs sm:text-sm font-semibold hover:bg-[#233c31] transition-all flex items-center gap-2 shadow-xs cursor-pointer"
          >
            <MessageSquare className="w-4 h-4 text-[#E5E1D8]" />
            <span>ຄັດລອກຄຳຖາມໄປຄຸຍກັບ AI</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handlePrint}
            className="px-4 py-2.5 rounded-xl border border-[#E5E1D8] text-xs sm:text-sm font-medium text-[#2D4C3E] hover:bg-[#F4EFEA] transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-4 h-4 text-[#8D5B28]" />
            <span>ພິມລາຍງານ (Print)</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleShare}
            className="px-4 py-2.5 rounded-xl border border-[#E5E1D8] text-xs sm:text-sm font-medium text-[#2D4C3E] hover:bg-[#F4EFEA] transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            {copiedLink ? <Check className="w-4 h-4 text-[#2D4C3E]" /> : <Share2 className="w-4 h-4 text-[#8D5B28]" />}
            <span>{copiedLink ? 'ຄັດລອກລິ້ງແລ້ວ' : 'ແບ່ງປັນ'}</span>
          </motion.button>
        </div>
      </div>

      {/* 6-Part Reflection Architecture Tabs */}
      <div className="space-y-6">
        {/* Tab Navigation Buttons with Animated Indicator */}
        <div className="flex overflow-x-auto pb-2 gap-2 scrollbar-none border-b border-[#E5E1D8]">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <motion.button
                key={tab.id}
                whileTap={{ scale: 0.96 }}
                onClick={() => setActiveTab(tab.id)}
                className={`relative px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition-colors cursor-pointer select-none ${
                  isActive
                    ? 'text-[#F9F8F5]'
                    : 'text-[#2D4C3E]/70 hover:text-[#2D4C3E] hover:bg-[#E5E1D8]/40'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="reportActiveTabIndicator"
                    className="absolute inset-0 bg-[#2D4C3E] rounded-xl shadow-xs -z-0"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                  />
                )}
                <span className="relative z-10">{tab.label}</span>
              </motion.button>
            );
          })}
        </div>

        {/* Tab 0: Overview & Signals */}
        {activeTab === 0 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="bg-[#FFFFFF] border border-[#E5E1D8] rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-[#2D4C3E] mb-2">
                  ຮູບແບບຄວາມສົນໃຈ ແລະ ທ່າແຮງ (Interest Patterns)
                </h2>
                <p className="text-sm text-[#2D4C3E]/75 leading-relaxed">
                  ສັນຍານເຫຼົ່ານີ້ມາຈາກກິດຈະກຳທີ່ເຈົ້າເລືອກວ່າເຮັດແລ້ວມີຄວາມສຸກ ແລະ ຮູ້ສຶກເປັນຕົວຂອງຕົວເອງ:
                </p>
              </div>

              {/* Profile Confidence & Generalist / Specialist Badge */}
              {report.profileConfidence && (
                <div
                  className={`p-4 rounded-2xl border text-xs sm:text-sm flex items-start gap-3.5 shadow-2xs ${
                    report.profileConfidence.isGeneralist
                      ? 'bg-[#F9F3EB] border-[#8D5B28]/40 text-[#8D5B28]'
                      : 'bg-[#EBF2EE] border-[#2D4C3E]/30 text-[#2D4C3E]'
                  }`}
                >
                  <Sparkles className="w-5 h-5 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold">
                        ລັກສະນະໂປຣໄຟລ໌: {report.profileConfidence.levelText}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-[#FFFFFF]/90 border text-[11px] font-semibold text-[#2D4C3E]">
                        ຄວາມໝັ້ນໃຈໃນການແນະນຳ: {report.profileConfidence.score}%
                      </span>
                    </div>
                    <p className="leading-relaxed text-[#2D4C3E]/85">
                      {report.profileConfidence.adviceLo}
                    </p>
                  </div>
                </div>
              )}

              {/* Interactive Radar Visualizer Card */}
              <div className="bg-[#F9F8F5] border border-[#E5E1D8] rounded-2xl p-5 sm:p-6 shadow-2xs">
                <div className="text-center max-w-md mx-auto mb-2">
                  <h3 className="font-bold text-sm sm:text-base text-[#2D4C3E]">
                    🧭 ແຜນທີ່ເຂັມທິດ 8 ມິຕິ (Compass Radar Dimensions)
                  </h3>
                  <p className="text-xs text-[#2D4C3E]/70 mt-0.5">
                    ສະແດງຄວາມສົມດຸນ ແລະ ຄວາມເຂັ້ມຂຸ້ນຂອງແຕ່ລະມິຕິໃນຕົວເຈົ້າ
                  </p>
                </div>

                <RadarVisualizer
                  signals={overview.signals}
                  selectedDimensionId={selectedDimensionId}
                  onSelectDimension={(id) =>
                    setSelectedDimensionId(id === selectedDimensionId ? null : id)
                  }
                />
              </div>

              {/* Signals list */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {overview.signals.map((signal) => {
                  const isSelected = selectedDimensionId === signal.dimensionId;
                  return (
                    <motion.div
                      key={signal.dimensionId}
                      whileHover={{ y: -2 }}
                      onClick={() =>
                        setSelectedDimensionId(isSelected ? null : signal.dimensionId)
                      }
                      className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                        isSelected
                          ? 'border-[#8D5B28] ring-2 ring-[#8D5B28]/30 bg-[#FDF8F3] shadow-sm'
                          : 'border-[#E5E1D8] bg-[#F9F8F5] hover:bg-[#F4EFEA]'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <span className="font-bold text-sm text-[#2D4C3E]">
                            {signal.nameLo}
                          </span>
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-[#FFFFFF] border border-[#E5E1D8] text-[#8D5B28]">
                            {signal.levelText}
                          </span>
                        </div>
                        <p className="text-xs text-[#2D4C3E]/70 leading-relaxed">
                          {signal.descriptionLo}
                        </p>
                      </div>

                      {/* Intensity Meter */}
                      <div className="space-y-1 pt-1">
                        <div className="w-full h-2 rounded-full bg-[#E5E1D8] overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${signal.intensity}%` }}
                            transition={{ duration: 0.6, ease: 'easeOut' }}
                            className="h-full rounded-full"
                            style={{
                              backgroundColor: signal.accentColor || '#2D4C3E',
                            }}
                          />
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Tab 1: Interests & Core Values */}
        {activeTab === 1 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="bg-[#FFFFFF] border border-[#E5E1D8] rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-[#2D4C3E] mb-2">
                  {interestsAndValues.headline}
                </h2>
                <p className="text-sm text-[#2D4C3E]/80 leading-relaxed">
                  {interestsAndValues.narrative}
                </p>
              </div>

              <div className="space-y-4">
                {interestsAndValues.keyThemes.map((theme, idx) => (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl bg-[#F9F8F5] border border-[#E5E1D8] flex items-start gap-4"
                  >
                    <div className="w-8 h-8 rounded-xl bg-[#2D4C3E] text-[#F9F8F5] flex items-center justify-center font-bold text-sm shrink-0 mt-0.5">
                      {idx + 1}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-sm sm:text-base text-[#2D4C3E]">
                          {theme.title}
                        </h3>
                        {theme.enHint && (
                          <span className="text-xs text-[#8D5B28]">({theme.enHint})</span>
                        )}
                      </div>
                      <p className="text-xs sm:text-sm text-[#2D4C3E]/75 leading-relaxed">
                        {theme.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Working Styles */}
        {activeTab === 2 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="bg-[#FFFFFF] border border-[#E5E1D8] rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
              <h2 className="text-lg sm:text-xl font-bold text-[#2D4C3E]">
                {workingStyles.headline}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-5 rounded-2xl bg-[#F9F8F5] border border-[#E5E1D8] space-y-2">
                  <span className="text-xs font-semibold text-[#8D5B28] block">ວິທີຮຽນຮູ້ (Learning Style)</span>
                  <p className="text-sm text-[#2D4C3E] font-medium leading-relaxed">
                    {workingStyles.learningStyle}
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-[#F9F8F5] border border-[#E5E1D8] space-y-2">
                  <span className="text-xs font-semibold text-[#8D5B28] block">ບົດບາດໃນທີມ (Team Role)</span>
                  <p className="text-sm text-[#2D4C3E] font-medium leading-relaxed">
                    {workingStyles.teamRole}
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-[#F9F8F5] border border-[#E5E1D8] space-y-2">
                  <span className="text-xs font-semibold text-[#8D5B28] block">ສະພາບແວດລ້ອມ (Environment)</span>
                  <p className="text-sm text-[#2D4C3E] font-medium leading-relaxed">
                    {workingStyles.thrivingEnvironment}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Tensions & Uncertainties */}
        {activeTab === 3 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="bg-[#FFFFFF] border border-[#E5E1D8] rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-[#2D4C3E] mb-2">
                  {tensionsAndUncertainties.headline}
                </h2>
                <div className="p-4 rounded-2xl bg-[#F4EFEA] border border-[#E5E1D8] text-sm text-[#2D4C3E]/85 leading-relaxed">
                  {tensionsAndUncertainties.comfortingNote}
                </div>
              </div>

              {/* Observed tensions */}
              <div className="space-y-3">
                <h3 className="font-bold text-sm text-[#2D4C3E]">
                  ສິ່ງທີ່ອາດສ້າງຄວາມກັງວົນໃນໃຈຂອງທ່ານ:
                </h3>
                <div className="space-y-2">
                  {tensionsAndUncertainties.notedTensions.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-[#F9F8F5] border border-[#E5E1D8] text-sm text-[#2D4C3E] flex items-center gap-2.5"
                    >
                      <span className="w-2 h-2 rounded-full bg-[#7A3E2D]" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Questions for reflection */}
              <div className="space-y-3 pt-2">
                <h3 className="font-bold text-sm text-[#2D4C3E]">
                  ຄຳຖາມຊວນຄິດກັບຕົນເອງ (Reflection Prompts):
                </h3>
                <div className="space-y-2.5">
                  {tensionsAndUncertainties.reflectionPrompts.map((prompt, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl bg-[#FFFFFF] border border-[#E5E1D8] text-sm text-[#2D4C3E]/85 italic leading-relaxed"
                    >
                      “{prompt}”
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Possible Paths 1, 2, 3 */}
        {activeTab === 4 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="space-y-6">
              <div className="bg-[#FFFFFF] border border-[#E5E1D8] rounded-2xl p-6 shadow-xs">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EBF2EE] text-[#2D4C3E] text-xs font-semibold mb-2">
                  <Briefcase className="w-3.5 h-3.5 text-[#2D4C3E]" />
                  <span>ຕົ້ນແບບອາຊີບ (Career Archetypes)</span>
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-[#2D4C3E] mb-2">
                  ເສັ້ນທາງ ແລະ ຕົ້ນແບບອາຊີບທີ່ອາດເໝາະສົມ
                </h2>
                <p className="text-sm text-[#2D4C3E]/75 leading-relaxed">
                  ສັງເຄາະຈາກຮູບແບບຄວາມຄິດ ແລະ ທ່າແຮງຂອງທ່ານ ພ້ອມຄຳແນະນຳວິທີອະທິບາຍໃຫ້ຄອບຄົວເຂົ້າໃຈໃນແຕ່ລະເສັ້ນທາງ:
                </p>
              </div>

              <div className="space-y-6">
                {possiblePaths.map((path) => (
                  <div
                    key={path.pathNumber}
                    className="bg-[#FFFFFF] border border-[#E5E1D8] rounded-2xl p-6 sm:p-8 shadow-xs space-y-5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <span className="px-3 py-1 rounded-lg bg-[#EBF2EE] text-[#2D4C3E] text-xs font-bold">
                          ທາງເລືອກທີ {path.pathNumber}
                        </span>
                        <span className="text-xs text-[#8D5B28]">{path.subtitle}</span>
                      </div>
                      {path.archetypeTag && (
                        <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#F4EFEA] border border-[#E5E1D8] text-[#8D5B28] font-mono">
                          {path.archetypeTag}
                        </span>
                      )}
                    </div>

                    <h3 className="text-xl font-bold text-[#2D4C3E]">
                      {path.title}
                    </h3>

                    <p className="text-sm text-[#2D4C3E]/80 leading-relaxed">
                      {path.whyThisFits}
                    </p>

                    {/* Real examples in Laos */}
                    <div className="pt-3 border-t border-[#E5E1D8]/60 space-y-2">
                      <span className="text-xs font-semibold text-[#8D5B28] block">
                        ຕົວຢ່າງວຽກ ຫຼື ບົດບາດຕົວຈິງໃນປະເທດລາວ:
                      </span>
                      <ul className="space-y-1.5 text-xs sm:text-sm text-[#2D4C3E]/85">
                        {path.examplesInLaos.map((ex, exIdx) => (
                          <li key={exIdx} className="flex items-start gap-2">
                            <span className="text-[#8D5B28] mt-0.5">•</span>
                            <span>{ex}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Stakeholder Translation Callout inside each path */}
                    {path.familyTranslation && (
                      <div className="p-4 rounded-2xl bg-[#F9F3EB] border border-[#8D5B28]/30 space-y-2 text-xs sm:text-sm">
                        <div className="flex items-center gap-2 font-bold text-[#8D5B28]">
                          <MessageSquare className="w-4 h-4" />
                          <span>💡 ວິທີອະທິບາຍໃຫ້ພໍ່ແມ່ຟັງ (Family Translation):</span>
                        </div>
                        <p className="text-[#2D4C3E] italic bg-[#FFFFFF]/70 p-3 rounded-xl border border-[#E5E1D8]/60 leading-relaxed">
                          {path.familyTranslation.suggestedScriptLo}
                        </p>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-[#2D4C3E]/75 gap-1 pt-1">
                          <span>📌 <strong>ຕຳແໜ່ງທຽບເທົ່າ:</strong> {path.familyTranslation.traditionalRoleEquivalent}</span>
                          <span className="text-[#8D5B28]">✓ <strong>ຄວາມໝັ້ນຄົງ:</strong> {path.familyTranslation.stabilityAngleLo}</span>
                        </div>
                      </div>
                    )}

                    {/* Field areas */}
                    <div className="pt-1 flex flex-wrap gap-2 text-xs">
                      {path.fieldAreas.map((f, fIdx) => (
                        <span
                          key={fIdx}
                          className="px-2.5 py-1 rounded-md bg-[#F9F8F5] border border-[#E5E1D8] text-[#2D4C3E]/75"
                        >
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: Suggested Micro-experiments (STEM Validation) */}
        {activeTab === 5 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="space-y-6">
              <div className="bg-[#FFFFFF] border border-[#E5E1D8] rounded-2xl p-6 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EBF2EE] text-[#2D4C3E] text-xs font-semibold mb-2">
                      <Sparkles className="w-3.5 h-3.5 text-[#2D4C3E]" />
                      <span>ການທົດລອງສຳຫຼວດທັກສະຕົວຈິງ (Skill & Passion Validation)</span>
                    </div>
                    <h2 className="text-lg sm:text-xl font-bold text-[#2D4C3E] mb-1">
                      ການທົດລອງນ້ອຍໆ ທີ່ວັດຜົນໄດ້ຈິງ (Micro-experiments)
                    </h2>
                    <p className="text-sm text-[#2D4C3E]/75 leading-relaxed">
                      ການທົດລອງ 1-2 ຊົ່ວໂມງທີ່ຊ່ວຍພິສູດຄວາມຮູ້ສຶກ ແລະ ທັກສະຕົວຈິງຂອງທ່ານ ພ້ອມຕົວຊີ້ວັດການວັດຜົນ (Measure):
                    </p>
                  </div>

                  {/* Interactive Progress Counter */}
                  <div className="bg-[#F9F8F5] border border-[#E5E1D8] p-3.5 rounded-2xl text-center min-w-[170px] shadow-2xs">
                    <span className="text-[11px] text-[#2D4C3E]/70 block font-medium">ຄວາມຄືບໜ້າການທົດລອງ</span>
                    <span className="text-base font-bold text-[#8D5B28]">
                      {suggestedExperiments.filter((e) => completedExperiments[e.id]).length} / {suggestedExperiments.length} ສຳເລັດ ✨
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                {suggestedExperiments.map((exp, idx) => {
                  const isDone = !!completedExperiments[exp.id];
                  return (
                    <motion.div
                      key={exp.id}
                      whileHover={{ y: -2 }}
                      className={`border rounded-2xl p-6 sm:p-8 shadow-xs space-y-4 transition-all ${
                        isDone
                          ? 'bg-[#EBF2EE]/30 border-[#2D4C3E]'
                          : 'bg-[#FFFFFF] border-[#E5E1D8]'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <motion.button
                            whileTap={{ scale: 0.9 }}
                            type="button"
                            onClick={() => toggleExperiment(exp.id)}
                            className={`w-6 h-6 rounded-lg flex items-center justify-center border transition-all cursor-pointer ${
                              isDone
                                ? 'bg-[#2D4C3E] border-[#2D4C3E] text-[#F9F8F5]'
                                : 'bg-[#FFFFFF] border-[#E5E1D8] text-transparent hover:border-[#2D4C3E]'
                            }`}
                          >
                            <Check className="w-4 h-4" />
                          </motion.button>
                          <h3 className="text-lg font-bold text-[#2D4C3E]">
                            {idx + 1}. {exp.title}
                          </h3>
                        </div>
                        <span className="text-xs px-2.5 py-1 rounded-md bg-[#F9F3EB] text-[#8D5B28] font-medium shrink-0">
                          {exp.timeCommitment}
                        </span>
                      </div>

                      <p className="text-sm text-[#2D4C3E]/80 leading-relaxed">
                        {exp.description}
                      </p>

                      <div className="space-y-2 pt-2 border-t border-[#E5E1D8]/60">
                        <span className="text-xs font-semibold text-[#2D4C3E] block">
                          ຂັ້ນຕອນການທົດລອງ:
                        </span>
                        <ul className="space-y-1.5 text-xs sm:text-sm text-[#2D4C3E]/85">
                          {exp.actionSteps.map((step, sIdx) => (
                            <li key={sIdx} className="flex items-start gap-2">
                              <span className="w-5 h-5 rounded-full bg-[#EBF2EE] text-[#2D4C3E] text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                                {sIdx + 1}
                              </span>
                              <span>{step}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Measurable Validation Metric */}
                      {exp.validationMetricLo && (
                        <div className="p-3.5 rounded-xl bg-[#EBF2EE]/70 border border-[#2D4C3E]/30 text-xs sm:text-sm text-[#2D4C3E] font-medium">
                          {exp.validationMetricLo}
                        </div>
                      )}

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                        <div className="text-xs text-[#8D5B28] italic">
                          💡 {exp.reassuranceNote}
                        </div>
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          type="button"
                          onClick={() => toggleExperiment(exp.id)}
                          className={`text-xs px-3.5 py-1.5 rounded-xl font-semibold cursor-pointer transition-colors shrink-0 ${
                            isDone
                              ? 'bg-[#2D4C3E] text-[#F9F8F5]'
                              : 'bg-[#F4EFEA] text-[#2D4C3E] hover:bg-[#E5E1D8]'
                          }`}
                        >
                          {isDone ? '✓ ທົດລອງສຳເລັດແລ້ວ' : 'ໝາຍວ່າລອງແລ້ວ'}
                        </motion.button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Tab 6: Stakeholder Translation Layer (Family Bridge) */}
        {activeTab === 6 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="bg-[#FFFFFF] border border-[#E5E1D8] rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FDF3F0] text-[#7A3E2D] text-xs font-semibold mb-2">
                  <HeartHandshake className="w-3.5 h-3.5 text-[#7A3E2D]" />
                  <span>ຂົວເຊື່ອມຄວາມເຂົ້າໃຈກັບຄອບຄົວ (Stakeholder Translation Layer)</span>
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-[#2D4C3E] mb-2">
                  ວິທີອະທິບາຍເສັ້ນທາງທີ່ເລືອກໃຫ້ພໍ່ແມ່ເຂົ້າໃຈ ແລະ ໝັ້ນໃຈ
                </h2>
                <p className="text-sm text-[#2D4C3E]/80 leading-relaxed">
                  {report.familyCommunicationGuide?.coreAdviceLo ||
                    'ພໍ່ແມ່ບໍ່ໄດ້ຕໍ່ຕ້ານຄວາມຝັນຂອງເຈົ້າ ແຕ່ເຂົາເຈົ້າກັງວົນເລື່ອງຄວາມໝັ້ນຄົງ ແລະ ຄວາມປອດໄພໃນຊີວິດ.'}
                </p>
              </div>

              {/* Translation Cards for Each Path */}
              <div className="space-y-4">
                {(report.familyCommunicationGuide?.pathTranslations || []).map((trans, idx) => (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl bg-[#F9F8F5] border border-[#E5E1D8] space-y-3"
                  >
                    <h3 className="font-bold text-base text-[#2D4C3E] flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-[#2D4C3E] text-[#F9F8F5] text-xs flex items-center justify-center font-bold">
                        {idx + 1}
                      </span>
                      <span>{trans.pathTitle}</span>
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs sm:text-sm">
                      {/* What not to say */}
                      <div className="p-3.5 rounded-xl bg-[#FDF3F0] border border-[#7A3E2D]/20 text-[#7A3E2D] space-y-1">
                        <span className="font-bold block">❌ ສິ່ງທີ່ຄວນຫຼີກລ່ຽງບໍ່ເວົ້າ:</span>
                        <p className="leading-relaxed">{trans.whatNotToSayLo}</p>
                      </div>

                      {/* What to say instead */}
                      <div className="p-3.5 rounded-xl bg-[#EBF2EE] border border-[#2D4C3E]/20 text-[#2D4C3E] space-y-1">
                        <span className="font-bold block">✅ ສິ່ງທີ່ຄວນອະທິບາຍແທນ:</span>
                        <p className="leading-relaxed font-medium">{trans.whatToSayLo}</p>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
                      <div className="text-xs text-[#8D5B28]">
                        💡 <strong>ເຫດຜົນທີ່ສ້າງຄວາມເຊື່ອໝັ້ນ:</strong> {trans.whyItBuildsTrustLo}
                      </div>
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        type="button"
                        onClick={async () => {
                          try {
                            await navigator.clipboard.writeText(trans.whatToSayLo);
                            setCopiedScriptIndex(idx);
                            setTimeout(() => setCopiedScriptIndex(null), 2500);
                          } catch {}
                        }}
                        className="text-xs px-3 py-1.5 rounded-xl border border-[#E5E1D8] bg-[#FFFFFF] hover:bg-[#F9F8F5] text-[#2D4C3E] font-medium flex items-center gap-1.5 cursor-pointer shadow-2xs shrink-0 self-start sm:self-auto"
                      >
                        {copiedScriptIndex === idx ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-[#2D4C3E]" />
                            <span>ຄັດລອກບົດເວົ້າແລ້ວ</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-[#8D5B28]" />
                            <span>ຄັດລອກບົດເວົ້າ</span>
                          </>
                        )}
                      </motion.button>
                    </div>
                  </div>
                ))}
              </div>

              {/* General 3 Golden Rules for talking to parents */}
              <div className="p-5 rounded-2xl bg-[#F4EFEA] border border-[#E5E1D8] space-y-3 text-xs sm:text-sm text-[#2D4C3E]">
                <h4 className="font-bold text-sm text-[#2D4C3E] flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#8D5B28]" />
                  <span>3 ກົດເຫຼັກໃນການສື່ສານກັບຄອບຄົວ:</span>
                </h4>
                <ul className="space-y-1.5 list-disc list-inside leading-relaxed text-[#2D4C3E]/85">
                  <li><strong>ຮັບຟັງຄວາມເປັນຫ່ວງກ່ອນ:</strong> ຢ່າຟ້າວຖຽງ ໃຫ້ຮັບຮູ້ວ່າຄວາມເປັນຫ່ວງຂອງພໍ່ແມ່ມາຈາກຄວາມຮັກ.</li>
                  <li><strong>ໃຊ້ຂໍ້ມູນຄວາມຕ້ອງການຂອງຕະຫຼາດ:</strong> ຍົກຕົວຢ່າງບໍລິສັດ, ທະນາຄານ ຫຼື ອົງການທີ່ກຳລັງເປີດຮັບຕຳແໜ່ງນີ້ໃນລາວ.</li>
                  <li><strong>ສະແດງຄວາມຮັບຜິດຊອບ:</strong> ບອກພໍ່ແມ່ວ່າເຈົ້າໄດ້ລອງເຮັດການທົດລອງນ້ອຍໆ ແລ້ວ ແລະ ເຫັນແນວທາງທີ່ຊັດເຈນ.</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Tab 7: Portfolio Roadmap (MVP 6-Month Action Plan) */}
        {activeTab === 7 && report.portfolioRoadmap && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="bg-[#FFFFFF] border border-[#E5E1D8] rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5E1D8]">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EBF2EE] text-[#2D4C3E] text-xs font-semibold mb-2">
                    <BookOpen className="w-3.5 h-3.5 text-[#2D4C3E]" />
                    <span>ແຜນງານ 6 ເດືອນ (Portfolio Roadmap MVP)</span>
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold text-[#2D4C3E]">
                    {report.portfolioRoadmap.title}
                  </h2>
                  <p className="text-xs sm:text-sm text-[#8D5B28] mt-1 font-medium">
                    ຈຸດສຸມຫຼັກ: {report.portfolioRoadmap.focusArea}
                  </p>
                </div>

                <button
                  onClick={handleCopyRoadmapMarkdown}
                  className="px-4 py-2.5 rounded-xl border border-[#E5E1D8] bg-[#F9F8F5] hover:bg-[#EBF2EE] text-xs sm:text-sm font-semibold text-[#2D4C3E] transition-all flex items-center gap-2 cursor-pointer shrink-0 shadow-2xs"
                >
                  {copiedRoadmap ? <Check className="w-4 h-4 text-[#2D4C3E]" /> : <Copy className="w-4 h-4 text-[#8D5B28]" />}
                  <span>{copiedRoadmap ? 'ຄັດລອກແລ້ວ!' : 'ຄັດລອກ Roadmap (Markdown)'}</span>
                </button>
              </div>

              {/* Milestones list */}
              <div className="space-y-5">
                {report.portfolioRoadmap.milestones.map((ms, idx) => (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl bg-[#F9F8F5] border border-[#E5E1D8] space-y-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="font-bold text-sm sm:text-base text-[#2D4C3E] flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-[#8D5B28] text-[#F9F8F5] text-xs flex items-center justify-center font-bold">
                          {idx + 1}
                        </span>
                        <span>{ms.period}</span>
                      </h3>
                      <span className="text-xs px-2.5 py-1 rounded-md bg-[#FFFFFF] border border-[#E5E1D8] text-[#2D4C3E]/80">
                        {ms.objective}
                      </span>
                    </div>

                    <div className="space-y-1.5 pl-8">
                      <span className="text-xs font-semibold text-[#2D4C3E]/70 block">
                        ສິ່ງທີ່ຄວນລົງມືເຮັດ:
                      </span>
                      <ul className="space-y-1 text-xs sm:text-sm text-[#2D4C3E]/85">
                        {ms.tasks.map((task, tIdx) => (
                          <li key={tIdx} className="flex items-start gap-2">
                            <span className="text-[#8D5B28]">•</span>
                            <span>{task}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Deliverable badge */}
                    <div className="pt-2 border-t border-[#E5E1D8]/60 flex items-center gap-2 text-xs text-[#2D4C3E]">
                      <span className="font-bold text-[#8D5B28]">📦 ຜົນງານທີ່ໄດ້ (Deliverable):</span>
                      <span className="font-medium bg-[#FFFFFF] px-2.5 py-0.5 rounded-md border border-[#E5E1D8]">
                        {ms.portfolioDeliverable}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Resume Tip */}
              <div className="p-4 rounded-2xl bg-[#F4EFEA] border border-[#E5E1D8] text-xs sm:text-sm text-[#2D4C3E] leading-relaxed">
                {report.portfolioRoadmap.resumeTipLo}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Accordion: Calculation Evidence & Transparency */}
      <div className="bg-[#FFFFFF] border border-[#E5E1D8] rounded-3xl overflow-hidden shadow-xs">
        <button
          type="button"
          onClick={() => setIsEvidenceOpen(!isEvidenceOpen)}
          className="w-full p-6 text-left flex items-center justify-between hover:bg-[#F9F8F5] transition-colors cursor-pointer"
          aria-expanded={isEvidenceOpen}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#EBF2EE] text-[#2D4C3E] flex items-center justify-center">
              <Info className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-base sm:text-lg text-[#2D4C3E]">
                ເຫດຜົນທີ່ຜົນອອກມາເປັນແນວນີ້ (Calculation Transparency)
              </h2>
              <p className="text-xs text-[#2D4C3E]/70">
                ກົດເພື່ອເບິ່ງວ່າຄຳຕອບໃດຂອງເຈົ້າທີ່ເຊື່ອມໂຍງກັບຜົນສະທ້ອນນີ້
              </p>
            </div>
          </div>
          <div className="p-1 rounded-lg text-[#2D4C3E]/60">
            {isEvidenceOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </div>
        </button>

        {isEvidenceOpen && (
          <div className="p-6 pt-0 border-t border-[#E5E1D8] space-y-4 animate-in fade-in duration-200">
            <p className="text-xs sm:text-sm text-[#2D4C3E]/75 leading-relaxed">
              ພວກເຮົາເຊື່ອໃນຄວາມໂປ່ງໃສ. ນີ້ຄືລາຍການຄຳຕອບທີ່ເຈົ້າເລືອກ ແລະ ວິທີທີ່ລະບົບນຳມາສະທ້ອນເປັນຮູບແບບຄວາມສົນໃຈ:
            </p>

            <div className="max-h-96 overflow-y-auto space-y-3 pr-2 divide-y divide-[#E5E1D8]/60">
              {transparencyEvidence.map((ev, idx) => (
                <div key={idx} className="pt-3 first:pt-0 space-y-1.5 text-xs sm:text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-bold px-2 py-0.5 rounded bg-[#F4EFEA] text-[#8D5B28] text-xs">
                      {ev.questionId}
                    </span>
                    <span className="font-semibold text-[#2D4C3E] line-clamp-1">
                      {ev.questionTitle}
                    </span>
                  </div>
                  <div className="pl-8 space-y-1">
                    <div className="text-[#8D5B28] font-medium">
                      ຄຳຕອບຂອງທ່ານ: {ev.userAnswerLabels.join(', ')}
                    </div>
                    <div className="text-[#2D4C3E]/75 text-xs">
                      {ev.explanationLo}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Actions: Feedback & Retake */}
      <div className="pt-6 border-t border-[#E5E1D8] flex flex-col sm:flex-row items-center justify-between gap-4">
        <button
          onClick={onRetake}
          className="w-full sm:w-auto px-6 py-3 rounded-xl border border-[#E5E1D8] text-xs sm:text-sm font-medium text-[#2D4C3E]/80 hover:bg-[#F4EFEA] transition-colors cursor-pointer"
        >
          ເລີ່ມຕົ້ນຕອບໃໝ່ (Retake Exploration)
        </button>

        <button
          onClick={onNavigateFeedback}
          className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-[#8D5B28] text-[#F9F8F5] text-sm font-semibold hover:bg-[#72491f] transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
        >
          <Heart className="w-4 h-4" />
          <span>ໃຫ້ຄຳຕິຊົມກ່ຽວກັບຜົນສະທ້ອນ (Feedback)</span>
        </button>
      </div>

      {/* AI Prompt Modal */}
      <AiPromptModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        markdownContent={aiPromptMarkdown}
      />
    </div>
  );
};
