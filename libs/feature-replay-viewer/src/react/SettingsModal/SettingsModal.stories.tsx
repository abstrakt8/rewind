import { Meta, Story } from "@storybook/react";
import { Settings, SettingsProps } from "./SettingsModal";
import { CssBaseline, Paper, ThemeProvider } from "@mui/material";
import { RewindTheme } from "../muiTheme";

export default {
  component: Settings,
  title: "SettingsModal",
  argTypes: {
    onClick: { action: "onClick executed!" },
  },
} as Meta;

const Template: Story<SettingsProps> = (args) => (
  <Paper elevation={2} sx={{ width: 560 }}>
    <Settings {...args} />
  </Paper>
);

export const Primary = Template.bind({});
Primary.args = {};
