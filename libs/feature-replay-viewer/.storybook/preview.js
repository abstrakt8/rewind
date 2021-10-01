import React from "react";

import { addDecorator } from "@storybook/react";

import { ThemeProvider as EmotionThemeProvider } from "emotion-theming";
import { RewindTheme } from "../src/react/muiTheme";
import { CssBaseline, ThemeProvider } from "@mui/material";

const defaultTheme = RewindTheme;

export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
};

const withThemeProvider = (Story, context) => {
  return (
    <EmotionThemeProvider theme={defaultTheme}>
      <ThemeProvider theme={defaultTheme}>
        <CssBaseline />
        <Story {...context} />
      </ThemeProvider>
    </EmotionThemeProvider>
  );
};

addDecorator(withThemeProvider);
