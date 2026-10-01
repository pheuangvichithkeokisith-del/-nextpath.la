import { AnswersMap, FeedbackData, ReflectionReport } from '../types/questionnaire';

const DRAFT_STORAGE_KEY = 'nextpath_draft_answers_v1';
const REPORT_STORAGE_KEY = 'nextpath_active_report_v1';
const SESSION_STORAGE_KEY = 'nextpath_current_session_v1';
const FEEDBACK_STORAGE_KEY = 'nextpath_user_feedback_v1';

export function getOrCreateSessionId(): string {
  try {
    let id = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!id) {
      if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        id = 'np_' + crypto.randomUUID();
      } else {
        id = 'np_' + Math.random().toString(36).substring(2, 15) + '_' + Date.now().toString(36);
      }
      localStorage.setItem(SESSION_STORAGE_KEY, id);
    }
    return id;
  } catch {
    return 'np_guest_' + Date.now();
  }
}

export function saveDraftAnswers(answers: AnswersMap): void {
  try {
    localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(answers));
  } catch (e) {
    console.warn('Could not save draft to localStorage', e);
  }
}

export function loadDraftAnswers(): AnswersMap | null {
  try {
    const raw = localStorage.getItem(DRAFT_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function clearDraftAnswers(): void {
  try {
    localStorage.removeItem(DRAFT_STORAGE_KEY);
  } catch (e) {
    console.warn('Could not clear draft', e);
  }
}

export function saveActiveReport(report: ReflectionReport): void {
  try {
    localStorage.setItem(REPORT_STORAGE_KEY, JSON.stringify(report));
  } catch (e) {
    console.warn('Could not save report to localStorage', e);
  }
}

export function loadActiveReport(): ReflectionReport | null {
  try {
    const raw = localStorage.getItem(REPORT_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function clearActiveReport(): void {
  try {
    localStorage.removeItem(REPORT_STORAGE_KEY);
  } catch (e) {
    console.warn('Could not clear report', e);
  }
}

export function saveFeedback(feedback: FeedbackData): void {
  try {
    const listRaw = localStorage.getItem(FEEDBACK_STORAGE_KEY);
    const list: FeedbackData[] = listRaw ? JSON.parse(listRaw) : [];
    list.push(feedback);
    localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(list));
  } catch (e) {
    console.warn('Could not save feedback', e);
  }
}
