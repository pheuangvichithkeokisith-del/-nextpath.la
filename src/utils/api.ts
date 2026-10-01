import { AnswersMap, FeedbackData, ReflectionReport } from '../types/questionnaire';
import { calculateReflectionReport } from './reflectionEngine';
import {
  clearDraftAnswers,
  loadActiveReport,
  loadDraftAnswers,
  saveActiveReport,
  saveDraftAnswers,
  saveFeedback,
} from './storage';

export interface AdminInsights {
  totalReports: number;
  totalDrafts: number;
  provinceDist: Array<{ province: string; count: number }>;
  dimensionDist: Array<{ dominant_dimension: string; count: number }>;
  feedbackStats: {
    totalFeedback: number;
    avgRating: number;
    comfortablePercentage: number;
  };
  recentComments: Array<{ comments: string; rating: number; created_at: string }>;
}

export async function apiSaveDraft(sessionId: string, answers: AnswersMap): Promise<boolean> {
  // Always update local storage first
  saveDraftAnswers(answers);

  try {
    const res = await fetch('/api/assessment/draft', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, answers }),
    });
    return res.ok;
  } catch (err) {
    console.warn('API save draft offline/fallback', err);
    return false;
  }
}

export async function apiGetDraft(sessionId: string): Promise<AnswersMap | null> {
  try {
    const res = await fetch(`/api/assessment/draft/${sessionId}`);
    if (res.ok) {
      const data = await res.json();
      if (data.draft?.answers) {
        return data.draft.answers;
      }
    }
  } catch (err) {
    console.warn('API get draft offline/fallback', err);
  }
  return loadDraftAnswers();
}

export async function apiSubmitAssessment(
  sessionId: string,
  answers: AnswersMap
): Promise<ReflectionReport> {
  // Try sending to backend
  try {
    const res = await fetch('/api/assessment/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, answers }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.report) {
        saveActiveReport(data.report);
        clearDraftAnswers();
        return data.report;
      }
    }
  } catch (err) {
    console.warn('API submit assessment offline/fallback', err);
  }

  // Fallback to client-side reflection calculation
  const fallbackReport = calculateReflectionReport(answers, sessionId);
  saveActiveReport(fallbackReport);
  clearDraftAnswers();
  return fallbackReport;
}

export async function apiGetReport(sessionId: string): Promise<ReflectionReport | null> {
  try {
    const res = await fetch(`/api/reports/${sessionId}`);
    if (res.ok) {
      const data = await res.json();
      if (data.report) {
        return data.report;
      }
    }
  } catch (err) {
    console.warn('API get report offline/fallback', err);
  }
  return loadActiveReport();
}

export async function apiSendFeedback(feedback: FeedbackData): Promise<boolean> {
  // Always update local storage
  saveFeedback(feedback);

  try {
    const res = await fetch('/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: feedback.sessionId,
        rating: feedback.accuracyRating,
        feltComfortable: feedback.feltComfortable,
        comments: feedback.comments,
      }),
    });
    return res.ok;
  } catch (err) {
    console.warn('API send feedback offline/fallback', err);
    return false;
  }
}

export async function apiGetInsights(): Promise<AdminInsights | null> {
  try {
    const res = await fetch('/api/admin/insights');
    if (res.ok) {
      const data = await res.json();
      return data.insights;
    }
  } catch (err) {
    console.warn('API get insights offline/fallback', err);
  }
  return null;
}
