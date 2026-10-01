import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import fs from 'fs';

// Ensure data directory exists
const DATA_DIR = path.resolve(process.cwd(), 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DB_FILE = path.join(DATA_DIR, 'nextpath.db');
const db = new DatabaseSync(DB_FILE);

// Enable Write-Ahead Logging (WAL) for concurrent read/write performance
db.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA synchronous = NORMAL;
`);

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS drafts (
    session_id TEXT PRIMARY KEY,
    answers_json TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS reports (
    session_id TEXT PRIMARY KEY,
    province TEXT,
    age_stage TEXT,
    dominant_dimension TEXT,
    report_json TEXT NOT NULL,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS feedbacks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT,
    rating INTEGER NOT NULL,
    felt_comfortable INTEGER NOT NULL,
    comments TEXT,
    created_at TEXT NOT NULL
  );
`);

export interface DraftRecord {
  session_id: string;
  answers_json: string;
  updated_at: string;
}

export interface ReportRecord {
  session_id: string;
  province: string;
  age_stage: string;
  dominant_dimension: string;
  report_json: string;
  created_at: string;
}

export interface FeedbackRecord {
  id?: number;
  session_id: string;
  rating: number;
  felt_comfortable: number;
  comments: string;
  created_at: string;
}

export const dbService = {
  // Drafts
  saveDraft(sessionId: string, answers: any) {
    const stmt = db.prepare(`
      INSERT INTO drafts (session_id, answers_json, updated_at)
      VALUES (?, ?, ?)
      ON CONFLICT(session_id) DO UPDATE SET
        answers_json = excluded.answers_json,
        updated_at = excluded.updated_at
    `);
    const now = new Date().toISOString();
    stmt.run(sessionId, JSON.stringify(answers), now);
    return { sessionId, updatedAt: now };
  },

  getDraft(sessionId: string) {
    const stmt = db.prepare(`SELECT * FROM drafts WHERE session_id = ?`);
    const row = stmt.get(sessionId) as DraftRecord | undefined;
    if (!row) return null;
    return {
      sessionId: row.session_id,
      answers: JSON.parse(row.answers_json),
      updatedAt: row.updated_at,
    };
  },

  deleteDraft(sessionId: string) {
    const stmt = db.prepare(`DELETE FROM drafts WHERE session_id = ?`);
    stmt.run(sessionId);
  },

  // Reports
  saveReport(sessionId: string, report: any) {
    const province = report.demographics?.province || 'ບໍ່ລະບຸ';
    const ageStage = report.demographics?.ageStage || 'ບໍ່ລະບຸ';
    const dominantDimension = report.overview?.signals?.[0]?.nameLo || 'ຄວາມຄິດສ້າງສັນ';

    const stmt = db.prepare(`
      INSERT INTO reports (session_id, province, age_stage, dominant_dimension, report_json, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(session_id) DO UPDATE SET
        province = excluded.province,
        age_stage = excluded.age_stage,
        dominant_dimension = excluded.dominant_dimension,
        report_json = excluded.report_json,
        created_at = excluded.created_at
    `);
    const now = new Date().toISOString();
    stmt.run(sessionId, province, ageStage, dominantDimension, JSON.stringify(report), now);

    // Clean up draft since it's now completed
    this.deleteDraft(sessionId);
    return { sessionId, createdAt: now };
  },

  getReport(sessionId: string) {
    const stmt = db.prepare(`SELECT * FROM reports WHERE session_id = ?`);
    const row = stmt.get(sessionId) as ReportRecord | undefined;
    if (!row) return null;
    return JSON.parse(row.report_json);
  },

  // Feedbacks
  saveFeedback(data: { sessionId: string; rating: number; feltComfortable: boolean; comments: string }) {
    const stmt = db.prepare(`
      INSERT INTO feedbacks (session_id, rating, felt_comfortable, comments, created_at)
      VALUES (?, ?, ?, ?, ?)
    `);
    const now = new Date().toISOString();
    stmt.run(data.sessionId, data.rating, data.feltComfortable ? 1 : 0, data.comments || '', now);
    return { success: true, createdAt: now };
  },

  // Admin Stats & Insights
  getInsights() {
    const totalReportsStmt = db.prepare(`SELECT COUNT(*) as count FROM reports`);
    const totalReports = (totalReportsStmt.get() as any)?.count || 0;

    const totalDraftsStmt = db.prepare(`SELECT COUNT(*) as count FROM drafts`);
    const totalDrafts = (totalDraftsStmt.get() as any)?.count || 0;

    // Province distribution
    const provinceStmt = db.prepare(`
      SELECT province, COUNT(*) as count
      FROM reports
      GROUP BY province
      ORDER BY count DESC
      LIMIT 6
    `);
    const provinceDist = provinceStmt.all() as Array<{ province: string; count: number }>;

    // Dominant dimension distribution
    const dimStmt = db.prepare(`
      SELECT dominant_dimension, COUNT(*) as count
      FROM reports
      GROUP BY dominant_dimension
      ORDER BY count DESC
      LIMIT 5
    `);
    const dimensionDist = dimStmt.all() as Array<{ dominant_dimension: string; count: number }>;

    // Feedback summary
    const feedbackSummaryStmt = db.prepare(`
      SELECT 
        COUNT(*) as total_feedback,
        AVG(rating) as avg_rating,
        SUM(felt_comfortable) as total_comfortable
      FROM feedbacks
    `);
    const feedbackStats = feedbackSummaryStmt.get() as any;

    // Recent anonymous comments
    const commentsStmt = db.prepare(`
      SELECT comments, rating, created_at
      FROM feedbacks
      WHERE comments != ''
      ORDER BY id DESC
      LIMIT 5
    `);
    const recentComments = commentsStmt.all() as Array<{ comments: string; rating: number; created_at: string }>;

    return {
      totalReports,
      totalDrafts,
      provinceDist,
      dimensionDist,
      feedbackStats: {
        totalFeedback: feedbackStats?.total_feedback || 0,
        avgRating: feedbackStats?.avg_rating ? Number(feedbackStats.avg_rating.toFixed(1)) : 5.0,
        comfortablePercentage: feedbackStats?.total_feedback
          ? Math.round((feedbackStats.total_comfortable / feedbackStats.total_feedback) * 100)
          : 100,
      },
      recentComments,
    };
  },
};
