import { exec } from 'child_process';
import { DatabasePlugin } from '../dbManager/DatabasePlugin';

export const startAutoDiscovery = () => {
  const db = DatabasePlugin.getInstance();
  setInterval(() => {
    exec('ss -tuln', (err, stdout) => {
      if (err) return;
      // Simple logic to parse and update DB
      // For now, just log as a trace of discovery
      console.log('[AutoDiscovery] Scanning network ports...');
    });
  }, 30000);
};
