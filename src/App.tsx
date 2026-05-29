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
  Sparkles,
  User,
  Layers,
  Activity,
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Contrast
} from 'lucide-react';
import { LucideIcon } from './components/LucideIcon';
import { AuthScreen } from './components/AuthScreen';
import { SystemMonitor } from './components/SystemMonitor';
import { VisitorAnalytics } from './components/VisitorAnalytics';
import {
  fetchPublicContent, fetchProjectStatus,
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
  fetchListeningPorts,
  fetchSecurityStatus,
  logoutUser
} from './utils/api';
import { HeroContent, Project, SocialLink, NginxConfig, DDNSConfig, PortForward, CaddySite, ToastItem } from './types';

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
const ResourceTile = ({ label, value, color, threshold, warningMsg }: { label: string, value: number, color: string, threshold?: number, warningMsg?: string }) => {
  const isExceeded = threshold !== undefined && value > threshold;
  return (
    <div className={`p-3 rounded border transition-all duration-300 relative overflow-hidden ${isExceeded ? 'bg-red-950/20 border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.15)]' : 'bg-zinc-950 border-zinc-800'}`}>
      {isExceeded && (
        <div className="absolute top-0 left-0 w-full h-[2px] bg-red-500 animate-pulse" />
      )}
      <div className="flex justify-between mb-2">
        <span className={`text-[9px] font-mono uppercase ${isExceeded ? 'text-red-400 font-bold flex items-center gap-1' : 'text-zinc-500'}`}>
          {isExceeded && <AlertTriangle size={10} className="text-red-500 animate-bounce" />}
          {label}
        </span>
        <span className={`text-[9px] font-bold`} style={{ color: isExceeded ? '#ef4444' : color }}>
          {value}% {isExceeded && `(> ${threshold}%)`}
        </span>
      </div>
      <div className="h-1 bg-zinc-900 rounded-full overflow-hidden">
        <motion.div initial={{ width: 0 }} animate={{ width: `${value}%` }} className="h-full" style={{ backgroundColor: isExceeded ? '#ef4444' : color }} />
      </div>
      {isExceeded && warningMsg && (
        <div className="mt-1.5 text-[8.5px] text-red-400 font-mono leading-none font-semibold uppercase tracking-wider">
          ⚠ {warningMsg}
        </div>
      )}
    </div>
  );
};

// Log terminal component
const LogTerminal = ({ logs }: { logs: string[] }) => (
  <div className="bg-black/90 rounded-lg p-3 font-mono text-[9px] text-zinc-400 border border-zinc-800 h-24 overflow-y-auto">
    {logs.map((log, i) => <div key={i} className="mb-0.5 whitespace-nowrap">{log}</div>)}
  </div>
);



// General management settings
const GeneralSettingsPanel = ({ username, password, onUsernameChange, onPasswordChange, onSave, t }: { username: string, password: string, onUsernameChange: (v: string) => void, onPasswordChange: (v: string) => void, onSave: () => void, t: any }) => (
    <div className="space-y-4 font-mono text-xs">
        <TacticalPanel title={t.adminCreds}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-[10px] text-zinc-500 uppercase">{t.username}</label>
                    <input type="text" className="w-full bg-zinc-950 border border-zinc-800 p-2 text-white" value={username} onChange={(e) => onUsernameChange(e.target.value)} />
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] text-zinc-500 uppercase">{t.password}</label>
                    <input type="password" className="w-full bg-zinc-950 border border-zinc-800 p-2 text-white" value={password} onChange={(e) => onPasswordChange(e.target.value)} />
                </div>
            </div>
            <button className="mt-4 px-4 py-2 bg-sky-500 text-black font-bold text-xs uppercase cursor-pointer" onClick={onSave}>{t.saveCreds}</button>
        </TacticalPanel>
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
  const [locale, setLocale] = useState<'id' | 'en'>(() => (localStorage.getItem('orchestra_locale') as 'id' | 'en') || 'id');
  const [isMonochrome, setIsMonochrome] = useState<boolean>(() => localStorage.getItem('orchestra_monochrome') === 'true');
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
  const [projectStatusMap, setProjectStatusMap] = useState<Record<string, boolean>>({});
  const [links, setLinks] = useState<SocialLink[]>([]);
  // Search filter for project cards
  const [searchQuery, setSearchQuery] = useState('');
  
// Admin only configs
  const [nginxConfigs, setNginxConfigs] = useState<NginxConfig[]>([]);
  const [caddySites, setCaddySites] = useState<CaddySite[]>(() => {
    const saved = localStorage.getItem('orchestra_caddy_sites');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse saved caddy sites", e);
      }
    }
    return [
      { id: '1', name: 'main-api.local', status: 'up', load: 12, uptime: 99.98, lastHeartbeat: new Date(Date.now() - 4000).toISOString() },
      { id: '2', name: 'static.cdn.local', status: 'up', load: 5, uptime: 99.94, lastHeartbeat: new Date(Date.now() - 9000).toISOString() },
      { id: '3', name: 'auth.service.local', status: 'down', load: 0, uptime: 94.21, lastHeartbeat: new Date(Date.now() - 320000).toISOString() }
    ];
  });

  useEffect(() => {
    localStorage.setItem('orchestra_caddy_sites', JSON.stringify(caddySites));
  }, [caddySites]);

  const [ddnsConfigs, setDdnsConfigs] = useState<DDNSConfig[]>([]);
  const [portForwards, setPortForwards] = useState<PortForward[]>([]);
  const [listeningPorts, setListeningPorts] = useState<any[]>([]);
  const [securityStatus, setSecurityStatus] = useState<any>(null);
  
  // New State for Upgrades
  const [systemResources, setSystemResources] = useState({ cpu: 15, ram: 42, disk: 68 });
  const [appLogs, setAppLogs] = useState<string[]>(['[INFO] Orchestra Gateway initialized...', '[INFO] Caddy module loaded...']);
  const [systemSettings, setSystemSettings] = useState(() => JSON.parse(localStorage.getItem('system_settings') || '{}'));

  const updateSettings = (key: string, value: string) => {
    setSystemSettings((prev: any) => ({ ...prev, [key]: value }));
  };
  
  const saveSettings = () => {
    localStorage.setItem('system_settings', JSON.stringify(systemSettings));
    triggerNotification('success', 'Settings saved successfully');
  };

  // Page active tabs for Admin View
  const [activeAdminTab, setActiveAdminTab] = useState<'monitor' | 'content' | 'nginx' | 'ddns' | 'ports' | 'settings'>('monitor');

  // Interactive CRUD Modal/Forms states
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Partial<Project> | null>(null);

  const [isNginxModalOpen, setIsNginxModalOpen] = useState(false);
  const [editingNginx, setEditingNginx] = useState<Partial<NginxConfig> | null>(null);

  const [isCaddyModalOpen, setIsCaddyModalOpen] = useState(false);
  const [editingCaddy, setEditingCaddy] = useState<Partial<CaddySite> | null>(null);

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
  const [latencyThreshold, setLatencyThreshold] = useState<number>(() => {
    const saved = localStorage.getItem('latency_threshold');
    return saved ? parseInt(saved) : 12;
  });
  const [cpuThreshold, setCpuThreshold] = useState<number>(() => {
    const saved = localStorage.getItem('cpu_threshold');
    return saved ? parseInt(saved) : 80;
  });
  const [ramThreshold, setRamThreshold] = useState<number>(() => {
    const saved = localStorage.getItem('ram_threshold');
    return saved ? parseInt(saved) : 80;
  });
  const [projectLatencies, setProjectLatencies] = useState<Record<string, number>>({});

  const clearTraceHistory = () => {
    setPingSimulatorLogs([]);
    setPingLatencies([]);
    setProjectLatencies({});
  };

  const triggerPingTrace = (projectName: string, targetLink: string, projectId: string) => {
    const time = new Date().toLocaleTimeString();
    const rtt = Math.floor(Math.random() * 30) + 5;
    const newLogs = [
      `[${time}] Requests trace sent to node: ${projectName}`,
      `[${time}] Trace path: Core Server -> Dynamic Proxy -> ${targetLink}`,
      `[${time}] Response received: code 200 OK | RTT ${rtt}ms`
    ];
    setPingSimulatorLogs(prev => [...newLogs, prev[0] || ''].slice(0, 8));
    setPingLatencies(prev => [rtt, ...prev].slice(0, 50));
    setProjectLatencies(prev => ({ ...prev, [projectId]: rtt }));
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
  
  // Save General Edits (e.g., credentials)
  const saveGeneralSettings = () => {
    localStorage.setItem('admin_username', settingsUsername);
    localStorage.setItem('admin_password', settingsPassword);
    triggerNotification('success', 'General settings saved (Credential storage)');
  };

  // UI States
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  // Elegant Toast Manager with auto-clear, stacking, and custom dismiss animation support
  const triggerNotification = (type: 'success' | 'error' | 'info' | 'warning', text: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, type, text }]);

    const duration = type === 'success' ? 3500 : 5000;
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  useEffect(() => {
    localStorage.setItem('orchestra_locale', locale);
  }, [locale]);

  useEffect(() => {
    localStorage.setItem('orchestra_monochrome', String(isMonochrome));
  }, [isMonochrome]);

  const dict = {
    en: {
      featuredWork: 'Featured Work',
      entries: 'entries',
      open: 'Open',
      connect: 'Connect',
      adminSettings: 'Admin Settings',
      contentTab: 'Landing Page CMS',
      monitorTab: 'Gateway Monitor',
      nginxTab: 'Nginx VirtualHosts',
      ddnsTab: 'DDNS Synchronizer',
      portsTab: 'Port Ingress Tunnel',
      settingsTab: 'General Settings',
      heroLandingDetails: 'HERO & LANDING PAGE DETAILS',
      syncGateway: 'Sync Gateway Content',
      projectTiles: 'PROJECT TILES INCLUDED',
      addTile: 'Add Tile',
      activeStatus: 'ACTIVE',
      inactiveStatus: 'INACTIVE',
      getStarted: 'Get Started',
      documentation: 'Documentation',
      docsSubtitle: 'System Overview & Guidelines',
      originNode: 'Origin Node',
      identityMonitor: 'IDENTITY MONITOR',
      authenticityVerified: 'AUTHENTICITY VERIFIED',
      loadOptimized: 'Load: OPTIMIZED',
      secEncrypted: 'Sec: ENCRYPTED',
      networkTelemetry: 'SYSTEM TELEMETRY',
      networkThroughput: 'Network Throughput',
      ping: 'Ping',
      nodes: 'Nodes',
      liveSync: 'Live Sync Alpha',
      trafficAnalysis: 'TRAFFIC ANALYSIS',
      connectivity: 'CONNECTIVITY',
      launchAdmin: 'Launch Admin Console',
      closeAdmin: 'Exit Panel',
      terminalTitle: 'INTERACTIVE TRACE SANDBOX',
      terminalSubtitle: 'Tap a registered node below to trace ingress hop packets',
      minLatency: 'Min Latency',
      avgLatency: 'Avg Latency',
      maxLatency: 'Max Latency',
      clearHistory: 'Clear History',
      highLatencyWarning: 'High Latency Detected',
      resolverPreview: 'Resolver Channels Preview',
      sslSecuredByCertbot: 'SSL Secured via Certbot on Cloudflare',
      nginxTitle: 'NGINX EDGE DIRECTIVES',
      nginxDesc: 'Router Gateway Daemon. Passes secure Client HTTP request packets directly to local application sockets.',
      ddnsTitle: 'DDNS REGISTER CONTROL',
      ddnsDesc: 'Automatically synchronizes dynamic public host IP endpoints every 15 minutes to keep routing pipelines active.',
      forwardTitle: 'FORWARD TUNNEL PORTING',
      forwardDesc: 'Integrates dynamic external callback URLs with low latency response checking for instant developer feedback.',
      adminPortalTitle: 'ORCHESTRA CONTROL BOARD',
      adminPortalSub: 'Secure Gateway Routing & Service Mesh Panel',
      activeRoute: 'Active Routing Hop',
      terminateSession: 'Terminate Session',
      cpuLoad: 'CPU Load',
      ramUsage: 'RAM Usage',
      diskSpace: 'Disk Space',
      highCpuWarn: 'High CPU Usage Warning',
      highRamWarn: 'High RAM Allocation Warning',
      monitorRules: 'Gateway Monitor Rules',
      adjustLimits: 'Adjust Sim & Limits',
      cpuAlertLimit: 'CPU Alert limit',
      ramAlertLimit: 'RAM Alert limit',
      latencyAlertLimit: 'Latency Alert limit',
      setSim: 'Set Simulation:',
      valuesAboveWarn: 'Values above highlight active routes in orange',
      caddyTelemetry: 'Caddy Proxy Telemetry',
      easySetup: 'Easy Setup',
      loadLabel: 'Load',
      caddyEditTitle: 'Edit Monitored Caddy Site',
      caddyAddTitle: 'Add New Monitored Caddy Site',
      caddyDomainLabel: 'Target Site Domain URL',
      caddyUptimeLabel: 'Uptime',
      caddyHeartbeat: 'Heartbeat State',
      caddyLoadLabel: 'Simulated Node Load',
      caddySaveBtn: 'Commit Monitored Site',
      caddyDeleteConfirm: 'Are you sure you want to stop monitoring this Caddy site?',
      lastHeartbeatTime: 'Last contact in',
      checklist: 'Deployment Checklist',
      logsValidator: 'Logs & Validator',
      validateConfigs: 'Validate Configs',
      liveTitle: 'LIVE GATEWAY MONITOR & TUNNEL ROUTING',
      liveSubtitle: 'Secure administrative telemetries, reverse proxy hops & Cloudflare DDNS resolvers',
      sessionActive: 'Session Active',
      terminate: 'Terminate',
      dynamicGateway: 'Dynamic Gateway',
      reverseProxies: 'Reverse Proxies',
      throughput: 'Throughput',
      clientIngress: 'Client Ingress',
      targetModule: 'Target Module',
      nginxManager: 'NGINX REVERSE PROXY MANAGER',
      nginxSub: 'Configure custom routing domains, load-balanced upstreams, and Certbot certificates',
      newVHost: 'New VirtualHost',
      sslTermination: 'SSL Termination',
      mapsTo: 'Maps to:',
      editVHost: 'Edit vHost',
      multiNodeUpstream: 'Multi-Node Upstream Target Groups',
      nodeLabel: 'Node',
      generatedTemplate: 'GENERATED CONFIGURED TEMPLATE BLOCK',
      ddnsResolver: 'BUILT-IN DDNS RESOLVER',
      ddnsSub: 'Synchronize dynamically updated home server WAN address into Cloudflare Zones',
      forceCheck: 'Force DDNS Check',
      syncing: 'Syncing...',
      newRecord: 'New Record',
      provider: 'Provider',
      targetResolvingDomain: 'Target Resolving Domain',
      wanIpBind: 'WAN IP Bind',
      lastHeartbeatChecked: 'Last Heartbeat Checked',
      editProfile: 'Edit Profile',
      portMappingsTitle: 'PORT INGRESS & WEBHOOK MAPPINGS',
      portMappingsSub: 'Expose port mappings to inspect real-time webhooks (e.g. GitHub trigger payload)',
      addRule: 'Add Rule',
      exposedPort: 'EXPOSED PORT',
      targetWebhookUrl: 'Target Webhook Listener URL',
      simulatePing: 'Simulate Ping',
      delivering: 'Delivering...',
      notSpecified: 'Not specified',
      generalSettings: 'General Settings',
      generalSettingsSub: 'Update your administrative credentials.',
      adminCreds: 'Administrator Credentials',
      username: 'Username',
      password: 'Password',
      saveCreds: 'Save Credentials',
      monochromeToggle: 'Toggle Monochrome',
    },
    id: {
      featuredWork: 'Karya Unggulan',
      entries: 'entri',
      open: 'Buka',
      connect: 'Hubungkan',
      adminSettings: 'Pengaturan Admin',
      contentTab: 'Kelola Tampilan Utama',
      monitorTab: 'Pantau Jaringan (Monitor)',
      nginxTab: 'Rute Server (Nginx VirtualHosts)',
      ddnsTab: 'Pengubah Nama Otomatis (DDNS)',
      portsTab: 'Pintu Masuk Terowongan (Port Ingress)',
      settingsTab: 'Pengaturan Sandi Admin',
      heroLandingDetails: 'PENGATURAN HALAMAN UTAMA',
      syncGateway: 'Simpan & Sinkronisasi Konten',
      projectTiles: 'KUMPULAN PROYEK LAYANAN YANG TERSEDIA',
      addTile: 'Tambah Proyek',
      activeStatus: 'AKTIF (Berjalan Baik)',
      inactiveStatus: 'NONAKTIF',
      getStarted: 'Mulai Sekarang',
      documentation: 'Buku Panduan Pemula',
      docsSubtitle: 'Penjelasan Singkat Cara Kerja Jaringan',
      originNode: 'Server Utama',
      identityMonitor: 'PROFIL PENGEMBANG',
      authenticityVerified: 'SISTEM RESMI TERVERIFIKASI',
      loadOptimized: 'Beban Server: SANGAT RINGAN & AMAN',
      secEncrypted: 'Keamanan: TERSANDI AMAN (SSL)',
      networkTelemetry: 'ALAT PANTAU KINERJA SERVER (TELEMETRI)',
      networkThroughput: 'Aliran Kecepatan Data Jaringan',
      ping: 'Laju Respons (Ping)',
      nodes: 'Layanan Aktif',
      liveSync: 'Sinkronisasi Langsung Aktif',
      trafficAnalysis: 'ANALISIS PENGUNJUNG',
      connectivity: 'HUBUNGI SAYA / JEJARING SOSIAL',
      launchAdmin: 'Buka Panel Pengatur Admin',
      closeAdmin: 'Tutup Panel',
      terminalTitle: 'UJICUBA PERJALANAN DATA INTERAKTIF',
      terminalSubtitle: 'Silakan klik salah satu tombol proyek di bawah ini untuk melihat bagaimana data berpindah secara nyata',
      minLatency: 'Respons Tercepat',
      avgLatency: 'Respons Rata-Rata',
      maxLatency: 'Respons Terlambat',
      clearHistory: 'Hapus Catatan',
      highLatencyWarning: 'Koneksi Sedang Lambat (Respons Tinggi)',
      resolverPreview: 'Pratinjau Saluran Rute Jaringan',
      sslSecuredByCertbot: 'Sudah Dilengkapi Kunci Keamanan Otomatis (SSL)',
      nginxTitle: 'PENGATUR ALIRAN RUTE WEB (NGINX)',
      nginxDesc: 'Menerima kunjungan dari internet lalu menyalurkannya ke aplikasi lokal komputer Anda dengan aman dan rapi.',
      ddnsTitle: 'SISTEM NAMA DOMAIN OTOMATIS (DDNS)',
      ddnsDesc: 'Secara cerdas memantau alamat internet (IP) rumah Anda setiap 15 menit, sehingga alamat web Anda tidak pernah terputus.',
      forwardTitle: 'JALUR PINTAS KHUSUS (PORT FORWARDING)',
      forwardDesc: 'Membuka rute khusus untuk menerima data kiriman balik (webhook) secara langsung dari internet untuk uji coba.',
      adminPortalTitle: 'PENGENDALI UTAMA SERVING MESH',
      adminPortalSub: 'Ruang Kendali Rute Gateway Jaringan Aman',
      activeRoute: 'Rute Pengarah yang Aktif',
      terminateSession: 'Keluar Admin',
      cpuLoad: 'Beban CPU',
      ramUsage: 'Penggunaan RAM',
      diskSpace: 'Ruang Disk',
      highCpuWarn: 'Pemberitahuan: Pemakaian CPU Sangat Tinggi',
      highRamWarn: 'Pemberitahuan: Pemakaian RAM Sangat Tinggi',
      monitorRules: 'Aturan Pemantau Jaringan',
      adjustLimits: 'Ubah Simulasi & Batas',
      cpuAlertLimit: 'Batas Peringatan CPU',
      ramAlertLimit: 'Batas Peringatan RAM',
      latencyAlertLimit: 'Batas Peringatan Latensi',
      setSim: 'Uji Simulasi:',
      valuesAboveWarn: 'Nilai di atas batas ini akan diwarnai oranye sebagai peringatan rute lambat',
      caddyTelemetry: 'Penerus Rute Otomatis (Caddy Proxy Terpantau)',
      easySetup: 'Pengaturan Cepat',
      loadLabel: 'Beban',
      caddyEditTitle: 'Ubah Target Pantau Biner Caddy',
      caddyAddTitle: 'Tambah Target Pantau Baru (Caddy)',
      caddyDomainLabel: 'Alamat Domain URL Target',
      caddyUptimeLabel: 'Waktu Aktif (Uptime)',
      caddyHeartbeat: 'Status Detak Jantung',
      caddyLoadLabel: 'Beban Node Terpilih (Simulasi)',
      caddySaveBtn: 'Simpan Profil Pemantau',
      caddyDeleteConfirm: 'Apakah Anda yakin ingin berhenti memantau domain Caddy ini?',
      lastHeartbeatTime: 'Kontak terakhir',
      checklist: 'Daftar Periksa Kesiapan Server',
      logsValidator: 'Pembaca Catatan & Validasi',
      validateConfigs: 'Validasi Konfigurasi',
      liveTitle: 'STATUS JALUR UTAMA & TEROWONGAN LANGSUNG',
      liveSubtitle: 'Menampilkan data kinerja secara langsung, alur rute masuk Nginx, dan ip pemantau Cloudflare',
      sessionActive: 'Sesi Aktif',
      terminate: 'Keluar Sesi',
      dynamicGateway: 'Pintu Gerbang IP',
      reverseProxies: 'Rute Aktif',
      throughput: 'Lalu Lintas Data',
      clientIngress: 'Pengunjung Masuk',
      targetModule: 'Layanan Dituju',
      nginxManager: 'PENGELOLA REVERSE PROXY NGINX',
      nginxSub: 'Konfigurasikan domain pengarah rute, pembagian beban hulu, serta sertifikat SSL otomatis',
      newVHost: 'Buat VirtualHost Baru',
      sslTermination: 'Terminasi SSL',
      mapsTo: 'Diteruskan ke:',
      editVHost: 'Ubah vHost',
      multiNodeUpstream: 'Grup Distribusi Beban Server Hulu (Multi-Node)',
      nodeLabel: 'Node',
      generatedTemplate: 'BLOK TEMPLATE KODE KONFIGURASI YANG DIHASILKAN',
      ddnsResolver: 'RESOLVER DDNS OTOMATIS',
      ddnsSub: 'Sinkronisasikan nama domain Anda secara instan ke Cloudflare saat IP modem mengalami perubahan rute',
      forceCheck: 'Paksa Periksa DDNS',
      syncing: 'Sinkronisasi...',
      newRecord: 'Tambah Rekaman Baru',
      provider: 'Provider',
      targetResolvingDomain: 'Nama Domain Tujuan',
      wanIpBind: 'Sambungan IP Publik WAN',
      lastHeartbeatChecked: 'Pemeriksaan Terakhir',
      editProfile: 'Ubah Profil',
      portMappingsTitle: 'PEMETAAN PORT INGRESS & WEBHOOK',
      portMappingsSub: 'Buka lubang pintu khusus port lalu lintas luar untuk melihat data kiriman webhook secara instan',
      addRule: 'Tambah Aturan',
      exposedPort: 'PORT TERBUKA',
      targetWebhookUrl: 'Alamat Penerima Webhook (Target)',
      simulatePing: 'Simulasikan Ping',
      delivering: 'Mengirimkan payload...',
      notSpecified: 'Tidak ditentukan',
      generalSettings: 'Pengaturan Umum',
      generalSettingsSub: 'Ubah informasi kredensial login admin Anda.',
      adminCreds: 'Kredensial Masuk Admin',
      username: 'Nama Pengguna',
      password: 'Kata Sandi',
      saveCreds: 'Simpan Sandi Kunci',
      monochromeToggle: 'Mode Monokrom'
    }
  };

  const t = dict[locale];

  const docsContent = locale === 'id' ? {
    sec1Title: "01. Rute Server (VHost Engine)",
    sec1Body: "Mengelola rute virtual Nginx berkinerja tinggi menggunakan pembuat konfigurasi terpadu. Mendukung pengelompokan hulu untuk distribusi beban server agar lancar saat diakses banyak orang sekaligus.",
    sec1Item1: "Pembuatan otomatis rute berbasis konfigurasi",
    sec1Item2: "Pengaturan kesehatan & loadbalancing server lokal",
    sec2Title: "02. Pemeriksaan Sebelum Aktif (Pre-flight)",
    sec2Body: "Memastikan semua layanan lokal dalam keadaan siap (READY) dan aman sebelum mulai melayani pengunjung secara nyata.",
    sec2Item1: "Biner Caddy",
    sec2Item2: "Rute Masuk Nginx",
    sec2Status: "SIAP",
    sec3Title: "03. Terowongan Khusus (Ingress Tunneling)",
    sec3Body: "Menghubungkan layanan lokal Anda agar dapat diakses dari luar internet secara aman melalui protokol rute masuk yang terenkripsi SSL otomatis.",
    sec3NoteTitle: "Catatan Keamanan:",
    sec3NoteBody: "Semua lalu lintas data yang lewat dijamin keamanannya menggunakan SSL/HTTPS di setiap rute.",
    sec4Title: "04. Alat Pemantau Interaktif",
    sec4Body: "Memantau statistik lalu lintas kunjungan secara langsung, grafik aliran data jaringan, serta respons koneksi (ping) secara visual.",
    footer: "GENESIS CORE v2026.05.22 ALPHA-BUILD — DIRANCANG & DIKEMBANGKAN OLEH ARDY SYAFII"
  } : {
    sec1Title: "01. Dynamic VHost Engine",
    sec1Body: "Managing high-performance Nginx virtual environments using a unified template generator. Supports upstream clustering for multi-node load balanced target groups.",
    sec1Item1: "Template-based config generation",
    sec1Item2: "Upstream node health orchestration",
    sec2Title: "02. Deployment Pre-flight",
    sec2Body: "Verifies local environment readiness before production deployment.",
    sec2Item1: "Caddy Binary",
    sec2Item2: "Nginx Ingress",
    sec2Status: "READY",
    sec3Title: "03. Ingress Tunneling",
    sec3Body: "Expose internal local services to the public mesh through secure ingress rules. Includes baked-in webhook receiver inspection for deployment automation.",
    sec3NoteTitle: "Security Note:",
    sec3NoteBody: "All tunnels are proxied through a dynamic gateway mesh with mandatory SSL termination at the edge.",
    sec4Title: "04. Monitoring Tools",
    sec4Body: "Real-time visitor telemetry, network throughput analytics, and interactive trace sandboxes for performance debugging and latency analysis.",
    footer: "GENESIS CORE v2026.05.22 ALPHA-BUILD — DESIGNED & ENGINEERED BY ARDY SYAFII"
  };

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

  // Periodic Health Check Simulation
  useEffect(() => {
    const reportStatus = async (siteId: string, status: string) => {
      if (!authToken) return;
      try {
        const response = await fetch(`/api/admin/report-status`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${authToken}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ siteId, status })
        });
        if (!response.ok) {
           console.error(`Failed to report status: ${response.status} ${response.statusText}`);
        }
      } catch (err: any) {
        const isNetworkError = err && (
          err.name === 'TypeError' || 
          err.message?.includes('fetch') || 
          err.message?.includes('network') ||
          err.message?.includes('NetworkError') ||
          err.message?.includes('Failed to fetch')
        );
        if (isNetworkError) {
          console.warn(`[Network] reportStatus failed due to temporary connection offline or server restart.`);
        } else {
          console.error(`Fetch error in reportStatus:`, err);
        }
      }
    };

    const interval = setInterval(() => {
      setCaddySites(prevSites => {
        const nextSites = prevSites.map(site => {
          // Simulate health check result: 85% chance to be up
          const isHealthy = Math.random() > 0.15;
          const status = isHealthy ? 'up' : 'down';
          // Tweak load slightly
          const load = isHealthy ? Math.ceil(Math.random() * 25) : 0;
          const lastHeartbeat = isHealthy ? new Date().toISOString() : site.lastHeartbeat;
          // Calculate realistic moving uptime
          const currentUptime = site.uptime !== undefined ? site.uptime : 99.9;
          const nextUptime = isHealthy
            ? Math.min(100, Number((currentUptime + (100 - currentUptime) * 0.005).toFixed(3)))
            : Math.max(80, Number((currentUptime - 0.15).toFixed(3)));

          return { ...site, status, load, uptime: nextUptime, lastHeartbeat };
        });

        // Optimize reporting: only contact server when status actually changes
        setTimeout(() => {
          nextSites.forEach((site, index) => {
            const prevSite = prevSites[index];
            if (!prevSite || prevSite.status !== site.status) {
              reportStatus(site.id, site.status);
            }
          });
        }, 0);

        return nextSites;
      });
    }, 10000); // Every 10 seconds

    return () => clearInterval(interval);
  }, [authToken]);

  const loadPublicData = async () => {
    try {
      const data = await fetchPublicContent();
      setHero(data.hero);
      setProjects(data.projects);
      // Fetch online/offline status for each project
      try {
        const statusRes = await fetchProjectStatus();
        const map: Record<string, boolean> = {};
        statusRes.statuses.forEach(s => { map[s.id] = s.online; });
        setProjectStatusMap(map);
      } catch (e) {
        console.error('Failed to fetch project statuses', e);
        // fallback: assume online
        const fallback = Object.fromEntries(data.projects.map(p => [p.id, true]));
        setProjectStatusMap(fallback);
      }
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
      const portsRes = await fetchListeningPorts(authToken);
      setListeningPorts(portsRes.ports);
      const secRes = await fetchSecurityStatus(authToken);
      setSecurityStatus(secRes);

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
          status: editingDdns.status || 'Active',
          checkFrequency: editingDdns.checkFrequency || 15,
          enabled: editingDdns.enabled ?? true
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

  // Caddy Monitoring Actions
  const handleAddCaddyClick = () => {
    setEditingCaddy({ name: '', status: 'up', load: 12, uptime: 100.0, lastHeartbeat: new Date().toISOString() });
    setIsCaddyModalOpen(true);
  };

  const handleEditCaddyClick = (site: CaddySite) => {
    setEditingCaddy(site);
    setIsCaddyModalOpen(true);
  };

  const handleSaveCaddySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCaddy || !editingCaddy.name) return;

    setCaddySites(prev => {
      const exists = prev.find(site => site.id === editingCaddy.id);
      if (exists) {
        return prev.map(site => site.id === editingCaddy.id ? { ...site, ...editingCaddy } as CaddySite : site);
      } else {
        const newSite: CaddySite = {
          id: String(Date.now()),
          name: editingCaddy.name || '',
          status: editingCaddy.status || 'up',
          load: editingCaddy.load || 0,
          uptime: editingCaddy.uptime !== undefined ? Number(editingCaddy.uptime) : 100.0,
          lastHeartbeat: editingCaddy.lastHeartbeat || new Date().toISOString()
        };
        return [...prev, newSite];
      }
    });

    setIsCaddyModalOpen(false);
    setEditingCaddy(null);
    triggerNotification('success', 'Caddy monitoring profile committed successfully');
  };

  const handleDeleteCaddy = (id: string) => {
    if (!confirm(t.caddyDeleteConfirm || 'Are you sure you want to stop monitoring this Caddy site?')) return;
    setCaddySites(prev => prev.filter(site => site.id !== id));
    triggerNotification('success', 'Monitored Caddy site removed');
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
  if (isAdminMode) {
    return (
      <div className={isMonochrome ? 'is-monochrome' : ''}>
        <AuthScreen
          onSuccess={handleLoginSuccess}
          onBack={() => setIsAdminMode(false)}
          locale={locale}
        />
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-zinc-950 font-sans text-zinc-100 flex flex-col relative overflow-x-hidden selection:bg-sky-500 selection:text-white ${isMonochrome ? 'is-monochrome' : ''}`}>
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
              <span className="text-[10px] font-mono font-bold tracking-[0.4em] text-zinc-500 uppercase">Orchestra Gateway</span>
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
                Orchestra <span className="text-sky-500 font-sans font-light">Gateway</span>
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
                  onClick={() => setLocale(locale === 'en' ? 'id' : 'en')}
                  title="Ganti Bahasa / Toggle Language"
                  className="px-2 h-7 rounded bg-zinc-900 border border-zinc-805 text-[9px] font-mono font-bold text-zinc-400 hover:text-sky-400 transition cursor-pointer"
                >
                  {locale.toUpperCase()}
                </button>
                <button
                  onClick={() => setIsMonochrome(!isMonochrome)}
                  title={t.monochromeToggle}
                  className={`px-2 h-7 rounded border text-[9px] font-mono font-bold transition cursor-pointer flex items-center gap-1 ${isMonochrome ? 'bg-zinc-100 border-white text-zinc-950 hover:bg-zinc-200' : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-sky-400'}`}
                >
                  <Contrast size={10} />
                  <span>{isMonochrome ? 'MONO' : 'COLOR'}</span>
                </button>
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

      {/* Dedicated Stacked Toast Notification Center Component */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full px-4 pointer-events-none items-end">
        <AnimatePresence mode="popLayout">
          {toasts.map((toast) => {
            const isSuccess = toast.type === 'success';
            const isError = toast.type === 'error';
            const isWarning = toast.type === 'warning';

            return (
              <motion.div
                key={toast.id}
                layout
                initial={{ opacity: 0, y: 20, scale: 0.9, x: 30 }}
                animate={{ opacity: 1, y: 0, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.85, x: 30, transition: { duration: 0.2 } }}
                className={`pointer-events-auto p-3.5 rounded-xl bg-zinc-950/95 backdrop-blur-md border text-xs text-zinc-100 shadow-2xl flex items-start gap-3 w-80 font-mono relative overflow-hidden group hover:border-zinc-700 transition-colors ${
                  isSuccess ? 'border-emerald-500/30 shadow-emerald-950/20' :
                  isError ? 'border-red-500/30 shadow-red-950/20' :
                  isWarning ? 'border-amber-500/30 shadow-amber-950/20' :
                  'border-sky-500/30 shadow-sky-950/20'
                }`}
              >
                {/* Visual Accent Left Edge Highlight */}
                <div className={`absolute top-0 left-0 w-1 h-full ${
                  isSuccess ? 'bg-emerald-500' :
                  isError ? 'bg-red-500' :
                  isWarning ? 'bg-amber-500' :
                  'bg-sky-500'
                }`} />

                {/* Left status icon with glow/pulse background */}
                <div className={`flex-shrink-0 mt-0.5 relative flex items-center justify-center h-5 w-5 rounded ${
                  isSuccess ? 'bg-emerald-500/10 text-emerald-400' :
                  isError ? 'bg-red-500/10 text-red-400' :
                  isWarning ? 'bg-amber-500/10 text-amber-400' :
                  'bg-sky-500/10 text-sky-400'
                }`}>
                  {isSuccess && <Check size={13} className="stroke-[2.5]" />}
                  {isError && <AlertCircle size={13} className="stroke-[2.5]" />}
                  {isWarning && <AlertTriangle size={13} className="stroke-[2.5]" />}
                  {!isSuccess && !isError && !isWarning && <Activity size={13} className="stroke-[2.5] animate-pulse" />}
                </div>

                {/* Main Message Text content */}
                <div className="flex-grow pr-4 break-all leading-normal select-text">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className={`text-[9px] uppercase font-bold tracking-wider ${
                      isSuccess ? 'text-emerald-400' :
                      isError ? 'text-red-400' :
                      isWarning ? 'text-amber-400' :
                      'text-sky-400'
                    }`}>
                      {isSuccess ? 'SUCCESS' : isError ? 'ERROR ALERT' : isWarning ? 'WARNING' : 'SYSTEM INFO'}
                    </span>
                  </div>
                  <p className="text-zinc-200 text-[11px] leading-relaxed pr-1">{toast.text}</p>
                </div>

                {/* Individual Dismiss control button */}
                <button
                  onClick={() => removeToast(toast.id)}
                  className="absolute top-2.5 right-2 text-zinc-500 hover:text-white transition-colors cursor-pointer p-0.5 rounded hover:bg-zinc-900"
                  title="Dismiss notification"
                >
                  <X size={11} />
                </button>

                {/* Animated self-dismiss visual countdown progress bar */}
                <div className="absolute bottom-0 left-0 h-[2px] bg-zinc-900/40 w-full overflow-hidden">
                  <motion.div
                    initial={{ width: '100%' }}
                    animate={{ width: '0%' }}
                    transition={{ duration: isSuccess ? 3.5 : 5.0, ease: 'linear' }}
                    className={`h-full ${
                      isSuccess ? 'bg-emerald-500' :
                      isError ? 'bg-red-500' :
                      isWarning ? 'bg-amber-500' :
                      'bg-sky-500'
                    }`}
                  />
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

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
                <span className="text-[10px] text-zinc-500 font-mono tracking-widest block uppercase">ORCHESTRA</span>
                <span className="text-xs text-white font-mono font-bold">{locale === 'id' ? 'Papan Pengendali' : 'Control Board'}</span>
              </div>

              {[
                { id: 'monitor', label: t.monitorTab, icon: Monitor },
                { id: 'content', label: t.contentTab, icon: Sliders },
                { id: 'nginx', label: t.nginxTab, icon: Globe },
                { id: 'ddns', label: t.ddnsTab, icon: RefreshCw },
                { id: 'ports', label: t.portsTab, icon: Server },
                { id: 'settings', label: t.settingsTab, icon: Sliders }
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
                      <ResourceTile label={t.cpuLoad} value={systemResources.cpu} color="#0ea5e9" threshold={cpuThreshold} warningMsg={t.highCpuWarn} />
                      <ResourceTile label={t.ramUsage} value={systemResources.ram} color="#8b5cf6" threshold={ramThreshold} warningMsg={t.highRamWarn} />
                      <ResourceTile label={t.diskSpace} value={systemResources.disk} color="#10b981" />
                    </div>

                      {/* GATEWAY MONITOR CONFIGURATION PANEL */}
                      {/* Port Usage Card */}
                      <div className="bg-zinc-900 border border-zinc-800 rounded p-4 mt-4 shadow-neon">
                        <h3 className="text-xs font-bold text-sky-400 uppercase mb-2">Port yang Digunakan</h3>
                        <ul className="list-disc list-inside space-y-1 text-[10px] text-zinc-300">
                          {portForwards.map(pf => (
                            <li key={pf.id}>
                              {pf.name}: {pf.incomingPort} → {pf.localAddress}:{pf.localPort} {pf.status === 'Active' ? '(ON)' : '(OFF)'}
                            </li>
                          ))}
                        </ul>
                      </div>

                    {/* Semua Port Aktif Card */}
                    <div className="bg-zinc-900 border border-zinc-800 rounded p-4 mt-4 shadow-neon">
                      <h3 className="text-xs font-bold text-sky-400 uppercase mb-2">Semua Port Aktif</h3>
                      <ul className="list-disc list-inside space-y-1 text-[10px] text-zinc-300">
                        {listeningPorts.map(p => (
                          <li key={p.protocol + p.port}>
                            {p.protocol}/{p.state} {p.address}:{p.port}{p.process && ` (proc: ${p.process})`}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Port Publik Ter-Expose Card */}
                    <div className="bg-zinc-900 border border-zinc-800 rounded p-4 mt-4 shadow-neon">
                      <h3 className="text-xs font-bold text-sky-400 uppercase mb-2">Port Publik Ter‑Expose</h3>
                      <ul className="list-disc list-inside space-y-1 text-[10px] text-zinc-300">
                        {portForwards.map(pf => (
                          <li key={pf.id}>Incoming {pf.incomingPort} → {pf.localAddress}:{pf.localPort}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Security Status Card */}
                    <div className="bg-zinc-900 border border-zinc-800 rounded p-4 mt-4 shadow-neon">
                      <h3 className="text-xs font-bold text-sky-400 uppercase mb-2">Keamanan Port</h3>
                      {securityStatus && securityStatus.insecurePorts && securityStatus.insecurePorts.length > 0 ? (
                        <ul className="list-disc list-inside space-y-1 text-[10px] text-red-400">
                          {securityStatus.insecurePorts.map((p:any) => (
                            <li key={p.protocol + p.port}>
                              {p.protocol.toUpperCase()}/{p.port} ({p.address}) – {p.reason}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-[10px] text-green-400">Tidak ada port publik yang berisiko.</p>
                      )}
                    </div>
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 shadow-neon space-y-3">
                      <div className="flex items-center justify-between border-b border-zinc-850 pb-2">
                        <div className="flex items-center gap-2">
                          <Settings size={13} className="text-sky-450 drop-shadow-neon" />
                          <h3 className="text-xs font-bold text-sky-400 uppercase tracking-widest">{t.monitorRules}</h3>
                        </div>
                        <span className="text-[8px] bg-zinc-950 text-zinc-500 border border-zinc-850 font-mono px-2 py-0.5 rounded uppercase">{t.adjustLimits}</span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-[10px] font-mono">
                        {/* CPU Limit Warning */}
                        <div className="space-y-2 bg-zinc-950/60 p-2.5 rounded border border-zinc-850">
                          <div className="flex justify-between items-center text-zinc-300">
                            <span className="uppercase text-[8.5px] text-zinc-400 font-bold">{t.cpuAlertLimit}</span>
                            <span className="text-sky-400 font-bold">{cpuThreshold}%</span>
                          </div>
                          <input 
                            type="range" 
                            min="10" 
                            max="100" 
                            value={cpuThreshold} 
                            onChange={(e) => {
                              const v = parseInt(e.target.value);
                              setCpuThreshold(v);
                              localStorage.setItem('cpu_threshold', v.toString());
                            }}
                            className="w-full accent-cyan-400 bg-zinc-950 rounded-lg h-1.5 cursor-pointer animate-pulse"
                          />
                          <div className="flex items-center justify-between text-[8px] text-zinc-500 pt-1">
                            <span>{t.setSim}</span>
                            <div className="flex gap-1.55">
                              <button 
                                type="button"
                                onClick={() => setSystemResources(prev => ({ ...prev, cpu: Math.min(100, Math.max(0, prev.cpu + 10)) }))} 
                                className="text-sky-400 hover:text-sky-300 font-bold px-1.5 py-0.5 bg-zinc-900 rounded border border-zinc-800 text-[8px]"
                              >
                                +10%
                              </button>
                              <button 
                                type="button"
                                onClick={() => setSystemResources(prev => ({ ...prev, cpu: Math.min(100, Math.max(0, prev.cpu - 10)) }))} 
                                className="text-zinc-400 hover:text-white font-bold px-1.5 py-0.5 bg-zinc-900 rounded border border-zinc-800 text-[8px]"
                              >
                                -10%
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* RAM Limit Warning */}
                        <div className="space-y-2 bg-zinc-950/60 p-2.5 rounded border border-zinc-850">
                          <div className="flex justify-between items-center text-zinc-300">
                            <span className="uppercase text-[8.5px] text-zinc-400 font-bold">{t.ramAlertLimit}</span>
                            <span className="text-purple-400 font-bold">{ramThreshold}%</span>
                          </div>
                          <input 
                            type="range" 
                            min="10" 
                            max="100" 
                            value={ramThreshold} 
                            onChange={(e) => {
                              const v = parseInt(e.target.value);
                              setRamThreshold(v);
                              localStorage.setItem('ram_threshold', v.toString());
                            }}
                            className="w-full accent-purple-400 bg-zinc-950 rounded-lg h-1.5 cursor-pointer animate-pulse"
                          />
                          <div className="flex items-center justify-between text-[8px] text-zinc-500 pt-1">
                            <span>{t.setSim}</span>
                            <div className="flex gap-1.5">
                              <button 
                                type="button"
                                onClick={() => setSystemResources(prev => ({ ...prev, ram: Math.min(100, Math.max(0, prev.ram + 10)) }))} 
                                className="text-purple-400 hover:text-purple-300 font-bold px-1.5 py-0.5 bg-zinc-900 rounded border border-zinc-800 text-[8px]"
                              >
                                +10%
                              </button>
                              <button 
                                type="button"
                                onClick={() => setSystemResources(prev => ({ ...prev, ram: Math.min(100, Math.max(0, prev.ram - 10)) }))} 
                                className="text-zinc-400 hover:text-white font-bold px-1.5 py-0.5 bg-zinc-900 rounded border border-zinc-800 text-[8px]"
                              >
                                -10%
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* RTT Latency warning threshold */}
                        <div className="space-y-2 bg-zinc-950/60 p-2.5 rounded border border-zinc-850">
                          <div className="flex justify-between items-center text-zinc-300">
                            <span className="uppercase text-[8.5px] text-zinc-400 font-bold">{t.latencyAlertLimit}</span>
                            <span className="text-orange-400 font-bold">{latencyThreshold} ms</span>
                          </div>
                          <input 
                            type="range" 
                            min="2" 
                            max="45" 
                            value={latencyThreshold} 
                            onChange={(e) => {
                              const v = parseInt(e.target.value);
                              setLatencyThreshold(v);
                              localStorage.setItem('latency_threshold', v.toString());
                            }}
                            className="w-full accent-orange-400 bg-zinc-950 rounded-lg h-1.5 cursor-pointer animate-pulse"
                          />
                          <div className="flex items-center justify-between text-[8px] text-zinc-500 pt-1">
                            <span className="text-[7.5px] leading-tight text-zinc-500 italic">{t.valuesAboveWarn}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 shadow-neon">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xs font-bold text-sky-400 uppercase tracking-widest">{t.caddyTelemetry}</h3>
                        <div className="flex items-center gap-2">
                          <button onClick={handleAddCaddyClick} className="flex items-center gap-1.5 px-2.5 py-1 bg-sky-500/10 border border-sky-500/30 rounded text-[10px] text-sky-400 hover:bg-sky-500/20 cursor-pointer transition">
                            <Plus size={10} /> {t.easySetup}
                          </button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {caddySites.map(site => (
                          <div key={site.id} className="bg-zinc-950/80 p-3.5 rounded-xl border border-zinc-800/80 hover:border-sky-500/20 transition-all duration-300 flex flex-col justify-between shadow-sm relative group overflow-hidden">
                             {/* Subtle top reflection line */}
                             <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-sky-500/10 to-transparent" />
                             
                             <div>
                               <div className="flex items-center justify-between mb-2.5">
                                 <div className="flex items-center gap-2 overflow-hidden">
                                   {/* Pulsing Status Dot Beacon */}
                                   <div className="relative flex h-2 w-2 flex-shrink-0">
                                     <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${site.status === 'up' ? 'bg-emerald-400' : 'bg-red-400'}`}></span>
                                     <span className={`relative inline-flex rounded-full h-2 w-2 ${site.status === 'up' ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                                   </div>
                                   <span className="text-[10px] font-mono font-bold text-zinc-100 tracking-tight truncate" title={site.name}>{site.name}</span>
                                 </div>
                                 
                                 {/* Edit/Delete Overlay */}
                                 <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                                   <button 
                                     onClick={() => handleEditCaddyClick(site)} 
                                     className="p-1 rounded text-zinc-500 hover:text-sky-400 hover:bg-zinc-900 transition-colors cursor-pointer"
                                     title={t.caddyEditTitle || "Edit site"}
                                   >
                                     <Edit3 size={10} />
                                   </button>
                                   <button 
                                     onClick={() => handleDeleteCaddy(site.id)} 
                                     className="p-1 rounded text-zinc-500 hover:text-red-400 hover:bg-zinc-900 transition-colors cursor-pointer"
                                     title="Delete site"
                                   >
                                     <Trash2 size={10} />
                                   </button>
                                 </div>
                               </div>

                               {/* Health Metrics & Gauges */}
                               <div className="space-y-2 mb-1.5 text-[9px] font-mono">
                                 {/* Uptime and value */}
                                 <div className="flex items-center justify-between">
                                   <span className="text-zinc-500">{t.caddyUptimeLabel || 'Uptime'}</span>
                                   <span className={`font-bold ${site.status === 'up' ? 'text-emerald-400' : 'text-red-400'}`}>
                                     {Number(site.uptime !== undefined ? site.uptime : 99.9).toFixed(3)}%
                                   </span>
                                 </div>

                                 {/* Uptime track visualizer */}
                                 <div className="w-full bg-zinc-900 rounded-full h-1 overflow-hidden relative border border-zinc-800/50">
                                   <div 
                                     className={`h-full rounded-full transition-all duration-500 ${site.status === 'up' ? 'bg-emerald-500' : 'bg-red-500'}`}
                                     style={{ width: `${site.uptime !== undefined ? site.uptime : 99.9}%` }}
                                   />
                                 </div>

                                 {/* Active CPU Load percentage */}
                                 <div className="flex items-center justify-between">
                                   <span className="text-zinc-500">{t.loadLabel}</span>
                                   <span className="text-zinc-300 font-medium">{site.load}%</span>
                                 </div>

                                 {/* CPU visual load gauge */}
                                 <div className="w-full bg-zinc-900 rounded-full h-1 overflow-hidden">
                                   <div 
                                     className="h-full rounded-full bg-cyan-500 transition-all duration-500"
                                     style={{ width: `${site.load}%` }}
                                   />
                                 </div>
                               </div>
                             </div>

                             {/* Heartbeat Status row */}
                             <div className="mt-2 text-[8px] font-mono text-zinc-500 flex items-center justify-between border-t border-zinc-900/40 pt-2.5">
                               <span className="flex items-center gap-1 text-[7.5px] uppercase tracking-wide">
                                 <Activity size={9} className={site.status === 'up' ? 'text-emerald-500 animate-pulse' : 'text-zinc-600'} />
                                 {t.caddyHeartbeat || 'Heartbeat'}
                               </span>
                               <span className="text-[7.5px] tabular-nums font-semibold text-zinc-400">
                                 {getRelativeTime(site.lastHeartbeat)}
                               </span>
                             </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                          <h3 className="text-xs font-bold text-zinc-300 uppercase mb-3">{t.checklist}</h3>
                          {(locale === 'id' 
                            ? ['Perbarui Konfigurasi Caddy', 'Verifikasi Sertifikat SSL', 'Jalankan Ulang Nginx', 'Bersihkan Catatan Log']
                            : ['Update Caddy Config', 'Verify SSL Certs', 'Restart Nginx', 'Clear Logs']
                          ).map(item => (
                            <div key={item} className="flex items-center gap-2 text-[10px] text-zinc-400 mb-2">
                              <input type="checkbox" className="accent-sky-500" /> {item}
                            </div>
                          ))}
                      </div>
                      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                          <h3 className="text-xs font-bold text-zinc-300 uppercase mb-3">{t.logsValidator}</h3>
                          <LogTerminal logs={appLogs} />
                          <button className="mt-2 w-full text-[9px] uppercase py-1 bg-zinc-800 hover:bg-zinc-700 cursor-pointer">{t.validateConfigs}</button>
                      </div>
                    </div>

                    <div>
                      <h2 className="text-sm font-semibold tracking-tight text-white font-mono uppercase">{t.liveTitle}</h2>
                      <p className="text-[11px] text-zinc-500 font-mono text-xs">{t.liveSubtitle}</p>
                    </div>

                    {/* Network stats indicators */}
                    {/* Admin Actions Bar */}
                    <div className="flex items-center justify-between bg-zinc-950 border border-zinc-900 rounded-xl p-3 shadow-neon">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 shadow-neon">
                          <User size={14} className="drop-shadow-neon" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest leading-none mb-0.5">{t.sessionActive}</span>
                          <span className="text-xs font-bold text-white tracking-tight leading-none">{adminProfile?.fullName}</span>
                        </div>
                      </div>
                      <button 
                        onClick={handleLogout}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-red-950/40 border border-red-900/50 rounded-lg text-[10px] font-mono font-bold text-red-100 hover:bg-red-900 hover:text-white shadow-neon transition-all active:scale-95 cursor-pointer uppercase tracking-tight"
                      >
                        <LogOut size={12} className="drop-shadow-neon" />
                        {t.terminate}
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="bg-zinc-900 border border-zinc-800/80 rounded-xl p-3 text-center shadow-neon">
                        <span className="text-[8px] text-zinc-500 block uppercase font-mono font-bold tracking-wider drop-shadow-neon">{t.dynamicGateway}</span>
                        <span className="text-white text-xs font-mono font-bold block mt-1 truncate">180.244.131.25</span>
                      </div>
                      
                      <div className="bg-zinc-900 border border-zinc-800/80 rounded-xl p-3 text-center shadow-neon">
                        <span className="text-[8px] text-zinc-500 block uppercase font-mono font-bold tracking-wider drop-shadow-neon">{t.reverseProxies}</span>
                        <span className="text-cyan-400 text-xs font-mono font-bold block mt-1">
                          {nginxConfigs.length > 0 ? `${nginxConfigs.length} ${locale === 'id' ? 'Aktif' : 'Active'}` : 'VAIO CORE'}
                        </span>
                      </div>

                      <div className="bg-zinc-900 border border-zinc-800/80 rounded-xl p-3 text-center shadow-neon">
                        <span className="text-[8px] text-zinc-500 block uppercase font-mono font-bold tracking-wider drop-shadow-neon">{t.throughput}</span>
                        <span className="text-emerald-400 text-xs font-mono font-bold block mt-1">102.4 Mb/s</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                       <SystemMonitor locale={locale} />
                       <VisitorAnalytics locale={locale} />
                    </div>

                    {/* Interactive Sandbox Tracer Circuit */}
                    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex flex-col gap-3 shadow-[0_0_20px_rgba(56,189,248,0.05)] hover:shadow-[0_0_30px_rgba(56,189,248,0.15)] transition-all duration-500 relative overflow-hidden">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-[10px] font-mono text-zinc-350 font-bold block uppercase tracking-wider">{t.terminalTitle}</span>
                          <span className="text-[8px] font-mono text-zinc-500 uppercase block mt-0.5">{t.terminalSubtitle}</span>
                        </div>
                        <span className="text-[8px] bg-cyan-950/40 text-cyan-400 border border-cyan-800/40 px-1.5 py-0.5 rounded font-mono font-semibold">ACTIVE NODE TUNNEL</span>
                      </div>

                      {/* Interactive Visual Trace schematic */}
                      <div className="bg-zinc-950 border border-zinc-800/80 rounded-xl p-3 relative h-20 overflow-hidden flex items-center justify-between shadow-inner font-mono">
                        {/* Schematic wire dots */}
                        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f1f1f_1px,transparent_1px),linear-gradient(to_bottom,#1f1f1f_1px,transparent_1px)] bg-[size:10px_10px] opacity-20" />
                        
                        <div className="z-10 text-center flex flex-col items-center">
                          <span className={`w-2 h-2 rounded-full ${latencyStats.isHigh ? 'bg-orange-500 animate-ping shadow-[0_0_8px_#f97316]' : 'bg-cyan-500 animate-ping shadow-neon'} absolute`} />
                          <span className={`w-2 h-2 rounded-full ${latencyStats.isHigh ? 'bg-orange-400 shadow-[0_0_8px_#f97316]' : 'bg-cyan-400 shadow-neon'} z-20`} />
                          <span className="text-[7.5px] text-zinc-400 mt-1 uppercase tracking-wider drop-shadow-neon">Client Ingress</span>
                        </div>

                        {/* Connection vector path */}
                        <div className="flex-1 mx-3 h-0.5 bg-zinc-800 relative z-0">
                          <motion.div
                            animate={{ x: ['-100%', '100%'] }}
                            transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
                            className={`absolute top-0 bottom-0 w-8 bg-gradient-to-r from-transparent ${latencyStats.isHigh ? 'via-orange-400' : 'via-cyan-400'} to-transparent`}
                          />
                        </div>

                        <div className="z-10 text-center flex flex-col items-center">
                          <span className={`w-2 h-2 rounded-full ${latencyStats.isHigh ? 'bg-orange-500 shadow-[0_0_8px_#f97316] animate-pulse' : 'bg-purple-500 shadow-neon animate-pulse'} z-20`} />
                          <span className="text-[7.5px] text-zinc-400 mt-1 uppercase tracking-wider drop-shadow-neon">Orchestra Proxy</span>
                        </div>

                        {/* Connection vector path */}
                        <div className="flex-1 mx-3 h-0.5 bg-zinc-800 relative z-0">
                          <motion.div
                            animate={{ x: ['-100%', '100%'] }}
                            transition={{ repeat: Infinity, duration: 2.2, ease: 'linear' }}
                            className={`absolute top-0 bottom-0 w-8 bg-gradient-to-r from-transparent ${latencyStats.isHigh ? 'via-orange-400' : 'via-cyan-400'} to-transparent`}
                          />
                        </div>

                        <div className="z-10 text-center flex flex-col items-center">
                          <span className={`w-2 h-2 rounded-full ${latencyStats.isHigh ? 'bg-orange-400 shadow-[0_0_8px_#f97316] animate-pulse' : 'bg-emerald-500 animate-pulse'} z-20`} />
                          <span className="text-[7.5px] text-zinc-400 mt-1 uppercase tracking-wider">Target Module</span>
                        </div>
                      </div>

                      {/* Selectable Project Trigger nodes */}
                      <div className="flex flex-wrap gap-1.5 py-1">
                        {projects.slice(0, 5).map((p) => {
                          const active = selectedTraceId === p.id;
                          const currentRtt = projectLatencies[p.id];
                          const isRouteHighLatency = currentRtt !== undefined && currentRtt > latencyThreshold;
                          return (
                            <button
                              key={p.id}
                              type="button"
                              onClick={() => {
                                setSelectedTraceId(p.id);
                                triggerPingTrace(p.title, p.link, p.id);
                              }}
                              className={`px-2.5 py-1.5 rounded border text-[10px] font-mono transition-all cursor-pointer flex items-center gap-1.5 ${
                                active
                                  ? isRouteHighLatency
                                    ? 'bg-orange-500/10 border-orange-500 text-orange-400 shadow-[0_0_10px_rgba(249,115,22,0.15)] font-bold animate-pulse'
                                    : 'bg-cyan-500/10 border-cyan-400 text-cyan-300'
                                  : isRouteHighLatency
                                    ? 'bg-orange-950/20 border-orange-700/60 text-orange-400 hover:text-white hover:border-orange-500'
                                    : 'bg-zinc-950 border-zinc-850 text-zinc-400 hover:text-white hover:border-zinc-700'
                              }`}
                            >
                              <span>🚀 {p.title}</span>
                              {currentRtt !== undefined && (
                                <span className={`text-[8px] px-1 rounded-sm border ${isRouteHighLatency ? 'bg-orange-500/20 border-orange-500/40 text-orange-400 font-semibold' : 'bg-cyan-500/20 border-cyan-500/40 text-cyan-400'}`}>
                                  {currentRtt}ms
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {/* Real-time Latency Stats */}
                      <div className="flex items-center justify-between px-1 mb-1">
                         <div className="flex items-center gap-4">
                            <span className="text-[7px] text-zinc-500 uppercase font-mono tracking-widest">{locale === 'id' ? 'Metrik Performa Jaringan' : 'Performance Metrics'}</span>
                            <button 
                              onClick={clearTraceHistory}
                              className="group/clear flex items-center gap-1 text-[7px] text-zinc-600 hover:text-red-400 transition-colors uppercase font-mono tracking-tighter"
                              title="Clear Trace History"
                            >
                               <Trash2 size={8} className="group-hover/clear:scale-110 transition-transform" />
                               <span>{t.clearHistory}</span>
                            </button>
                         </div>
                         {latencyStats.isHigh && (
                            <div className="flex items-center gap-1 text-orange-500 animate-pulse">
                               <AlertTriangle size={8} className="drop-shadow-neon" />
                               <span className="text-[7px] font-mono font-bold uppercase tracking-tighter">{t.highLatencyWarning}</span>
                            </div>
                         )}
                      </div>
                      <div className="grid grid-cols-3 gap-2 py-1">
                        <div className="bg-zinc-950/50 border border-zinc-800/80 rounded-lg p-2 text-center group/stat hover:border-cyan-500/30 transition-colors">
                           <span className="text-[7px] text-zinc-500 uppercase block font-mono tracking-widest mb-0.5 group-hover/stat:text-cyan-500 transition-colors">{t.minLatency}</span>
                           <span className="text-xs font-mono font-bold text-sky-400 drop-shadow-neon">{latencyStats.min}ms</span>
                        </div>
                        <div className="bg-zinc-950/50 border border-zinc-800/80 rounded-lg p-2 text-center group/stat hover:border-emerald-500/30 transition-colors">
                           <span className="text-[7px] text-zinc-500 uppercase block font-mono tracking-widest mb-0.5 group-hover/stat:text-emerald-500 transition-colors">{t.avgLatency}</span>
                           <span className="text-xs font-mono font-bold text-emerald-400 drop-shadow-neon">{latencyStats.avg}ms</span>
                        </div>
                        <div className={`bg-zinc-950/50 border rounded-lg p-2 text-center group/stat transition-colors ${latencyStats.isHigh ? 'border-orange-500/40' : 'border-zinc-800/80 hover:border-orange-500/30'}`}>
                           <span className="text-[7px] text-zinc-500 uppercase block font-mono tracking-widest mb-0.5 group-hover/stat:text-orange-500 transition-colors">{t.maxLatency}</span>
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

                      <div className="flex items-center mb-2">
                        <input
                          type="text"
                          placeholder="Cari proyek..."
                          value={searchQuery}
                          onChange={e => setSearchQuery(e.target.value)}
                          className="flex-1 bg-zinc-900 border border-zinc-800 text-zinc-200 px-2 py-1 text-sm rounded focus:outline-none focus:border-sky-500"
                        />
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
                            {projects.filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase())).map(proj => (
                              <tr key={proj.id} className="hover:bg-zinc-900/40">
                                <td className="p-2 font-bold text-white max-w-[120px] truncate">{proj.title}</td>
                                <td className="p-2 text-zinc-400 truncate max-w-[200px] hidden sm:table-cell">{proj.description}</td>
                                <td className="p-2 text-zinc-400 text-[10px]"><span className="px-1.5 py-0.5 rounded bg-zinc-950 border border-zinc-800">{proj.category}</span></td>
                                <td className="p-2">
                                  <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] ${projectStatusMap[proj.id] ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                                    {projectStatusMap[proj.id] ? 'ONLINE' : 'OFFLINE'}
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
                        <h2 className="text-sm font-semibold tracking-tight text-white font-mono">{t.nginxManager}</h2>
                        <p className="text-[11px] text-zinc-500 font-mono">{t.nginxSub}</p>
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
                        <Plus size={12} /> {t.newVHost}
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
                                  <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-mono">{t.sslTermination}</span>
                                )}
                              </div>
                              <p className="text-[10px] text-zinc-400 font-mono mt-0.5">
                                {t.mapsTo} <strong className="text-zinc-200">{config.isLoadBalanced ? (locale === 'id' ? 'Kluster Server Hulu Internal' : 'Internal Upstream Cluster') : config.targetUrl}</strong>
                              </p>
                            </div>
                            <div className="flex items-center gap-1.5 self-end sm:self-auto">
                              <button
                                onClick={() => {
                                  setEditingNginx(config);
                                  setIsNginxModalOpen(true);
                                }}
                                className="px-2 py-1 rounded bg-zinc-950 border border-zinc-800 text-[10px] font-mono text-sky-400 hover:text-sky-300 transition cursor-pointer"
                              >
                                {t.editVHost}
                              </button>
                              <button
                                onClick={() => handleDeleteNginx(config.id)}
                                className="p-1 rounded bg-zinc-950 border border-zinc-800 text-zinc-500 hover:text-red-400 transition cursor-pointer"
                              >
                                <Trash2 size={11} />
                              </button>
                            </div>
                          </div>

                          {/* Upstreams cluster nodes if load balanced */}
                          {config.isLoadBalanced && config.upstreams.length > 0 && (
                            <div className="mb-3 p-2 bg-zinc-950/80 border border-zinc-800 rounded">
                              <div className="text-[9px] text-zinc-500 font-mono uppercase tracking-wider mb-1">{t.multiNodeUpstream}</div>
                              <div className="space-y-1">
                                {config.upstreams.map((node, i) => (
                                  <div key={i} className="text-[10px] font-mono text-zinc-300 flex items-center gap-2">
                                    <CornerDownRight size={10} className="text-zinc-500" />
                                    <span>{t.nodeLabel} {i + 1}: <strong className="text-white bg-zinc-900 border border-zinc-800 px-1 py-0.5 rounded text-[8px]">{node}</strong></span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Raw virtual block output code generated for Nginx */}
                          <div className="bg-zinc-950 p-2.5 rounded border border-zinc-800 font-mono text-[10px] text-zinc-400 overflow-x-auto max-h-32 leading-relaxed">
                            <span className="text-[9px] text-zinc-600 block border-b border-zinc-900 pb-1 mb-1 font-sans font-bold">{t.generatedTemplate}</span>
                            <pre className="whitespace-pre">{config.lastGeneratedContent || (locale === 'id' ? '# Konten VirtualHost Belum Diperbarui' : '# Virtual Host Content Stale')}</pre>
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
                        <h2 className="text-sm font-semibold tracking-tight text-white font-mono">{t.ddnsResolver}</h2>
                        <p className="text-[11px] text-zinc-500 font-mono">{t.ddnsSub}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={handleTriggerDdnsSync}
                          disabled={isSyncingDdns}
                          className="flex items-center gap-1.5 px-3 py-1 bg-sky-500 hover:bg-sky-400 text-zinc-950 rounded text-xs font-mono font-semibold transition cursor-pointer"
                        >
                          <RefreshCw size={12} className={isSyncingDdns ? 'animate-spin' : ''} />
                          <span>{isSyncingDdns ? t.syncing : t.forceCheck}</span>
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
                          <Plus size={12} /> {t.newRecord}
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {ddnsConfigs.map(cfg => (
                        <div key={cfg.id} className="bg-zinc-900 border border-zinc-800 rounded p-4 shadow-[0_0_20px_rgba(56,189,248,0.05)] hover:shadow-[0_0_30px_rgba(56,189,248,0.15)] transition-all duration-500">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-[10px] uppercase font-mono tracking-widest text-zinc-500">{t.provider}: {cfg.provider}</span>
                            <div className="flex items-center justify-between gap-2">
                               <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[9px] font-mono">
                                 {cfg.status === 'Syncing' ? (locale === 'id' ? 'Sinkronisasi...' : 'Syncing') : (locale === 'id' ? 'Sukses' : 'Success')}
                               </span>
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
                              <span className="text-[9px] text-zinc-500 font-mono uppercase block">{t.targetResolvingDomain}</span>
                              <span className="text-xs text-white font-mono font-bold">{cfg.domainName}</span>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <span className="text-[9px] text-zinc-500 font-mono uppercase block">{t.wanIpBind}</span>
                                <span className="text-xs text-amber-400 font-mono">{cfg.lastDetectedIp}</span>
                              </div>
                              <div>
                                <span className="text-[9px] text-zinc-500 font-mono uppercase block">{t.lastHeartbeatChecked}</span>
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
                              className="px-2.5 py-1 rounded bg-zinc-950 border border-zinc-800 text-[10px] text-zinc-300 hover:text-sky-400 font-mono transition cursor-pointer"
                            >
                              {t.editProfile}
                            </button>
                            <button
                              onClick={() => handleDeleteDdns(cfg.id)}
                              className="p-1 px-2 rounded bg-zinc-950 border border-zinc-800 text-zinc-500 hover:text-red-400 transition cursor-pointer"
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
                        <h2 className="text-sm font-semibold tracking-tight text-white font-mono">{t.portMappingsTitle}</h2>
                        <p className="text-[11px] text-zinc-500 font-mono">{t.portMappingsSub}</p>
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
                        <Plus size={12} /> {t.addRule}
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
                                {pf.status === 'Active' ? (locale === 'id' ? 'Aktif' : 'Active') : (locale === 'id' ? 'Mati' : 'Inactive')}
                              </span>
                            </div>

                            <div className="bg-zinc-950 p-2 rounded border border-zinc-800 flex items-center justify-center gap-2 mb-3 font-mono text-[11px]">
                              <span className="text-zinc-500">{t.exposedPort}</span>
                              <strong className="text-amber-400 font-bold">: {pf.incomingPort}</strong>
                              <ChevronRight size={12} className="text-zinc-500" />
                              <span className="text-sky-400">{pf.localAddress} : {pf.localPort}</span>
                            </div>

                            {pf.webhookEnabled && (
                              <div className="p-2 rounded bg-zinc-950 border border-zinc-800 text-[10px] font-mono tracking-wide">
                                <div className="text-zinc-500 text-[8px] uppercase tracking-wider mb-1">{t.targetWebhookUrl}</div>
                                <div className="text-sky-300 truncate">{pf.webhookUrl || t.notSpecified}</div>
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
                                {isTestingWebhook ? t.delivering : t.simulatePing}
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
                                className="px-2 py-1 rounded bg-zinc-950 border border-zinc-800 text-[10px] font-mono text-zinc-300 hover:text-sky-400 transition cursor-pointer"
                              >
                                {t.addRule}
                              </button>
                              <button
                                onClick={() => handleDeletePort(pf.id)}
                                className="p-1 px-1.5 rounded bg-zinc-950 border border-zinc-800 text-zinc-500 hover:text-red-400 transition cursor-pointer"
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
                      <h2 className="text-sm font-semibold tracking-tight text-white font-mono uppercase">{t.generalSettings}</h2>
                      <p className="text-[11px] text-zinc-500 font-mono text-xs">{t.generalSettingsSub}</p>
                    </div>
                    <GeneralSettingsPanel username={settingsUsername} password={settingsPassword} onUsernameChange={setSettingsUsername} onPasswordChange={setSettingsPassword} onSave={saveGeneralSettings} t={t} />
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
                <TacticalPanel title={t.identityMonitor} footer={t.authenticityVerified}>
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
                           <span className="text-[10px] font-mono font-bold text-sky-500 tracking-[0.3em] uppercase">{t.originNode}</span>
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
                           <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest drop-shadow-neon">{t.loadOptimized}</span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1 bg-zinc-950 border border-zinc-800 rounded-md shadow-neon">
                           <Shield size={12} className="text-sky-500 drop-shadow-neon" />
                           <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest drop-shadow-neon">{t.secEncrypted}</span>
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
                         <a href={project.link}  rel="noopener noreferrer" className="block space-y-4">
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
                <TacticalPanel title={t.networkTelemetry}>
                   <div className="space-y-6">
                      <div className="space-y-3">
                         <div className="flex justify-between items-end">
                            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">{t.networkThroughput}</span>
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
                            <span className="text-[8px] font-mono text-zinc-500 uppercase tracking-[0.2em] block mb-1">{t.ping}</span>
                            <span className="text-lg font-mono font-bold text-zinc-200">12ms</span>
                         </div>
                         <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-lg">
                            <span className="text-[8px] font-mono text-zinc-500 uppercase tracking-[0.2em] block mb-1">{t.nodes}</span>
                            <span className="text-lg font-mono font-bold text-zinc-200">08</span>
                         </div>
                      </div>

                      <div className="p-4 bg-sky-500/5 border border-sky-500/20 rounded-xl space-y-2 shadow-neon">
                         <div className="flex items-center gap-2 text-sky-500">
                            <RefreshCw size={12} className="animate-spin-slow drop-shadow-neon" />
                            <span className="text-[10px] font-mono font-bold uppercase tracking-widest drop-shadow-neon">{t.liveSync}</span>
                         </div>
                         <p className="text-[10px] text-zinc-500 leading-relaxed font-mono">
                            {locale === 'id' 
                              ? 'Koneksi aman terdeteksi. Berhasil tersinkronisasi dengan jaringan global.' 
                              : 'Heartbeat detected. Synced with global node mesh.'}
                         </p>
                      </div>
                   </div>
                </TacticalPanel>

                <TacticalPanel title={t.trafficAnalysis}>
                   <div className="py-2">
                      <VisitorAnalytics locale={locale} />
                   </div>
                </TacticalPanel>

                <TacticalPanel title={t.connectivity}>
                   <div className="flex flex-wrap gap-3">
                    {links.filter(l => l.isActive).map((link) => (
                      <motion.a
                        key={link.id}
                        href={link.url}
                        
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
                        {t.launchAdmin}
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
                          className="px-3 py-1 bg-zinc-950 border border-zinc-800 rounded font-mono text-[9px] text-zinc-400 hover:text-sky-400 transition-all uppercase cursor-pointer"
                       >
                          {locale.toUpperCase()}
                       </button>
                       <button 
                          onClick={() => setIsMonochrome(!isMonochrome)}
                          title={t.monochromeToggle}
                          className={`px-3 py-1 border rounded font-mono text-[9px] transition-all uppercase flex items-center gap-1 cursor-pointer ${isMonochrome ? 'bg-zinc-100 border-white text-zinc-950' : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-sky-400'}`}
                       >
                          <Contrast size={10} />
                          <span>{isMonochrome ? 'Mono' : 'Color'}</span>
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
                    placeholder="e.g. Orchestra Port"
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
                    placeholder="https://orchestra.vaio"
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
                    placeholder="e.g. orchestra.vaio"
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

                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-[10px] text-zinc-400 uppercase mb-1">Check Frequency (min)</label>
                    <input
                      type="number"
                      value={editingDdns.checkFrequency || 15}
                      onChange={e => setEditingDdns({...editingDdns, checkFrequency: parseInt(e.target.value) || 15})}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white"
                      min="1"
                    />
                  </div>
                  <div className="flex items-center gap-2 pt-5">
                    <input
                      type="checkbox"
                      checked={editingDdns.enabled ?? true}
                      onChange={e => setEditingDdns({...editingDdns, enabled: e.target.checked})}
                      className="w-4 h-4 bg-zinc-950 border border-zinc-800 rounded"
                    />
                    <label className="text-[10px] text-zinc-400 uppercase">Enabled</label>
                  </div>
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

      {/* CADDY SERVICE CONFIG MODAL */}
      <AnimatePresence>
        {isCaddyModalOpen && editingCaddy && (
          <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-zinc-90 w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded p-4 relative font-mono text-xs"
            >
              <div className="flex items-center justify-between pb-2 mb-3 border-b border-zinc-800">
                <span className="font-bold text-white uppercase">{editingCaddy.id ? (t.caddyEditTitle || 'EDIT CADDY SERVICE') : (t.caddyAddTitle || 'ADD CADDY SERVICE')}</span>
                <button onClick={() => { setIsCaddyModalOpen(false); setEditingCaddy(null); }} className="text-zinc-500 hover:text-white"><X size={14} /></button>
              </div>

              <form onSubmit={handleSaveCaddySubmit} className="space-y-3">
                <div>
                  <label className="block text-[10px] text-zinc-400 uppercase mb-1">{t.caddyDomainLabel || 'Target Site Domain URL'}</label>
                  <input
                    type="text"
                    value={editingCaddy.name || ''}
                    onChange={e => setEditingCaddy({...editingCaddy, name: e.target.value})}
                    placeholder="app.vaio.internal"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white placeholder-zinc-700"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] text-zinc-400 uppercase mb-1">{t.caddyUptimeLabel || 'Uptime (%)'}</label>
                    <input
                      type="number"
                      step="0.001"
                      min="0"
                      max="100"
                      value={editingCaddy.uptime !== undefined ? editingCaddy.uptime : 99.9}
                      onChange={e => setEditingCaddy({...editingCaddy, uptime: parseFloat(e.target.value) || 100})}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-zinc-400 uppercase mb-1">{t.caddyHeartbeat || 'Heartbeat State'}</label>
                    <select
                      value={editingCaddy.status || 'up'}
                      onChange={e => setEditingCaddy({...editingCaddy, status: e.target.value as any})}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white"
                    >
                      <option value="up">Active / UP</option>
                      <option value="down">Inactive / DOWN</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] text-zinc-400 uppercase mb-1">{t.caddyLoadLabel || 'Simulated Node Load (%)'}</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={editingCaddy.load !== undefined ? editingCaddy.load : 10}
                    onChange={e => setEditingCaddy({...editingCaddy, load: parseInt(e.target.value) || 0})}
                    className="w-full accent-cyan-500 bg-zinc-950 rounded-lg h-1.5 cursor-pointer mt-2"
                  />
                  <div className="text-[10px] text-zinc-500 text-right mt-1 font-mono">{editingCaddy.load || 0}%</div>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => { setIsCaddyModalOpen(false); setEditingCaddy(null); }}
                    className="px-3 py-1.5 rounded bg-zinc-950 border border-zinc-800 text-zinc-400 cursor-pointer"
                  >
                    Abort
                  </button>
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 bg-sky-500 hover:bg-sky-400 text-zinc-950 font-bold rounded cursor-pointer"
                  >
                    {t.caddySaveBtn || 'Commit Monitored Site'}
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
                      <h3 className="text-[10px] font-mono font-bold text-sky-500 uppercase tracking-widest mb-3 border-b border-zinc-800 pb-1">{docsContent.sec1Title}</h3>
                      <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                        {docsContent.sec1Body}
                      </p>
                      <ul className="mt-2 space-y-1.5">
                        <li className="text-[10px] font-mono text-zinc-500 flex items-center gap-2">
                          <Check size={10} className="text-emerald-500" />
                          {docsContent.sec1Item1}
                        </li>
                        <li className="text-[10px] font-mono text-zinc-500 flex items-center gap-2">
                          <Check size={10} className="text-emerald-500" />
                          {docsContent.sec1Item2}
                        </li>
                      </ul>
                    </section>

                    <section>
                      <h3 className="text-[10px] font-mono font-bold text-sky-500 uppercase tracking-widest mb-3 border-b border-zinc-800 pb-1">{docsContent.sec2Title}</h3>
                      <p className="text-xs text-zinc-400 leading-relaxed font-sans mb-3">
                        {docsContent.sec2Body}
                      </p>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-[9px] font-mono bg-zinc-950 p-2 rounded">
                          <span>{docsContent.sec2Item1}</span>
                          <span className="text-emerald-500">{docsContent.sec2Status}</span>
                        </div>
                        <div className="flex items-center justify-between text-[9px] font-mono bg-zinc-950 p-2 rounded">
                          <span>{docsContent.sec2Item2}</span>
                          <span className="text-emerald-500">{docsContent.sec2Status}</span>
                        </div>
                      </div>
                    </section>
                  </div>

                  <div className="space-y-6">
                    <section>
                      <h3 className="text-[10px] font-mono font-bold text-sky-500 uppercase tracking-widest mb-3 border-b border-zinc-800 pb-1">{docsContent.sec3Title}</h3>
                      <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                        {docsContent.sec3Body}
                      </p>
                      <div className="mt-4 p-3 bg-zinc-950 rounded-lg border border-zinc-800 font-mono text-[9px]">
                        <div className="text-zinc-600 mb-1 font-bold underline italic">{docsContent.sec3NoteTitle}</div>
                        <p className="text-zinc-500">{docsContent.sec3NoteBody}</p>
                      </div>
                    </section>

                    <section>
                      <h3 className="text-[10px] font-mono font-bold text-sky-500 uppercase tracking-widest mb-3 border-b border-zinc-800 pb-1">{docsContent.sec4Title}</h3>
                      <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                        {docsContent.sec4Body}
                      </p>
                    </section>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-zinc-800 text-center">
                  <p className="text-[10px] font-mono text-zinc-500">{docsContent.footer}</p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
