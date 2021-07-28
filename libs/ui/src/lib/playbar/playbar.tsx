import './playbar.module.css';

/* eslint-disable-next-line */
export interface PlaybarProps {}

export function Playbar(props: PlaybarProps) {
  return (
    <div className="h-3 bg-red-900">
      <h1>Welcome to playbar!</h1>
    </div>
  );
}

export default Playbar;
