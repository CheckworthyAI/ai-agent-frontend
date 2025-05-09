import { useEffect, useState } from "react";

const BASE_URL = "https://fastapi-monitoring.fly.dev/docs"; // Change later 

function App() {
  const [monitorData, setMonitorData] = useState(null);
  const [logs, setLogs] = useState([]);
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch stats from /monitor
  const fetchMonitor = async () => {
    const res = await fetch(`${BASE_URL}/monitor`);
    const data = await res.json();
    setMonitorData(data);
  };

  // Fetch logs from /get-logs
  const fetchLogs = async () => {
    const res = await fetch(`${BASE_URL}/get-logs`);
    const data = await res.json();
    setLogs(data.logs || []);
  };

  useEffect(() => {
    fetchMonitor();
    fetchLogs();
  }, []);

  const runAudit = async () => {
    setLoading(true);
    const res = await fetch(`${BASE_URL}/reason`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ agent_name: "Alpha" }) // Replace or make dynamic
    });

    const data = await res.json();
    setSummary(data.summary || "No summary returned.");
    setLoading(false);
  };

  return (
    <div style={{ fontFamily: "Arial", padding: "20px" }}>
      <h1>AI Agent Monitoring Dashboard</h1>
      <p>Real-time insights from monitored AI agents</p>

      {monitorData && (
        <div style={{ marginTop: "20px" }}>
          <h2>Stats</h2>
          <p><strong>Total Logs:</strong> {monitorData.total_logs}</p>
          <p><strong>Empty Inputs Found:</strong> {monitorData.empty_inputs_found}</p>
          <p><strong>Agents Active:</strong> {Object.keys(monitorData.logs_per_agent).length}</p>
        </div>
      )}

      <div style={{ marginTop: "30px" }}>
        <h2>Agent Activity</h2>
        <ul>
          {monitorData &&
            Object.entries(monitorData.logs_per_agent).map(([agent, count]) => (
              <li key={agent}>
                <strong>{agent}</strong>: {count} logs
              </li>
            ))}
        </ul>
      </div>

      <div style={{ marginTop: "30px" }}>
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
      </div>

      <div style={{ marginTop: "30px" }}>
        <h2>Run GPT Audit</h2>
        <button onClick={runAudit} disabled={loading}>
          {loading ? "Running..." : "Generate Summary"}
        </button>
        {summary && <p><strong>Audit Result:</strong> {summary}</p>}
      </div>
    </div>
  );
}

export default App;


