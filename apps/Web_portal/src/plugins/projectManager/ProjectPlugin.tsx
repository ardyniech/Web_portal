import React, { useEffect, useState, useCallback } from 'react';
import { fetchAdminConfigs } from '../../utils/api';
import { EmptyState } from '../../components/EmptyState';
import { RefreshCw } from 'lucide-react';

export const ProjectPlugin = {
  id: 'project-manager',
  name: 'Project Manager',
  init: () => console.log('Project Manager Plugin Initialized'),
  render: () => {
    const [projects, setProjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const loadProjects = useCallback(async () => {
      setLoading(true);
      try {
        const data: any = await fetchAdminConfigs();
        setProjects(data.projects);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }, []);

    useEffect(() => { loadProjects(); }, [loadProjects]);

    return (
      <div className="space-y-2">
        <div className="flex justify-between items-center mb-2">
            <span className="text-[9px] text-zinc-500">Project Registry</span>
            <button onClick={loadProjects} className="p-1 hover:bg-zinc-800 rounded transition-colors">
                <RefreshCw size={10} className={loading ? 'animate-spin' : ''} />
            </button>
        </div>
        {projects.length === 0 ? (
          <EmptyState message="No projects found" />
        ) : (
          projects.map((p: any) => (
            <div key={p.id} className="flex justify-between items-center text-xs font-mono border-b border-zinc-800 pb-2">
              <div>
                <span className="text-white font-bold">{p.title}</span>
                <div className="text-[9px] text-zinc-500">{p.category}</div>
              </div>
              <div className={`px-1.5 py-0.5 rounded text-[9px] ${p.isActive ? 'bg-emerald-900 text-emerald-300' : 'bg-red-900 text-red-300'}`}>
                {p.isActive ? 'Active' : 'Stopped'}
              </div>
            </div>
          ))
        )}
      </div>
    );
  }
};
