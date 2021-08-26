const VideoCameraIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-8 w-8 text-gray-200"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
    />
  </svg>
);
const FilmIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="sidebar-icon" viewBox="0 0 20 20" fill="currentColor">
    <path
      fillRule="evenodd"
      d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm3 2h6v4H7V5zm8 8v2h1v-2h-1zm-2-2H7v4h6v-4zm2 0h1V9h-1v2zm1-4V5h-1v2h1zM5 5v2H4V5h1zm0 4H4v2h1V9zm-1 4h1v2H4v-2z"
      clipRule="evenodd"
    />
  </svg>
);
const HomeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="sidebar-icon" viewBox="0 0 20 20" fill="currentColor">
    <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
  </svg>
);
const SettingsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="sidebar-icon" viewBox="0 0 20 20" fill="currentColor">
    <path
      fillRule="evenodd"
      d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
      clipRule="evenodd"
    />
  </svg>
);
const RewindIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="sidebar-icon" viewBox="0 0 20 20" fill="currentColor">
    <path d="M8.445 14.832A1 1 0 0010 14v-2.798l5.445 3.63A1 1 0 0017 14V6a1 1 0 00-1.555-.832L10 8.798V6a1 1 0 00-1.555-.832l-6 4a1 1 0 000 1.664l6 4z" />
  </svg>
);
const RewindLogo = () => (
  <div className={"flex flex-col items-center"}>
    <RewindIcon />
    <span className={"logo-text"}>Rewind</span>
  </div>
);

export function LeftMenuSidebar() {
  return (
    <nav className={"flex-none w-20 p-2 border-gray-500 border-r"}>
      <ul className={"flex flex-col items-center text-gray-200 gap-4 h-full"}>
        <li>
          <RewindLogo />
        </li>
        <li>
          <div className={"border-b-2 border-gray-500 w-6"} />
        </li>
        <li className={""}>
          <HomeIcon />
        </li>
        <li className={""}>
          <FilmIcon />
        </li>
        {/* Gap */}
        <li className={"flex-1"} />
        <li className={""}>
          <SettingsIcon />
        </li>
      </ul>
    </nav>
  );
}
