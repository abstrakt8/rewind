import { Switch } from "@headlessui/react";
import React from "react";

export function Toggle(props: { enabled: boolean; setEnabled: (b: boolean) => unknown; color?: string }) {
  const { enabled, setEnabled, color } = props;

  return (
    <Switch
      // doesn't really work
      tabIndex={-1}
      checked={enabled}
      onChange={setEnabled}
      className={`relative inline-flex items-center h-6 rounded-full w-11`}
      style={{ backgroundColor: enabled ? color ?? "#4272b3" : "#dddddd" }}
    >
      <span
        className={`${
          enabled ? "translate-x-6" : "translate-x-1"
        } inline-block w-4 h-4 transform bg-white rounded-full`}
      />
    </Switch>
  );
}
