import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { DbStore } from './src/dbStore';
const db = new DbStore();
const app = express();
const PORT = 3000;

// Periodic DDNS check
setInterval(async () => {
  const ddnsConfigs = db.getDdnsConfigs();
  for (const config of ddnsConfigs) {
    if (config.enabled) {
      const lastUpdated = new Date(config.lastUpdated).getTime();
      const frequencyMs = config.checkFrequency * 60 * 1000;
      if (Date.now() - lastUpdated > frequencyMs) {
        console.log(`[DDNS] Syncing ${config.domainName}...`);
        // Simulate sync
        db.updateDdnsConfig(config.id, { lastDetectedIp: '180.244.' + Math.floor(Math.random() * 255) + '.' + Math.floor(Math.random() * 255) });
      }
    }
  }
}, 60000); // Check every minute

app.use(express.json());

// Auth middleware helper
const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized. No token provided.' });
    return;
  }
  const token = authHeader.split(' ')[1];
  const username = db.verifySession(token);
  if (!username) {
    res.status(401).json({ error: 'Unauthorized or session expired.' });
    return;
  }
  (req as any).username = username;
  next();
};

// Report endpoint
app.post('/api/admin/report-status', requireAuth, (req: Request, res: Response) => {
  res.json({ ok: true });
});

// --- AUTH API ---
app.post('/api/auth/register', (req: Request, res: Response) => {
  const { username, password, fullName, email } = req.body;
  if (!username || !password || !fullName || !email) {
    res.status(400).json({ error: 'All registration fields are required.' });
    return;
  }
  const created = db.registerUser(username, password, fullName, email);
  if (!created) {
    res.status(400).json({ error: 'Username is already taken.' });
    return;
  }
  res.json({ message: 'User registered successfully!', username: created });
});

app.post('/api/auth/login', (req: Request, res: Response) => {
  const { username, password } = req.body;
  if (!username || !password) {
    res.status(400).json({ error: 'Username and password are required.' });
    return;
  }
  const token = db.authenticate(username, password);
  if (!token) {
    res.status(401).json({ error: 'Invalid username or password.' });
    return;
  }
  const profile = db.getProfile(username);
  res.json({ token, profile });
});

app.post('/api/auth/logout', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    db.logout(token);
  }
  res.json({ message: 'Logged out successfully.' });
});

app.get('/api/auth/me', requireAuth, (req: Request, res: Response) => {
  const username = (req as any).username;
  const profile = db.getProfile(username);
  if (!profile) {
    res.status(404).json({ error: 'Profile not found.' });
    return;
  }
  res.json({ profile });
});

// --- PUBLIC API (FOR LANDING PAGE) ---

// Project status check (online/offline)
app.get('/api/public/project-status', async (req: Request, res: Response) => {
  const projects = db.getProjects().filter(p => p.isActive);
  const statuses = await Promise.all(projects.map(async p => {
    try {
      const resp = await fetch(p.link, { method: 'HEAD', timeout: 3000 });
      return { id: p.id, online: resp.ok };
    } catch (e) {
      return { id: p.id, online: false };
    }
  }));
  res.json({ statuses });
});
app.get('/api/public/content', (req: Request, res: Response) => {
  const hero = db.getHero();
  const projects = db.getProjects().filter(p => p.isActive);
  const links = db.getLinks().filter(l => l.isActive);
  res.json({ hero, projects, links });
});

// --- ADMIN API (CMS & VPS INTEGRATIONS) ---
app.get('/api/admin/configs', requireAuth, (req: Request, res: Response) => {
  const state = db.getState();
  res.json({
    hero: state.hero,
    projects: state.projects,
    links: state.links,
    nginxConfigs: state.nginxConfigs,
    ddnsConfigs: state.ddnsConfigs,
    portForwards: state.portForwards
  });
});

// Hero update
app.post('/api/admin/hero', requireAuth, (req: Request, res: Response) => {
  db.updateHero(req.body);
  res.json({ message: 'Hero content updated successfully.', hero: db.getHero() });
});

// Project CRUD
app.post('/api/admin/projects', requireAuth, (req: Request, res: Response) => {
  const { title, description, link, iconName, category, isActive } = req.body;
  if (!title || !description || !link) {
    res.status(400).json({ error: 'Title, description, and link are required.' });
    return;
  }
  const proj = db.addProject({
    title,
    description,
    link,
    iconName: iconName || 'Sparkles',
    category: category || 'Utility',
    isActive: typeof isActive === 'boolean' ? isActive : true
  });
  res.json({ message: 'Project added successfully.', project: proj });
});

app.put('/api/admin/projects/:id', requireAuth, (req: Request, res: Response) => {
  const success = db.updateProject(req.params.id, req.body);
  if (!success) {
    res.status(404).json({ error: 'Project not found.' });
    return;
  }
  res.json({ message: 'Project updated successfully.' });
});

app.delete('/api/admin/projects/:id', requireAuth, (req: Request, res: Response) => {
  const success = db.deleteProject(req.params.id);
  if (!success) {
    res.status(404).json({ error: 'Project not found.' });
    return;
  }
  res.json({ message: 'Project deleted successfully.' });
});

// Link CRUD
app.post('/api/admin/links', requireAuth, (req: Request, res: Response) => {
  const { platform, url, iconName, isActive } = req.body;
  if (!platform || !url) {
    res.status(400).json({ error: 'Platform and URL are required.' });
    return;
  }
  const link = db.addLink({
    platform,
    url,
    iconName: iconName || 'ExternalLink',
    isActive: typeof isActive === 'boolean' ? isActive : true
  });
  res.json({ message: 'Social link added successfully.', link });
});

app.put('/api/admin/links/:id', requireAuth, (req: Request, res: Response) => {
  const success = db.updateLink(req.params.id, req.body);
  if (!success) {
    res.status(404).json({ error: 'Link not found.' });
    return;
  }
  res.json({ message: 'Social link updated successfully.' });
});

app.delete('/api/admin/links/:id', requireAuth, (req: Request, res: Response) => {
  const success = db.deleteLink(req.params.id);
  if (!success) {
    res.status(404).json({ error: 'Link not found.' });
    return;
  }
  res.json({ message: 'Social link deleted successfully.' });
});

// Nginx Config CRUD
app.post('/api/admin/nginx', requireAuth, (req: Request, res: Response) => {
  const { domainName, targetUrl, sslEnabled, sslType, sslEmail, isLoadBalanced, upstreams, customDirectives, isActive } = req.body;
  if (!domainName || (!targetUrl && !isLoadBalanced)) {
    res.status(400).json({ error: 'Domain name and backend target URL (or upstreams) are required.' });
    return;
  }
  const config = db.addNginxConfig({
    domainName,
    targetUrl: targetUrl || '',
    sslEnabled: !!sslEnabled,
    sslType: sslType || 'Certbot',
    sslEmail: sslEmail || '',
    isLoadBalanced: !!isLoadBalanced,
    upstreams: upstreams || [],
    customDirectives: customDirectives || '',
    isActive: typeof isActive === 'boolean' ? isActive : true
  });
  res.json({ message: 'Nginx entry registered successfully.', config });
});

app.put('/api/admin/nginx/:id', requireAuth, (req: Request, res: Response) => {
  const success = db.updateNginxConfig(req.params.id, req.body);
  if (!success) {
    res.status(404).json({ error: 'Nginx config not found.' });
    return;
  }
  res.json({ message: 'Nginx config and dynamic server blocks updated.' });
});

app.delete('/api/admin/nginx/:id', requireAuth, (req: Request, res: Response) => {
  const success = db.deleteNginxConfig(req.params.id);
  if (!success) {
    res.status(404).json({ error: 'Nginx config entry not found.' });
    return;
  }
  res.json({ message: 'Nginx config deleted.' });
});

// DDNS CRUD
app.post('/api/admin/ddns', requireAuth, (req: Request, res: Response) => {
  const { provider, domainName, apiToken, zoneId, lastDetectedIp, status } = req.body;
  if (!provider || !domainName || !apiToken) {
    res.status(400).json({ error: 'Provider, domain, and API token are required.' });
    return;
  }
  const config = db.addDdnsConfig({
    provider,
    domainName,
    apiToken,
    zoneId: zoneId || '',
    lastDetectedIp: lastDetectedIp || '127.0.0.1',
    status: status || 'Syncing'
  });
  res.json({ message: 'DDNS configuration created.', config });
});

app.put('/api/admin/ddns/:id', requireAuth, (req: Request, res: Response) => {
  const success = db.updateDdnsConfig(req.params.id, req.body);
  if (!success) {
    res.status(404).json({ error: 'DDNS configuration not found.' });
    return;
  }
  res.json({ message: 'DDNS configuration updated successfully.' });
});

app.delete('/api/admin/ddns/:id', requireAuth, (req: Request, res: Response) => {
  const success = db.deleteDdnsConfig(req.params.id);
  if (!success) {
    res.status(404).json({ error: 'DDNS configuration not found.' });
    return;
  }
  res.json({ message: 'DDNS configuration deleted.' });
});

// Port Forward CRUD
app.post('/api/admin/portforward', requireAuth, (req: Request, res: Response) => {
  const { name, incomingPort, localAddress, localPort, webhookEnabled, webhookUrl, status } = req.body;
  if (!name || !incomingPort || !localPort) {
    res.status(400).json({ error: 'Forward name, incoming port, and local port are required.' });
    return;
  }
  const pf = db.addPortForward({
    name,
    incomingPort: Number(incomingPort),
    localAddress: localAddress || '127.0.0.1',
    localPort: Number(localPort),
    webhookEnabled: !!webhookEnabled,
    webhookUrl: webhookUrl || '',
    status: status || 'Active'
  });
  res.json({ message: 'Port forwarding entry added.', portForward: pf });
});

app.put('/api/admin/portforward/:id', requireAuth, (req: Request, res: Response) => {
  const success = db.updatePortForward(req.params.id, req.body);
  if (!success) {
    res.status(404).json({ error: 'Port forwarding configuration not found.' });
    return;
  }
  res.json({ message: 'Port forwarding entry updated.' });
});

app.delete('/api/admin/portforward/:id', requireAuth, (req: Request, res: Response) => {
  const success = db.deletePortForward(req.params.id);
  if (!success) {
    res.status(404).json({ error: 'Port forwarding configuration not found.' });
    return;
  }
  res.json({ message: 'Port forwarding entry deleted successfully.' });
});

// Listening ports detection (admin)
app.get('/api/admin/listening-ports', requireAuth, async (req: Request, res: Response) => {
  const { exec } = await import('child_process');
  exec('ss -tuln -p', (error, stdout, stderr) => {
    if (error) {
      console.error('Error fetching ports:', error);
      res.status(500).json({ error: 'Failed to retrieve listening ports' });
      return;
    }
    const lines = stdout.split('\n').slice(1).filter(l => l.trim());
    const ports = lines.map(line => {
      const parts = line.trim().split(/\s+/);
      const [protocol, state, , , local, , proc] = parts;
      const addrPort = local.startsWith('[') ? local.replace(']', '').split(']:') : local.split(':');
      const address = addrPort[0];
      const port = addrPort[1] || '';
      const processInfo = proc ? proc.replace('users:', '').trim() : '';
      const exposed = address === '0.0.0.0' || address === '::';
      return { protocol, state, address, port, process: processInfo, exposed };
    });
    res.json({ ports });
  });
});

// Security status (admin)
app.get('/api/admin/security-status', requireAuth, async (req: Request, res: Response) => {
  const { exec } = await import('child_process');
  exec('ss -tuln -p', (error, stdout, stderr) => {
    if (error) {
      console.error('Error fetching security status:', error);
      res.status(500).json({ error: 'Failed to retrieve security status' });
      return;
    }
    const lines = stdout.split('\n').slice(1).filter(l => l.trim());
    const insecurePorts = [];
    const checks = lines.map(line => {
      const parts = line.trim().split(/\s+/);
      const [protocol, state, , , local, , proc] = parts;
      const addrPort = local.startsWith('[') ? local.replace(']', '').split(']:') : local.split(':');
      const address = addrPort[0];
      const port = addrPort[1] || '';
      const exposed = address === '0.0.0.0' || address === '::';
      // Simple insecure criteria: exposed & port in common insecure list
      const insecureList = ['22', '80', '8080', '443'];
      if (exposed && insecureList.includes(port)) {
        insecurePorts.push({ protocol, port, address, reason: 'Common insecure port exposed publicly' });
      }
    });
    res.json({ insecurePorts, totalExposed: insecurePorts.length });
  });
});


// SIMULATIONS INTEGRATIONS WEBHOOKS / TEST ROUTES
app.post('/api/webhooks/github', (req: Request, res: Response) => {
  console.log('📡 Received Github Webhook Trigger for Port Forward Loopback');
  res.json({ ok: true, source: 'port_forward_webhook_sim', timestamp: new Date().toISOString() });
});

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(`[Error] ${req.method} ${req.url}:`, err.message);
  res.status(err.status || 500).json({ 
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'production' ? 'An unexpected error occurred.' : err.message
  });
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Orchestra Server] Running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
