import { BackendState } from "../../store/backend/slice";
import { HashLoader } from "react-spinners";
import { Stack } from "@mui/material";

interface Props {
  status: BackendState;
}

// TODO: Remove probably
function text(status: BackendState) {
  switch (status) {
    case "LOADING":
      return "Services are getting ready ... ";
    case "READY":
      return "Just a moment ...";
    case "SETUP_MISSING":
      return "Setup is missing, you will be redirected to the setup screen ...";
    case "NOT_STARTED":
      return "Waiting for services to boot...";
  }
}

export function SplashScreen({ status }: Props) {
  const showSpinner =
    status === "LOADING" || status === "NOT_STARTED" || status === "SETUP_MISSING" || status === "READY";
  const loadingText = text(status);
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
      {/*Hardcoding white not good*/}
      <HashLoader color={"white"} loading={showSpinner} />
      <div>{loadingText}</div>
    </Stack>
  );
}
