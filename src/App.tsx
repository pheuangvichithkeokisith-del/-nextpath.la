import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { LandingPage } from './components/LandingPage';
import { IntroductionPage } from './components/IntroductionPage';
import { AssessmentPage } from './components/AssessmentPage';
import { ProcessingPage } from './components/ProcessingPage';
import { ReportPage } from './components/ReportPage';
import { FeedbackPage } from './components/FeedbackPage';
import { InsightsPage } from './components/InsightsPage';
import { AnswersMap, FeedbackData, ReflectionReport } from './types/questionnaire';
import {
  clearActiveReport,
  clearDraftAnswers,
  getOrCreateSessionId,
  loadActiveReport,
  loadDraftAnswers,
} from './utils/storage';
import {
  apiGetDraft,
  apiGetReport,
  apiSaveDraft,
  apiSendFeedback,
  apiSubmitAssessment,
} from './utils/api';

export default function App() {
  const [currentPath, setCurrentPath] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const p = window.location.pathname;
      if (['/', '/introduction', '/assessment', '/processing', '/report', '/feedback', '/insights'].includes(p)) {
        return p;
      }
    }
    return '/';
  });

  const [sessionId] = useState<string>(() => getOrCreateSessionId());
  const [draftAnswers, setDraftAnswers] = useState<AnswersMap>(() => loadDraftAnswers() || {});
  const [activeReport, setActiveReport] = useState<ReflectionReport | null>(() => loadActiveReport());
  const [processingError, setProcessingError] = useState<string | null>(null);

  // Sync route with browser history
  const navigate = useCallback((path: string) => {
    if (typeof window !== 'undefined') {
      if (window.location.pathname !== path) {
        window.history.pushState({}, '', path);
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    setCurrentPath(path);
  }, []);

  // Listen to popstate (back/forward browser buttons)
  useEffect(() => {
    const handlePopState = () => {
      const p = window.location.pathname;
      if (['/', '/introduction', '/assessment', '/processing', '/report', '/feedback', '/insights'].includes(p)) {
        setCurrentPath(p);
      } else {
        setCurrentPath('/');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Check backend for draft and report on mount
  useEffect(() => {
    async function syncWithBackend() {
      if (sessionId) {
        const serverDraft = await apiGetDraft(sessionId);
        if (serverDraft && Object.keys(serverDraft).length > 0) {
          setDraftAnswers(serverDraft);
        }
        const serverReport = await apiGetReport(sessionId);
        if (serverReport) {
          setActiveReport(serverReport);
        }
      }
    }
    syncWithBackend();
  }, [sessionId]);

  // Save draft answers to state and backend/local storage
  const handleSaveDraft = useCallback((answers: AnswersMap) => {
    setDraftAnswers(answers);
    apiSaveDraft(sessionId, answers);
  }, [sessionId]);

  // Submit assessment answers: proceed to processing and compute report via backend
  const handleSubmitAssessment = useCallback(async (answers: AnswersMap) => {
    try {
      setProcessingError(null);
      setDraftAnswers(answers);
      navigate('/processing');

      // Generate report via backend (with fallback)
      const report = await apiSubmitAssessment(sessionId, answers);
      setActiveReport(report);
    } catch (err) {
      console.error('Failed to generate report', err);
      setProcessingError('ບໍ່ສາມາດສັງເຄາະຜົນສະທ້ອນໄດ້ ກະລຸນາລອງໃໝ່ອີກຄັ້ງ');
    }
  }, [navigate, sessionId]);

  // Restart/Retake assessment
  const handleRetake = useCallback(() => {
    clearActiveReport();
    clearDraftAnswers();
    setActiveReport(null);
    setDraftAnswers({});
    navigate('/introduction');
  }, [navigate]);

  // Submit feedback
  const handleSubmitFeedback = useCallback((feedback: FeedbackData) => {
    apiSendFeedback(feedback);
  }, []);

  const hasSavedDraft = Object.keys(draftAnswers).length > 0;

  return (
    <div className="min-h-screen flex flex-col bg-[#F9F8F5] paper-grain font-lao-sans text-[#2D4C3E]">
      {/* Universal Navigation Header */}
      <Header
        currentPath={currentPath}
        onNavigate={navigate}
        hasActiveReport={!!activeReport}
      />

      {/* Main Dynamic View */}
      <main className="flex-1 w-full overflow-hidden" id="main-content">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPath}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
          >
            {currentPath === '/' && (
              <LandingPage
                onStart={() => navigate('/introduction')}
                hasSavedDraft={hasSavedDraft}
                onResumeDraft={() => navigate('/assessment')}
              />
            )}

            {currentPath === '/introduction' && (
              <IntroductionPage
                onProceed={() => navigate('/assessment')}
                onBack={() => navigate('/')}
              />
            )}

            {currentPath === '/assessment' && (
              <AssessmentPage
                initialAnswers={draftAnswers}
                onSaveDraft={handleSaveDraft}
                onSubmit={handleSubmitAssessment}
                onCancel={() => navigate('/')}
              />
            )}

            {currentPath === '/processing' && (
              <ProcessingPage
                isError={!!processingError}
                errorMessage={processingError || undefined}
                onErrorRetry={() => handleSubmitAssessment(draftAnswers)}
                onComplete={() => navigate('/report')}
              />
            )}

            {currentPath === '/report' && (
              <ReportPage
                report={activeReport}
                onRetake={handleRetake}
                onNavigateFeedback={() => navigate('/feedback')}
              />
            )}

            {currentPath === '/feedback' && (
              <FeedbackPage
                sessionId={sessionId}
                hasActiveReport={!!activeReport}
                onSubmitFeedback={handleSubmitFeedback}
                onNavigateHome={() => navigate('/')}
                onNavigateReport={() => navigate('/report')}
              />
            )}

            {currentPath === '/insights' && (
              <InsightsPage
                onBack={() => navigate('/')}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Universal Brand Footer */}
      <Footer onNavigate={navigate} />
    </div>
  );
}
