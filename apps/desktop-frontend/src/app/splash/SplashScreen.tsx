import { BackendState } from "../backend/slice";
import { HashLoader } from "react-spinners";
import { Stack } from "@mui/material";

interface Props {
  status: BackendState;
}

function text(status: BackendState) {
  switch (status) {
    case "LOADING":
      return "Services are getting ready ... ";
    case "READY":
      return "Ready!";
    case "SETUP_MISSING":
      return "Setup is missing, you will be redirected to the setup screen ...";
    case "NOT_STARTED":
      return "Waiting for services to boot...";
  }
}

export function SplashScreen({ status }: Props) {
  const showSpinner = status === "LOADING" || status === "NOT_STARTED" || status === "SETUP_MISSING";
  const loadingText = text(status);
  return (
    <Stack
      sx={{
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <HashLoader color={"white"} loading={showSpinner} />
      <div>{loadingText}</div>
    </Stack>
  );
}
