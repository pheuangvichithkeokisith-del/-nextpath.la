import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Compass, Sparkles, CheckCircle2, AlertCircle, ArrowRight, RotateCw, Check } from 'lucide-react';

interface ProcessingPageProps {
  onComplete: () => void;
  onErrorRetry: () => void;
  isError?: boolean;
  errorMessage?: string;
}

const WARM_MESSAGES = [
  'ກຳລັງອ່ານຮູບແບບຄວາມສົນໃຈ ແລະ ທ່າແຮງຈາກຄຳຕອບ...',
  'ກຳລັງຈັດຮຽງຄຸນຄ່າ ແລະ ບັນຍາກາດການເຮັດວຽກທີ່ທ່ານມັກ...',
  'ກຳລັງເຊື່ອມໂຍງລະຫວ່າງ STEM ແລະ ໂອກາດຕົວຈິງໃນປະເທດລາວ...',
  'ກຳລັງສ້າງຄຳແນະນຳການທົດລອງນ້ອຍໆ (Micro-experiments)...',
  'ກຳລັງກຽມຄຳແປສຳລັບອະທິບາຍໃຫ້ຄອບຄົວເຂົ້າໃຈ (Family Bridge)...',
];

const ORBIT_DOMAINS = [
  { label: 'Software & AI', color: '#2D4C3E', angle: 0 },
  { label: 'Data & Analytics', color: '#8D5B28', angle: 60 },
  { label: 'Hardware & IoT', color: '#7A3E2D', angle: 120 },
  { label: 'Climate & Ecology', color: '#2D4C3E', angle: 180 },
  { label: 'Enterprise / PM', color: '#8D5B28', angle: 240 },
  { label: 'Creative Tech', color: '#7A3E2D', angle: 300 },
];

export const ProcessingPage: React.FC<ProcessingPageProps> = ({
  onComplete,
  onErrorRetry,
  isError = false,
  errorMessage,
}) => {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [progress, setProgress] = useState(12);
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    if (isError) return;

    // Cycle through messages smoothly
    const messageInterval = setInterval(() => {
      setCurrentMessageIndex((prev) => (prev + 1) % WARM_MESSAGES.length);
    }, 1300);

    // Increment progress gently
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          setIsDone(true);
          return 100;
        }
        return prev + 12;
      });
    }, 380);

    return () => {
      clearInterval(messageInterval);
      clearInterval(progressInterval);
    };
  }, [isError]);

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 sm:px-6 py-12 relative overflow-hidden">
      {/* Dynamic ambient backdrop light */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#8D5B28]/10 rounded-full blur-3xl pointer-events-none"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="max-w-md w-full bg-[#FFFFFF] border border-[#E5E1D8] rounded-3xl p-8 sm:p-10 shadow-sm text-center relative overflow-hidden"
      >
        {isError ? (
          /* Error State */
          <div className="space-y-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="w-16 h-16 rounded-2xl bg-[#FDF3F0] text-[#7A3E2D] flex items-center justify-center mx-auto shadow-xs"
            >
              <AlertCircle className="w-8 h-8" />
            </motion.div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold text-[#7A3E2D]">ເກີດຂໍ້ຂັດຂ້ອງໃນການປະມວນຜົນ</h2>
              <p className="text-sm text-[#2D4C3E]/80 leading-relaxed">
                {errorMessage || 'ຂໍອະໄພ, ບໍ່ສາມາດສັງເຄາະຜົນສະທ້ອນໄດ້ໃນຕອນນີ້. ຂໍ້ມູນຄຳຕອບຂອງທ່ານຍັງຄົງປອດໄພ.'}
              </p>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onErrorRetry}
              className="w-full py-3.5 px-6 rounded-2xl bg-[#2D4C3E] text-[#F9F8F5] text-sm font-semibold hover:bg-[#233c31] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <RotateCw className="w-4 h-4" />
              <span>ລອງໃໝ່ອີກຄັ້ງ (Retry)</span>
            </motion.button>
          </div>
        ) : (
          /* Multi-Orbit Compass Synthesis Animation */
          <div className="space-y-8 relative z-10">
            {/* Multi-orbit animation container */}
            <div className="relative w-40 h-40 mx-auto flex items-center justify-center">
              {/* Outer Orbit Ring */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-0 rounded-full border border-dashed border-[#E5E1D8]"
              >
                {/* Orbital Domain Dots */}
                {ORBIT_DOMAINS.map((domain, idx) => {
                  const rad = (domain.angle * Math.PI) / 180;
                  const r = 74; // orbit radius
                  const x = 80 + r * Math.cos(rad) - 5;
                  const y = 80 + r * Math.sin(rad) - 5;
                  return (
                    <motion.div
                      key={idx}
                      style={{
                        position: 'absolute',
                        left: `${x}px`,
                        top: `${y}px`,
                        backgroundColor: domain.color,
                      }}
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{ duration: 2, delay: idx * 0.3, repeat: Infinity }}
                      className="w-2.5 h-2.5 rounded-full shadow-xs"
                    />
                  );
                })}
              </motion.div>

              {/* Middle Reverse Rotating Ring */}
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
                className="absolute w-28 h-28 rounded-full border border-[#8D5B28]/20"
              />

              {/* Center Pulsing Compass Core */}
              <motion.div
                animate={isDone ? { scale: [1, 1.08, 1] } : { scale: [1, 1.04, 1] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-md transition-colors duration-500 ${
                  isDone ? 'bg-[#2D4C3E] text-[#F9F8F5]' : 'bg-[#2D4C3E] text-[#F9F8F5]'
                }`}
              >
                {isDone ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                  >
                    <Check className="w-8 h-8 text-[#EBF2EE]" />
                  </motion.div>
                ) : (
                  <Compass className="w-8 h-8 text-[#E5E1D8] animate-spin-slow" />
                )}
              </motion.div>
            </div>

            {/* Rotating Lao Message with AnimatePresence */}
            <div className="space-y-2 min-h-[72px]">
              <AnimatePresence mode="wait">
                <motion.p
                  key={isDone ? 'done' : currentMessageIndex}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.3 }}
                  className="text-base sm:text-lg font-semibold text-[#2D4C3E]"
                >
                  {isDone ? 'ການຈັດກຽມຜົນສະທ້ອນສຳເລັດແລ້ວ! 🎉' : WARM_MESSAGES[currentMessageIndex]}
                </motion.p>
              </AnimatePresence>
              <p className="text-xs text-[#2D4C3E]/60">
                Next-path ພຽງແຕ່ຊ່ວຍສະທ້ອນສິ່ງທີ່ເຈົ້າຕອບ ບໍ່ໄດ້ຕັດສິນອະນາຄົດແທນເຈົ້າ
              </p>
            </div>

            {/* Fluid Progress Bar */}
            <div className="space-y-2">
              <div className="w-full h-2.5 rounded-full bg-[#E5E1D8] overflow-hidden p-0.5">
                <motion.div
                  initial={{ width: '10%' }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                  className={`h-full rounded-full transition-colors duration-300 ${
                    isDone ? 'bg-[#2D4C3E]' : 'bg-[#8D5B28]'
                  }`}
                />
              </div>
              <div className="flex justify-between text-xs text-[#2D4C3E]/70 font-medium px-1">
                <span>{isDone ? 'ພ້ອມເປີດອ່ານ' : 'ກຳລັງສັງເຄາະ...'}</span>
                <span>{progress}%</span>
              </div>
            </div>

            {/* View Result Action Button */}
            <motion.button
              whileHover={isDone ? { scale: 1.03 } : {}}
              whileTap={isDone ? { scale: 0.98 } : {}}
              onClick={onComplete}
              disabled={!isDone}
              className={`w-full py-4 px-6 rounded-2xl text-base font-semibold transition-all flex items-center justify-center gap-2 ${
                isDone
                  ? 'bg-[#2D4C3E] text-[#F9F8F5] hover:bg-[#233c31] shadow-md hover:shadow-lg cursor-pointer focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#2D4C3E]'
                  : 'bg-[#E5E1D8] text-[#2D4C3E]/40 cursor-not-allowed'
              }`}
              aria-disabled={!isDone}
            >
              <span>{isDone ? 'ເປີດອ່ານຜົນສະທ້ອນຂອງທ່ານ' : 'ກຳລັງກະກຽມຂໍ້ມູນ...'}</span>
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </div>
        )}
      </motion.div>
    </div>
  );
};
