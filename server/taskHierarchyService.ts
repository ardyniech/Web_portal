export interface SubTaskItem {
  id: string;
  title: string;
  assignedRole: 'Architect' | 'Coder' | 'QAReviewer' | 'SecurityAuditor';
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  estimatedTokens: number;
}

export interface EpicTask {
  id: string;
  epicTitle: string;
  goal: string;
  createdAt: string;
  subTasks: SubTaskItem[];
  progressPercent: number;
}

let activeEpics: EpicTask[] = [
  {
    id: 'EPIC-001',
    epicTitle: 'Implementasi Large-Scale Project Architecture Suite',
    goal: 'Membangun 5 instrumen otomasi arsitektur dan pencegahan regresi',
    createdAt: new Date().toISOString(),
    progressPercent: 100,
    subTasks: [
      { id: 'ST-1', title: 'Code Graph & Symbol Reference Navigation', assignedRole: 'Architect', status: 'completed', estimatedTokens: 400 },
      { id: 'ST-2', title: 'Blast-Radius Impact Calculator & Breaking Detector', assignedRole: 'Coder', status: 'completed', estimatedTokens: 550 },
      { id: 'ST-3', title: 'Hierarchical Project Memory & Hybrid Search', assignedRole: 'Architect', status: 'completed', estimatedTokens: 350 },
      { id: 'ST-4', title: 'Atomic Multi-File Sandbox Staging & Runner', assignedRole: 'Coder', status: 'completed', estimatedTokens: 450 },
      { id: 'ST-5', title: 'Boundary Enforcer & Cyclomatic Complexity Monitor', assignedRole: 'QAReviewer', status: 'completed', estimatedTokens: 300 },
    ],
  },
];

export function getEpicTasks() {
  return activeEpics;
}

export function createEpicTask(epicTitle: string, goal: string) {
  const epic: EpicTask = {
    id: `EPIC-${Date.now().toString().slice(-3)}`,
    epicTitle,
    goal,
    createdAt: new Date().toISOString(),
    progressPercent: 0,
    subTasks: [
      { id: 'ST-1', title: `Dekomposisi struktur & interface untuk ${epicTitle}`, assignedRole: 'Architect', status: 'pending', estimatedTokens: 300 },
      { id: 'ST-2', title: `Implementasi logic & storage murni`, assignedRole: 'Coder', status: 'pending', estimatedTokens: 600 },
      { id: 'ST-3', title: `Pengujian unit & validasi batasan modular`, assignedRole: 'QAReviewer', status: 'pending', estimatedTokens: 250 },
    ],
  };
  activeEpics.unshift(epic);
  return epic;
}
