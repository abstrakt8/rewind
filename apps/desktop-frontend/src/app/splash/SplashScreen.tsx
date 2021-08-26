import { BackendState } from "../backend/slice";
import { HashLoader } from "react-spinners";

interface Props {
  status: BackendState;
}

function text(status: BackendState) {
  switch (status) {
    case "LOADING":
      return "Services are preparing ... ";
    case "READY":
      return "Ready!";
    case "SETUP_MISSING":
      return "Setup is missing";
    case "NOT_STARTED":
      return "Waiting for services to boot...";
  }
}

export function SplashScreen({ status }: Props) {
  const showSpinner = status === "LOADING" || status === "NOT_STARTED";
  const loadingText = text(status);
  return (
    <div className={"h-screen bg-gray-700 flex items-center justify-center flex-col text-gray-200 gap-4"}>
      <HashLoader color={"white"} loading={showSpinner} />
      <div>{loadingText}</div>
    </div>
  );
}
