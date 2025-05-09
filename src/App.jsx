import { useEffect, useState } from "react";
import logo from "./assets/CheckworthyAILogo.png";

const BASE_URL = "https://fastapi-monitoring.fly.dev"; // Your deployed backend

function App() {
  const [monitorData, setMonitorData] = useState(null);
  const [logs, setLogs] = useState([]);
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch stats from /monitor
  const fetchMonitor = async () => {
    try {
      const res = await fetch(`${BASE_URL}/monitor`);
      const data = await res.json();
      setMonitorData(data);
    } catch (error) {
      console.error("Error fetching monitor data:", error);
    }
  };

  // Fetch logs from /get-logs
  const fetchLogs = async () => {
    try {
      const res = await fetch(`${BASE_URL}/get-logs`);
      const data = await res.json();
      setLogs(data.logs || []);
    } catch (error) {
      console.error("Error fetching logs:", error);
    }
  };

  useEffect(() => {
    fetchMonitor();
    fetchLogs();
  }, []);

  const runAudit = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/reason`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agent_name: "Alpha" }) // You can make this dynamic
      });

      const data = await res.json();
      setSummary(data.summary || "No summary returned.");
    } catch (error) {
      console.error("Audit failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ fontFamily: "Arial, sans-serif", padding: "20px" }}>
      {/* Logo and Title */}
      <header style={{ display: "flex", alignItems: "center", marginBottom: "20px" }}>
        <img src={logo} alt="Checkworthy AI Logo" style={{ height: "60px", marginRight: "15px" }} />
        <div>
          <h1 style={{ margin: 0 }}>Checkworthy AI Dashboard</h1>
          <p style={{ margin: 0, color: "#666" }}>Real-time insights from monitored AI agents</p>
        </div>
      </header>

      {/* Stats */}
      {monitorData && (
        <section style={{ marginBottom: "30px" }}>
          <h2>Stats</h2>
          <p><strong>Total Logs:</strong> {monitorData.total_logs}</p>
          <p><strong>Empty Inputs Found:</strong> {monitorData.empty_inputs_found}</p>
          <p><strong>Agents Active:</strong> {Object.keys(monitorData.logs_per_agent).length}</p>
        </section>
      )}

      {/* Agent Activity */}
      {monitorData && (
        <section style={{ marginBottom: "30px" }}>
          <h2>Agent Activity</h2>
          <ul>
            {Object.entries(monitorData.logs_per_agent).map(([agent, count]) => (
              <li key={agent}><strong>{agent}</strong>: {count} logs</li>
            ))}
          </ul>
        </section>
      )}

      {/* Captured Logs */}
      <section style={{ marginBottom: "30px" }}>
        <h2>Captured Logs</h2>
        <table border="1" cellPadding="8">
          <thead>
            <tr>
              <th>Agent</th>
              <th>User Input</th>
              <th>Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log, idx) => (
              <tr key={idx}>
                <td>{log.agent_name}</td>
                <td>{log.user_input}</td>
                <td>{new Date(log.timestamp).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Audit */}
      <section style={{ marginBottom: "30px" }}>
        <h2>Run GPT Audit</h2>
        <button onClick={runAudit} disabled={loading}>
          {loading ? "Running..." : "Generate Summary"}
        </button>
        {summary && (
          <p style={{ marginTop: "15px" }}>
            <strong>Audit Result:</strong><br /> {summary}
          </p>
        )}
      </section>
    </div>
  );
}

export default App;



