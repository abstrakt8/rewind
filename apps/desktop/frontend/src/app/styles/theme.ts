import { createTheme } from "@mui/material";

export const rewindTheme = createTheme({
  palette: {
    mode: "dark",
    background: {},
  },
  components: {
    MuiButtonBase: {
      defaultProps: {
        disableRipple: true,
      },
    },
  },
});
