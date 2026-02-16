import { useEffect, useState } from "react";
import "./App.css";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

function App() {
  const [status, setStatus] = useState("checking");
  const [details, setDetails] = useState("");

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/habits/`);
        if (!response.ok) {
          setStatus("error");
          setDetails(`HTTP ${response.status}`);
          return;
        }
        await response.json();
        setStatus("connected");
        setDetails("");
      } catch (error) {
        setStatus("error");
        setDetails("Network error");
      }
    };

    checkConnection();
  }, []);

  return (
    <main className="app">
      <div className="app-content">
        <p className="app-eyebrow">Frontend Starter</p>
        <h1>Just a template</h1>
        <p>
          Clean base styles, global tokens, and a calm palette are ready for
          your next feature.
        </p>
        <div className={`status-card status-${status}`}>
          <p className="status-title">
            {status === "connected"
              ? "Django connected"
              : status === "error"
                ? "Django connection failed"
                : "Checking Django connection..."}
          </p>
          {details ? <p className="status-detail">{details}</p> : null}
        </div>
        <button type="button">Get started</button>
      </div>
    </main>
  );
}

export default App;
