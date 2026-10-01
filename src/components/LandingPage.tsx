import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Compass,
  Sparkles,
  ShieldCheck,
  Clock,
  CheckCircle2,
  ArrowRight,
  Eye,
  Footprints,
  HelpCircle,
  HeartHandshake,
  Cpu,
  Brain,
  Palette,
  Leaf,
  ChevronDown,
  Layers,
  Flame,
} from 'lucide-react';

interface LandingPageProps {
  onStart: () => void;
  hasSavedDraft?: boolean;
  onResumeDraft?: () => void;
}

interface DemoArchetype {
  id: string;
  nameLo: string;
  enTitle: string;
  icon: typeof Cpu;
  accent: string;
  descriptionLo: string;
  traits: { label: string; score: number }[];
  realJobLo: string;
  whyFit: string;
}

const DEMO_ARCHETYPES: DemoArchetype[] = [
  {
    id: 'applied-tech',
    nameLo: 'ນັກປະດິດ & ໂປຣແກຣມນັກພັດທະນາ',
    enTitle: 'Applied Tech & IoT Prototyper',
    icon: Cpu,
    accent: '#2D4C3E',
    descriptionLo: 'ມັກເອົາຄວາມຮູ້ດ້ານໂປຣແກຣມມາສ້າງສິ່ງຂອງທີ່ຈັບຕ້ອງໄດ້ ຫຼື ແກ້ໄຂບັນຫາແທ້ໃນຊີວິດ',
    traits: [
      { label: 'Hands-on (ລົງມືສ້າງ)', score: 92 },
      { label: 'Coding / Tech', score: 88 },
      { label: 'Creative Problem Solving', score: 85 },
      { label: 'Analytical Thinking', score: 78 },
    ],
    realJobLo: 'Hardware/IoT Specialist, Web/Mobile App Developer, Embedded Systems Engineer',
    whyFit: 'ເໝາະສຳລັບຄົນທີ່ບໍ່ມັກນັ່ງທ່ອງຈຳທິດສະດີລ້າໆ ແຕ່ມັກທົດລອງສ້າງລະບົບທີ່ໃຊ້ວຽກໄດ້ແທ້',
  },
  {
    id: 'data-science',
    nameLo: 'ນັກວິເຄາະຂໍ້ມູນ & ວິທະຍາສາດຄອມ',
    enTitle: 'Data Science & Technical Analytics',
    icon: Brain,
    accent: '#8D5B28',
    descriptionLo: 'ມັກຄົ້ນຫາແບບແຜນ (Pattern) ທີ່ເຊື່ອງຢູ່ໃນຂໍ້ມູນໃຫຍ່ໆ ເພື່ອຕອບຄຳຖາມທີ່ຊັບຊ້ອນ',
    traits: [
      { label: 'Analytical Thinking', score: 95 },
      { label: 'Data & Statistics', score: 90 },
      { label: 'System Logic', score: 86 },
      { label: 'Business Insight', score: 72 },
    ],
    realJobLo: 'Data Analyst ໃນທະນາຄານ/ໂທລະຄົມ, Business Intelligence, Machine Learning Engineer',
    whyFit: 'ເໝາະສຳລັບຜູ້ທີ່ມັກໃຊ້ເຫດຜົນ ແລະ ຕົວເລກໃນການຕັດສິນໃຈແທນຄວາມຮູ້ສຶກ',
  },
  {
    id: 'creative-problem-solving',
    nameLo: 'ນັກຄິດ & ສະຖາປັດຕະຍະກຳນະວັດຕະກຳ',
    enTitle: 'Product & System Architect',
    icon: Palette,
    accent: '#7A3E2D',
    descriptionLo: 'ເຊື່ອມໂຍງລະຫວ່າງຄວາມຕ້ອງການຂອງຄົນ (UX) ກັບຄວາມເປັນໄປໄດ້ທາງເທັກໂນໂລຊີ',
    traits: [
      { label: 'Creative Innovation', score: 90 },
      { label: 'System Design / UX', score: 88 },
      { label: 'Communication / Empathy', score: 84 },
      { label: 'Technical Grounding', score: 76 },
    ],
    realJobLo: 'Product Manager, Technical UX/UI Designer, Digital Transformation Strategist',
    whyFit: 'ມັກຄິດພາບລວມ ແລະ ສື່ສານກັບຄົນຫຼາກຫຼາຍສາຍງານ ເພື່ອສ້າງຜະລິດຕະພັນທີ່ໃຊ້ງ່າຍ',
  },
  {
    id: 'eco-community-tech',
    nameLo: 'ນັກເຕັກໂນໂລຊີຊຸມຊົນ & ສິ່ງແວດລ້ອມ',
    enTitle: 'Agro-Tech & Sustainable Solutions',
    icon: Leaf,
    accent: '#2D4C3E',
    descriptionLo: 'ນຳໃຊ້ເຕັກໂນໂລຊີມາພັດທະນາການກະເສດ, ພະລັງງານທົດແທນ ຫຼື ຍົກລະດັບຄຸນນະພາບຊີວິດຊຸມຊົນ',
    traits: [
      { label: 'Nature & Ecology', score: 94 },
      { label: 'Community Focus', score: 88 },
      { label: 'Practical Innovation', score: 82 },
      { label: 'Resource Management', score: 80 },
    ],
    realJobLo: 'Smart Farming Specialist, Renewable Energy Planner, Eco-Tourism & Supply Chain',
    whyFit: 'ເໝາະສຳລັບຜູ້ທີ່ຕ້ອງການເຫັນຜົນກະທົບຕໍ່ສັງຄົມ ແລະ ທຳມະຊາດໃນບ້ານເກີດຕົນເອງ',
  },
];

const FAQS = [
  {
    question: 'ຖ້າຂ້ອຍຍັງບໍ່ຮູ້ວ່າຕົນເອງມັກຫຍັງເລີຍ ຈະຕອບໄດ້ບໍ?',
    answer: 'ຕອບໄດ້ແນ່ນອນ 100%! Next-path ບໍ່ໄດ້ຖາມຫາອາຊີບໃນຝັນ ແຕ່ຖາມພຽງວ່າ "ກິດຈະກຳແບບໃດໃນຊີວິດປະຈຳວັນທີ່ເຮັດໃຫ້ເຈົ້າຮູ້ສຶກບໍ່ອິດເມື່ອຍ" ຄຳຕອບແບບຊື່ສັດແມ່ນສິ່ງທີ່ມີຄ່າທີ່ສຸດ.',
  },
  {
    question: 'ພໍ່ແມ່ຢາກໃຫ້ຮຽນຢ່າງອື່ນ ແຕ່ຂ້ອຍຢາກໄປສາຍອື່ນ ຄວນເຮັດແນວໃດ?',
    answer: 'ໃນໜ້າລາຍງານຜົນສະທ້ອນ ເຮົາມີລະບົບ "Stakeholder Translation Layer" ເຊິ່ງຊ່ວຍແປສິ່ງທີ່ເຈົ້າສົນໃຈໃຫ້ກາຍເປັນພາສາ ແລະ ມຸມມອງຄວາມໝັ້ນຄົງທີ່ພໍ່ແມ່ເຂົ້າໃຈ ແລະ ພ້ອມສະໜັບສະໜູນ.',
  },
  {
    question: 'ຜົນທີ່ໄດ້ຈະຕັດສິນອະນາຄົດຂ້ອຍເລີຍບໍ?',
    answer: 'ບໍ່ແມ່ນເລີຍ. Next-path ເປັນພຽງ "ແວ່ນແຍງ (Mirror)" ຊ່ວຍສະທ້ອນສິ່ງທີ່ຢູ່ໃນໃຈເຈົ້າ. ພ້ອມໃຫ້ "ການທົດລອງນ້ອຍໆ (Micro-experiments)" 1-2 ຊົ່ວໂມງໃຫ້ລອງເຮັດເບິ່ງກ່ອນຕັດສິນໃຈໃຫຍ່.',
  },
];

export const LandingPage: React.FC<LandingPageProps> = ({
  onStart,
  hasSavedDraft,
  onResumeDraft,
}) => {
  const [selectedArchetype, setSelectedArchetype] = useState<string>(DEMO_ARCHETYPES[0].id);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const activeDemo = DEMO_ARCHETYPES.find((a) => a.id === selectedArchetype) || DEMO_ARCHETYPES[0];

  return (
    <div className="space-y-16 sm:space-y-24 py-8 sm:py-12 overflow-hidden">
      {/* Hero Section with Fluid Motion */}
      <section className="text-center max-w-3xl mx-auto px-4 sm:px-6 relative">
        {/* Animated background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-[#8D5B28]/10 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse-glow" />

        {/* Soft tag */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E5E1D8]/70 border border-[#E5E1D8] text-[#2D4C3E] text-xs sm:text-sm font-medium mb-6 shadow-2xs"
        >
          <Compass className="w-4 h-4 text-[#8D5B28] animate-spin-slow" />
          <span>ພື້ນທີ່ສຳຫຼວດຕົນເອງສຳລັບໄວໜຸ່ມລາວ (ອາຍຸ 15 ປີຂຶ້ນໄປ)</span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
          className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#2D4C3E] tracking-tight leading-tight sm:leading-snug mb-6"
        >
          ຄົ້ນຫາເສັ້ນທາງທີ່ເປັນເຈົ້າ <br className="hidden sm:inline" />
          <span className="text-[#8D5B28] relative inline-block">
            ໂດຍບໍ່ມີຄວາມກົດດັນ
            <svg
              className="absolute -bottom-1.5 left-0 w-full text-[#8D5B28]/40"
              height="8"
              viewBox="0 0 200 8"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M1 5.5C50 1.5 150 1.5 199 5.5"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </span>
        </motion.h1>

        {/* Narrative Description */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
          className="text-base sm:text-lg text-[#2D4C3E]/85 leading-relaxed mb-8 max-w-2xl mx-auto"
        >
          Next-path ເປັນພື້ນທີ່ປອດໄພທີ່ຊ່ວຍໃຫ້ເຈົ້າໄດ້ຄິດທົບທວນກັບຕົນເອງ, ເຂົ້າໃຈສິ່ງທີ່ມັກ ແລະ ບໍ່ມັກ, 
          ພ້ອມທັງເປີດມຸມມອງໃໝ່ໆ ກ່ຽວກັບການຮຽນ ແລະ ຊີວິດ. ທີ່ນີ້ບໍ່ແມ່ນບົດສອບເສັງ, ບໍ່ມີຄະແນນຖືກ-ຜິດ, 
          ແລະ ບໍ່ມີໃຜຕັດສິນອະນາຄົດແທນເຈົ້າ.
        </motion.p>

        {/* Call to action & Time estimate with Motion */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-4"
        >
          <motion.button
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97 }}
            onClick={onStart}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-[#2D4C3E] text-[#F9F8F5] text-base font-semibold hover:bg-[#233c31] transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-3 cursor-pointer group focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#2D4C3E]"
          >
            <span>ເລີ່ມຕົ້ນສຳຫຼວດຕົນເອງ</span>
            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
          </motion.button>

          {hasSavedDraft && onResumeDraft && (
            <motion.button
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
              onClick={onResumeDraft}
              className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-[#FFFFFF] border border-[#E5E1D8] text-[#8D5B28] text-base font-medium hover:bg-[#F4EFEA] transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-[#8D5B28]" />
              <span>ຕອບຕໍ່ຈາກຮ່າງເກົ່າ</span>
            </motion.button>
          )}
        </motion.div>

        {/* Time and Peace Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex items-center justify-center gap-4 text-xs sm:text-sm text-[#2D4C3E]/70"
        >
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-[#8D5B28]" />
            <span>ໃຊ້ເວລາປະມານ 10 - 15 ນາທີ</span>
          </div>
          <span>·</span>
          <span>ບໍ່ຟ້າວ ຕອບສະບາຍໆ ຕາມໃຈເຈົ້າ</span>
        </motion.div>
      </section>

      {/* Interactive Archetype Playground (Playful Feature) */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="bg-[#FFFFFF] border border-[#E5E1D8] rounded-3xl p-6 sm:p-10 shadow-xs relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F4EFEA] text-[#8D5B28] text-xs font-semibold mb-2">
                <Sparkles className="w-3.5 h-3.5 text-[#8D5B28]" />
                <span>ລອງສຳຜັດຕົວຢ່າງ (Interactive Preview)</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#2D4C3E]">
                ລອງກົດເບິ່ງ 4 ຕົ້ນແບບອາຊີບຕົວຢ່າງ
              </h2>
              <p className="text-xs sm:text-sm text-[#2D4C3E]/75 mt-1">
                ກົດເລືອກສາຍຕ່າງໆ ເພື່ອເບິ່ງວິທີທີ່ລະບົບ Next-path ວິເຄາະທ່າແຮງ ແລະ ຕົວຢ່າງວຽກຈິງໃນລາວ:
              </p>
            </div>
            <span className="text-xs text-[#8D5B28] font-medium hidden md:inline-block">
              ✨ ຕອບແບບສຳຫຼວດເພື່ອຄົ້ນຫາແບບສະເພາະຂອງເຈົ້າ
            </span>
          </div>

          {/* Archetype Selector Tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-8">
            {DEMO_ARCHETYPES.map((arch) => {
              const isSelected = selectedArchetype === arch.id;
              const IconComp = arch.icon;
              return (
                <motion.button
                  key={arch.id}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedArchetype(arch.id)}
                  className={`p-3 sm:p-4 rounded-2xl text-left border transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                    isSelected
                      ? 'bg-[#2D4C3E] text-[#F9F8F5] border-[#2D4C3E] shadow-sm'
                      : 'bg-[#F9F8F5] text-[#2D4C3E] border-[#E5E1D8] hover:bg-[#F4EFEA]'
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                      isSelected ? 'bg-[#FFFFFF]/20 text-[#F9F8F5]' : 'bg-[#FFFFFF] text-[#2D4C3E] border border-[#E5E1D8]'
                    }`}
                  >
                    <IconComp className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xs sm:text-sm line-clamp-1">{arch.nameLo}</h3>
                    <p
                      className={`text-[11px] truncate mt-0.5 ${
                        isSelected ? 'text-[#F9F8F5]/80' : 'text-[#8D5B28]'
                      }`}
                    >
                      {arch.enTitle}
                    </p>
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* Animated Detail Display */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeDemo.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="bg-[#F9F8F5] border border-[#E5E1D8] rounded-2xl p-6 sm:p-8"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                {/* Left: Description & Fit */}
                <div className="lg:col-span-7 space-y-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#EBF2EE] text-[#2D4C3E] font-semibold">
                        {activeDemo.enTitle}
                      </span>
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-[#2D4C3E]">
                      {activeDemo.nameLo}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#2D4C3E]/85 leading-relaxed">
                      {activeDemo.descriptionLo}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#FFFFFF] border border-[#E5E1D8] space-y-1">
                    <span className="text-xs font-semibold text-[#8D5B28] block">
                      📌 ຕົວຢ່າງວຽກ ແລະ ໂອກາດໃນປະເທດລາວ:
                    </span>
                    <p className="text-xs sm:text-sm text-[#2D4C3E]/90 font-medium">
                      {activeDemo.realJobLo}
                    </p>
                  </div>

                  <p className="text-xs text-[#2D4C3E]/75 italic">
                    💡 {activeDemo.whyFit}
                  </p>
                </div>

                {/* Right: Trait Meters with animated width */}
                <div className="lg:col-span-5 bg-[#FFFFFF] border border-[#E5E1D8] rounded-xl p-5 space-y-3 shadow-2xs">
                  <span className="text-xs font-bold text-[#2D4C3E] block border-b border-[#E5E1D8]/60 pb-2">
                    📊 ຄວາມໂດດເດັ່ນຂອງທັກສະ (Skill Balance):
                  </span>
                  <div className="space-y-3">
                    {activeDemo.traits.map((trait, tIdx) => (
                      <div key={tIdx} className="space-y-1">
                        <div className="flex justify-between text-xs font-medium text-[#2D4C3E]">
                          <span>{trait.label}</span>
                          <span className="font-semibold text-[#8D5B28]">{trait.score}%</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-[#E5E1D8] overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${trait.score}%` }}
                            transition={{ duration: 0.6, delay: tIdx * 0.08, ease: 'easeOut' }}
                            className="h-full rounded-full bg-[#2D4C3E]"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* 4 Steps Section with Motion Cards */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#2D4C3E] mb-3">
            ວິທີທີ່ Next-path ຊ່ວຍເຈົ້າ
          </h2>
          <p className="text-sm sm:text-base text-[#2D4C3E]/75">
            4 ຂັ້ນຕອນທີ່ລຽບງ່າຍ ແລະ ເຄົາລົບຄວາມເປັນຕົວຕົນຂອງເຈົ້າ
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Step 1 */}
          <motion.div
            whileHover={{ y: -6, transition: { duration: 0.2 } }}
            className="bg-[#FFFFFF] border border-[#E5E1D8] rounded-2xl p-6 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-[#EBF2EE] text-[#2D4C3E] flex items-center justify-center font-bold text-lg mb-4">
                1
              </div>
              <h3 className="font-bold text-lg text-[#2D4C3E] mb-2">ສຳຫຼວດຕົນເອງ</h3>
              <p className="text-sm text-[#2D4C3E]/80 leading-relaxed">
                ຕອບຄຳຖາມສະບາຍໆ ກ່ຽວກັບກິດຈະກຳທີ່ມັກ, ວິທີຮຽນຮູ້ ແລະ ບັນຍາກາດທີ່ເຮັດໃຫ້ເຈົ້າຮູ້ສຶກສະບາຍໃຈ.
              </p>
            </div>
            <div className="mt-4 pt-4 border-t border-[#E5E1D8]/60 text-xs text-[#8D5B28] font-medium">
              ບໍ່ມີຄຳຕອບຖືກ ຫຼື ຜິດ
            </div>
          </motion.div>

          {/* Step 2 */}
          <motion.div
            whileHover={{ y: -6, transition: { duration: 0.2 } }}
            className="bg-[#FFFFFF] border border-[#E5E1D8] rounded-2xl p-6 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-[#FDF3F0] text-[#7A3E2D] flex items-center justify-center font-bold text-lg mb-4">
                2
              </div>
              <h3 className="font-bold text-lg text-[#2D4C3E] mb-2">ເຫັນຮູບແບບຄວາມສົນໃຈ</h3>
              <p className="text-sm text-[#2D4C3E]/80 leading-relaxed">
                ລະບົບຈະຮວບຮວມສັນຍານຈາກຄຳຕອບມາສະທ້ອນໃຫ້ເຫັນທ່າແຮງ ແລະ ຄວາມສົນໃຈຫຼັກ 8 ດ້ານໃນຕົວເຈົ້າ.
              </p>
            </div>
            <div className="mt-4 pt-4 border-t border-[#E5E1D8]/60 text-xs text-[#7A3E2D] font-medium">
              ເຫັນຈຸດເດັ່ນໃນແບບຂອງຕົນ
            </div>
          </motion.div>

          {/* Step 3 */}
          <motion.div
            whileHover={{ y: -6, transition: { duration: 0.2 } }}
            className="bg-[#FFFFFF] border border-[#E5E1D8] rounded-2xl p-6 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-[#F9F3EB] text-[#8D5B28] flex items-center justify-center font-bold text-lg mb-4">
                3
              </div>
              <h3 className="font-bold text-lg text-[#2D4C3E] mb-2">ຄົ້ນຫາທາງເລືອກທີ່ໜ້າລອງ</h3>
              <p className="text-sm text-[#2D4C3E]/80 leading-relaxed">
                ພົບກັບ 3 ເສັ້ນທາງທີ່ອາດສອດຄ່ອງກັບເຈົ້າ ໂດຍເຊື່ອມໂຍງກັບໂອກາດຕົວຈິງໃນປະເທດລາວ.
              </p>
            </div>
            <div className="mt-4 pt-4 border-t border-[#E5E1D8]/60 text-xs text-[#8D5B28] font-medium">
              ເປັນທາງເລືອກ ບໍ່ແມ່ນການບັງຄັບ
            </div>
          </motion.div>

          {/* Step 4 */}
          <motion.div
            whileHover={{ y: -6, transition: { duration: 0.2 } }}
            className="bg-[#FFFFFF] border border-[#E5E1D8] rounded-2xl p-6 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-[#EBF2EE] text-[#2D4C3E] flex items-center justify-center font-bold text-lg mb-4">
                4
              </div>
              <h3 className="font-bold text-lg text-[#2D4C3E] mb-2">ທົດລອງບາດກ້າວນ້ອຍໆ</h3>
              <p className="text-sm text-[#2D4C3E]/80 leading-relaxed">
                ແນະນຳການທົດລອງງ່າຍໆ 1-2 ຊົ່ວໂມງໃນຊີວິດປະຈຳວັນ ເພື່ອສຳຜັດຄວາມຮູ້ສຶກແທ້ໆ ກ່ອນຕັດສິນໃຈໃຫຍ່.
              </p>
            </div>
            <div className="mt-4 pt-4 border-t border-[#E5E1D8]/60 text-xs text-[#2D4C3E] font-medium">
              ລອງກ່ອນຕັດສິນໃຈ
            </div>
          </motion.div>
        </div>
      </section>

      {/* Safety & Non-Judgment Manifesto */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="bg-[#F4EFEA] border border-[#E5E1D8] rounded-3xl p-6 sm:p-10 relative overflow-hidden">
          <div className="max-w-2xl">
            <h2 className="text-xl sm:text-2xl font-bold text-[#2D4C3E] mb-4 flex items-center gap-2.5">
              <ShieldCheck className="w-6 h-6 text-[#2D4C3E]" />
              <span>ພື້ນທີ່ປອດໄພ ທີ່ບໍ່ມີໃຜຕັດສິນເຈົ້າ</span>
            </h2>

            <div className="space-y-4 text-sm sm:text-base text-[#2D4C3E]/85">
              <p>
                ໃນໄວຮຽນ, ຫຼາຍຄົນມັກຖືກຖາມວ່າ <span className="italic font-medium">"ຈົບໄປຢາກເປັນຫຍັງ?"</span> ແລະ ມັກຖືກຄາດຫວັງໃຫ້ມີຄຳຕອບທີ່ຊັດເຈນທັນທີ. 
                ແຕ່ຄວາມຈິງແລ້ວ, ຄວາມບໍ່ແນ່ໃຈເປັນເລື່ອງທຳມະຊາດທີ່ສຸດ.
              </p>
              <p>
                Next-path ຖືກສ້າງຂຶ້ນເພື່ອເປັນເພື່ອນຮ່ວມທາງ. ບໍ່ມີການໃຫ້ຄະແນນເສັງ, ບໍ່ມີການຈັດອັນດັບຄວາມເກັ່ງ, 
                ແລະ ບໍ່ມີການຟັນທົງອາຊີບຕາຍຕົວ. ພວກເຮົາພຽງແຕ່ຊ່ວຍໃຫ້ເຈົ້າໄດ້ຍິນສຽງໃນໃຈຂອງຕົນເອງຊັດເຈນຂຶ້ນ.
              </p>
            </div>

            <div className="mt-6 pt-6 border-t border-[#E5E1D8] grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm text-[#2D4C3E]/80">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#8D5B28] shrink-0" />
                <span>ບໍ່ຂໍຊື່, ອີເມວ ຫຼື ເບີໂທລະສັບ</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#8D5B28] shrink-0" />
                <span>ບໍ່ມີການສົ່ງຕໍ່ຂໍ້ມູນໃຫ້ບຸກຄົນທີສາມ</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#8D5B28] shrink-0" />
                <span>ສາມາດຢຸດ ຫຼື ກັບມາຕອບຕໍ່ໄດ້ທຸກເວລາ</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#8D5B28] shrink-0" />
                <span>ອອກແບບມາສະເພາະສຳລັບບໍລິບົດໄວໜຸ່ມລາວ</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive FAQ / Reassurance Accordion */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-[#2D4C3E]">
            ຄຳຖາມທີ່ມັກຖາມເລື້ອຍໆ
          </h2>
          <p className="text-xs sm:text-sm text-[#2D4C3E]/75 mt-1">
            ສິ່ງທີ່ໄວໜຸ່ມຫຼາຍຄົນມັກສົງໄສກ່ອນເລີ່ມສຳຫຼວດຕົນເອງ
          </p>
        </div>

        <div className="space-y-3">
          {FAQS.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div
                key={idx}
                className="bg-[#FFFFFF] border border-[#E5E1D8] rounded-2xl overflow-hidden shadow-2xs"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-[#F9F8F5] transition-colors"
                >
                  <span className="font-bold text-sm sm:text-base text-[#2D4C3E]">
                    {faq.question}
                  </span>
                  <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="shrink-0 text-[#8D5B28]"
                  >
                    <ChevronDown className="w-5 h-5" />
                  </motion.div>
                </button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                    >
                      <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-[#2D4C3E]/80 border-t border-[#E5E1D8]/60 leading-relaxed">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </section>

      {/* Bottom Start CTA */}
      <section className="text-center max-w-xl mx-auto px-4 sm:px-6">
        <h3 className="text-xl sm:text-2xl font-bold text-[#2D4C3E] mb-3">
          ພ້ອມແລ້ວບໍ່ທີ່ຈະເລີ່ມຕົ້ນຟັງສຽງຕົນເອງ?
        </h3>
        <p className="text-sm text-[#2D4C3E]/75 mb-6">
          ໃຫ້ເວລາສັ້ນໆ ນີ້ເປັນຂອງຂວັນໃຫ້ກັບຄວາມຄິດ ແລະ ຄວາມຮູ້ສຶກຂອງເຈົ້າເອງ
        </p>
        <motion.button
          whileHover={{ scale: 1.03, y: -2 }}
          whileTap={{ scale: 0.97 }}
          onClick={onStart}
          className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-[#2D4C3E] text-[#F9F8F5] text-base font-semibold hover:bg-[#233c31] transition-all shadow-md cursor-pointer inline-flex items-center justify-center gap-2 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#2D4C3E]"
        >
          <span>ເລີ່ມຕົ້ນຕອນນີ້</span>
          <ArrowRight className="w-4 h-4" />
        </motion.button>
      </section>
    </div>
  );
};
