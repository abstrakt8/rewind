import { HashLoader } from "react-spinners";
import { Stack } from "@mui/material";

export function SplashScreen() {
  return (
    <Stack
      sx={{
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      gap={2}
    >
      <HashLoader color={"white"} loading={true} />
      <div>Services are getting ready ...</div>
    </Stack>
  );
}
