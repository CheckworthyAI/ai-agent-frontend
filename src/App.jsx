import { useEffect, useState } from "react";
import logo from "./assets/CheckworthyAILogo.png";

const BASE_URL = "https://fastapi-monitoring.fly.dev";

function App() {
  const [monitorData, setMonitorData] = useState(null);
  const [logs, setLogs] = useState([]);
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [agentName, setAgentName] = useState("");
  const [userInput, setUserInput] = useState("");
  const [output, setOutput] = useState("");

  const fetchMonitor = async () => {
    try {
      const res = await fetch(`${BASE_URL}/monitor`);
      const data = await res.json();
      setMonitorData(data);
    } catch (error) {
      console.error("Error fetching monitor data:", error);
    }
  };

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

  const handleCapture = async () => {
    if (!agentName || !userInput || !output) return alert("All fields are required.");
    try {
      await fetch(`${BASE_URL}/capture-input`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agent_name: agentName,
          user_input: userInput,
          output,
          timestamp: new Date().toISOString()
        })
      });
      setAgentName("");
      setUserInput("");
      setOutput("");
      fetchLogs();
      fetchMonitor();
    } catch (err) {
      console.error("Capture failed:", err);
    }
  };

  const runAudit = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/reason`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agent_name: agentName })
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
    <div style={{ fontFamily: "Arial, sans-serif", maxWidth: "900px", margin: "0 auto", padding: "30px" }}>
      {/* Header */}
      <header style={{ display: "flex", alignItems: "center", marginBottom: "30px" }}>
        <img src={logo} alt="Checkworthy AI Logo" style={{ height: "60px", marginRight: "15px" }} />
        <div>
          <h1 style={{ margin: 0 }}>Checkworthy AI Dashboard</h1>
          <p style={{ margin: 0, color: "#666" }}>Monitor, analyze, and audit your deployed AI agents</p>
        </div>
      </header>

      {/* Stats */}
      {monitorData && (
        <section style={{ marginBottom: "30px" }}>
          <h2>📊 Stats</h2>
          <p><strong>Total Logs:</strong> {monitorData.total_logs}</p>
          <p><strong>Empty Inputs Found:</strong> {monitorData.empty_inputs_found}</p>
          <p><strong>Agents Active:</strong> {Object.keys(monitorData.logs_per_agent).length}</p>
        </section>
      )}

      {/* Agent Activity */}
      {monitorData && (
        <section style={{ marginBottom: "30px" }}>
          <h2>🤖 Agent Activity</h2>
          <ul>
            {Object.entries(monitorData.logs_per_agent).map(([agent, count]) => (
              <li key={agent}><strong>{agent}</strong>: {count} logs</li>
            ))}
          </ul>
        </section>
      )}

      {/* Capture Form */}
      <section style={{ marginBottom: "30px", background: "#f9f9f9", padding: "20px", borderRadius: "10px" }}>
        <h2>📝 Capture Agent Log</h2>
        <input
          type="text"
          placeholder="Agent Name"
          value={agentName}
          onChange={(e) => setAgentName(e.target.value)}
          style={{ marginRight: "10px", padding: "8px", width: "30%" }}
        />
        <input
          type="text"
          placeholder="User Input"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          style={{ marginRight: "10px", padding: "8px", width: "30%" }}
        />
        <input
          type="text"
          placeholder="Agent Output"
          value={output}
          onChange={(e) => setOutput(e.target.value)}
          style={{ padding: "8px", width: "30%" }}
        />
        <div style={{ marginTop: "10px" }}>
          <button onClick={handleCapture} style={{ padding: "10px 20px" }}>Submit Log</button>
        </div>
      </section>

      {/* Logs Table */}
      <section style={{ marginBottom: "30px" }}>
        <h2>📚 Captured Logs</h2>
        <table border="1" cellPadding="8" style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ backgroundColor: "#f2f2f2" }}>
              <th>Agent</th>
              <th>User Input</th>
              <th>Output</th>
              <th>Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log, idx) => (
              <tr key={idx}>
                <td>{log.agent_name}</td>
                <td>{log.user_input}</td>
                <td>{log.output || "N/A"}</td>
                <td>{new Date(log.timestamp).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* GPT Audit */}
      <section>
        <h2>🧠 Run GPT Audit</h2>
        <p>Select an agent and get a quality audit:</p>
        <button onClick={runAudit} disabled={loading || !agentName}>
          {loading ? "Running..." : "Generate Summary for " + (agentName || "Agent")}
        </button>
        {summary && (
          <p style={{ marginTop: "15px", whiteSpace: "pre-wrap" }}>
            <strong>Audit Result:</strong><br />{summary}
          </p>
        )}
      </section>
    </div>
  );
}

export default App;




