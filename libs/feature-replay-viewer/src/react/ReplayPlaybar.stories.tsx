import { Box, CssBaseline, ThemeProvider } from "@mui/material";
import { Meta, Story } from "@storybook/react";
import { Playbar } from "./Playbar";
import { ReplayBar, ReplayBarProps } from "./ReplayBar";
import { RewindTheme } from "./muiTheme";

export default {
  component: ReplayBar,
  title: "ReplayBar",
  argTypes: {
    onClick: { action: "onClick executed!" },
  },
} as Meta;

const Template: Story<ReplayBarProps> = (args) => (
  <ThemeProvider theme={RewindTheme}>
    <CssBaseline />
    <Box width={"420px"}>
      <ReplayBar {...args} />
    </Box>
  </ThemeProvider>
);

export const Primary = Template.bind({});
Primary.args = {
  events: [
    { color: "#ff0000", position: 0.1 },
    { color: "green", position: 0.2 },
    { color: "cyan", position: 0.3 },
    { color: "#ffefab", position: 0.4 },
  ],
  loadedPercentage: 0.5,
};
