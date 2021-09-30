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
  backgroundEnable: true,
};

export const NotEnabled = Template.bind({});
NotEnabled.args = {
  backgroundEnable: false,
};
