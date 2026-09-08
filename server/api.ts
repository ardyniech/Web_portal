import { Router } from 'express';
import { generateAiContentWithFallback } from './geminiService';
import { gitRouter } from './gitRouter';
import { refactorRouter } from './refactorRouter';
import { commitSummaryRouter } from './commitSummaryRouter';
import { preFlightRouter } from './preFlightRouter';
import { codeGraphRouter } from './codeGraphRouter';
import { blastRadiusRouter } from './blastRadiusRouter';
import { projectMemoryRouter } from './projectMemoryRouter';
import { stagingRouter } from './stagingRouter';
import { boundaryRouter } from './boundaryRouter';
import { autoDevRouter } from './autoDevRouter';
import { planEngineRouter } from './planEngineRouter';
import { modelSwitcherRouter } from './modelSwitcherRouter';

export const apiRouter = Router();

apiRouter.use('/git', gitRouter);
apiRouter.use('/refactor', refactorRouter);
apiRouter.use('/commits', commitSummaryRouter);
apiRouter.use('/preflight', preFlightRouter);
apiRouter.use('/codegraph', codeGraphRouter);
apiRouter.use('/blastradius', blastRadiusRouter);
apiRouter.use('/projectmemory', projectMemoryRouter);
apiRouter.use('/memory', projectMemoryRouter);
apiRouter.use('/staging', stagingRouter);
apiRouter.use('/boundary', boundaryRouter);
apiRouter.use('/autodev', autoDevRouter);
apiRouter.use('/plan', planEngineRouter);
apiRouter.use('/models', modelSwitcherRouter);

const SYSTEM_INSTRUCTION =
  'You are an elite GitHub repository AI development agent, security auditor, testing engineer, and senior software architect. ' +
  'You operate with a strict ZERO-MISTAKES and ZERO-TYPO discipline across all programming languages.\n\n' +
  'DIRECT AUTONOMOUS EXECUTION PROTOCOL (ZERO-TALK & ZERO-CONFIRMATION-DELAY):\n' +
  '- DO NOT waste time writing long preamble plans, step-by-step proposals without code, or asking rhetorical confirmation questions like "Apakah Anda ingin saya melanjutkan?" or "Silakan konfirmasi".\n' +
  '- IMMEDIATELY execute the task directly by generating the complete, runnable ```copilot action block containing all necessary files and clear semantic commit message.\n' +
  '- Complete the entire scope definitively in one go.\n\n' +
  'ZERO-MISTAKES CODING DIRECTIVE:\n' +
  '1. ZERO-PLACEHOLDER: NEVER emit partial code like "...rest of code", "TODO: implement", or "throw new Error(\'Not implemented\')". Every file must be complete, functional, and self-contained.\n' +
  '2. ZERO-TYPO & SYNTAX PRECISION: Double-check keyword spellings. Ensure 100% matched brackets and valid JSON.\n' +
  '3. MODULAR ARCHITECTURE: Strive to keep functions concise, single-responsibility, and easy to maintain (<125 lines).\n' +
  '4. LEAK-FREE SECURITY: Never hardcode real API keys or private tokens.\n\n' +
  'Always format responses in concise, structured, readable markdown. Speak in friendly, professional Indonesian.';

apiRouter.post('/gemini/analyze', async (req, res) => {
  try {
    const { prompt, repoContext } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt tidak boleh kosong.' });
    }

    const contents = `Repository Context:\n${repoContext || 'Tidak ada konteks'}\n\n${prompt}`;
    const result = await generateAiContentWithFallback(contents, SYSTEM_INSTRUCTION);
    res.json(result);
  } catch (error: any) {
    console.error('[Module:AI] Error in server analysis:', error?.message || error);
    const errMsg = String(error?.message || error);
    let friendlyMsg = 'Terjadi kendala saat memproses permintaan AI. Silakan coba sesaat lagi.';
    
    if (errMsg.includes('503') || errMsg.includes('high demand') || errMsg.includes('UNAVAILABLE')) {
      friendlyMsg = 'Model AI sedang mengalami lonjakan trafik sementara. Mohon coba kirim ulang dalam beberapa detik.';
    } else if (errMsg.includes('429') || errMsg.includes('quota') || errMsg.includes('RESOURCE_EXHAUSTED')) {
      friendlyMsg = 'Batas kuota harian/menit tercapai sementara. Mohon tunggu sejenak sebelum mencoba lagi.';
    }
    res.status(500).json({ error: friendlyMsg });
  }
});
