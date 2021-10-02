import React, { createContext, useContext, useState } from "react";

type ISettingsContext = {
  settingsModalOpen: boolean;
  onSettingsModalOpenChange: (open: boolean) => unknown;
  // settingsTab: number;
};

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
export const SettingsContext = createContext<ISettingsContext>(null!);

interface SettingsModalProps {
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export function SettingsModalProvider({ children, defaultOpen = false }: SettingsModalProps) {
  const [settingsModalOpen, setSettingsModalOpen] = useState(defaultOpen);

  return (
    <SettingsContext.Provider
      value={{
        settingsModalOpen,
        onSettingsModalOpenChange: (b) => setSettingsModalOpen(b),
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettingsModalContext() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw Error("useSettingsModalContext can only be used within a SettingsModalProvider");
  }
  return context;
}
