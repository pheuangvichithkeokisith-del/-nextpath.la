import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  MODULES,
  QUESTIONS,
  LAO_PROVINCES,
} from '../data/questionnaireData';
import { AnswersMap, Question } from '../types/questionnaire';
import {
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Sparkles,
  HelpCircle,
  RotateCcw,
  Search,
  Check,
  ChevronDown,
  Layers,
  ChevronUp,
} from 'lucide-react';

interface AssessmentPageProps {
  initialAnswers: AnswersMap;
  onSaveDraft: (answers: AnswersMap) => void;
  onSubmit: (answers: AnswersMap) => void;
  onCancel: () => void;
}

export const AssessmentPage: React.FC<AssessmentPageProps> = ({
  initialAnswers,
  onSaveDraft,
  onSubmit,
  onCancel,
}) => {
  const [answers, setAnswers] = useState<AnswersMap>(initialAnswers);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [focusedQuestionId, setFocusedQuestionId] = useState<string | null>(null);
  const [provinceSearch, setProvinceSearch] = useState<string>('');
  const [isProvinceDropdownOpen, setIsProvinceDropdownOpen] = useState<boolean>(false);
  const [draftSavedToast, setDraftSavedToast] = useState<boolean>(false);
  const [isNavDockOpen, setIsNavDockOpen] = useState<boolean>(false);

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const questionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Auto-save debounce effect
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      onSaveDraft(answers);
      setDraftSavedToast(true);
      const toastTimer = setTimeout(() => setDraftSavedToast(false), 2200);
      return () => clearTimeout(toastTimer);
    }, 600);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [answers, onSaveDraft]);

  // Answer handler for single select (radio)
  const handleSingleSelect = (questionId: string, optionId: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }));

    if (validationErrors.includes(questionId)) {
      setValidationErrors((prev) => prev.filter((id) => id !== questionId));
    }
  };

  // Answer handler for multi select (checkbox, e.g. Q9)
  const handleMultiSelect = (question: Question, optionId: string) => {
    const current = (answers[question.id] as string[]) || [];
    let updated: string[];

    if (current.includes(optionId)) {
      updated = current.filter((id) => id !== optionId);
    } else {
      if (question.maxSelections && current.length >= question.maxSelections) {
        updated = [...current.slice(1), optionId];
      } else {
        updated = [...current, optionId];
      }
    }

    setAnswers((prev) => ({
      ...prev,
      [question.id]: updated,
    }));

    if (validationErrors.includes(question.id)) {
      const minRequired = question.minSelections || 1;
      if (updated.length >= minRequired) {
        setValidationErrors((prev) => prev.filter((id) => id !== question.id));
      }
    }
  };

  // D3 Province selection handler
  const handleProvinceSelect = (provinceId: string) => {
    setAnswers((prev) => ({
      ...prev,
      D3: provinceId,
    }));
    setIsProvinceDropdownOpen(false);

    if (validationErrors.includes('D3')) {
      setValidationErrors((prev) => prev.filter((id) => id !== 'D3'));
    }
  };

  // Count answered questions
  const totalQuestions = QUESTIONS.length;
  const answeredCount = QUESTIONS.filter((q) => {
    const ans = answers[q.id];
    if (!ans) return false;
    if (Array.isArray(ans)) {
      const min = q.minSelections || 1;
      return ans.length >= min;
    }
    return true;
  }).length;

  const progressPercent = Math.round((answeredCount / totalQuestions) * 100);

  // Validate form before submission
  const validateForm = (): string[] => {
    const errors: string[] = [];

    for (const q of QUESTIONS) {
      if (q.required) {
        const val = answers[q.id];
        if (!val) {
          errors.push(q.id);
        } else if (Array.isArray(val)) {
          const min = q.minSelections || 1;
          if (val.length < min) {
            errors.push(q.id);
          }
        }
      }
    }

    return errors;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validateForm();

    if (errors.length > 0) {
      setValidationErrors(errors);
      const firstErrorId = errors[0];
      scrollToQuestion(firstErrorId);
      return;
    }

    onSubmit(answers);
  };

  // Scroll to and focus a question
  const scrollToQuestion = (questionId: string) => {
    const element = questionRefs.current[questionId];
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setFocusedQuestionId(questionId);
      setTimeout(() => {
        setFocusedQuestionId(null);
      }, 3000);
    }
  };

  const scrollToModule = (moduleId: string) => {
    const firstQ = QUESTIONS.find((q) => q.moduleId === moduleId);
    if (firstQ) {
      scrollToQuestion(firstQ.id);
    }
    setIsNavDockOpen(false);
  };

  const scrollToNextUnanswered = () => {
    const nextQ = QUESTIONS.find((q) => {
      const ans = answers[q.id];
      if (!ans) return true;
      if (Array.isArray(ans)) return ans.length < (q.minSelections || 1);
      return false;
    });
    if (nextQ) {
      scrollToQuestion(nextQ.id);
    }
    setIsNavDockOpen(false);
  };

  // Filter provinces for type-ahead
  const filteredProvinces = LAO_PROVINCES.filter(
    (p) =>
      p.nameLo.toLowerCase().includes(provinceSearch.toLowerCase()) ||
      p.nameEn.toLowerCase().includes(provinceSearch.toLowerCase())
  );

  const selectedProvince = LAO_PROVINCES.find((p) => p.id === answers['D3']);

  return (
    <div className="relative pb-24">
      {/* Skip Link for Keyboard / Screen Reader Accessibility */}
      <a
        href="#assessment-questions"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 z-50 bg-[#2D4C3E] text-[#F9F8F5] px-4 py-2 rounded-lg font-medium shadow-md"
      >
        ຂ້າມໄປຍັງຄຳຖາມແບບສຳຫຼວດ (Skip to questions)
      </a>

      {/* Sticky Progress Header with Motion */}
      <div className="sticky top-18 z-30 bg-[#F9F8F5]/95 backdrop-blur-md border-b border-[#E5E1D8] py-3 px-4 sm:px-6 transition-all shadow-xs">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          {/* Progress labels */}
          <div className="w-full sm:w-auto flex items-center justify-between sm:justify-start gap-4">
            <span className="text-sm font-semibold text-[#2D4C3E] flex items-center gap-1.5">
              <span>ຕອບແລ້ວ</span>
              <motion.span
                key={answeredCount}
                initial={{ scale: 1.3, color: '#8D5B28' }}
                animate={{ scale: 1, color: '#8D5B28' }}
                className="font-bold text-[#8D5B28]"
              >
                {answeredCount}
              </motion.span>
              <span>/</span>
              <span>{totalQuestions} ຂໍ້</span>
            </span>

            <span className="text-xs text-[#2D4C3E]/70 hidden md:inline">
              {answeredCount === totalQuestions
                ? 'ຕອບຄົບທຸກຂໍ້ແລ້ວ! ພ້ອມເບິ່ງຜົນສະທ້ອນ 🎉'
                : answeredCount >= 20
                ? 'ຍັງເຫຼືອອີກໜ້ອຍດຽວ, ຕອບສະບາຍໆ'
                : 'ຄ່ອຍໆ ຕອບຕາມຄວາມຮູ້ສຶກ'}
            </span>

            {/* Autosave status indicator with smooth AnimatePresence */}
            <AnimatePresence>
              {draftSavedToast && (
                <motion.span
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-xs text-[#2D4C3E] font-medium flex items-center gap-1"
                >
                  <Check className="w-3.5 h-3.5 text-[#2D4C3E]" />
                  <span>ບັນທຶກຮ່າງແລ້ວ</span>
                </motion.span>
              )}
            </AnimatePresence>
          </div>

          {/* Spring Progress Bar */}
          <div className="w-full sm:w-64 flex items-center gap-2">
            <div
              className="flex-1 h-2 rounded-full bg-[#E5E1D8] overflow-hidden"
              role="progressbar"
              aria-valuenow={progressPercent}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="ຄວາມຄືບໜ້າການຕອບແບບສຳຫຼວດ"
            >
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className="h-full bg-[#2D4C3E] rounded-full"
              />
            </div>
            <span className="text-xs font-semibold text-[#2D4C3E] w-9 text-right">
              {progressPercent}%
            </span>
          </div>
        </div>
      </div>

      {/* Main Form Content */}
      <div id="assessment-questions" className="max-w-3xl mx-auto px-4 sm:px-6 pt-8 space-y-12">
        {/* Intro Banner */}
        <div className="bg-[#FFFFFF] border border-[#E5E1D8] rounded-2xl p-6 shadow-xs">
          <h1 className="text-xl sm:text-2xl font-bold text-[#2D4C3E] mb-2">
            ແບບສຳຫຼວດຕົນເອງ (Self-reflection)
          </h1>
          <p className="text-sm text-[#2D4C3E]/80 leading-relaxed">
            ຄຳຖາມທັງໝົດແບ່ງອອກເປັນ 8 ພາກສ່ວນ. ບໍ່ມີການກຳນົດເວລາ ແລະ ບໍ່ມີຄຳຕອບທີ່ຖືກ ຫຼື ຜິດ.
            ເຈົ້າສາມາດເລື່ອນຕອບຢ່າງຕໍ່ເນື່ອງ (Continuous scroll).
          </p>
        </div>

        {/* Validation Errors Alert Box (if errors exist) */}
        {validationErrors.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-5 rounded-2xl bg-[#FDF3F0] border border-[#7A3E2D]/40 text-[#7A3E2D] shadow-xs space-y-3"
            role="alert"
          >
            <div className="flex items-center gap-2 font-bold text-sm sm:text-base">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>ຍັງມີບາງຂໍ້ທີ່ຍັງບໍ່ທັນໄດ້ຕອບ ຫຼື ຍັງເລືອກບໍ່ຄົບ:</span>
            </div>
            <p className="text-xs sm:text-sm text-[#7A3E2D]/90">
              ກະລຸນາກົດທີ່ລາຍການດ້ານລຸ່ມນີ້ ເພື່ອໄປຍັງຂໍ້ດັ່ງກ່າວ ແລະ ເລືອກຄຳຕອບ:
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              {validationErrors.map((errId) => {
                const questionObj = QUESTIONS.find((q) => q.id === errId);
                return (
                  <button
                    key={errId}
                    type="button"
                    onClick={() => scrollToQuestion(errId)}
                    className="px-3 py-1.5 rounded-xl bg-[#FFFFFF] border border-[#7A3E2D]/40 text-xs font-semibold text-[#7A3E2D] hover:bg-[#7A3E2D] hover:text-[#FFFFFF] transition-all cursor-pointer shadow-2xs"
                  >
                    ໄປທີ່ຂໍ້ {questionObj?.numberText || errId}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Questions grouped by Modules */}
        <form onSubmit={handleSubmit} className="space-y-12">
          {MODULES.map((module) => {
            const moduleQuestions = QUESTIONS.filter((q) => q.moduleId === module.id);
            if (moduleQuestions.length === 0) return null;

            return (
              <section
                key={module.id}
                className="space-y-6"
                aria-labelledby={`module-heading-${module.id}`}
              >
                {/* Module Header */}
                <div className="pt-4 border-t border-[#E5E1D8]">
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#8D5B28] mb-1">
                    {module.number === 0 ? (
                      <span>ຂໍ້ມູນພື້ນຖານ (Demographics)</span>
                    ) : (
                      <span>ພາກສ່ວນທີ {module.number} ຈາກ 8</span>
                    )}
                  </div>
                  <h2
                    id={`module-heading-${module.id}`}
                    className="text-lg sm:text-xl font-bold text-[#2D4C3E]"
                  >
                    {module.title}
                  </h2>
                  <p className="text-xs sm:text-sm text-[#2D4C3E]/75 mt-1">
                    {module.description}
                  </p>
                </div>

                {/* Question Cards */}
                <div className="space-y-6">
                  {moduleQuestions.map((q) => {
                    const isError = validationErrors.includes(q.id);
                    const isFocused = focusedQuestionId === q.id;
                    const currentValue = answers[q.id];

                    return (
                      <div
                        key={q.id}
                        id={`q-${q.id}`}
                        ref={(el) => { questionRefs.current[q.id] = el; }}
                        className={`bg-[#FFFFFF] border rounded-2xl p-5 sm:p-7 transition-all shadow-xs ${
                          isError
                            ? 'border-[#7A3E2D] ring-2 ring-[#7A3E2D]/20 bg-[#FDF3F0]/20'
                            : isFocused
                            ? 'border-[#8D5B28] ring-2 ring-[#8D5B28]/30 shadow-md'
                            : 'border-[#E5E1D8]'
                        }`}
                      >
                        {/* Question Title & Number */}
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-bold text-xs px-2.5 py-0.5 rounded-md bg-[#F4EFEA] text-[#8D5B28]">
                                {q.numberText}
                              </span>
                              {q.required && (
                                <span className="text-xs text-[#7A3E2D] font-medium">* ຈຳເປັນ</span>
                              )}
                              {q.id === 'Q8b' && (
                                <span className="font-semibold text-xs px-2.5 py-0.5 rounded-md bg-[#2D4C3E]/10 text-[#2D4C3E] border border-[#2D4C3E]/20 flex items-center gap-1">
                                  <Sparkles className="w-3 h-3 text-[#8D5B28]" />
                                  <span>Domain Filter (ຈຸດປ່ຽນກຸ່ມອາຊີບ 6 Clusters)</span>
                                </span>
                              )}
                            </div>
                            <h3 className="font-bold text-base sm:text-lg text-[#2D4C3E] leading-snug">
                              {q.title}
                            </h3>
                          </div>
                        </div>

                        {q.helpText && (
                          <p className="text-xs sm:text-sm text-[#2D4C3E]/70 mb-4 leading-relaxed">
                            {q.helpText}
                          </p>
                        )}

                        {/* Special: D3 Province Searchable Type-Ahead Select */}
                        {q.id === 'D3' ? (
                          <div className="space-y-3 font-lao-looped">
                            <div className="relative">
                              <button
                                type="button"
                                onClick={() => setIsProvinceDropdownOpen(!isProvinceDropdownOpen)}
                                className={`w-full text-left p-3.5 rounded-xl border bg-[#F9F8F5] text-sm flex items-center justify-between cursor-pointer focus-visible:ring-2 focus-visible:ring-[#8D5B28] ${
                                  isError ? 'border-[#7A3E2D]' : 'border-[#E5E1D8]'
                                }`}
                                aria-haspopup="listbox"
                                aria-expanded={isProvinceDropdownOpen}
                              >
                                <span className={selectedProvince ? 'text-[#2D4C3E] font-medium' : 'text-[#2D4C3E]/50'}>
                                  {selectedProvince
                                    ? `${selectedProvince.nameLo} (${selectedProvince.nameEn})`
                                    : 'ກະລຸນາເລືອກແຂວງ ຫຼື ນະຄອນຫຼວງ...'}
                                </span>
                                <ChevronDown className="w-4 h-4 text-[#2D4C3E]/60" />
                              </button>

                              {isProvinceDropdownOpen && (
                                <div className="absolute top-full left-0 right-0 mt-2 bg-[#FFFFFF] border border-[#E5E1D8] rounded-2xl shadow-xl z-20 overflow-hidden">
                                  <div className="p-3 border-b border-[#E5E1D8] bg-[#F9F8F5] flex items-center gap-2">
                                    <Search className="w-4 h-4 text-[#8D5B28] shrink-0" />
                                    <input
                                      type="text"
                                      value={provinceSearch}
                                      onChange={(e) => setProvinceSearch(e.target.value)}
                                      placeholder="ພິມຊື່ແຂວງເພື່ອຄົ້ນຫາ..."
                                      className="w-full bg-transparent text-sm text-[#2D4C3E] focus:outline-none placeholder:text-[#2D4C3E]/40"
                                      autoFocus
                                    />
                                  </div>

                                  <div className="max-h-60 overflow-y-auto p-1 divide-y divide-[#E5E1D8]/40" role="listbox">
                                    {filteredProvinces.length === 0 ? (
                                      <div className="p-4 text-xs text-center text-[#2D4C3E]/60">
                                        ບໍ່ພົບຊື່ແຂວງທີ່ກົງກັບຄຳຄົ້ນຫາ
                                      </div>
                                    ) : (
                                      filteredProvinces.map((prov) => {
                                        const isSelected = answers['D3'] === prov.id;
                                        return (
                                          <button
                                            key={prov.id}
                                            type="button"
                                            onClick={() => handleProvinceSelect(prov.id)}
                                            className={`w-full text-left px-4 py-2.5 text-sm flex items-center justify-between rounded-lg transition-colors cursor-pointer ${
                                              isSelected
                                                ? 'bg-[#EBF2EE] font-semibold text-[#2D4C3E]'
                                                : 'hover:bg-[#F4EFEA] text-[#2D4C3E]'
                                            }`}
                                            role="option"
                                            aria-selected={isSelected}
                                          >
                                            <div>
                                              <span>{prov.nameLo}</span>
                                              <span className="text-xs text-[#8D5B28] ml-2">({prov.nameEn})</span>
                                            </div>
                                            {isSelected && <Check className="w-4 h-4 text-[#2D4C3E]" />}
                                          </button>
                                        );
                                      })
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        ) : q.type === 'multiple' ? (
                          /* Multi-Select Checkboxes (e.g. Q9) */
                          <div className="space-y-2.5">
                            {q.options.map((opt) => {
                              const checked = Array.isArray(currentValue) && currentValue.includes(opt.id);
                              return (
                                <motion.label
                                  key={opt.id}
                                  whileHover={{ scale: 1.006 }}
                                  whileTap={{ scale: 0.992 }}
                                  className={`flex items-start gap-3 p-3.5 rounded-xl border transition-all cursor-pointer select-none ${
                                    checked
                                      ? 'bg-[#EBF2EE] border-[#2D4C3E] text-[#2D4C3E] shadow-2xs'
                                      : 'bg-[#F9F8F5]/80 border-[#E5E1D8] hover:bg-[#F4EFEA] text-[#2D4C3E]/90'
                                  }`}
                                >
                                  <input
                                    type="checkbox"
                                    name={q.id}
                                    value={opt.id}
                                    checked={checked}
                                    onChange={() => handleMultiSelect(q, opt.id)}
                                    className="mt-1 w-4 h-4 rounded border-[#8D5B28] text-[#2D4C3E] focus:ring-[#8D5B28] accent-[#2D4C3E] cursor-pointer"
                                  />
                                  <div className="flex-1 text-sm leading-relaxed">
                                    <span>{opt.label}</span>
                                    {opt.enHint && (
                                      <span className="text-xs text-[#8D5B28] ml-1.5 font-normal">
                                        ({opt.enHint})
                                      </span>
                                    )}
                                  </div>
                                </motion.label>
                              );
                            })}
                          </div>
                        ) : (
                          /* Single Select Radios */
                          <div className="space-y-2.5">
                            {q.options.map((opt) => {
                              const isSelected = currentValue === opt.id;
                              return (
                                <motion.label
                                  key={opt.id}
                                  whileHover={{ scale: 1.006 }}
                                  whileTap={{ scale: 0.992 }}
                                  className={`flex items-start gap-3 p-3.5 rounded-xl border transition-all cursor-pointer select-none ${
                                    isSelected
                                      ? 'bg-[#EBF2EE] border-[#2D4C3E] text-[#2D4C3E] shadow-2xs font-medium'
                                      : 'bg-[#F9F8F5]/80 border-[#E5E1D8] hover:bg-[#F4EFEA] text-[#2D4C3E]/90'
                                  }`}
                                >
                                  <input
                                    type="radio"
                                    name={q.id}
                                    value={opt.id}
                                    checked={isSelected}
                                    onChange={() => handleSingleSelect(q.id, opt.id)}
                                    className="mt-1 w-4 h-4 border-[#8D5B28] text-[#2D4C3E] focus:ring-[#8D5B28] accent-[#2D4C3E] cursor-pointer"
                                  />
                                  <div className="flex-1 text-sm leading-relaxed">
                                    <span>{opt.label}</span>
                                    {opt.enHint && (
                                      <span className="text-xs text-[#8D5B28] ml-1.5 font-normal">
                                        ({opt.enHint})
                                      </span>
                                    )}
                                  </div>
                                </motion.label>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}

          {/* Submission Bar */}
          <div className="pt-8 border-t border-[#E5E1D8] flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
              type="button"
              onClick={onCancel}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl border border-[#E5E1D8] text-sm font-medium text-[#2D4C3E]/80 hover:bg-[#F4EFEA] transition-colors cursor-pointer"
            >
              ກັບຄືນ (Back)
            </button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="w-full sm:w-auto px-10 py-4 rounded-2xl bg-[#2D4C3E] text-[#F9F8F5] text-base font-semibold hover:bg-[#233c31] transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#2D4C3E]"
            >
              <span>ສຳເລັດການຕອບ ແລະ ເບິ່ງຜົນສະທ້ອນ</span>
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </div>
        </form>
      </div>

      {/* Floating Quick Navigation Helper Dock */}
      <div className="fixed bottom-6 right-6 z-40">
        <AnimatePresence>
          {isNavDockOpen && (
            <motion.div
              initial={{ opacity: 0, y: 15, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 15, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="mb-3 w-72 bg-[#FFFFFF] border border-[#E5E1D8] rounded-2xl shadow-xl p-4 space-y-3 font-sans"
            >
              <div className="flex items-center justify-between border-b border-[#E5E1D8]/60 pb-2">
                <span className="text-xs font-bold text-[#2D4C3E] flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-[#8D5B28]" />
                  <span>ຂ້າມໄປຍັງພາກສ່ວນຕ່າງໆ</span>
                </span>
                <span className="text-xs text-[#8D5B28] font-semibold">{progressPercent}%</span>
              </div>

              <div className="max-h-56 overflow-y-auto space-y-1 pr-1 scrollbar-thin text-xs">
                {MODULES.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => scrollToModule(m.id)}
                    className="w-full text-left p-2 rounded-lg hover:bg-[#F9F8F5] text-[#2D4C3E] truncate flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <span className="truncate">
                      {m.number === 0 ? 'Demographics' : `ສ່ວນ ${m.number}: ${m.title}`}
                    </span>
                  </button>
                ))}
              </div>

              {answeredCount < totalQuestions && (
                <button
                  type="button"
                  onClick={scrollToNextUnanswered}
                  className="w-full py-2 px-3 rounded-xl bg-[#EBF2EE] text-[#2D4C3E] text-xs font-semibold hover:bg-[#2D4C3E] hover:text-[#F9F8F5] transition-all flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>ໄປຂໍ້ທີ່ຍັງບໍ່ຕອບຕໍ່ໄປ</span>
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          type="button"
          onClick={() => setIsNavDockOpen(!isNavDockOpen)}
          className="px-4 py-3 rounded-full bg-[#2D4C3E] text-[#F9F8F5] text-xs sm:text-sm font-semibold shadow-lg hover:shadow-xl flex items-center gap-2 cursor-pointer border border-[#E5E1D8]/20 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#2D4C3E]"
        >
          <Layers className="w-4 h-4 text-[#E5E1D8]" />
          <span>{answeredCount}/{totalQuestions} ຂໍ້</span>
          {isNavDockOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
        </motion.button>
      </div>
    </div>
  );
};
