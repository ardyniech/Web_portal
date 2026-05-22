/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { HeroContent, Project, SocialLink, NginxConfig, DDNSConfig, PortForward } from '../types';

const API_BASE = '/api';

export async function fetchPublicContent(): Promise<{ hero: HeroContent; projects: Project[]; links: SocialLink[] }> {
  const res = await fetch(`${API_BASE}/public/content`);
  if (!res.ok) throw new Error('Failed to load public landing content');
  return res.json();
}

export async function loginUser(username: string, passwordPlain: string) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password: passwordPlain })
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || 'Authentication failed');
  }
  return res.json();
}

export async function registerUser(username: string, passwordPlain: string, fullName: string, email: string) {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password: passwordPlain, fullName, email })
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || 'Registration failed');
  }
  return res.json();
}

export async function checkSession(token: string) {
  const res = await fetch(`${API_BASE}/auth/me`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Session invalid');
  return res.json();
}

export async function logoutUser(token: string) {
  try {
    await fetch(`${API_BASE}/auth/logout`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
  } catch (e) {
    console.error('Logout request failed:', e);
  }
}

export async function fetchAdminConfigs(token: string) {
  const res = await fetch(`${API_BASE}/admin/configs`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to load system configs');
  return res.json();
}

// Hero Content Updates
export async function updateHeroContent(token: string, hero: HeroContent) {
  const res = await fetch(`${API_BASE}/admin/hero`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(hero)
  });
  if (!res.ok) throw new Error('Failed to update hero details.');
  return res.json();
}

// Project CRUD
export async function addProject(token: string, project: Omit<Project, 'id'>) {
  const res = await fetch(`${API_BASE}/admin/projects`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(project)
  });
  if (!res.ok) throw new Error('Failed to add project');
  return res.json();
}

export async function updateProject(token: string, id: string, project: Partial<Project>) {
  const res = await fetch(`${API_BASE}/admin/projects/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(project)
  });
  if (!res.ok) throw new Error('Failed to update project');
  return res.json();
}

export async function deleteProject(token: string, id: string) {
  const res = await fetch(`${API_BASE}/admin/projects/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to delete project');
  return res.json();
}

// Social Link CRUD
export async function addSocialLink(token: string, link: Omit<SocialLink, 'id'>) {
  const res = await fetch(`${API_BASE}/admin/links`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(link)
  });
  if (!res.ok) throw new Error('Failed to add connection link');
  return res.json();
}

export async function updateSocialLink(token: string, id: string, link: Partial<SocialLink>) {
  const res = await fetch(`${API_BASE}/admin/links/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(link)
  });
  if (!res.ok) throw new Error('Failed to update connection link');
  return res.json();
}

export async function deleteSocialLink(token: string, id: string) {
  const res = await fetch(`${API_BASE}/admin/links/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to delete connection link');
  return res.json();
}

// Nginx Config CRUD
export async function addNginxConfig(token: string, config: Omit<NginxConfig, 'id' | 'createdAt'>) {
  const res = await fetch(`${API_BASE}/admin/nginx`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(config)
  });
  if (!res.ok) throw new Error('Failed to register Nginx VirtualHost');
  return res.json();
}

export async function updateNginxConfig(token: string, id: string, config: Partial<NginxConfig>) {
  const res = await fetch(`${API_BASE}/admin/nginx/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(config)
  });
  if (!res.ok) throw new Error('Failed to update Nginx configuration');
  return res.json();
}

export async function deleteNginxConfig(token: string, id: string) {
  const res = await fetch(`${API_BASE}/admin/nginx/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to remove server block entry');
  return res.json();
}

// DDNS Config CRUD
export async function addDdnsConfig(token: string, config: Omit<DDNSConfig, 'id' | 'lastUpdated'>) {
  const res = await fetch(`${API_BASE}/admin/ddns`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(config)
  });
  if (!res.ok) throw new Error('Failed to create DDNS resolver binding');
  return res.json();
}

export async function updateDdnsConfig(token: string, id: string, config: Partial<DDNSConfig>) {
  const res = await fetch(`${API_BASE}/admin/ddns/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(config)
  });
  if (!res.ok) throw new Error('Failed to synchronize DDNS entries with Cloudflare API');
  return res.json();
}

export async function deleteDdnsConfig(token: string, id: string) {
  const res = await fetch(`${API_BASE}/admin/ddns/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to clear DDNS resolver routing record');
  return res.json();
}


// Port forwarding CRUD
export async function addPortForward(token: string, pf: Omit<PortForward, 'id'>) {
  const res = await fetch(`${API_BASE}/admin/portforward`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(pf)
  });
  if (!res.ok) throw new Error('Failed to register Port forward ingress tunnel');
  return res.json();
}

export async function updatePortForward(token: string, id: string, pf: Partial<PortForward>) {
  const res = await fetch(`${API_BASE}/admin/portforward/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(pf)
  });
  if (!res.ok) throw new Error('Failed to update ingress port forward registry');
  return res.json();
}

export async function deletePortForward(token: string, id: string) {
  const res = await fetch(`${API_BASE}/admin/portforward/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to remove ingress port forwarding table lookup');
  return res.json();
}
