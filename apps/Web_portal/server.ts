import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { rateLimit } from 'express-rate-limit';
import pino from 'pino';
import { execFile } from 'child_process';
import { DbStore } from './src/dbStore';
import { DatabasePlugin } from './src/plugins/dbManager/DatabasePlugin';
import { startAutoDiscovery } from './src/plugins/autoDiscovery/discoveryEngine';

const logger = pino({ transport: { target: 'pino-pretty' } });
const db = new DbStore();
const app = express();
const PORT = process.env.PORT || 56235;

// Init plugins
DatabasePlugin.init();
startAutoDiscovery();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000, // Increased limit for dev/debugging
  message: 'Too many requests, please try again later.'
});

app.use(limiter);
app.use(express.json());

// Auth middleware
const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' });
  const token = authHeader.split(' ')[1];
  if (!db.verifySession(token)) return res.status(401).json({ error: 'Unauthorized' });
  next();
};

// --- AUTH API ---
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  const token = db.authenticate(username, password);
  if (!token) return res.status(401).json({ error: 'Invalid credentials' });
  res.json({ token, profile: db.getProfile(username) });
});

// --- ADMIN API ---
app.get('/api/admin/listening-ports', requireAuth, (req, res) => {
  execFile('/usr/sbin/ss', ['-tuln', '-p'], (error, stdout) => {
    if (error) {
      logger.error('Error fetching ports:', error);
      return res.status(500).json({ error: 'Failed to retrieve listening ports' });
    }
    res.json({ ports: stdout });
  });
});

app.get('/api/admin/security-status', requireAuth, (req, res) => {
    // Implementation of security check
    res.json({ insecurePorts: [], totalExposed: 0 });
});

app.get('/api/admin/configs', requireAuth, (req, res) => {
  res.json(db.getState());
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: 'spa' });
    app.use(vite.middlewares);
  } else {
    const staticPath = path.join(process.cwd(), 'dist');
    logger.info(`Serving static files from: ${staticPath}`);
    app.use(express.static(staticPath));

    app.get('*', (req, res) => {
      res.sendFile(path.join(staticPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    logger.info(`[Orchestra Server] Running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
