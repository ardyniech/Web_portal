/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Server,
  Globe,
  Monitor,
  Cpu,
  Terminal,
  Shield,
  Key,
  Plus,
  Trash2,
  Edit3,
  Check,
  X,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Settings,
  CornerDownRight,
  RefreshCw,
  LogOut,
  Sliders,
  Send,
  Sparkles,
  User,
  Layers,
  Activity,
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  BookOpen
} from 'lucide-react';
import { LucideIcon } from './components/LucideIcon';
import { AuthScreen } from './components/AuthScreen';
import { SystemMonitor } from './components/SystemMonitor';
import { VisitorAnalytics } from './components/VisitorAnalytics';
import {
  fetchPublicContent,
  fetchAdminConfigs,
  updateHeroContent,
  addProject,
  updateProject,
  deleteProject,
  addSocialLink,
  updateSocialLink,
  deleteSocialLink,
  addNginxConfig,
  updateNginxConfig,
  deleteNginxConfig,
  addDdnsConfig,
  updateDdnsConfig,
  deleteDdnsConfig,
  addPortForward,
  updatePortForward,
  deletePortForward,
  logoutUser
} from './utils/api';
import { HeroContent, Project, SocialLink, NginxConfig, DDNSConfig, PortForward } from './types';

// Tactical UI Components for "Out of the Box" Design
const TacticalCorner = ({ className }: { className?: string }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M2 2V10M2 2H10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const ScanLine = () => (
  <motion.div 
    animate={{ top: ['0%', '100%', '0%'] }}
    transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
    className="absolute left-0 right-0 h-[1px] bg-sky-500/20 z-0 pointer-events-none"
  />
);

const getRelativeTime = (timestamp: string) => {
  if (!timestamp) return 'Never';
  const now = new Date();
  const then = new Date(timestamp);
  const diffInSeconds = Math.floor((now.getTime() - then.getTime()) / 1000);

  if (diffInSeconds < 5) return 'Just now';
  if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  return then.toLocaleDateString();
};

// Visual resource tracker
const ResourceTile = ({ label, value, color }: { label: string, value: number, color: string }) => (
  <div className="bg-zinc-950 p-3 rounded border border-zinc-800">
    <div className="flex justify-between mb-2">
      <span className="text-[9px] font-mono uppercase text-zinc-500">{label}</span>
      <span className={`text-[9px] font-bold`} style={{ color }}>{value}%</span>
    </div>
    <div className="h-1 bg-zinc-900 rounded-full overflow-hidden">
      <motion.div initial={{ width: 0 }} animate={{ width: `${value}%` }} className="h-full" style={{ backgroundColor: color }} />
    </div>
  </div>
);

// Log terminal component
const LogTerminal = ({ logs }: { logs: string[] }) => (
  <div className="bg-black/90 rounded-lg p-3 font-mono text-[9px] text-zinc-400 border border-zinc-800 h-24 overflow-y-auto">
    {logs.map((log, i) => <div key={i} className="mb-0.5 whitespace-nowrap">{log}</div>)}
  </div>
);

const TacticalPanel = ({ children, title, footer, className = '' }: { children: React.ReactNode, title?: string, footer?: string, className?: string }) => (
  <div className={`relative bg-zinc-900/40 border border-zinc-800/80 backdrop-blur-md rounded-xl p-6 group transition-all duration-500 shadow-neon hover:shadow-neon-strong ${className}`}>
    <TacticalCorner className="absolute top-2 left-2 text-zinc-700 opacity-50 group-hover:text-sky-500 transition-colors drop-shadow-neon" />
    <TacticalCorner className="absolute top-2 right-2 text-zinc-700 opacity-50 rotate-90 group-hover:text-sky-500 transition-colors drop-shadow-neon" />
    <TacticalCorner className="absolute bottom-2 left-2 text-zinc-700 opacity-50 -rotate-90 group-hover:text-sky-500 transition-colors drop-shadow-neon" />
    <TacticalCorner className="absolute bottom-2 right-2 text-zinc-700 opacity-50 rotate-180 group-hover:text-sky-500 transition-colors drop-shadow-neon" />
    
    {title && (
      <div className="flex items-center gap-2 mb-4">
        <div className="w-1.5 h-1.5 rounded-full bg-sky-500 shadow-neon" />
        <span className="text-[10px] font-mono font-bold tracking-[0.2em] text-zinc-400 uppercase drop-shadow-neon">{title}</span>
      </div>
    )}
    
    <div className="relative z-10">{children}</div>
    
    {footer && (
      <div className="mt-4 pt-4 border-t border-zinc-800/50 flex justify-end">
        <span className="text-[8px] font-mono text-zinc-600 uppercase tracking-widest">{footer}</span>
      </div>
    )}
  </div>
);

// Mock weather-style widgets without using emojis or generic icons.
// Uses custom high-contrast SVG graphics/geometric badges instead.
export default function App() {
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [locale, setLocale] = useState<'id' | 'en'>(() => (localStorage.getItem('orchestra_locale') as 'id' | 'en') || 'en');
  const [authToken, setAuthToken] = useState<string | null>(() => localStorage.getItem('orchestra_auth_token'));
  const [adminProfile, setAdminProfile] = useState<any>(() => {
    const saved = localStorage.getItem('orchestra_admin_profile');
    return saved ? JSON.parse(saved) : null;
  });

  // Data states
  const [hero, setHero] = useState<HeroContent>({
    title: 'Ardy Syafii',
    subtitle: 'Dynamic Systems Architect & Network Solutions Eng.',
    highlightText: 'Headless Landing page with integrated reverse proxy & DDNS management system.',
    socialBadgeText: '📡 VAIO SERVER ACTIVE',
    showKoperasiSection: true,
    ctaText: 'Get Started',
    ctaUrl: '/projects'
  });
  const [projects, setProjects] = useState<Project[]>([]);
  const [links, setLinks] = useState<SocialLink[]>([]);
  
// Admin only configs
  const [nginxConfigs, setNginxConfigs] = useState<NginxConfig[]>([]);
  const [caddySites, setCaddySites] = useState<{ id: string, name: string, status: 'up' | 'down', load: number }[]>([
    { id: '1', name: 'main-api.local', status: 'up', load: 12 },
    { id: '2', name: 'static.cdn.local', status: 'up', load: 5 },
    { id: '3', name: 'auth.service.local', status: 'down', load: 0 }
  ]);
  const [ddnsConfigs, setDdnsConfigs] = useState<DDNSConfig[]>([]);
  const [portForwards, setPortForwards] = useState<PortForward[]>([]);
  
  // New State for Upgrades
  const [systemResources, setSystemResources] = useState({ cpu: 15, ram: 42, disk: 68 });
  const [appLogs, setAppLogs] = useState<string[]>(['[INFO] Genesis Core initialized...', '[INFO] Caddy module loaded...']);

  // Page active tabs for Admin View
  const [activeAdminTab, setActiveAdminTab] = useState<'monitor' | 'content' | 'nginx' | 'ddns' | 'ports'>('monitor');

  // Interactive CRUD Modal/Forms states
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Partial<Project> | null>(null);

  const [isNginxModalOpen, setIsNginxModalOpen] = useState(false);
  const [editingNginx, setEditingNginx] = useState<Partial<NginxConfig> | null>(null);

  const [isCaddyModalOpen, setIsCaddyModalOpen] = useState(false);
  const [editingCaddy, setEditingCaddy] = useState<{name: string, domain: string} | null>(null);

  const [isDdnsModalOpen, setIsDdnsModalOpen] = useState(false);
  const [editingDdns, setEditingDdns] = useState<Partial<DDNSConfig> | null>(null);

  const [isPortModalOpen, setIsPortModalOpen] = useState(false);
  const [editingPort, setEditingPort] = useState<Partial<PortForward> | null>(null);
  const [isDocsModalOpen, setIsDocsModalOpen] = useState(false);

  // Public Interactive Page States
  const [activePublicTab, setActivePublicTab] = useState<'monitor' | 'nodes' | 'network'>('monitor');
  const [selectedTraceId, setSelectedTraceId] = useState<string | null>(null);
  const [pingSimulatorLogs, setPingSimulatorLogs] = useState<string[]>([
    '[SYSTEM] VAIO CORE DEPLOYED INGRESS GATEWAY ONLINE',
    '[ROUTING] ALL REVERSE PROXY HOPS OPERATIONAL (port 3000)',
    '[SECURITY] SSL DIRECTIVES SECURED VIA CERTBOT ON CLOUDFLARE'
  ]);
  const [pingLatencies, setPingLatencies] = useState<number[]>([]);
  const [latencyThreshold, setLatencyThreshold] = useState<number>(12);

  const clearTraceHistory = () => {
    setPingSimulatorLogs([]);
    setPingLatencies([]);
  };

  const triggerPingTrace = (projectName: string, targetLink: string) => {
    const time = new Date().toLocaleTimeString();
    const rtt = Math.floor(Math.random() * 12) + 4;
    const newLogs = [
      `[${time}] Requests trace sent to node: ${projectName}`,
      `[${time}] Trace path: Core Server -> Dynamic Proxy -> ${targetLink}`,
      `[${time}] Response received: code 200 OK | RTT ${rtt}ms`
    ];
    setPingSimulatorLogs(prev => [...newLogs, prev[0] || ''].slice(0, 8));
    setPingLatencies(prev => [rtt, ...prev].slice(0, 50));
  };

  const latencyStats = useMemo(() => {
    if (pingLatencies.length === 0) return { min: 0, max: 0, avg: 0 };
    const min = Math.min(...pingLatencies);
    const max = Math.max(...pingLatencies);
    const avg = Math.round(pingLatencies.reduce((a, b) => a + b, 0) / pingLatencies.length);
    const isHigh = pingLatencies.length > 0 && pingLatencies[0] > latencyThreshold;
    return { min, max, avg, isHigh, last: pingLatencies[0] || 0 };
  }, [pingLatencies, latencyThreshold]);

  // Admin Setting States
  const [settingsUsername, setSettingsUsername] = useState(() => localStorage.getItem('admin_username') || 'admin');
  const [settingsPassword, setSettingsPassword] = useState(() => localStorage.getItem('admin_password') || 'admin123');

  useEffect(() => {
    localStorage.setItem('admin_username', settingsUsername);
  }, [settingsUsername]);

  useEffect(() => {
    localStorage.setItem('admin_password', settingsPassword);
  }, [settingsPassword]);

  // UI States
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Auto-clear helper for notifications
  const triggerNotification = (type: 'success' | 'error', text: string) => {
    if (type === 'success') {
      setSuccessMsg(text);
      setTimeout(() => setSuccessMsg(''), 3500);
    } else {
      setErrorMsg(text);
      setTimeout(() => setErrorMsg(''), 4500);
    }
  };

  useEffect(() => {
    localStorage.setItem('orchestra_locale', locale);
  }, [locale]);

  const dict = {
    en: {
      featuredWork: 'Featured Work',
      entries: 'entries',
      open: 'Open',
      connect: 'Connect',
      adminSettings: 'Admin Settings',
      contentTab: 'Content',
      monitorTab: 'Monitor',
      nginxTab: 'Nginx',
      ddnsTab: 'DDNS',
      portsTab: 'Ports',
      heroLandingDetails: 'HERO & LANDING PAGE DETAILS',
      syncGateway: 'Sync Gateway Content',
      projectTiles: 'PROJECT TILES INCLUDED',
      addTile: 'Add Tile',
      activeStatus: 'ACTIVE',
      inactiveStatus: 'INACTIVE',
      getStarted: 'Get Started',
      documentation: 'Documentation',
      docsSubtitle: 'System Overview & Guidelines'
    },
    id: {
      featuredWork: 'Karya Unggulan',
      entries: 'entri',
      open: 'Buka',
      connect: 'Hubungkan',
      adminSettings: 'Pengaturan Admin',
      contentTab: 'Konten',
      monitorTab: 'Monitor',
      nginxTab: 'Nginx',
      ddnsTab: 'DDNS',
      portsTab: 'Port',
      heroLandingDetails: 'DETAIL HERO & LANDING PAGE',
      syncGateway: 'Sinkronisasi Konten Gateway',
      projectTiles: 'TILE PROYEK TERMASUK',
      addTile: 'Tambah Tile',
      activeStatus: 'AKTIF',
      inactiveStatus: 'NONAKTIF',
      getStarted: 'Mulai Sekarang',
      documentation: 'Dokumentasi',
      docsSubtitle: 'Tinjauan Sistem & Panduan'
    }
  };

  const t = dict[locale];

  // Load public data on mount
  useEffect(() => {
    loadPublicData();
  }, []);

  // When auth token changes, load admin config
  useEffect(() => {
    if (authToken) {
      loadAdminData();
    }
  }, [authToken]);

  const loadPublicData = async () => {
    try {
      const data = await fetchPublicContent();
      setHero(data.hero);
      setProjects(data.projects);
      setLinks(data.links);
    } catch (e) {
      console.error('Error loading public data:', e);
      triggerNotification('error', 'Network error. Using local cache.');
    } finally {
      setIsInitialLoading(false);
    }
  };

  const loadAdminData = async () => {
    if (!authToken) return;
    try {
      const data = await fetchAdminConfigs(authToken);
      setHero(data.hero);
      setProjects(data.projects);
      setLinks(data.links);
      setNginxConfigs(data.nginxConfigs);
      setDdnsConfigs(data.ddnsConfigs);
      setPortForwards(data.portForwards);
    } catch (e) {
      console.error('Session expired or error loading admin configs:', e);
      handleLogout();
    }
  };

  const handleLogout = async () => {
    if (authToken) {
      await logoutUser(authToken);
    }
    setAuthToken(null);
    setAdminProfile(null);
    setIsAdminMode(false);
    localStorage.removeItem('orchestra_auth_token');
    localStorage.removeItem('orchestra_admin_profile');
    loadPublicData();
  };

  const handleLoginSuccess = (token: string, profile: any) => {
    setAuthToken(token);
    setAdminProfile(profile);
    localStorage.setItem('orchestra_auth_token', token);
    localStorage.setItem('orchestra_admin_profile', JSON.stringify(profile));
    setIsAdminMode(false); // hide login screen, now show dashboard
  };

  // Save Hero Edits
  const handleSaveHero = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authToken) return;
    setLoading(true);
    try {
      await updateHeroContent(authToken, hero);
      triggerNotification('success', 'Hero Content & Visibility updated successfully');
      loadAdminData();
    } catch (err: any) {
      triggerNotification('error', err.message || 'Failed to update content');
    } finally {
      setLoading(false);
    }
  };

  // Create or Update Project
  const handleSaveProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authToken || !editingProject) return;
    try {
      if (editingProject.id) {
        // Edit mode
        await updateProject(authToken, editingProject.id, editingProject);
        triggerNotification('success', 'Project updated successfully');
      } else {
        // Create mode
        await addProject(authToken, {
          title: editingProject.title || '',
          description: editingProject.description || '',
          link: editingProject.link || '',
          iconName: editingProject.iconName || 'Sparkles',
          category: editingProject.category || 'Utility',
          isActive: editingProject.isActive !== false
        });
        triggerNotification('success', 'New Project registered successfully');
      }
      setIsProjectModalOpen(false);
      setEditingProject(null);
      loadAdminData();
    } catch (err: any) {
      triggerNotification('error', err.message);
    }
  };

  // Create or Update Nginx config
  const handleSaveNginxSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authToken || !editingNginx) return;
    try {
      if (editingNginx.id) {
        await updateNginxConfig(authToken, editingNginx.id, editingNginx);
        triggerNotification('success', 'Nginx VirtualHost updated and reloaded');
      } else {
        await addNginxConfig(authToken, {
          domainName: editingNginx.domainName || '',
          targetUrl: editingNginx.targetUrl || '',
          sslEnabled: !!editingNginx.sslEnabled,
          sslType: editingNginx.sslType || 'Certbot',
          sslEmail: editingNginx.sslEmail || '',
          isLoadBalanced: !!editingNginx.isLoadBalanced,
          upstreams: editingNginx.upstreams || [],
          customDirectives: editingNginx.customDirectives || '',
          isActive: editingNginx.isActive !== false
        });
        triggerNotification('success', 'Nginx config generated and registered');
      }
      setIsNginxModalOpen(false);
      setEditingNginx(null);
      loadAdminData();
    } catch (err: any) {
      triggerNotification('error', err.message);
    }
  };

  // Create or Update DDNS Config
  const handleSaveDdnsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authToken || !editingDdns) return;
    try {
      if (editingDdns.id) {
        await updateDdnsConfig(authToken, editingDdns.id, editingDdns);
        triggerNotification('success', 'DDNS resolver binding synchronized with Cloudflare API');
      } else {
        await addDdnsConfig(authToken, {
          provider: editingDdns.provider || 'Cloudflare',
          domainName: editingDdns.domainName || '',
          apiToken: editingDdns.apiToken || '',
          zoneId: editingDdns.zoneId || '',
          lastDetectedIp: editingDdns.lastDetectedIp || '180.244.131.25',
          status: editingDdns.status || 'Active'
        });
        triggerNotification('success', 'DDNS record router configured.');
      }
      setIsDdnsModalOpen(false);
      setEditingDdns(null);
      loadAdminData();
    } catch (err: any) {
      triggerNotification('error', err.message);
    }
  };

  // Create or Update Port Forward Settings
  const handleSavePortSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authToken || !editingPort) return;
    try {
      if (editingPort.id) {
        await updatePortForward(authToken, editingPort.id, editingPort);
        triggerNotification('success', 'Ingress tunnel routing updated');
      } else {
        await addPortForward(authToken, {
          name: editingPort.name || '',
          incomingPort: Number(editingPort.incomingPort) || 80,
          localAddress: editingPort.localAddress || '127.0.0.1',
          localPort: Number(editingPort.localPort) || 3000,
          webhookEnabled: !!editingPort.webhookEnabled,
          webhookUrl: editingPort.webhookUrl || '',
          status: editingPort.status || 'Active'
        });
        triggerNotification('success', 'Port forward ingress rule added');
      }
      setIsPortModalOpen(false);
      setEditingPort(null);
      loadAdminData();
    } catch (err: any) {
      triggerNotification('error', err.message);
    }
  };

  // Deletions
  const handleDeleteProj = async (id: string) => {
    if (!authToken || !confirm('Are you sure you want to remove this project?')) return;
    try {
      await deleteProject(authToken, id);
      triggerNotification('success', 'Project removed');
      loadAdminData();
    } catch (e: any) {
      triggerNotification('error', e.message);
    }
  };

  const handleDeleteNginx = async (id: string) => {
    if (!authToken || !confirm('Are you sure you want to remove this Nginx virtual block?')) return;
    try {
      await deleteNginxConfig(authToken, id);
      triggerNotification('success', 'Nginx VirtualHost config removed.');
      loadAdminData();
    } catch (e: any) {
      triggerNotification('error', e.message);
    }
  };

  const handleDeleteDdns = async (id: string) => {
    if (!authToken || !confirm('Are you sure you want to delete this DDNS routing binder?')) return;
    try {
      await deleteDdnsConfig(authToken, id);
      triggerNotification('success', 'DDNS resolver binding cleared.');
      loadAdminData();
    } catch (e: any) {
      triggerNotification('error', e.message);
    }
  };

  const handleDeletePort = async (id: string) => {
    if (!authToken || !confirm('Delete this tunnel forward record?')) return;
    try {
      await deletePortForward(authToken, id);
      triggerNotification('success', 'Ingress forward tunnel removed.');
      loadAdminData();
    } catch (e: any) {
      triggerNotification('error', e.message);
    }
  };

  // Trigger simulated DDNS check
  const [isSyncingDdns, setIsSyncingDdns] = useState(false);
  const handleTriggerDdnsSync = async () => {
    setIsSyncingDdns(true);
    setTimeout(async () => {
      if (ddnsConfigs.length > 0 && authToken) {
        const dummyIP = `180.244.${Math.floor(Math.random() * 254) + 1}.${Math.floor(Math.random() * 254) + 1}`;
        await updateDdnsConfig(authToken, ddnsConfigs[0].id, {
          lastDetectedIp: dummyIP,
          status: 'Active'
        });
        loadAdminData();
        triggerNotification('success', `DNS resolved synced successfully. New WAN IP detected: ${dummyIP}`);
      } else {
        triggerNotification('error', 'No active DDNS profile to synchronize.');
      }
      setIsSyncingDdns(false);
    }, 1500);
  };

  // Trigger webhooks simulation testing for port forwarders
  const [isTestingWebhook, setIsTestingWebhook] = useState(false);
  const handleTestWebhook = async (webhookUrl: string) => {
    setIsTestingWebhook(true);
    try {
      const res = await fetch('/api/webhooks/github', { method: 'POST' });
      const data = await res.json();
      if (data.ok) {
        triggerNotification('success', `Webhook OK. Target node loopback replied successfully! Timestamp: ${data.timestamp}`);
      } else {
        triggerNotification('error', 'Payload delivered, but returned faulty status response.');
      }
    } catch (e) {
      triggerNotification('error', 'Webhook unreachable or port mapping blocked on current route.');
    } finally {
      setIsTestingWebhook(false);
    }
  };

  // If user clicked administrative auth, load auth component
  if (isAdminMode && !authToken) {
    return (
      <AuthScreen
        onSuccess={handleLoginSuccess}
        onBack={() => setIsAdminMode(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 font-sans text-zinc-100 flex flex-col relative overflow-x-hidden selection:bg-sky-500 selection:text-white">
      <div className="noise-overlay" />
      
      {/* INITIAL LOAD SCREEN */}
      <AnimatePresence>
        {isInitialLoading && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.8, ease: "circOut" }}
            className="fixed inset-0 z-[100] bg-zinc-950 flex flex-col items-center justify-center gap-6"
          >
            <motion.div
              animate={{ 
                rotate: 360,
                scale: [1, 1.1, 1],
              }}
              transition={{ 
                rotate: { duration: 4, repeat: Infinity, ease: "linear" },
                scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
              }}
              className="w-16 h-16 rounded-2xl border-2 border-zinc-800 border-t-sky-500 relative flex items-center justify-center"
            >
              <Cpu size={24} className="text-zinc-600" />
            </motion.div>
            <div className="flex flex-col items-center gap-2">
              <span className="text-[10px] font-mono font-bold tracking-[0.4em] text-zinc-500 uppercase">Genesis Core</span>
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    animate={{ opacity: [0.2, 1, 0.2] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                    className="w-1 h-1 rounded-full bg-sky-500"
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dynamic Network Mesh Effect (pure CSS and SVG, no heavy images or emojis) */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900 via-zinc-950 to-zinc-950 opacity-100 pointer-events-none" />
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-zinc-800 to-transparent" />

      {/* HEADER BAR - Floating Island Style (Only for Admin Portal access) */}
      {isAdminMode && (
        <div className="fixed top-4 left-0 right-0 z-50 px-4 flex justify-center pointer-events-none">
          <header className="w-full max-w-4xl bg-zinc-950/80 backdrop-blur-xl border border-zinc-800 px-4 py-2.5 rounded-2xl flex items-center justify-between shadow-2xl shadow-zinc-950/50 pointer-events-auto">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-zinc-900 border border-zinc-800 flex items-center justify-center text-sky-400">
              <Cpu size={14} className="animate-pulse" />
            </div>
            <div>
              <span id="header-app-logo" className="text-xs font-mono font-bold tracking-wider text-white uppercase">
                Genesis <span className="text-sky-500 font-sans font-light">Core</span>
              </span>
              <div className="text-[9px] font-mono text-zinc-500 flex items-center gap-1.5">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping-slow" />
                <span>ADMIN PORTAL — NODE 2026.05</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {authToken ? (
              <div className="flex items-center gap-1.5">
                <div className="hidden xs:flex flex-col text-right">
                  <span className="text-[10px] font-mono text-zinc-300 font-semibold">{adminProfile?.fullName}</span>
                  <span className="text-[8px] text-zinc-500 uppercase tracking-widest font-mono">ROOT DEPLOYER</span>
                </div>
                <button
                  id="btn-logout"
                  onClick={handleLogout}
                  title="Log out of Secure Session"
                  className="w-7 h-7 rounded bg-red-950/60 border border-red-900/60 flex items-center justify-center text-red-400 hover:bg-red-900 hover:text-red-100 transition cursor-pointer"
                >
                  <LogOut size={12} />
                </button>
              </div>
            ) : null}
          </div>
        </header>
      </div>
      )}

      {/* Global Status notifications */}
      <AnimatePresence>
        {(successMsg || errorMsg) && (
          <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full px-4">
            {successMsg && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="p-3 rounded bg-zinc-900 border border-emerald-500/50 text-xs text-zinc-100 shadow-xl flex items-start gap-2 max-w-xs font-mono ml-auto"
              >
                <Check size={14} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                <span>{successMsg}</span>
              </motion.div>
            )}

            {errorMsg && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="p-3 rounded bg-zinc-900 border border-red-500/50 text-xs text-zinc-100 shadow-xl flex items-start gap-2 max-w-xs font-mono ml-auto"
              >
                <AlertCircle size={14} className="text-red-500 flex-shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </motion.div>
            )}
          </div>
        )}
      </AnimatePresence>

      {/* MAIN VIEW CONTROLLER */}
      <main className="flex-grow flex flex-col w-full">
        {authToken ? (
          /* ======================================================== */
          /* ADMINISTRATIVE ACTIVE VIEW - CMS & VPS ROUTING INTEGRATIONS */
          /* ======================================================== */
          <div className="flex-1 flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-zinc-900">
            
            {/* Minimal Mobile friendly Subnav dashboard sidebar */}
            <div className="w-full lg:w-56 bg-zinc-950/60 p-3 flex lg:flex-col gap-1.5 overflow-x-auto lg:overflow-x-visible whitespace-nowrap scrollbar-none border-b lg:border-b-0 border-zinc-900">
              <div className="hidden lg:block px-2 pb-2 mb-2 border-b border-zinc-900">
                <span className="text-[10px] text-zinc-500 font-mono tracking-widest block uppercase">ORCHESTRA SYSTEM</span>
                <span className="text-xs text-white font-mono font-bold">Control Board</span>
              </div>

              {[
                { id: 'monitor', label: 'Gateway Monitor', icon: Monitor },
                { id: 'content', label: 'Landing Page CMS', icon: Sliders },
                { id: 'nginx', label: 'Nginx VirtualHosts', icon: Globe },
                { id: 'ddns', label: 'DDNS Synchronizer', icon: RefreshCw },
                { id: 'ports', label: 'Port Ingress Tunnel', icon: Server },
                { id: 'settings', label: 'Admin Settings', icon: Settings }
              ].map(tb => {
                const Icon = tb.icon;
                const active = activeAdminTab === tb.id;
                return (
                  <button
                    key={tb.id}
                    id={`tab-admin-${tb.id}`}
                    onClick={() => setActiveAdminTab(tb.id as any)}
                    className={`flex items-center gap-2 px-3 py-2 rounded text-xs font-mono tracking-wide transition cursor-pointer select-none ${
                      active
                        ? 'bg-sky-500/10 text-sky-400 border border-sky-500/30'
                        : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-950'
                    }`}
                  >
                    <Icon size={13} className={`${active ? 'text-sky-400' : 'text-zinc-500'} drop-shadow-neon`} />
                    <span>{tb.label}</span>
                  </button>
                );
              })}

              <div className="hidden lg:block mt-auto p-2 border border-zinc-900 rounded bg-zinc-950/80">
                <div className="text-[8px] font-mono text-zinc-500 tracking-wider">SECURE SHELL STATUS</div>
                <div className="text-[10px] text-emerald-400 font-mono mt-1 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full inline-block animate-ping-slow" />
                  <span>Vaio Proxy Online</span>
                </div>
              </div>
            </div>

            {/* Active module execution area */}
            <div className="flex-1 p-3 xs:p-4 bg-zinc-950/20 max-w-full overflow-hidden">
              
              <AnimatePresence mode="wait">
                {activeAdminTab === 'monitor' && (
                  <motion.div
                    key="tab-monitor"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-4 font-mono text-xs"
                  >
                    {/* CADDY MONITORING SECTION */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <ResourceTile label="CPU Load" value={systemResources.cpu} color="#0ea5e9" />
                      <ResourceTile label="RAM Usage" value={systemResources.ram} color="#8b5cf6" />
                      <ResourceTile label="Disk Space" value={systemResources.disk} color="#10b981" />
                    </div>

                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 shadow-neon">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xs font-bold text-sky-400 uppercase tracking-widest">Caddy Proxy Telemetry</h3>
                        <div className="flex items-center gap-2">
                          <button onClick={() => setIsCaddyModalOpen(true)} className="flex items-center gap-1.5 px-3 py-1 bg-sky-500/10 border border-sky-500/30 rounded text-[10px] text-sky-400 hover:bg-sky-500/20">
                            <Plus size={10} /> Easy Setup
                          </button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {caddySites.map(site => (
                          <div key={site.id} className="bg-zinc-950 p-3 rounded border border-zinc-800">
                             <div className="flex items-center justify-between mb-2">
                               <span className="text-[10px] font-bold text-white">{site.name}</span>
                               <span className={`px-1.5 py-0.5 rounded text-[8px] ${site.status === 'up' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                                 {site.status.toUpperCase()}
                               </span>
                             </div>
                             <div className="flex items-center justify-between text-[8px] text-zinc-500">
                               <span>Load</span>
                               <span>{site.load}%</span>
                             </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                          <h3 className="text-xs font-bold text-zinc-300 uppercase mb-3">Deployment Checklist</h3>
                          {['Update Caddy Config', 'Verify SSL Certs', 'Restart Nginx', 'Clear Logs'].map(item => (
                            <div key={item} className="flex items-center gap-2 text-[10px] text-zinc-400 mb-2">
                              <input type="checkbox" className="accent-sky-500" /> {item}
                            </div>
                          ))}
                      </div>
                      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                          <h3 className="text-xs font-bold text-zinc-300 uppercase mb-3">Logs & Validator</h3>
                          <LogTerminal logs={appLogs} />
                          <button className="mt-2 w-full text-[9px] uppercase py-1 bg-zinc-800 hover:bg-zinc-700">Validate Configs</button>
                      </div>
                    </div>

                    <div>
                      <h2 className="text-sm font-semibold tracking-tight text-white font-mono uppercase">LIVE GATEWAY MONITOR & TUNNEL ROUTING</h2>
                      <p className="text-[11px] text-zinc-500 font-mono text-xs">Secure administrative telemetries, reverse proxy hops & Cloudflare DDNS resolvers</p>
                    </div>

                    {/* Network stats indicators */}
                    {/* Admin Actions Bar */}
                    <div className="flex items-center justify-between bg-zinc-950 border border-zinc-900 rounded-xl p-3 shadow-neon">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 shadow-neon">
                          <User size={14} className="drop-shadow-neon" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest leading-none mb-0.5">Session Active</span>
                          <span className="text-xs font-bold text-white tracking-tight leading-none">{adminProfile?.fullName}</span>
                        </div>
                      </div>
                      <button 
                        onClick={handleLogout}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-red-950/40 border border-red-900/50 rounded-lg text-[10px] font-mono font-bold text-red-100 hover:bg-red-900 hover:text-white shadow-neon transition-all active:scale-95 cursor-pointer uppercase tracking-tight"
                      >
                        <LogOut size={12} className="drop-shadow-neon" />
                        Terminate
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="bg-zinc-900 border border-zinc-800/80 rounded-xl p-3 text-center shadow-neon">
                        <span className="text-[8px] text-zinc-500 block uppercase font-mono font-bold tracking-wider drop-shadow-neon">Dynamic Gateway</span>
                        <span className="text-white text-xs font-mono font-bold block mt-1 truncate">180.244.131.25</span>
                      </div>
                      
                      <div className="bg-zinc-900 border border-zinc-800/80 rounded-xl p-3 text-center shadow-neon">
                        <span className="text-[8px] text-zinc-500 block uppercase font-mono font-bold tracking-wider drop-shadow-neon">Reverse Proxies</span>
                        <span className="text-cyan-400 text-xs font-mono font-bold block mt-1">
                          {nginxConfigs.length > 0 ? `${nginxConfigs.length} Active` : 'VAIO CORE'}
                        </span>
                      </div>

                      <div className="bg-zinc-900 border border-zinc-800/80 rounded-xl p-3 text-center shadow-neon">
                        <span className="text-[8px] text-zinc-500 block uppercase font-mono font-bold tracking-wider drop-shadow-neon">Throughput</span>
                        <span className="text-emerald-400 text-xs font-mono font-bold block mt-1">102.4 Mb/s</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                       <SystemMonitor />
                       <VisitorAnalytics />
                    </div>

                    {/* Interactive Sandbox Tracer Circuit */}
                    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex flex-col gap-3 shadow-[0_0_20px_rgba(56,189,248,0.05)] hover:shadow-[0_0_30px_rgba(56,189,248,0.15)] transition-all duration-500 relative overflow-hidden">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-[10px] font-mono text-zinc-350 font-bold block uppercase tracking-wider">Interactive Trace Sandbox</span>
                          <span className="text-[8px] font-mono text-zinc-500 uppercase block mt-0.5">Tap a registered node below to trace ingress hop packets</span>
                        </div>
                        <span className="text-[8px] bg-cyan-950/40 text-cyan-400 border border-cyan-800/40 px-1.5 py-0.5 rounded font-mono font-semibold">ACTIVE NODE TUNNEL</span>
                      </div>

                      {/* Interactive Visual Trace schematic */}
                      <div className="bg-zinc-950 border border-zinc-800/80 rounded-xl p-3 relative h-20 overflow-hidden flex items-center justify-between shadow-inner font-mono">
                        {/* Schematic wire dots */}
                        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f1f1f_1px,transparent_1px),linear-gradient(to_bottom,#1f1f1f_1px,transparent_1px)] bg-[size:10px_10px] opacity-20" />
                        
                        <div className="z-10 text-center flex flex-col items-center">
                          <span className="w-2 h-2 rounded-full bg-cyan-500 animate-ping absolute shadow-neon" />
                          <span className="w-2 h-2 rounded-full bg-cyan-400 z-20 shadow-neon" />
                          <span className="text-[7.5px] text-zinc-400 mt-1 uppercase tracking-wider drop-shadow-neon">Client Ingress</span>
                        </div>

                        {/* Connection vector path */}
                        <div className="flex-1 mx-3 h-0.5 bg-zinc-800 relative z-0">
                          <motion.div
                            animate={{ x: ['-100%', '100%'] }}
                            transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
                            className="absolute top-0 bottom-0 w-8 bg-gradient-to-r from-transparent via-cyan-400 to-transparent"
                          />
                        </div>

                        <div className="z-10 text-center flex flex-col items-center">
                          <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse shadow-neon" />
                          <span className="text-[7.5px] text-zinc-400 mt-1 uppercase tracking-wider drop-shadow-neon">Genesis Proxy</span>
                        </div>

                        <div className="flex-1 mx-3 h-0.5 bg-zinc-800 relative z-0">
                          <motion.div
                            animate={{ x: ['-100%', '100%'] }}
                            transition={{ repeat: Infinity, duration: 2.2, ease: 'linear' }}
                            className="absolute top-0 bottom-0 w-8 bg-gradient-to-r from-transparent via-cyan-400 to-transparent"
                          />
                        </div>

                        <div className="z-10 text-center flex flex-col items-center">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          <span className="text-[7.5px] text-zinc-400 mt-1 uppercase tracking-wider">Target Module</span>
                        </div>
                      </div>

                      {/* Selectable Project Trigger nodes */}
                      <div className="flex flex-wrap gap-1.5 py-1">
                        {projects.slice(0, 5).map((p) => {
                          const active = selectedTraceId === p.id;
                          return (
                            <button
                              key={p.id}
                              type="button"
                              onClick={() => {
                                setSelectedTraceId(p.id);
                                triggerPingTrace(p.title, p.link);
                              }}
                              className={`px-2.5 py-1.5 rounded border text-[10px] font-mono transition-all cursor-pointer ${
                                active
                                  ? 'bg-cyan-500/10 border-cyan-400 text-cyan-300'
                                  : 'bg-zinc-950 border-zinc-850 text-zinc-400 hover:text-white hover:border-zinc-700'
                              }`}
                            >
                              🚀 {p.title}
                            </button>
                          );
                        })}
                      </div>

                      {/* Real-time Latency Stats */}
                      <div className="flex items-center justify-between px-1 mb-1">
                         <div className="flex items-center gap-4">
                            <span className="text-[7px] text-zinc-500 uppercase font-mono tracking-widest">Performance Metrics</span>
                            <button 
                              onClick={clearTraceHistory}
                              className="group/clear flex items-center gap-1 text-[7px] text-zinc-600 hover:text-red-400 transition-colors uppercase font-mono tracking-tighter"
                              title="Clear Trace History"
                            >
                               <Trash2 size={8} className="group-hover/clear:scale-110 transition-transform" />
                               <span>Clear History</span>
                            </button>
                         </div>
                         {latencyStats.isHigh && (
                            <div className="flex items-center gap-1 text-orange-500 animate-pulse">
                               <AlertTriangle size={8} className="drop-shadow-neon" />
                               <span className="text-[7px] font-mono font-bold uppercase tracking-tighter">High Latency Detected</span>
                            </div>
                         )}
                      </div>
                      <div className="grid grid-cols-3 gap-2 py-1">
                        <div className="bg-zinc-950/50 border border-zinc-800/80 rounded-lg p-2 text-center group/stat hover:border-cyan-500/30 transition-colors">
                           <span className="text-[7px] text-zinc-500 uppercase block font-mono tracking-widest mb-0.5 group-hover/stat:text-cyan-500 transition-colors">Min Latency</span>
                           <span className="text-xs font-mono font-bold text-sky-400 drop-shadow-neon">{latencyStats.min}ms</span>
                        </div>
                        <div className="bg-zinc-950/50 border border-zinc-800/80 rounded-lg p-2 text-center group/stat hover:border-emerald-500/30 transition-colors">
                           <span className="text-[7px] text-zinc-500 uppercase block font-mono tracking-widest mb-0.5 group-hover/stat:text-emerald-500 transition-colors">Avg Latency</span>
                           <span className="text-xs font-mono font-bold text-emerald-400 drop-shadow-neon">{latencyStats.avg}ms</span>
                        </div>
                        <div className={`bg-zinc-950/50 border rounded-lg p-2 text-center group/stat transition-colors ${latencyStats.isHigh ? 'border-orange-500/40' : 'border-zinc-800/80 hover:border-orange-500/30'}`}>
                           <span className="text-[7px] text-zinc-500 uppercase block font-mono tracking-widest mb-0.5 group-hover/stat:text-orange-500 transition-colors">Max Latency</span>
                           <span className="text-xs font-mono font-bold text-orange-400 drop-shadow-neon">{latencyStats.max}ms</span>
                        </div>
                      </div>

                      {/* Micro Real-time Terminal Log Stream */}
                      <div className="bg-black/80 p-3 rounded border border-zinc-800/80 text-[9px] font-mono text-zinc-400 space-y-1 max-h-24 overflow-y-auto">
                        {pingSimulatorLogs.map((log, idx) => (
                          <div key={idx} className={idx === 0 ? 'text-white font-bold' : ''}>
                            {idx === 0 && <span className="text-cyan-400 mr-1">»</span>}
                            {log}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Tunnel Routing details */}
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-3 shadow-[0_0_20px_rgba(56,189,248,0.05)] hover:shadow-[0_0_30px_rgba(56,189,248,0.1)] transition-all duration-500">
                      <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                        <span className="text-[9px] font-mono text-zinc-500 font-bold uppercase tracking-wider">RESOLVER CHANNELS PREVIEW</span>
                        <span className="inline-flex items-center gap-1.5 bg-cyan-950/40 border border-cyan-800/40 px-2 py-0.5 rounded text-[8px] font-mono text-cyan-400">
                          <span className="w-1 h-1 bg-cyan-400 rounded-full animate-pulse" />
                          SSL SECURED BY DIRECT CERTBOT
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {/* Nginx Virtual Host proxy representation */}
                        <div className="p-3 bg-zinc-950 border border-zinc-850 rounded-xl text-xs flex flex-col gap-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[8px] font-mono text-zinc-500 uppercase tracking-widest">NGINX EDGE DIRECTIVES</span>
                            <span className="text-[9px] font-mono font-bold text-cyan-400">Active Proxy</span>
                          </div>
                          <p className="text-[11.5px] text-zinc-100 font-semibold mt-0.5 font-mono">Router Gateway Daemon</p>
                          <p className="text-[10px] text-zinc-400 font-mono italic mt-0.5">
                            Passes secure Client HTTP request packets directly to local application sockets with optimized latency offsets.
                          </p>
                        </div>

                        {/* Built-in DDNS Resolver status representation */}
                        <div className="p-3 bg-zinc-950 border border-zinc-850 rounded-xl text-xs flex flex-col gap-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[8px] font-mono text-zinc-500 uppercase tracking-widest font-mono">DDNS REGISTER CONTROL</span>
                            <span className="text-[9px] font-mono font-bold text-purple-400 font-mono">Cloudflare API</span>
                          </div>
                          <p className="text-[11.5px] text-zinc-100 font-semibold mt-0.5">Dynamic DNS Sync Service</p>
                          <p className="text-[10px] text-zinc-400 font-mono italic mt-0.5">
                            Automatically synchronizes dynamic public host IP endpoints every 15 minutes to keep routing pipelines active.
                          </p>
                        </div>

                        {/* Ingress Gateway status representation */}
                        <div className="p-3 bg-zinc-950 border border-zinc-850 rounded-xl text-xs flex flex-col gap-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[8px] font-mono text-zinc-550 uppercase tracking-widest text-zinc-500">FORWARD TUNNEL PORTING</span>
                            <span className="text-[9px] font-mono font-bold text-emerald-400">Loopback OK</span>
                          </div>
                          <p className="text-[11.5px] text-zinc-100 font-semibold mt-0.5">Live Port Forward Tunneling</p>
                          <p className="text-[10px] text-zinc-400 font-mono italic mt-0.5">
                            Integrates dynamic external callback URLs with low latency response checking for instant developer feedback.
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeAdminTab === 'content' && (
                  <motion.div
                    key="tab-content"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-sm font-semibold tracking-tight text-white font-mono">HERO & LANDING PAGE DETAILS</h2>
                        <p className="text-[11px] text-zinc-500 font-mono">Configure details instantly rendered to the public page</p>
                      </div>
                    </div>

                    <div className="bg-zinc-900 border border-zinc-800 rounded p-4 shadow-[0_0_20px_rgba(56,189,248,0.05)]">
                      <form onSubmit={handleSaveHero} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[11px] font-mono text-zinc-400 uppercase tracking-wider mb-1">Developer Title</label>
                            <input
                              type="text"
                              value={hero.title}
                              onChange={e => setHero({ ...hero, title: e.target.value })}
                              className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-xs text-zinc-100 placeholder-zinc-700"
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-mono text-zinc-400 uppercase tracking-wider mb-1">Dynamic Subtitle</label>
                            <input
                              type="text"
                              value={hero.subtitle}
                              onChange={e => setHero({ ...hero, subtitle: e.target.value })}
                              className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-xs text-zinc-100 placeholder-zinc-700"
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-mono text-zinc-400 uppercase tracking-wider mb-1">CTA Button Text</label>
                            <input
                              type="text"
                              value={hero.ctaText || ''}
                              onChange={e => setHero({ ...hero, ctaText: e.target.value })}
                              className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-xs text-zinc-100 placeholder-zinc-700"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-mono text-zinc-400 uppercase tracking-wider mb-1">CTA URL</label>
                            <input
                              type="text"
                              value={hero.ctaUrl || ''}
                              onChange={e => setHero({ ...hero, ctaUrl: e.target.value })}
                              className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-xs text-zinc-100 placeholder-zinc-700"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] font-mono text-zinc-400 uppercase tracking-wider mb-1">Highlights Text</label>
                          <textarea
                            value={hero.highlightText}
                            rows={2}
                            onChange={e => setHero({ ...hero, highlightText: e.target.value })}
                            className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-xs text-zinc-100 placeholder-zinc-700 font-sans"
                            required
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
                          <div>
                            <label className="block text-[11px] font-mono text-zinc-400 uppercase tracking-wider mb-1">Badge Status Info</label>
                            <input
                              type="text"
                              value={hero.socialBadgeText || ''}
                              onChange={e => setHero({ ...hero, socialBadgeText: e.target.value })}
                              placeholder="e.g. VAIO SERVER ACTIVE"
                              className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-xs text-zinc-100 placeholder-zinc-700 font-mono"
                            />
                          </div>

                          <div className="flex flex-col justify-center">
                            <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider mb-1">Visibility Controls</span>
                            <label className="flex items-center gap-2 mt-1.5 cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={hero.showKoperasiSection}
                                onChange={e => setHero({ ...hero, showKoperasiSection: e.target.checked })}
                                className="rounded bg-zinc-950 border-zinc-800 text-sky-500 w-4 h-4 focus:ring-0 focus:ring-offset-0"
                              />
                              <span className="text-xs text-zinc-200 font-mono">Include 'Koperasi' Category Projects</span>
                            </label>
                          </div>
                        </div>

                        <div className="pt-2 flex justify-end">
                          <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 bg-sky-500 hover:bg-sky-400 text-zinc-950 font-mono text-xs font-semibold rounded transition cursor-pointer"
                          >
                            {loading ? 'Executing Script...' : 'Sync Gateway Content'}
                          </button>
                        </div>
                      </form>
                    </div>

                    {/* MANAGING PROJECTS COMPACT TABLE */}
                    <div className="mt-6">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h3 className="text-xs font-bold font-mono tracking-widest text-zinc-300 uppercase">PROJECT TILES INCLUDED</h3>
                          <p className="text-[10px] text-zinc-500 font-mono">Rendered dynamically under public portfolio section</p>
                        </div>
                        <button
                          onClick={() => {
                            setEditingProject({
                              title: '',
                              description: '',
                              link: '',
                              iconName: 'Sparkles',
                              category: 'Core',
                              isActive: true
                            });
                            setIsProjectModalOpen(true);
                          }}
                          className="flex items-center gap-1 px-2.5 py-1 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded text-xs font-mono text-sky-400 cursor-pointer"
                        >
                          <Plus size={12} /> Add Tile
                        </button>
                      </div>

                      <div className="overflow-x-auto border border-zinc-900 rounded bg-zinc-900/60">
                        <table className="w-full text-left border-collapse font-mono text-xs text-zinc-300">
                          <thead>
                            <tr className="bg-zinc-950 border-b border-zinc-900 text-zinc-500 text-[10px] uppercase">
                              <th className="p-2">Title</th>
                              <th className="p-2 hidden sm:table-cell">Desc</th>
                              <th className="p-2">Group</th>
                              <th className="p-2">Status</th>
                              <th className="p-2 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-zinc-900">
                            {projects.map(proj => (
                              <tr key={proj.id} className="hover:bg-zinc-900/40">
                                <td className="p-2 font-bold text-white max-w-[120px] truncate">{proj.title}</td>
                                <td className="p-2 text-zinc-400 truncate max-w-[200px] hidden sm:table-cell">{proj.description}</td>
                                <td className="p-2 text-zinc-400 text-[10px]"><span className="px-1.5 py-0.5 rounded bg-zinc-950 border border-zinc-800">{proj.category}</span></td>
                                <td className="p-2">
                                  <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] ${proj.isActive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-zinc-800 text-zinc-500'}`}>
                                    {proj.isActive ? 'Active' : 'Inactive'}
                                  </span>
                                </td>
                                <td className="p-2 text-right space-x-1">
                                  <button
                                    onClick={() => {
                                      setEditingProject(proj);
                                      setIsProjectModalOpen(true);
                                    }}
                                    className="p-1 text-zinc-400 hover:text-sky-400 transition"
                                  >
                                    <Edit3 size={12} />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteProj(proj.id)}
                                    className="p-1 text-zinc-400 hover:text-red-400 transition"
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeAdminTab === 'nginx' && (
                  <motion.div
                    key="tab-nginx"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-sm font-semibold tracking-tight text-white font-mono">NGINX REVERSE PROXY MANAGER</h2>
                        <p className="text-[11px] text-zinc-500 font-mono">Configure custom routing domains, load-balanced upstreams, and Certbot certificates</p>
                      </div>
                      <button
                        onClick={() => {
                          setEditingNginx({
                            domainName: '',
                            targetUrl: '',
                            sslEnabled: true,
                            sslType: 'Certbot',
                            isLoadBalanced: false,
                            upstreams: [],
                            customDirectives: '',
                            isActive: true
                          });
                          setIsNginxModalOpen(true);
                        }}
                        className="flex items-center gap-1 px-2.5 py-1 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded text-xs font-mono text-sky-400 cursor-pointer"
                      >
                        <Plus size={12} /> New VirtualHost
                      </button>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      {nginxConfigs.map(config => (
                        <div key={config.id} className="bg-zinc-900 border border-zinc-800 rounded p-4 shadow-[0_0_20px_rgba(56,189,248,0.05)] hover:shadow-[0_0_30px_rgba(56,189,248,0.15)] transition-all duration-500 relative overflow-hidden">
                          <div className="absolute top-0 left-0 h-full w-[3px] bg-sky-500" />
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800/60 pb-2 mb-3">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-xs font-bold text-white">{config.domainName}</span>
                                {config.sslEnabled && (
                                  <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-mono">SSL Termination</span>
                                )}
                              </div>
                              <p className="text-[10px] text-zinc-400 font-mono mt-0.5">
                                Maps to: <strong className="text-zinc-200">{config.isLoadBalanced ? 'Internal Upstream Cluster' : config.targetUrl}</strong>
                              </p>
                            </div>
                            <div className="flex items-center gap-1.5 self-end sm:self-auto">
                              <button
                                onClick={() => {
                                  setEditingNginx(config);
                                  setIsNginxModalOpen(true);
                                }}
                                className="px-2 py-1 rounded bg-zinc-950 border border-zinc-800 text-[10px] font-mono text-sky-400 hover:text-sky-300 transition"
                              >
                                Edit vHost
                              </button>
                              <button
                                onClick={() => handleDeleteNginx(config.id)}
                                className="p-1 rounded bg-zinc-950 border border-zinc-800 text-zinc-500 hover:text-red-400 transition"
                              >
                                <Trash2 size={11} />
                              </button>
                            </div>
                          </div>

                          {/* Upstreams cluster nodes if load balanced */}
                          {config.isLoadBalanced && config.upstreams.length > 0 && (
                            <div className="mb-3 p-2 bg-zinc-950/80 border border-zinc-800 rounded">
                              <div className="text-[9px] text-zinc-500 font-mono uppercase tracking-wider mb-1">Multi-Node Upstream Target Groups</div>
                              <div className="space-y-1">
                                {config.upstreams.map((node, i) => (
                                  <div key={i} className="text-[10px] font-mono text-zinc-300 flex items-center gap-2">
                                    <CornerDownRight size={10} className="text-zinc-500" />
                                    <span>Node {i + 1}: <strong className="text-white bg-zinc-900 border border-zinc-800 px-1 py-0.5 rounded text-[8px]">{node}</strong></span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Raw virtual block output code generated for Nginx */}
                          <div className="bg-zinc-950 p-2.5 rounded border border-zinc-800 font-mono text-[10px] text-zinc-400 overflow-x-auto max-h-32 leading-relaxed">
                            <span className="text-[9px] text-zinc-600 block border-b border-zinc-900 pb-1 mb-1 font-sans font-bold">GENERATED CONFIGURED TEMPLATE BLOCK</span>
                            <pre className="whitespace-pre">{config.lastGeneratedContent || '# Virtual Host Content Stale'}</pre>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {activeAdminTab === 'ddns' && (
                  <motion.div
                    key="tab-ddns"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-sm font-semibold tracking-tight text-white font-mono">BUILT-IN DDNS RESOLVER</h2>
                        <p className="text-[11px] text-zinc-500 font-mono">Synchronize dynamically updated home server WAN address into Cloudflare Zones</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={handleTriggerDdnsSync}
                          disabled={isSyncingDdns}
                          className="flex items-center gap-1.5 px-3 py-1 bg-sky-500 hover:bg-sky-400 text-zinc-950 rounded text-xs font-mono font-semibold transition cursor-pointer"
                        >
                          <RefreshCw size={12} className={isSyncingDdns ? 'animate-spin' : ''} />
                          <span>{isSyncingDdns ? 'Syncing...' : 'Force DDNS Check'}</span>
                        </button>
                        <button
                          onClick={() => {
                            setEditingDdns({
                              provider: 'Cloudflare',
                              domainName: '',
                              apiToken: '',
                              zoneId: '',
                              lastDetectedIp: '180.244.131.25',
                              status: 'Syncing'
                            });
                            setIsDdnsModalOpen(true);
                          }}
                          className="flex items-center gap-1 px-2.5 py-1 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded text-xs font-mono text-sky-400 cursor-pointer"
                        >
                          <Plus size={12} /> New Record
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {ddnsConfigs.map(cfg => (
                        <div key={cfg.id} className="bg-zinc-900 border border-zinc-800 rounded p-4 shadow-[0_0_20px_rgba(56,189,248,0.05)] hover:shadow-[0_0_30px_rgba(56,189,248,0.15)] transition-all duration-500">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-[10px] uppercase font-mono tracking-widest text-zinc-500">PROVIDER: {cfg.provider}</span>
                            <div className="flex items-center gap-2">
                               <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[9px] font-mono">{cfg.status}</span>
                               <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-zinc-950 border border-zinc-800 shadow-neon">
                                  <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                                  <span className="text-[8px] font-mono font-bold text-zinc-400 uppercase tracking-tighter">
                                    Heartbeat: {getRelativeTime(cfg.lastUpdated)}
                                  </span>
                               </div>
                            </div>
                          </div>

                          <div className="space-y-2 mb-4">
                            <div>
                              <span className="text-[9px] text-zinc-500 font-mono uppercase block">Target Resolving Domain</span>
                              <span className="text-xs text-white font-mono font-bold font-mono">{cfg.domainName}</span>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <span className="text-[9px] text-zinc-500 font-mono uppercase block">WAN IP Bind</span>
                                <span className="text-xs text-amber-400 font-mono font-mono">{cfg.lastDetectedIp}</span>
                              </div>
                              <div>
                                <span className="text-[9px] text-zinc-500 font-mono uppercase block">Last Heartbeat Checked</span>
                                <span className="text-[10px] text-zinc-400 font-mono">{new Date(cfg.lastUpdated).toLocaleTimeString()}</span>
                              </div>
                            </div>
                          </div>

                          <div className="border-t border-zinc-800/80 pt-3 flex justify-end gap-1.5">
                            <button
                              onClick={() => {
                                setEditingDdns(cfg);
                                setIsDdnsModalOpen(true);
                              }}
                              className="px-2.5 py-1 rounded bg-zinc-950 border border-zinc-800 text-[10px] text-zinc-300 hover:text-sky-400 font-mono transition"
                            >
                              Edit Profile
                            </button>
                            <button
                              onClick={() => handleDeleteDdns(cfg.id)}
                              className="p-1 px-2 rounded bg-zinc-950 border border-zinc-800 text-zinc-500 hover:text-red-400 transition"
                            >
                              <Trash2 size={11} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {activeAdminTab === 'ports' && (
                  <motion.div
                    key="tab-ports"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-sm font-semibold tracking-tight text-white font-mono">PORT INGRESS & WEBHOOK MAPPINGS</h2>
                        <p className="text-[11px] text-zinc-500 font-mono">Expose port mappings to inspect real-time webhooks (e.g. GitHub trigger payload)</p>
                      </div>
                      <button
                        onClick={() => {
                          setEditingPort({
                            name: '',
                            incomingPort: 8080,
                            localAddress: '127.0.0.1',
                            localPort: 3000,
                            webhookEnabled: true,
                            webhookUrl: 'http://localhost:3000/api/webhooks/github',
                            status: 'Active'
                          });
                          setIsPortModalOpen(true);
                        }}
                        className="flex items-center gap-1 px-2.5 py-1 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded text-xs font-mono text-sky-400 cursor-pointer"
                      >
                        <Plus size={12} /> Add Rule
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {portForwards.map(pf => (
                        <div key={pf.id} className="bg-zinc-900 border border-zinc-800 rounded p-4 flex flex-col justify-between shadow-[0_0_20px_rgba(56,189,248,0.05)] hover:shadow-[0_0_30px_rgba(56,189,248,0.15)] transition-all duration-500">
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-mono font-bold text-white max-w-[70%] truncate">{pf.name}</span>
                              <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono ${
                                pf.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-zinc-800 text-zinc-500'
                              }`}>
                                {pf.status}
                              </span>
                            </div>

                            <div className="bg-zinc-950 p-2 rounded border border-zinc-800 flex items-center justify-center gap-2 mb-3 font-mono text-[11px]">
                              <span className="text-zinc-500">EXPOSED PORT</span>
                              <strong className="text-amber-400 font-bold">: {pf.incomingPort}</strong>
                              <ChevronRight size={12} className="text-zinc-500" />
                              <span className="text-sky-400">{pf.localAddress} : {pf.localPort}</span>
                            </div>

                            {pf.webhookEnabled && (
                              <div className="p-2 rounded bg-zinc-950 border border-zinc-800 text-[10px] font-mono tracking-wide">
                                <div className="text-zinc-500 text-[8px] uppercase tracking-wider mb-1">Target Webhook Listener URL</div>
                                <div className="text-sky-300 truncate">{pf.webhookUrl || 'Not specified'}</div>
                              </div>
                            )}
                          </div>

                          <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between">
                            {pf.webhookEnabled ? (
                              <button
                                onClick={() => handleTestWebhook(pf.webhookUrl || '')}
                                disabled={isTestingWebhook}
                                className="px-2 py-1 rounded bg-sky-500 hover:bg-sky-400 text-zinc-950 text-[10px] font-mono font-bold transition flex items-center gap-1 cursor-pointer"
                              >
                                {isTestingWebhook ? 'Delivering...' : 'Simulate Ping'}
                              </button>
                            ) : (
                              <div />
                            )}

                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => {
                                  setEditingPort(pf);
                                  setIsPortModalOpen(true);
                                }}
                                className="px-2 py-1 rounded bg-zinc-950 border border-zinc-800 text-[10px] font-mono text-zinc-300 hover:text-sky-400 transition"
                              >
                                Edit Rule
                              </button>
                              <button
                                onClick={() => handleDeletePort(pf.id)}
                                className="p-1 px-1.5 rounded bg-zinc-950 border border-zinc-800 text-zinc-500 hover:text-red-400 transition"
                              >
                                <Trash2 size={11} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {activeAdminTab === 'settings' && (
                  <motion.div
                    key="tab-settings"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-4 font-mono text-xs"
                  >
                    <div>
                      <h2 className="text-sm font-semibold tracking-tight text-white font-mono uppercase">Admin Settings</h2>
                      <p className="text-[11px] text-zinc-500 font-mono text-xs">Update your administrative credentials.</p>
                    </div>

                    <div className="bg-zinc-900 border border-zinc-800 rounded p-4 space-y-4 shadow-[0_0_20px_rgba(56,189,248,0.05)]">
                      <div>
                        <label className="block text-[10px] uppercase text-zinc-500 mb-1">New Username</label>
                        <input
                          type="text"
                          value={settingsUsername}
                          onChange={(e) => setSettingsUsername(e.target.value)}
                          placeholder="admin"
                          className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase text-zinc-500 mb-1">New Password</label>
                        <input
                          type="password"
                          value={settingsPassword}
                          onChange={(e) => setSettingsPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase text-zinc-500 mb-1">Google Analytics Measurement ID</label>
                        <input
                          type="text"
                          value={localStorage.getItem('ga_measurement_id') || ''}
                          onChange={(e) => localStorage.setItem('ga_measurement_id', e.target.value)}
                          placeholder="G-XXXXXXXXXX"
                          className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase text-zinc-500 mb-1">Latency Alert Threshold (ms)</label>
                        <input
                          type="number"
                          value={latencyThreshold}
                          onChange={(e) => setLatencyThreshold(parseInt(e.target.value) || 0)}
                          placeholder="12"
                          className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-xs font-mono text-white"
                        />
                      </div>
                      <button
                        onClick={() => triggerNotification('success', 'Admin settings updated (Simulated)')}
                        className="px-3 py-1.5 bg-sky-500 hover:bg-sky-400 text-zinc-950 rounded text-[11px] font-bold cursor-pointer"
                      >
                        Save Settings
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        ) : (
          /* ======================================================== */
          /* PUBLIC DEPLOYED GATEWAY LANDING PAGE (Tactical OS Style) */
          /* ======================================================== */
          <div className="flex-1 w-full max-w-6xl mx-auto px-6 py-20 font-sans relative">
            <ScanLine />
            
            {/* TACTICAL GRID LAYOUT */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* LEFT COLUMN: HERO & IDENTITY */}
              <div className="lg:col-span-12 xl:col-span-8 flex flex-col gap-6">
                <TacticalPanel title="IDENTITY MONITOR" footer="AUTHENTICITY VERIFIED">
                  <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
                    <div className="relative group">
                      <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-center text-sky-500 overflow-hidden relative">
                         <div className="absolute inset-0 bg-gradient-to-br from-sky-500/20 to-transparent flex items-center justify-center shadow-neon">
                            <User size={48} className="opacity-50 drop-shadow-neon" />
                         </div>
                         <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-sky-500 animate-[scanner_2s_infinite]" />
                      </div>
                      <div className="absolute -bottom-2 -right-2 bg-emerald-500 w-4 h-4 rounded-full border-4 border-zinc-900" title="System Online" />
                    </div>

                    <div className="space-y-4 flex-1">
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                           <span className="text-[10px] font-mono font-bold text-sky-500 tracking-[0.3em] uppercase">Origin Node</span>
                           <div className="h-[1px] flex-1 bg-sky-500/20" />
                        </div>
                        <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tighter font-display">
                          {hero.title}
                        </h1>
                        <p className="text-lg text-zinc-400 font-display tracking-tight leading-none mt-2">
                          {hero.subtitle}
                        </p>
                      </div>
                      
                      <div className="flex flex-wrap gap-4 pt-2">
                        <div className="flex items-center gap-2 px-3 py-1 bg-zinc-950 border border-zinc-800 rounded-md shadow-neon">
                           <Activity size={12} className="text-emerald-500 drop-shadow-neon" />
                           <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest drop-shadow-neon">Load: OPTIMIZED</span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1 bg-zinc-950 border border-zinc-800 rounded-md shadow-neon">
                           <Shield size={12} className="text-sky-500 drop-shadow-neon" />
                           <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest drop-shadow-neon">Sec: ENCRYPTED</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </TacticalPanel>

                {/* PROJECTS BENTO GRID */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {projects.filter(p => p.isActive).map((project, idx) => (
                    <motion.div
                      key={project.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * idx }}
                    >
                      <TacticalPanel className="h-full hover:border-sky-500/50 transition-colors group cursor-pointer" title={`LOG ENTRY #${idx + 1}`}>
                         <a href={project.link} target="_blank" rel="noopener noreferrer" className="block space-y-4">
                            <div className="flex items-center justify-between">
                               <div className="w-10 h-10 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-center text-zinc-500 group-hover:text-sky-400 transition-colors">
                                  <LucideIcon name={project.iconName as any} size={20} />
                               </div>
                               <ChevronRight size={16} className="text-zinc-700 group-hover:text-sky-400 group-hover:translate-x-1 transition-all drop-shadow-neon" />
                            </div>
                            <div>
                               <h3 className="text-lg font-bold text-white font-display tracking-tight group-hover:text-sky-300 transition-colors uppercase">
                                 {project.title}
                               </h3>
                               <span className="text-[9px] font-mono font-bold text-zinc-500 uppercase tracking-widest mb-2 block">
                                  {project.category}
                               </span>
                               <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                                 {project.description}
                               </p>
                            </div>
                         </a>
                      </TacticalPanel>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* RIGHT COLUMN: SYSTEM STATUS & ANALYTICS */}
              <div className="lg:col-span-12 xl:col-span-4 flex flex-col gap-6">
                <TacticalPanel title="SYSTEM TELEMETRY">
                   <div className="space-y-6">
                      <div className="space-y-3">
                         <div className="flex justify-between items-end">
                            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Network Throughput</span>
                            <span className="text-xs font-mono text-sky-400">92%</span>
                         </div>
                         <div className="h-1 bg-zinc-950 border border-zinc-800 rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: "92%" }}
                              className="h-full bg-sky-500 shadow-[0_0_8px_rgba(56,189,248,0.5)]" 
                            />
                         </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                         <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-lg">
                            <span className="text-[8px] font-mono text-zinc-500 uppercase tracking-[0.2em] block mb-1">Ping</span>
                            <span className="text-lg font-mono font-bold text-zinc-200">12ms</span>
                         </div>
                         <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-lg">
                            <span className="text-[8px] font-mono text-zinc-500 uppercase tracking-[0.2em] block mb-1">Nodes</span>
                            <span className="text-lg font-mono font-bold text-zinc-200">08</span>
                         </div>
                      </div>

                      <div className="p-4 bg-sky-500/5 border border-sky-500/20 rounded-xl space-y-2 shadow-neon">
                         <div className="flex items-center gap-2 text-sky-500">
                            <RefreshCw size={12} className="animate-spin-slow drop-shadow-neon" />
                            <span className="text-[10px] font-mono font-bold uppercase tracking-widest drop-shadow-neon">Live Sync Alpha</span>
                         </div>
                         <p className="text-[10px] text-zinc-500 leading-relaxed font-mono">
                            Heartbeat detected. Synced with global node mesh 2026.05.22
                         </p>
                      </div>
                   </div>
                </TacticalPanel>

                <TacticalPanel title="TRAFFIC ANALYSIS">
                   <div className="py-2">
                      <VisitorAnalytics />
                   </div>
                </TacticalPanel>

                <TacticalPanel title="CONNECTIVITY">
                   <div className="flex flex-wrap gap-3">
                    {links.filter(l => l.isActive).map((link) => (
                      <motion.a
                        key={link.id}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.05, borderColor: '#38bdf8' }}
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center gap-3 px-4 py-2 bg-zinc-950 border border-zinc-800 rounded-lg group transition-all"
                        title={link.platform}
                      >
                        <LucideIcon name={link.iconName as any} size={14} className="text-zinc-500 group-hover:text-sky-500 transition-colors" />
                        <span className="text-[10px] font-mono font-bold text-zinc-400 group-hover:text-zinc-100 uppercase tracking-widest">{link.platform}</span>
                      </motion.a>
                    ))}
                   </div>
                </TacticalPanel>

                <div className="mt-auto pt-6 flex items-center justify-between px-2">
                   <div className="flex flex-col">
                      <span className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">© 2026 GENESIS CORE</span>
                      <button 
                        onClick={() => setIsAdminMode(true)}
                        className="text-[9px] font-mono text-zinc-800 hover:text-zinc-600 transition-colors uppercase tracking-[0.3em] cursor-pointer text-left"
                      >
                        Launch Admin Console
                      </button>
                   </div>
                   <div className="flex items-center gap-2">
                       <button 
                          onClick={() => setIsDocsModalOpen(true)}
                          className="px-3 py-1 bg-zinc-950 border border-zinc-800 rounded font-mono text-[9px] text-zinc-400 hover:text-sky-400 transition-all uppercase flex items-center gap-1.5"
                       >
                          <BookOpen size={10} />
                          {t.documentation}
                       </button>
                       <button 
                          onClick={() => setLocale(locale === 'en' ? 'id' : 'en')}
                          className="px-3 py-1 bg-zinc-950 border border-zinc-800 rounded font-mono text-[9px] text-zinc-400 hover:text-sky-400 transition-all uppercase"
                       >
                          {locale.toUpperCase()}
                       </button>
                   </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>


      {/* ======================================================== */}
      {/* CMS INPUT EDITORIAL MODALS (Styled highly compact and dark matching) */}
      {/* ======================================================== */}
      
      {/* PROJECT CRUD MODAL */}
      <AnimatePresence>
        {isProjectModalOpen && editingProject && (
          <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-zinc-90 w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded p-4 relative font-mono text-xs"
            >
              <div className="flex items-center justify-between pb-2 mb-3 border-b border-zinc-800">
                <span className="font-bold text-white">{editingProject.id ? 'EDIT PORTFOLIO TILE' : 'NEW PORTFOLIO TILE'}</span>
                <button onClick={() => setIsProjectModalOpen(false)} className="text-zinc-500 hover:text-white"><X size={14} /></button>
              </div>

              <form onSubmit={handleSaveProjectSubmit} className="space-y-3">
                <div>
                  <label className="block text-[10px] text-zinc-400 uppercase mb-1">Tile Title</label>
                  <input
                    type="text"
                    value={editingProject.title || ''}
                    onChange={e => setEditingProject({...editingProject, title: e.target.value})}
                    placeholder="e.g. Genesis Port"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white placeholder-zinc-700"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-zinc-400 uppercase mb-1">Description line</label>
                  <input
                    type="text"
                    value={editingProject.description || ''}
                    onChange={e => setEditingProject({...editingProject, description: e.target.value})}
                    placeholder="Brief architectural review"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white placeholder-zinc-700"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-zinc-400 uppercase mb-1">Dynamic URI Target</label>
                  <input
                    type="url"
                    value={editingProject.link || ''}
                    onChange={e => setEditingProject({...editingProject, link: e.target.value})}
                    placeholder="https://genesis.vaio"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white placeholder-zinc-700 font-mono"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] text-zinc-400 uppercase mb-1">Lucide Icon name</label>
                    <select
                      value={editingProject.iconName || 'Sparkles'}
                      onChange={e => setEditingProject({...editingProject, iconName: e.target.value})}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white"
                    >
                      <option value="Sparkles">Sparkles</option>
                      <option value="Server">Server</option>
                      <option value="TrendingUp">TrendingUp</option>
                      <option value="Globe">Globe</option>
                      <option value="Cpu">Cpu</option>
                      <option value="Shield">Shield</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] text-zinc-400 uppercase mb-1">Section Group</label>
                    <select
                      value={editingProject.category || 'Core'}
                      onChange={e => setEditingProject({...editingProject, category: e.target.value})}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white"
                    >
                      <option value="Core">Core</option>
                      <option value="Koperasi">Koperasi</option>
                      <option value="Utility">Utility</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-2 py-1">
                  <input
                    type="checkbox"
                    id="chk-proj-active"
                    checked={editingProject.isActive !== false}
                    onChange={e => setEditingProject({...editingProject, isActive: e.target.checked})}
                    className="rounded bg-zinc-950 border-zinc-800 text-sky-500 focus:ring-0 focus:ring-offset-0"
                  />
                  <label htmlFor="chk-proj-active" className="text-[10px] uppercase text-zinc-300">Publicly Rendered Active</label>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsProjectModalOpen(false)}
                    className="px-3 py-1.5 rounded bg-zinc-950 border border-zinc-800 text-zinc-400"
                  >
                    Abort
                  </button>
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 bg-sky-500 hover:bg-sky-400 text-zinc-950 font-bold rounded"
                  >
                    Commit Tile
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* NGINX BLOCK CONFIG MODAL */}
      <AnimatePresence>
        {isNginxModalOpen && editingNginx && (
          <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-zinc-90 w-full max-w-md bg-zinc-900 border border-zinc-800 rounded p-4 relative font-mono text-xs"
            >
              <div className="flex items-center justify-between pb-2 mb-3 border-b border-zinc-800">
                <span className="font-bold text-white">{editingNginx.id ? 'UPDATE REVERSE PROXY VHOST' : 'NEW NGINX REVERSE PROXY'}</span>
                <button onClick={() => setIsNginxModalOpen(false)} className="text-zinc-500 hover:text-white"><X size={14} /></button>
              </div>

              <form onSubmit={handleSaveNginxSubmit} className="space-y-3">
                <div>
                  <label className="block text-[10px] text-zinc-400 uppercase mb-1">Server Domain Name</label>
                  <input
                    type="text"
                    value={editingNginx.domainName || ''}
                    onChange={e => setEditingNginx({...editingNginx, domainName: e.target.value})}
                    placeholder="e.g. genesis.vaio"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white placeholder-zinc-700"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center gap-2 py-2">
                    <input
                      type="checkbox"
                      id="chk-nginx-lb"
                      checked={!!editingNginx.isLoadBalanced}
                      onChange={e => setEditingNginx({...editingNginx, isLoadBalanced: e.target.checked})}
                      className="rounded bg-zinc-950 border-zinc-800 text-sky-500 focus:ring-0 focus:ring-offset-0"
                    />
                    <label htmlFor="chk-nginx-lb" className="text-[10px] text-zinc-300 uppercase">Load Balanced</label>
                  </div>

                  <div className="flex items-center gap-2 py-2">
                    <input
                      type="checkbox"
                      id="chk-nginx-ssl"
                      checked={!!editingNginx.sslEnabled}
                      onChange={e => setEditingNginx({...editingNginx, sslEnabled: e.target.checked})}
                      className="rounded bg-zinc-950 border-zinc-800 text-sky-500 focus:ring-0"
                    />
                    <label htmlFor="chk-nginx-ssl" className="text-[10px] text-zinc-300 uppercase font-mono">SSL enabled</label>
                  </div>
                </div>

                {!editingNginx.isLoadBalanced ? (
                  <div>
                    <label className="block text-[10px] text-zinc-400 uppercase mb-1">Target Path / Destination URI</label>
                    <input
                      type="text"
                      value={editingNginx.targetUrl || ''}
                      onChange={e => setEditingNginx({...editingNginx, targetUrl: e.target.value})}
                      placeholder="http://127.0.0.1:3000"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white placeholder-zinc-700"
                      required={!editingNginx.isLoadBalanced}
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-[10px] text-zinc-400 uppercase mb-1">Upstream Nodes (One per line with optional config)</label>
                    <textarea
                      rows={2}
                      value={editingNginx.upstreams?.join('\n') || ''}
                      onChange={e => setEditingNginx({...editingNginx, upstreams: e.target.value.split('\n')})}
                      placeholder="e.g.&#10;127.0.0.1:8001 weight=3&#10;127.0.0.1:8002 weight=2"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white placeholder-zinc-700 h-16 font-mono"
                      required={!!editingNginx.isLoadBalanced}
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] text-zinc-400 uppercase mb-1">SSL Certificate Provider</label>
                    <select
                      value={editingNginx.sslType || 'Certbot'}
                      onChange={e => setEditingNginx({...editingNginx, sslType: e.target.value as any})}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white"
                    >
                      <option value="Certbot">Certbot (Let's Encrypt)</option>
                      <option value="Cloudflare">Cloudflare (Edge/Origin)</option>
                      <option value="SelfSigned">SelfSigned (Development)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] text-zinc-400 uppercase mb-1">Contact Email</label>
                    <input
                      type="email"
                      value={editingNginx.sslEmail || ''}
                      onChange={e => setEditingNginx({...editingNginx, sslEmail: e.target.value})}
                      placeholder="ardy@vaio.net"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white placeholder-zinc-700"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] text-zinc-400 uppercase mb-1">Extended Location Directives</label>
                  <textarea
                    rows={1}
                    value={editingNginx.customDirectives || ''}
                    onChange={e => setEditingNginx({...editingNginx, customDirectives: e.target.value})}
                    placeholder="client_max_body_size 64M;"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white placeholder-zinc-700 font-mono"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsNginxModalOpen(false)}
                    className="px-3 py-1.5 rounded bg-zinc-950 border border-zinc-800 text-zinc-400"
                  >
                    Abort
                  </button>
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 bg-sky-500 hover:bg-sky-400 text-zinc-950 font-bold rounded"
                  >
                    Compile Config
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DDNS CONFIG MODAL */}
      <AnimatePresence>
        {isDdnsModalOpen && editingDdns && (
          <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-zinc-90 w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded p-4 relative font-mono text-xs"
            >
              <div className="flex items-center justify-between pb-2 mb-3 border-b border-zinc-800">
                <span className="font-bold text-white">{editingDdns.id ? 'EDIT DDNS RESOLVER' : 'NEW DDNS PROFILE'}</span>
                <button onClick={() => setIsDdnsModalOpen(false)} className="text-zinc-500 hover:text-white"><X size={14} /></button>
              </div>

              <form onSubmit={handleSaveDdnsSubmit} className="space-y-3">
                <div>
                  <label className="block text-[10px] text-zinc-400 uppercase mb-1">Resolver API Provider</label>
                  <select
                    value={editingDdns.provider || 'Cloudflare'}
                    onChange={e => setEditingDdns({...editingDdns, provider: e.target.value as any})}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white"
                  >
                    <option value="Cloudflare">Cloudflare API Token Client</option>
                    <option value="NoIP">No-IP Client</option>
                    <option value="DuckDNS">DuckDNS Resolver</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] text-zinc-400 uppercase mb-1">Target Host / Domain Name</label>
                  <input
                    type="text"
                    value={editingDdns.domainName || ''}
                    onChange={e => setEditingDdns({...editingDdns, domainName: e.target.value})}
                    placeholder="home.vaio.net"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white placeholder-zinc-700"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-zinc-400 uppercase mb-1">API Authentication Token Key</label>
                  <input
                    type="password"
                    value={editingDdns.apiToken || ''}
                    onChange={e => setEditingDdns({...editingDdns, apiToken: e.target.value})}
                    placeholder="cf_tok_•••••••••••••••••"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white placeholder-zinc-700"
                    required
                  />
                </div>

                {editingDdns.provider === 'Cloudflare' && (
                  <div>
                    <label className="block text-[10px] text-zinc-400 uppercase mb-1">Zone Identifier (optional)</label>
                    <input
                      type="text"
                      value={editingDdns.zoneId || ''}
                      onChange={e => setEditingDdns({...editingDdns, zoneId: e.target.value})}
                      placeholder="cf_zone_e3b0c442..."
                      className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white placeholder-zinc-700"
                    />
                  </div>
                )}

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsDdnsModalOpen(false)}
                    className="px-3 py-1.5 rounded bg-zinc-950 border border-zinc-800 text-zinc-400"
                  >
                    Abort
                  </button>
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 bg-sky-500 hover:bg-sky-400 text-zinc-950 font-bold rounded"
                  >
                    Assign Sync Record
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* PORT INGRESS FORWARDING CONFIG MODAL */}
      <AnimatePresence>
        {isPortModalOpen && editingPort && (
          <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-zinc-90 w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded p-4 relative font-mono text-xs"
            >
              <div className="flex items-center justify-between pb-2 mb-3 border-b border-zinc-800">
                <span className="font-bold text-white">{editingPort.id ? 'EDIT PORT FORWARD' : 'NEW PORT MAPPING INGRESS'}</span>
                <button onClick={() => setIsPortModalOpen(false)} className="text-zinc-500 hover:text-white"><X size={14} /></button>
              </div>

              <form onSubmit={handleSavePortSubmit} className="space-y-3">
                <div>
                  <label className="block text-[10px] text-zinc-400 uppercase mb-1">Exposed Port Rule Name</label>
                  <input
                    type="text"
                    value={editingPort.name || ''}
                    onChange={e => setEditingPort({...editingPort, name: e.target.value})}
                    placeholder="GitHub Webhook Listener"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white placeholder-zinc-700"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] text-zinc-400 uppercase mb-1">Ingress Port (Exposed)</label>
                    <input
                      type="number"
                      value={editingPort.incomingPort || ''}
                      onChange={e => setEditingPort({...editingPort, incomingPort: Number(e.target.value)})}
                      placeholder="8080"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-zinc-400 uppercase mb-1">Internal Local Port</label>
                    <input
                      type="number"
                      value={editingPort.localPort || ''}
                      onChange={e => setEditingPort({...editingPort, localPort: Number(e.target.value)})}
                      placeholder="3000"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] text-zinc-400 uppercase mb-1">Internal Target Host</label>
                  <input
                    type="text"
                    value={editingPort.localAddress || '127.0.0.1'}
                    onChange={e => setEditingPort({...editingPort, localAddress: e.target.value})}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white"
                    required
                  />
                </div>

                <div className="flex items-center gap-2 py-1">
                  <input
                    type="checkbox"
                    id="chk-pf-webhook"
                    checked={!!editingPort.webhookEnabled}
                    onChange={e => setEditingPort({...editingPort, webhookEnabled: e.target.checked})}
                    className="rounded bg-zinc-950 border-zinc-800 text-sky-500 focus:ring-0 focus:ring-offset-0"
                  />
                  <label htmlFor="chk-pf-webhook" className="text-[10px] uppercase text-zinc-300">Enable Webhook receiver inspection</label>
                </div>

                {editingPort.webhookEnabled && (
                  <div>
                    <label className="block text-[10px] text-zinc-400 uppercase mb-1">Webhook endpoint route</label>
                    <input
                      type="text"
                      value={editingPort.webhookUrl || ''}
                      onChange={e => setEditingPort({...editingPort, webhookUrl: e.target.value})}
                      placeholder="http://localhost:3000/api/webhooks/github"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white font-mono text-[11px]"
                    />
                  </div>
                )}

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsPortModalOpen(false)}
                    className="px-3 py-1.5 rounded bg-zinc-950 border border-zinc-800 text-zinc-400"
                  >
                    Abort
                  </button>
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 bg-sky-500 hover:bg-sky-400 text-zinc-950 font-bold rounded"
                  >
                    Commit Mapping
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DOCUMENTATION MODAL (Scaled Up Version) */}
      <AnimatePresence>
        {isDocsModalOpen && (
          <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl relative"
            >
              <div className="bg-zinc-950 border-b border-zinc-800 p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 shadow-neon">
                    <BookOpen size={20} />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-white uppercase tracking-widest font-mono">{t.documentation}</h2>
                    <p className="text-[10px] text-zinc-500 font-mono italic uppercase tracking-tighter">{t.docsSubtitle}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsDocsModalOpen(false)}
                  className="w-8 h-8 rounded-full hover:bg-zinc-800 flex items-center justify-center text-zinc-500 hover:text-white transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-6 overflow-y-auto max-h-[70vh] scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <section>
                      <h3 className="text-[10px] font-mono font-bold text-sky-500 uppercase tracking-widest mb-3 border-b border-zinc-800 pb-1">01. Dynamic VHost Engine</h3>
                      <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                        Managing high-performance Nginx virtual environments using a unified template generator. Supports upstream clustering for multi-node load balanced target groups.
                      </p>
                      <ul className="mt-2 space-y-1.5">
                        <li className="text-[10px] font-mono text-zinc-500 flex items-center gap-2">
                          <Check size={10} className="text-emerald-500" />
                          Template-based config generation
                        </li>
                        <li className="text-[10px] font-mono text-zinc-500 flex items-center gap-2">
                          <Check size={10} className="text-emerald-500" />
                          Upstream node health orchestration
                        </li>
                      </ul>
                    </section>

                    <section>
                      <h3 className="text-[10px] font-mono font-bold text-sky-500 uppercase tracking-widest mb-3 border-b border-zinc-800 pb-1">02. Deployment Pre-flight</h3>
                      <p className="text-xs text-zinc-400 leading-relaxed font-sans mb-3">
                        Verifies local environment readiness before production deployment.
                      </p>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-[9px] font-mono bg-zinc-950 p-2 rounded">
                          <span>Caddy Binary</span>
                          <span className="text-emerald-500">READY</span>
                        </div>
                        <div className="flex items-center justify-between text-[9px] font-mono bg-zinc-950 p-2 rounded">
                          <span>Nginx Ingress</span>
                          <span className="text-emerald-500">READY</span>
                        </div>
                      </div>
                    </section>
                  </div>

                  <div className="space-y-6">
                    <section>
                      <h3 className="text-[10px] font-mono font-bold text-sky-500 uppercase tracking-widest mb-3 border-b border-zinc-800 pb-1">03. Ingress Tunneling</h3>
                      <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                        Expose internal local services to the public mesh through secure ingress rules. Includes baked-in webhook receiver inspection for deployment automation.
                      </p>
                      <div className="mt-4 p-3 bg-zinc-950 rounded-lg border border-zinc-800 font-mono text-[9px]">
                        <div className="text-zinc-600 mb-1 font-bold underline italic">Security Note:</div>
                        <p className="text-zinc-500">All tunnels are proxied through a dynamic gateway mesh with mandatory SSL termination at the edge.</p>
                      </div>
                    </section>

                    <section>
                      <h3 className="text-[10px] font-mono font-bold text-sky-500 uppercase tracking-widest mb-3 border-b border-zinc-800 pb-1">04. Monitoring Tools</h3>
                      <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                        Real-time visitor telemetry, network throughput analytics, and interactive trace sandboxes for performance debugging and latency analysis.
                      </p>
                    </section>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-zinc-800 text-center">
                  <p className="text-[10px] font-mono text-zinc-500">GENESIS CORE v2026.05.22 ALPHA-BUILD — DESIGNED & ENGINEERED BY ARDY SYAFII</p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
