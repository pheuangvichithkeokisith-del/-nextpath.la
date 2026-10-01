import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { dbService } from './src/server/db.js';
import { calculateReflectionReport } from './src/utils/reflectionEngine.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
  const isProduction = process.env.NODE_ENV === 'production';

  app.use(express.json());

  // API Routes
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({ status: 'ok', service: 'Next-path SQLite Backend', timestamp: new Date().toISOString() });
  });

  // Save Draft (Autosave)
  app.post('/api/assessment/draft', (req: Request, res: Response) => {
    try {
      const { sessionId, answers } = req.body;
      if (!sessionId) {
        return res.status(400).json({ error: 'sessionId is required' });
      }
      const result = dbService.saveDraft(sessionId, answers || {});
      res.json({ success: true, ...result });
    } catch (err: any) {
      console.error('Error saving draft:', err);
      res.status(500).json({ error: 'Failed to save draft' });
    }
  });

  // Get Draft
  app.get('/api/assessment/draft/:sessionId', (req: Request, res: Response) => {
    try {
      const { sessionId } = req.params;
      const draft = dbService.getDraft(sessionId);
      res.json({ success: true, draft });
    } catch (err: any) {
      console.error('Error getting draft:', err);
      res.status(500).json({ error: 'Failed to retrieve draft' });
    }
  });

  // Submit Assessment (Compute & Store Report)
  app.post('/api/assessment/submit', (req: Request, res: Response) => {
    try {
      const { sessionId, answers } = req.body;
      if (!sessionId || !answers) {
        return res.status(400).json({ error: 'sessionId and answers are required' });
      }

      // Calculate reflection report
      const report = calculateReflectionReport(answers, sessionId);

      // Save to SQLite
      dbService.saveReport(sessionId, report);

      res.json({ success: true, report });
    } catch (err: any) {
      console.error('Error submitting assessment:', err);
      res.status(500).json({ error: 'Failed to process assessment' });
    }
  });

  // Get Report by Session ID
  app.get('/api/reports/:sessionId', (req: Request, res: Response) => {
    try {
      const { sessionId } = req.params;
      const report = dbService.getReport(sessionId);
      if (!report) {
        return res.status(404).json({ error: 'Report not found' });
      }
      res.json({ success: true, report });
    } catch (err: any) {
      console.error('Error getting report:', err);
      res.status(500).json({ error: 'Failed to retrieve report' });
    }
  });

  // In-memory rate limiting tracker for feedback (max 5 per minute per IP)
  const feedbackRateLimiter = new Map<string, { count: number; resetTime: number }>();

  // Save Feedback
  app.post('/api/feedback', (req: Request, res: Response) => {
    try {
      const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
      const now = Date.now();
      const clientRate = feedbackRateLimiter.get(clientIp);

      if (clientRate && clientRate.resetTime > now) {
        if (clientRate.count >= 5) {
          return res.status(429).json({ error: 'Too many submissions. Please wait a moment.' });
        }
        clientRate.count += 1;
      } else {
        feedbackRateLimiter.set(clientIp, { count: 1, resetTime: now + 60000 });
      }

      const { sessionId, rating, feltComfortable, comments } = req.body;
      if (!sessionId || rating === undefined) {
        return res.status(400).json({ error: 'sessionId and rating are required' });
      }

      // Input sanitization / length bounds
      const safeComments = typeof comments === 'string' ? comments.trim().substring(0, 1000) : '';
      const numRating = Math.max(1, Math.min(5, Number(rating) || 5));

      const result = dbService.saveFeedback({
        sessionId: String(sessionId).substring(0, 100),
        rating: numRating,
        feltComfortable: Boolean(feltComfortable),
        comments: safeComments,
      });
      res.json(result);
    } catch (err: any) {
      console.error('Error saving feedback:', err);
      res.status(500).json({ error: 'Failed to save feedback' });
    }
  });

  // Admin Insights (Anonymous aggregated statistics)
  app.get('/api/admin/insights', (req: Request, res: Response) => {
    try {
      const insights = dbService.getInsights();
      res.json({ success: true, insights });
    } catch (err: any) {
      console.error('Error fetching insights:', err);
      res.status(500).json({ error: 'Failed to fetch insights' });
    }
  });

  // Vite middleware in dev or static files in production
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: process.env.DISABLE_HMR !== 'true' },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Next-path Backend] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
