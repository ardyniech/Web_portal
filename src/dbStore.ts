import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { DatabaseState, HeroContent, Project, SocialLink, NginxConfig, DDNSConfig, PortForward } from './types';

// Let's store DB in current working directory as orchestra_db.json
const DB_FILE_PATH = path.join(process.cwd(), 'orchestra_db.json');

// Simple crypto utilities
export function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

export function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

const DEFAULT_STATE: DatabaseState = {
  users: {
    // default password is 'admin' or 'orchestra2026'
    admin: hashPassword('admin123')
  },
  profiles: {
    admin: {
      id: 'admin',
      email: 'admin@vaio.net',
      username: 'admin',
      fullName: 'Ardy Syafii',
      bio: 'Fullstack Systems Engineer and Network Infrastructure Developer.',
      avatarUrl: ''
    }
  },
  sessions: {},
  hero: {
    title: 'Ardy Syafii',
    subtitle: 'Dynamic Systems Architect & Network Solutions Eng.',
    highlightText: 'Headless Landing page with integrated reverse proxy & DDNS management system.',
    socialBadgeText: '📡 VAIO SERVER ACTIVE',
    showKoperasiSection: true
  },
  projects: [
    {
      id: 'proj_1',
      title: 'Orchestra Web Canvas',
      description: 'Elegant, ultra-fast, and distraction-free portfolio with custom interactive modules.',
      link: 'https://orchestra.vaio',
      iconName: 'Sparkles',
      category: 'Core',
      isActive: true
    },
    {
      id: 'proj_2',
      title: 'Koperasi Micro-Banking',
      description: 'Community-focused transaction settlement engine and automated bookkeeping dashboard.',
      link: 'https://koperasi.vaio',
      iconName: 'TrendingUp',
      category: 'Koperasi',
      isActive: true
    },
    {
      id: 'proj_3',
      title: 'Vaio Core Gate',
      description: 'High-performance microservice router with live Cloudflare DNS & SSL provisioning hooks.',
      link: 'https://gateway.vaio',
      iconName: 'Server',
      category: 'Utility',
      isActive: true
    }
  ],
  links: [
    {
      id: 'link_1',
      platform: 'GitHub',
      url: 'https://github.com/ardysyafii',
      iconName: 'Github',
      isActive: true
    },
    {
      id: 'link_2',
      platform: 'LinkedIn',
      url: 'https://linkedin.com/in/ardysyafii',
      iconName: 'Linkedin',
      isActive: true
    },
    {
      id: 'link_3',
      platform: 'Email',
      url: 'mailto:ardy.syafii@gmail.com',
      iconName: 'Mail',
      isActive: true
    },
    {
      id: 'link_4',
      platform: 'Telegram',
      url: 'https://t.me/ardysyafii',
      iconName: 'Send',
      isActive: true
    }
  ],
  nginxConfigs: [
    {
      id: 'nginx_1',
      domainName: 'orchestra.vaio',
      targetUrl: 'http://127.0.0.1:3000',
      sslEnabled: true,
      sslType: 'Certbot',
      sslEmail: 'ardy.syafii@gmail.com',
      isLoadBalanced: false,
      upstreams: [],
      isActive: true,
      lastGeneratedContent: '',
      createdAt: new Date().toISOString()
    },
    {
      id: 'nginx_2',
      domainName: 'api-loadbalancer.vaio',
      targetUrl: 'http://api_cluster',
      sslEnabled: true,
      sslType: 'Cloudflare',
      isLoadBalanced: true,
      upstreams: ['http://127.0.0.1:8001 weight=3', 'http://127.0.0.1:8002 weight=2'],
      isActive: true,
      lastGeneratedContent: '',
      createdAt: new Date().toISOString()
    }
  ],
  ddnsConfigs: [
    {
      id: 'ddns_1',
      provider: 'Cloudflare',
      domainName: 'home.vaio.net',
      apiToken: 'cf_tok_7a9f8f2e1a3b4c5d6e7f8g9h',
      zoneId: 'cf_zone_e3b0c44298fc1c149afbf4c8996fb924',
      lastDetectedIp: '180.244.131.25',
      status: 'Active',
      lastUpdated: new Date().toISOString(),
      checkFrequency: 15,
      enabled: true
    }
  ],
  portForwards: [
    {
      id: 'pf_1',
      name: 'GitHub Webhook Ingress',
      incomingPort: 8080,
      localAddress: '127.0.0.1',
      localPort: 3000,
      webhookEnabled: true,
      webhookUrl: 'http://localhost:3000/api/webhooks/github',
      status: 'Active'
    },
    {
      id: 'pf_2',
      name: 'FastAPI Dev Router',
      incomingPort: 9000,
      localAddress: '127.0.0.1',
      localPort: 8000,
      webhookEnabled: false,
      status: 'Inactive'
    }
  ]
};

export class DbStore {
  private state: DatabaseState;

  constructor() {
    this.state = this.load();
  }

  private load(): DatabaseState {
    try {
      if (fs.existsSync(DB_FILE_PATH)) {
        const fileContent = fs.readFileSync(DB_FILE_PATH, 'utf-8');
        const parsed = JSON.parse(fileContent);
        // Deep merge keys to preserve integrity in case schema gets updated
        return {
          ...DEFAULT_STATE,
          ...parsed,
          users: { ...DEFAULT_STATE.users, ...parsed.users },
          profiles: { ...DEFAULT_STATE.profiles, ...parsed.profiles },
          ddnsConfigs: (parsed.ddnsConfigs || []).map((d: any) => ({
            ...d,
            checkFrequency: d.checkFrequency || 15,
            enabled: typeof d.enabled === 'boolean' ? d.enabled : true
          })),
          sessions: parsed.sessions || {}
        };
      }
    } catch (e) {
      console.error('Failed to load database from disk. Initializing empty/defaults...', e);
    }
    // Write defaults
    this.saveDirect(DEFAULT_STATE);
    return DEFAULT_STATE;
  }

  private saveDirect(state: DatabaseState): void {
    try {
      fs.writeFileSync(DB_FILE_PATH, JSON.stringify(state, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to write database to disk:', e);
    }
  }

  public save(): void {
    this.saveDirect(this.state);
  }

  public getState(): DatabaseState {
    return this.state;
  }

  // Auth Operations
  public registerUser(username: string, passwordPlain: string, fullName: string, email: string): string | null {
    const normUser = username.trim().toLowerCase();
    if (this.state.users[normUser]) {
      return null; // Already exists
    }
    this.state.users[normUser] = hashPassword(passwordPlain);
    this.state.profiles[normUser] = {
      id: normUser,
      email: email,
      username: username,
      fullName: fullName,
      bio: `Infrastructure and applications developer.`
    };
    this.save();
    return normUser;
  }

  public authenticate(username: string, passwordPlain: string): string | null {
    const normUser = username.trim().toLowerCase();
    const storedHash = this.state.users[normUser];
    if (storedHash && storedHash === hashPassword(passwordPlain)) {
      const token = generateToken();
      this.state.sessions[token] = normUser;
      this.save();
      return token;
    }
    return null;
  }

  public verifySession(token: string): string | null {
    return this.state.sessions[token] || null;
  }

  public logout(token: string): void {
    if (this.state.sessions[token]) {
      delete this.state.sessions[token];
      this.save();
    }
  }

  public getProfile(username: string) {
    return this.state.profiles[username];
  }

  // Landing Page Management
  public getHero(): HeroContent {
    return this.state.hero;
  }

  public updateHero(hero: Partial<HeroContent>): void {
    this.state.hero = { ...this.state.hero, ...hero };
    this.save();
  }

  public getProjects(): Project[] {
    return this.state.projects;
  }

  public addProject(proj: Omit<Project, 'id'>): Project {
    const newProj: Project = {
      ...proj,
      id: 'proj_' + Date.now()
    };
    this.state.projects.push(newProj);
    this.save();
    return newProj;
  }

  public updateProject(id: string, updated: Partial<Project>): boolean {
    const idx = this.state.projects.findIndex(p => p.id === id);
    if (idx !== -1) {
      this.state.projects[idx] = { ...this.state.projects[idx], ...updated };
      this.save();
      return true;
    }
    return false;
  }

  public deleteProject(id: string): boolean {
    const originalLength = this.state.projects.length;
    this.state.projects = this.state.projects.filter(p => p.id !== id);
    if (this.state.projects.length !== originalLength) {
      this.save();
      return true;
    }
    return false;
  }

  public getLinks(): SocialLink[] {
    return this.state.links;
  }

  public addLink(link: Omit<SocialLink, 'id'>): SocialLink {
    const newLink: SocialLink = {
      ...link,
      id: 'link_' + Date.now()
    };
    this.state.links.push(newLink);
    this.save();
    return newLink;
  }

  public updateLink(id: string, updated: Partial<SocialLink>): boolean {
    const idx = this.state.links.findIndex(l => l.id === id);
    if (idx !== -1) {
      this.state.links[idx] = { ...this.state.links[idx], ...updated };
      this.save();
      return true;
    }
    return false;
  }

  public deleteLink(id: string): boolean {
    const originalLength = this.state.links.length;
    this.state.links = this.state.links.filter(l => l.id !== id);
    if (this.state.links.length !== originalLength) {
      this.save();
      return true;
    }
    return false;
  }

  // Nginx Proxy Management
  public getNginxConfigs(): NginxConfig[] {
    return this.state.nginxConfigs;
  }

  public addNginxConfig(config: Omit<NginxConfig, 'id' | 'createdAt'>): NginxConfig {
    const generatedConf = this.buildNginxConfString(config.domainName, config.targetUrl, config.sslEnabled, config.isLoadBalanced, config.upstreams, config.customDirectives);
    const newConfig: NginxConfig = {
      ...config,
      id: 'nginx_' + Date.now(),
      lastGeneratedContent: generatedConf,
      createdAt: new Date().toISOString()
    };
    this.state.nginxConfigs.push(newConfig);
    this.save();
    return newConfig;
  }

  public updateNginxConfig(id: string, updated: Partial<NginxConfig>): boolean {
    const idx = this.state.nginxConfigs.findIndex(n => n.id === id);
    if (idx !== -1) {
      const merged = { ...this.state.nginxConfigs[idx], ...updated };
      merged.lastGeneratedContent = this.buildNginxConfString(
        merged.domainName,
        merged.targetUrl,
        merged.sslEnabled,
        merged.isLoadBalanced,
        merged.upstreams,
        merged.customDirectives
      );
      this.state.nginxConfigs[idx] = merged;
      this.save();
      return true;
    }
    return false;
  }

  public deleteNginxConfig(id: string): boolean {
    const originalLength = this.state.nginxConfigs.length;
    this.state.nginxConfigs = this.state.nginxConfigs.filter(n => n.id !== id);
    if (this.state.nginxConfigs.length !== originalLength) {
      this.save();
      return true;
    }
    return false;
  }

  // DDNS Management
  public getDdnsConfigs(): DDNSConfig[] {
    return this.state.ddnsConfigs;
  }

  public addDdnsConfig(config: Omit<DDNSConfig, 'id' | 'lastUpdated'>): DDNSConfig {
    const newConfig: DDNSConfig = {
      ...config,
      id: 'ddns_' + Date.now(),
      lastUpdated: new Date().toISOString()
    };
    this.state.ddnsConfigs.push(newConfig);
    this.save();
    return newConfig;
  }

  public updateDdnsConfig(id: string, updated: Partial<DDNSConfig>): boolean {
    const idx = this.state.ddnsConfigs.findIndex(d => d.id === id);
    if (idx !== -1) {
      this.state.ddnsConfigs[idx] = {
        ...this.state.ddnsConfigs[idx],
        ...updated,
        lastUpdated: new Date().toISOString()
      };
      this.save();
      return true;
    }
    return false;
  }

  public deleteDdnsConfig(id: string): boolean {
    const originalLength = this.state.ddnsConfigs.length;
    this.state.ddnsConfigs = this.state.ddnsConfigs.filter(d => d.id !== id);
    if (this.state.ddnsConfigs.length !== originalLength) {
      this.save();
      return true;
    }
    return false;
  }

  // Port Forwarding Settings
  public getPortForwards(): PortForward[] {
    return this.state.portForwards;
  }

  public addPortForward(pf: Omit<PortForward, 'id'>): PortForward {
    const newPf: PortForward = {
      ...pf,
      id: 'pf_' + Date.now()
    };
    this.state.portForwards.push(newPf);
    this.save();
    return newPf;
  }

  public updatePortForward(id: string, updated: Partial<PortForward>): boolean {
    const idx = this.state.portForwards.findIndex(p => p.id === id);
    if (idx !== -1) {
      this.state.portForwards[idx] = { ...this.state.portForwards[idx], ...updated };
      this.save();
      return true;
    }
    return false;
  }

  public deletePortForward(id: string): boolean {
    const originalLength = this.state.portForwards.length;
    this.state.portForwards = this.state.portForwards.filter(p => p.id !== id);
    if (this.state.portForwards.length !== originalLength) {
      this.save();
      return true;
    }
    return false;
  }

  // Nginx config builder (Generates standard nginx configuration code on-the-fly)
  private buildNginxConfString(
    domain: string,
    target: string,
    ssl: boolean,
    loadBalanced: boolean,
    upstreams: string[],
    directives?: string
  ): string {
    let conf = `# Orchestra Auto-Generated Nginx Virtual Host Config\n`;
    
    if (loadBalanced && upstreams.length > 0) {
      conf += `upstream app_cluster_${domain.replace(/[^a-zA-Z0-9]/g, '_')} {\n`;
      upstreams.forEach(srv => {
        conf += `    server ${srv};\n`;
      });
      conf += `    keepalive 32;\n`;
      conf += `}\n\n`;
    }

    conf += `server {\n`;
    conf += `    listen 80;\n`;
    conf += `    listen [::]:80;\n`;
    conf += `    server_name ${domain};\n\n`;

    if (ssl) {
      conf += `    # SSL Termination via Let's Encrypt / Certbot / Cloudflare Edge\n`;
      conf += `    listen 443 ssl http2;\n`;
      conf += `    listen [::]:443 ssl http2;\n`;
      conf += `    ssl_certificate /etc/letsencrypt/live/${domain}/fullchain.pem; # managed by Certbot\n`;
      conf += `    ssl_certificate_key /etc/letsencrypt/live/${domain}/privkey.pem; # managed by Certbot\n`;
      conf += `    ssl_protocols TLSv1.2 TLSv1.3;\n`;
      conf += `    ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384';\n`;
      conf += `    ssl_prefer_server_ciphers on;\n\n`;
      
      conf += `    # Force HTTPS Redirection\n`;
      conf += `    if ($scheme != "https") {\n`;
      conf += `        return 301 https://$host$request_uri;\n`;
      conf += `    }\n\n`;
    }

    conf += `    location / {\n`;
    if (loadBalanced && upstreams.length > 0) {
      conf += `        proxy_pass http://app_cluster_${domain.replace(/[^a-zA-Z0-9]/g, '_')};\n`;
    } else {
      conf += `        proxy_pass ${target};\n`;
    }
    conf += `        proxy_http_version 1.1;\n`;
    conf += `        proxy_set_header Upgrade $http_upgrade;\n`;
    conf += `        proxy_set_header Connection "upgrade";\n`;
    conf += `        proxy_set_header Host $host;\n`;
    conf += `        proxy_set_header X-Real-IP $remote_addr;\n`;
    conf += `        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;\n`;
    conf += `        proxy_set_header X-Forwarded-Proto $scheme;\n`;
    conf += `        proxy_read_timeout 90s;\n`;
    conf += `    }\n`;

    if (directives && directives.trim()) {
      conf += `\n    # Extended Custom Directives\n`;
      directives.split('\n').forEach(line => {
        if (line.trim()) {
          conf += `    ${line.trim()}\n`;
        }
      });
    }

    conf += `}\n`;
    return conf;
  }
}
