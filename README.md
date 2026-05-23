# Genesis Core - Unified Dynamics Control & Advanced Gateway Mesh

Genesis Core is a high-performance, professional-grade infrastructure management dashboard and landing page. It serves as a unified control center for managing network services, reverse proxies, DDNS synchronization, and service monitoring.

## 🚀 Key Features

- **Advanced Gateway Mesh**: A professional landing page with integrated status monitoring and interactive trace sandboxes.
- **Dynamic VHost Management**: Real-time configuration and generation of Nginx virtual host templates for multi-node upstream target groups.
- **DDNS Synchronizer**: Built-in DDNS resolver that synchronizes dynamically updated home server WAN addresses into Cloudflare, DuckDNS, or No-IP zones.
- **Port Ingress Forwarding**: Manage and expose port mappings with built-in webhook receiver inspection for tools like GitHub or custom deployment pipelines.
- **Interactive Trace Sandbox**: Real-time network latency simulation with min/max/average statistics and high-latency alerts.
- **Multilingual Support**: Fully localized interface supporting English and Indonesian.

## 🛠️ Technical Architecture

- **Runtime**: Node.js with Express and Vite.
- **Frontend**: React 19, Tailwind CSS 4, and Framer Motion.
- **Backend**: Express API for dynamic content synchronization and state management.
- **Type Safety**: Strictly typed with TypeScript.
- **Build System**: Bundled with Esbuild for optimized server-side execution.

## 📦 Deployment

Genesis Core is designed to run in containerized environments. It binds to port `3000` and `0.0.0.0` by default.

### Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm start
```

## 🔐 Security

- **Encrypted Admin Profiles**: Secure authentication for management functions.
- **Directives Validation**: Built-in inspection for Nginx custom directives and port mappings.
- **SSL Ready**: Designed to work behind Cloudflare or Certbot-secured reverse proxies.

---
*Crafted by Ardy Syafii*
