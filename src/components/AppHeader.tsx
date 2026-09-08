import React from 'react';
import { Github } from 'lucide-react';
import { NotificationCenter } from '../modules/notification';
import { AuthPanel, useAuth } from '../modules/auth';
import { VoiceCommanderButton } from '../modules/voiceCommander';
import { GitSyncButton } from '../modules/gitSync';
import { TimeMachineButton } from '../modules/timeMachine';
import { PlaygroundButton } from '../modules/playground';

interface AppHeaderProps { repoFullName?: string; }

const HeaderBrand = () => (
  <div className="flex items-center gap-2">
    <div className="p-1.5 bg-zinc-900 rounded-lg text-white">
      <Github className="w-5 h-5" />
    </div>
    <div className="flex flex-col gap-0.5">
      <h1 className="font-bold text-sm tracking-tight leading-none">GitHub Workspace Analyzer</h1>
      <p className="text-[10px] text-zinc-500 font-medium leading-none">Asisten Cerdas Pengembangan Kode</p>
    </div>
  </div>
);

export function AppHeader({ repoFullName }: AppHeaderProps) {
  const { token } = useAuth();

  const renderActions = () => {
    try {
      return (
        <div className="flex items-center gap-2.5">
          <PlaygroundButton />
          <VoiceCommanderButton repoFullName={repoFullName} token={token} />
          <TimeMachineButton />
          <GitSyncButton defaultRepoFullName={repoFullName} authToken={token} />
          <NotificationCenter />
          <div className="h-4 w-[1px] bg-zinc-200" />
          <AuthPanel />
        </div>
      );
    } catch (error) {
      console.error('[Module:AppHeader] Error in renderActions:', error);
      return null;
    }
  };

  return (
    <header className="border-b border-zinc-200 bg-white sticky top-0 z-10 px-4 py-3 flex items-center justify-between">
      <HeaderBrand />
      {renderActions()}
    </header>
  );
}