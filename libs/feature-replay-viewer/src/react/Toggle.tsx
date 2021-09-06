import React, { useCallback } from "react";

export interface ToggleProps {
  enabled: boolean;
  setEnabled: (b: boolean) => unknown;
  color?: string;
}

export function Toggle(props: ToggleProps) {
  const { enabled, setEnabled, color } = props;
  const toggle = useCallback(() => setEnabled(!enabled), [enabled, setEnabled]);

  return (
    <div
      onClick={() => toggle()}
      className={`relative inline-flex items-center h-6 rounded-full w-11 cursor-pointer`}
      style={{ backgroundColor: enabled ? color ?? "#4272b3" : "#dddddd" }}
    >
      <span
        className={`${
          enabled ? "translate-x-6" : "translate-x-1"
        } inline-block w-4 h-4 transform bg-white rounded-full`}
      />
    </div>
  );
}
