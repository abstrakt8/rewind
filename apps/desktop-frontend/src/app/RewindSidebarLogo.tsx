import { RewindIcon } from "@heroicons/react/solid";

// const RewindIcon = () => (
//   <svg xmlns="http://www.w3.org/2000/svg" className="sidebar-icon" viewBox="0 0 20 20" fill="currentColor">
//     <path d="M8.445 14.832A1 1 0 0010 14v-2.798l5.445 3.63A1 1 0 0017 14V6a1 1 0 00-1.555-.832L10 8.798V6a1 1 0
// 00-1.555-.832l-6 4a1 1 0 000 1.664l6 4z" /> </svg> );
export const RewindSidebarLogo = () => (
  <div className={"flex flex-col items-center"}>
    <RewindIcon className={"h-8 w-8"} />
    <span className={"logo-text select-none"}>Rewind</span>
  </div>
);

export const RewindLogo = () => (
  <div className={"flex flex-col items-center"}>
    <RewindIcon className={"h-10 w-10"} />
    <span className={"text-xl -mt-2 select-none"}>Rewind</span>
  </div>
);
