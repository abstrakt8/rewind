import React, { createContext, useContext, useState } from "react";

type ISettingsContext = {
  settingsModalOpen: boolean;
  onSettingsModalOpenChange: (open: boolean) => unknown;

  opacity: number;
  onOpacityChange: (opacity: number) => unknown;

  tabIndex: number;
  onTabIndexChange: (index: number) => unknown;
};

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
export const SettingsContext = createContext<ISettingsContext>(null!);

interface SettingsModalProps {
  children: React.ReactNode;
  defaultOpen?: boolean;
}

const DEFAULT_OPACITY = 100; // maxOpacity = 100%

export function SettingsModalProvider({ children, defaultOpen = false }: SettingsModalProps) {
  const [settingsModalOpen, setSettingsModalOpen] = useState(defaultOpen);
  const [opacity, onOpacityChange] = useState(DEFAULT_OPACITY);
  const [tabIndex, onTabIndexChange] = useState(0);

  return (
    <SettingsContext.Provider
      value={{
        settingsModalOpen,
        onSettingsModalOpenChange: (b) => setSettingsModalOpen(b),
        opacity,
        onOpacityChange,
        tabIndex,
        onTabIndexChange,
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
