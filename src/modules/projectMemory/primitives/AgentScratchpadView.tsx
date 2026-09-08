import React, { useState } from 'react';
import { EpicTask } from '../logic/types';
import { ListTodo, CheckCircle2, Clock, Plus, Bot, UserCheck, Shield } from 'lucide-react';
import { Button } from '../../../shared/atoms/Button';

interface AgentScratchpadViewProps {
  epics: EpicTask[];
  onCreateEpic: (title: string, goal: string) => void;
  loading: boolean;
}

export function AgentScratchpadView({ epics, onCreateEpic, loading }: AgentScratchpadViewProps) {
  const [showNew, setShowNew] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newGoal, setNewGoal] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    onCreateEpic(newTitle, newGoal);
    setNewTitle('');
    setNewGoal('');
    setShowNew(false);
  };

  return (
    <div className="flex flex-col gap-2.5 flex-1 overflow-hidden">
      <div className="flex items-center justify-between">
        <h4 className="text-[11px] font-bold text-zinc-800 flex items-center gap-1.5">
          <ListTodo className="w-3.5 h-3.5 text-purple-600" />
          <span>Agent Task Hierarchy & Sub-Agents Scratchpad</span>
        </h4>
        <Button size="sm" onClick={() => setShowNew(!showNew)} className="h-7 text-xs bg-purple-600 text-white font-bold">
          <Plus className="w-3 h-3" /> Tambah Epic
        </Button>
      </div>

      {showNew && (
        <form onSubmit={handleSubmit} className="p-2.5 bg-purple-50/60 border border-purple-200 rounded-xl flex flex-col gap-2">
          <input
            type="text"
            placeholder="Judul Epic Feature (cth: Refaktor Auth Token Provider)..."
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="w-full px-2.5 py-1 text-xs bg-white border border-purple-200 rounded-lg focus:outline-none"
          />
          <input
            type="text"
            placeholder="Tujuan & Target Outcome..."
            value={newGoal}
            onChange={(e) => setNewGoal(e.target.value)}
            className="w-full px-2.5 py-1 text-xs bg-white border border-purple-200 rounded-lg focus:outline-none"
          />
          <div className="flex justify-end gap-1.5">
            <button type="button" onClick={() => setShowNew(false)} className="px-2 py-1 text-[10px] text-zinc-500 hover:text-zinc-700 cursor-pointer">Batal</button>
            <Button size="sm" type="submit" className="h-7 text-[10.5px] bg-purple-600 text-white font-bold">Simpan Epic</Button>
          </div>
        </form>
      )}

      <div className="flex-1 overflow-y-auto flex flex-col gap-3 pr-1 max-h-[340px]">
        {epics.map((epic) => (
          <div key={epic.id} className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-bold text-zinc-900 text-xs">{epic.epicTitle}</span>
                <p className="text-[10px] text-zinc-500">{epic.goal}</p>
              </div>
              <span className="text-[10px] font-extrabold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
                {epic.progressPercent}% Selesai
              </span>
            </div>

            <div className="flex flex-col gap-1.5 pt-1 border-t border-zinc-200/60">
              {epic.subTasks.map((st) => (
                <div key={st.id} className="p-1.5 bg-white border border-zinc-200/80 rounded-lg flex items-center justify-between gap-2 text-[10px]">
                  <div className="flex items-center gap-1.5">
                    {st.status === 'completed' ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    ) : (
                      <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    )}
                    <span className={`font-medium ${st.status === 'completed' ? 'text-zinc-500 line-through' : 'text-zinc-800'}`}>
                      {st.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <span className="text-[8.5px] font-bold px-1.5 py-0.2 bg-zinc-100 text-zinc-600 rounded flex items-center gap-1">
                      <Bot className="w-2.5 h-2.5" /> {st.assignedRole}
                    </span>
                    <span className="text-[8.5px] font-mono text-zinc-400">~{st.estimatedTokens} tok</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
