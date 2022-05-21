import { createTheme } from "@mui/material";

export const rewindTheme = createTheme({
  palette: {
    mode: "dark",
    background: {},
  },
  components: {
    // Name of the component ⚛️
    MuiButtonBase: {
      defaultProps: {
        // The props to apply
        disableRipple: true, // No more ripple, on the whole application 💣!
      },
    },
  },
});
