import React from 'react';
import { AgentMemoryModal } from '../../memory';
import { AutoLearningModal } from '../../learning';
import { AgentPerformanceModal } from '../../agentPerformance';
import { UnitTestModal } from '../../unitTester';
import { AutoImprovementModal } from '../../autoImprovement';
import { KnowledgeBaseModal } from '../../knowledgeBase';
import { SelfAuditModal } from '../../selfAudit';
import { SystemHealthModal } from '../../systemHealth';
import { ProactiveActionsModal } from '../../proactiveActions';
import { AgentInsightModal } from '../../agentInsight';
import { CIPipelineModal } from '../../ciPipeline';
import { ProactiveLinterModal } from '../../proactiveLinter';
import { TaskQueueModal } from '../../agentTaskQueue';
import { VisualizerModal } from '../../repoVisualizer';
import { PreFlightModal } from '../../prPreFlight';
import { CodeGraphModal } from '../../codeGraph';
import { BlastRadiusModal } from '../../blastRadius';
import { ProjectMemoryModal } from '../../projectMemory';
import { AtomicStagingModal } from '../../atomicStaging';
import { BoundaryEnforcerModal } from '../../boundaryEnforcer';
import { LiveVoiceModal } from './LiveVoiceModal';

interface AgentModalsProps {
  activeModal: string | null;
  setActiveModal: (m: string | null) => void;
  repoFullName?: string;
  token?: string | null;
  voiceProps: {
    status: any;
    errorMessage: any;
    volumeLevel: number;
    startVoice: () => void;
    stopVoice: () => void;
  };
}

export function AgentModals({ activeModal, setActiveModal, repoFullName, token, voiceProps }: AgentModalsProps) {
  const close = () => setActiveModal(null);
  return (
    <>
      {activeModal === 'voice' && <LiveVoiceModal status={voiceProps.status} errorMessage={voiceProps.errorMessage} volumeLevel={voiceProps.volumeLevel} repoFullName={repoFullName} onStart={voiceProps.startVoice} onStop={voiceProps.stopVoice} onClose={() => { close(); voiceProps.stopVoice(); }} />}
      {activeModal === 'memory' && <AgentMemoryModal currentRepoFullName={repoFullName} onClose={close} />}
      {activeModal === 'learning' && <AutoLearningModal repoFullName={repoFullName} onClose={close} />}
      {activeModal === 'performance' && <AgentPerformanceModal onClose={close} />}
      {activeModal === 'unitTester' && <UnitTestModal repoFullName={repoFullName} onClose={close} />}
      {activeModal === 'autoImprovement' && <AutoImprovementModal repoFullName={repoFullName} onClose={close} />}
      {activeModal === 'knowledgeBase' && <KnowledgeBaseModal onClose={close} />}
      {activeModal === 'selfAudit' && <SelfAuditModal onClose={close} />}
      {activeModal === 'systemHealth' && <SystemHealthModal onClose={close} />}
      {activeModal === 'proactiveActions' && <ProactiveActionsModal onClose={close} />}
      {activeModal === 'agentInsight' && <AgentInsightModal repoFullName={repoFullName} onClose={close} />}
      {activeModal === 'ciPipeline' && <CIPipelineModal repoFullName={repoFullName} token={token} onClose={close} />}
      {activeModal === 'proactiveLinter' && <ProactiveLinterModal onClose={close} />}
      {activeModal === 'agentTaskQueue' && <TaskQueueModal onClose={close} />}
      {activeModal === 'repoVisualizer' && <VisualizerModal onClose={close} />}
      {activeModal === 'prPreFlight' && <PreFlightModal onClose={close} />}
      {activeModal === 'codeGraph' && <CodeGraphModal onClose={close} />}
      {activeModal === 'blastRadius' && <BlastRadiusModal onClose={close} />}
      {activeModal === 'projectMemory' && <ProjectMemoryModal onClose={close} />}
      {activeModal === 'atomicStaging' && <AtomicStagingModal onClose={close} />}
      {activeModal === 'boundaryEnforcer' && <BoundaryEnforcerModal onClose={close} />}
    </>
  );
}
