import React from "react";

export function ignoreFocus(event: React.FocusEvent<HTMLButtonElement>) {
  event.target.blur();
}
