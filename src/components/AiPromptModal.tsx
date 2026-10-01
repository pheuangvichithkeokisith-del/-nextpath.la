import React, { useState } from 'react';
import { Copy, Check, ExternalLink, X, ShieldAlert, Sparkles, MessageSquare } from 'lucide-react';

interface AiPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  markdownContent: string;
}

export const AiPromptModal: React.FC<AiPromptModalProps> = ({
  isOpen,
  onClose,
  markdownContent,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(markdownContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
      const textArea = document.createElement('textarea');
      textArea.value = markdownContent;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div
        className="bg-[#FFFFFF] border border-[#E5E1D8] rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="ai-modal-title"
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-[#E5E1D8] flex items-center justify-between bg-[#F9F8F5]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#2D4C3E] text-[#F9F8F5] flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-[#E5E1D8]" />
            </div>
            <div>
              <h2 id="ai-modal-title" className="font-bold text-base sm:text-lg text-[#2D4C3E]">
                ຄັດລອກຄຳຖາມໄປຄຸຍກັບ AI
              </h2>
              <p className="text-xs text-[#2D4C3E]/70">
                ໃຊ້ເປັນຕົວຊ່ວຍຄິດ ແລະ ສຳຫຼວດໄອເດຍຕໍ່ຍອດກັບ ChatGPT, Claude ຫຼື Gemini
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#2D4C3E]/60 hover:text-[#2D4C3E] hover:bg-[#E5E1D8]/50 transition-colors cursor-pointer"
            aria-label="ປິດໜ້າຕ່າງ"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-sm">
          {/* Privacy & Safety Warning Notice */}
          <div className="p-4 rounded-2xl bg-[#FDF3F0] border border-[#7A3E2D]/30 flex items-start gap-3 text-xs sm:text-sm text-[#7A3E2D]">
            <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold block">ຂໍ້ຄວນລະວັງເພື່ອຄວາມປອດໄພ</span>
              <p className="leading-relaxed">
                1. ກະລຸນາກວດສອບຂໍ້ຄວາມກ່ອນສົ່ງ. ຢ່າໃສ່ຂໍ້ມູນສ່ວນຕົວລະອຽດ (ເຊັ່ນ: ທີ່ຢູ່ແທ້ ຫຼື ລະຫັດຜ່ານ).<br />
                2. AI ເປັນພຽງ "ຜູ້ຊ່ວຍຄິດ" ເທົ່ານັ້ນ ບໍ່ແມ່ນຜູ້ຕັດສິນ ຫຼື ກຳນົດອະນາຄົດຂອງທ່ານ.
              </p>
            </div>
          </div>

          {/* Markdown Content Preview */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-[#2D4C3E]/80">
                ຂໍ້ຄວາມທີ່ກຽມໄວ້ (Markdown Format):
              </label>
              <button
                onClick={handleCopy}
                className="text-xs font-semibold text-[#8D5B28] hover:text-[#2D4C3E] flex items-center gap-1 cursor-pointer transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'ຄັດລອກແລ້ວ!' : 'ຄັດລອກທັງໝົດ'}</span>
              </button>
            </div>
            <pre className="p-4 rounded-2xl bg-[#F9F8F5] border border-[#E5E1D8] text-xs font-mono text-[#2D4C3E] whitespace-pre-wrap max-h-56 overflow-y-auto leading-relaxed select-all">
              {markdownContent}
            </pre>
          </div>

          {/* Quick AI Launch Links */}
          <div className="space-y-2 pt-2 border-t border-[#E5E1D8]">
            <span className="text-xs font-semibold text-[#2D4C3E] block">
              ເລືອກເປີດບໍລິການ AI ທີ່ທ່ານຕ້ອງການ:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <a
                href="https://chatgpt.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-xl border border-[#E5E1D8] hover:border-[#2D4C3E] bg-[#FFFFFF] hover:bg-[#F9F8F5] flex items-center justify-between text-xs font-medium text-[#2D4C3E] transition-all cursor-pointer"
              >
                <span>ໄປທີ່ ChatGPT</span>
                <ExternalLink className="w-3.5 h-3.5 text-[#2D4C3E]/60" />
              </a>

              <a
                href="https://claude.ai/"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-xl border border-[#E5E1D8] hover:border-[#2D4C3E] bg-[#FFFFFF] hover:bg-[#F9F8F5] flex items-center justify-between text-xs font-medium text-[#2D4C3E] transition-all cursor-pointer"
              >
                <span>ໄປທີ່ Claude</span>
                <ExternalLink className="w-3.5 h-3.5 text-[#2D4C3E]/60" />
              </a>

              <a
                href="https://gemini.google.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-xl border border-[#E5E1D8] hover:border-[#2D4C3E] bg-[#FFFFFF] hover:bg-[#F9F8F5] flex items-center justify-between text-xs font-medium text-[#2D4C3E] transition-all cursor-pointer"
              >
                <span>ໄປທີ່ Gemini</span>
                <ExternalLink className="w-3.5 h-3.5 text-[#2D4C3E]/60" />
              </a>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-[#E5E1D8] bg-[#F9F8F5] flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-[#E5E1D8] text-xs sm:text-sm font-medium text-[#2D4C3E]/80 hover:bg-[#F4EFEA] transition-colors cursor-pointer"
          >
            ປິດ (Close)
          </button>

          <button
            onClick={handleCopy}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#2D4C3E] text-[#F9F8F5] text-xs sm:text-sm font-semibold hover:bg-[#233c31] transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                <span>ຄັດລອກສຳເລັດແລ້ວ</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>ຄັດລອກຂໍ້ຄວາມທັງໝົດ</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
