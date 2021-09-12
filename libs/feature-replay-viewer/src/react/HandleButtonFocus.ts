import React from "react";

export function handleButtonFocus(event: React.FocusEvent<HTMLButtonElement>) {
  event.target.blur();
}
