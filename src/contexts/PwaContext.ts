import { createContext, useContext } from 'react';

export interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}
export interface PwaState {
  installPrompt: InstallPromptEvent | null;
  clearInstallPrompt: () => void;
  installed: boolean;
  online: boolean;
  offlineReady: boolean;
  registrationError: boolean;
}
export const PwaContext = createContext<PwaState | null>(null);
export function usePwa() {
  const value = useContext(PwaContext);
  if (!value) throw new Error('usePwa requiere PwaProvider');
  return value;
}
