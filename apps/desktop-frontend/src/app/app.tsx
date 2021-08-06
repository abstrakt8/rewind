import { useCallback } from "react";
import styles from "./app.module.css";

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
