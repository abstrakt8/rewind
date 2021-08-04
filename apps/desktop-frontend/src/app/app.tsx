import { useCallback } from "react";
import styles from "./app.module.css";

import { ReactComponent as Logo } from "./logo.svg";
import star from "./star.svg";

export function App() {
  const a = useCallback(() => {
    window.api.send("toMain", "a");
  }, []);
  return (
    <div className={styles.app}>
      <button onClick={a}>Press me</button>
    </div>
  );
}

export default App;
