import { PortPlugin } from "./portManager/PortPlugin";
import { CaddyPlugin } from "./caddyManager/CaddyPlugin";
import { SecurityAuditPlugin } from "./securityAudit/SecurityAuditPlugin";
import { DatabasePlugin } from "./dbManager/DatabasePlugin";
import { ProjectPlugin } from "./projectManager/ProjectPlugin";

export interface Plugin {
  id: string;
  name: string;
  init: () => void;
  render?: () => JSX.Element;
}

class PluginManager {
  private plugins: Map<string, Plugin> = new Map();

  constructor() {
    this.register(DatabasePlugin);
    this.register(PortPlugin);
    this.register(CaddyPlugin);
    this.register(SecurityAuditPlugin);
    this.register(ProjectPlugin);
  }

  register(plugin: Plugin) {
    this.plugins.set(plugin.id, plugin);
    plugin.init();
  }

  getPlugins() {
    return Array.from(this.plugins.values());
  }
}

export const pluginManager = new PluginManager();
