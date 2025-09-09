// src/contexts/UIContext.tsx

import { createContext, useState, useContext, type ReactNode } from 'react';

// Tipe untuk nilai yang akan disediakan oleh context
interface UIcontextType {
  isAccountSettingsModalOpen: boolean;
  openAccountSettingsModal: () => void;
  closeAccountSettingsModal: () => void;
}

// Buat context dengan nilai default
const UIcontext = createContext<UIcontextType | undefined>(undefined);

// Buat Provider component
export const UIProvider = ({ children }: { children: ReactNode }) => {
  const [isAccountSettingsModalOpen, setAccountSettingsModalOpen] = useState(false);

  const openAccountSettingsModal = () => setAccountSettingsModalOpen(true);
  const closeAccountSettingsModal = () => setAccountSettingsModalOpen(false);

  const value = {
    isAccountSettingsModalOpen,
    openAccountSettingsModal,
    closeAccountSettingsModal,
  };

  return <UIcontext.Provider value={value}>{children}</UIcontext.Provider>;
};

// Buat custom hook untuk kemudahan penggunaan
export const useUI = () => {
  const context = useContext(UIcontext);
  if (context === undefined) {
    throw new Error('useUI must be used within a UIProvider');
  }
  return context;
};