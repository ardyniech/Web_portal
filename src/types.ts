/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface User {
  id: string;
  email: string;
  username: string;
  fullName: string;
  bio?: string;
  avatarUrl?: string;
}

export interface HeroContent {
  title: string;
  subtitle: string;
  highlightText: string;
  backgroundImage?: string;
  avatarUrl?: string;
  socialBadgeText?: string;
  showKoperasiSection: boolean;
  ctaText?: string;
  ctaUrl?: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  link: string;
  iconName: string; // lucide icon identifier
  category: string; // e.g., 'Core', 'Koperasi', 'Utility'
  isActive: boolean;
}

export interface SocialLink {
  id: string;
  platform: string;
  url: string;
  iconName: string;
  isActive: boolean;
}

export interface NginxConfig {
  id: string;
  domainName: string;
  targetUrl: string; // e.g. http://127.0.0.1:3000 or http://127.0.0.1:8000
  sslEnabled: boolean;
  sslType: 'Certbot' | 'Cloudflare' | 'SelfSigned';
  sslEmail?: string;
  isLoadBalanced: boolean;
  upstreams: string[]; // list of backend nodes
  customDirectives?: string;
  isActive: boolean;
  lastGeneratedContent?: string;
  createdAt: string;
}

export interface DDNSConfig {
  id: string;
  provider: 'Cloudflare' | 'NoIP' | 'DuckDNS';
  domainName: string;
  apiToken: string;
  zoneId?: string;
  lastDetectedIp: string;
  status: 'Syncing' | 'Active' | 'Failed';
  lastUpdated: string;
}

export interface PortForward {
  id: string;
  name: string;
  incomingPort: number;
  localAddress: string;
  localPort: number;
  webhookEnabled: boolean;
  webhookUrl?: string;
  status: 'Active' | 'Inactive';
}

export interface DatabaseState {
  users: Record<string, string>; // username -> hashed_password (or plain if dev, but we will use custom hashing)
  profiles: Record<string, User>;
  sessions: Record<string, string>; // sessionToken -> username
  hero: HeroContent;
  projects: Project[];
  links: SocialLink[];
  nginxConfigs: NginxConfig[];
  ddnsConfigs: DDNSConfig[];
  portForwards: PortForward[];
}
