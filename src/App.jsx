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
          agent_output: output,
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

  // 💅 Style Constants
  const sectionCardStyle = {
    background: "#fff",
    borderRadius: "12px",
    padding: "25px",
    marginBottom: "30px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.04)"
  };

  const sectionTitleStyle = {
    marginBottom: "15px",
    fontSize: "1.25rem",
    color: "#222"
  };

  const inputStyle = {
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    width: "calc(33% - 10px)",
    flex: "1"
  };

  const buttonStyle = {
    padding: "10px 20px",
    backgroundColor: "#111",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer"
  };

  const tableHeaderCell = {
    padding: "10px",
    textAlign: "left",
    fontWeight: "bold"
  };

  const tableCell = {
    padding: "10px"
  };

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: "#f5f5f7", minHeight: "100vh", padding: "40px" }}>
      {/* Header */}
      <header style={{ display: "flex", alignItems: "center", marginBottom: "40px" }}>
        <img src={logo} alt="Checkworthy AI Logo" style={{ height: "50px", marginRight: "20px" }} />
        <div>
          <h1 style={{ margin: 0, fontSize: "2rem", color: "#111" }}>Checkworthy AI</h1>
          <p style={{ margin: 0, color: "#555" }}>Audit and monitor your AI agents with confidence</p>
        </div>
      </header>

      {/* Stats */}
      {monitorData && (
        <section style={sectionCardStyle}>
          <h2 style={sectionTitleStyle}>📊 Stats</h2>
          <p><strong>Total Logs:</strong> {monitorData.total_logs}</p>
          <p><strong>Empty Inputs Found:</strong> {monitorData.empty_inputs_found}</p>
          <p><strong>Agents Active:</strong> {Object.keys(monitorData.logs_per_agent).length}</p>
        </section>
      )}

      {/* Agent Activity */}
      {monitorData && (
        <section style={sectionCardStyle}>
          <h2 style={sectionTitleStyle}>🤖 Agent Activity</h2>
          <ul>
            {Object.entries(monitorData.logs_per_agent).map(([agent, count]) => (
              <li key={agent}><strong>{agent}</strong>: {count} logs</li>
            ))}
          </ul>
        </section>
      )}

      {/* Capture Form */}
      <section style={sectionCardStyle}>
        <h2 style={sectionTitleStyle}>📝 Capture Agent Log</h2>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "15px" }}>
          <input placeholder="Agent Name" value={agentName} onChange={(e) => setAgentName(e.target.value)} style={inputStyle} />
          <input placeholder="User Input" value={userInput} onChange={(e) => setUserInput(e.target.value)} style={inputStyle} />
          <input placeholder="Agent Output" value={output} onChange={(e) => setOutput(e.target.value)} style={inputStyle} />
        </div>
        <button onClick={handleCapture} style={buttonStyle}>Submit Log</button>
      </section>

      {/* Logs Table */}
      <section style={sectionCardStyle}>
        <h2 style={sectionTitleStyle}>📚 Captured Logs</h2>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "#eee" }}>
                <th style={tableHeaderCell}>Agent</th>
                <th style={tableHeaderCell}>User Input</th>
                <th style={tableHeaderCell}>Output</th>
                <th style={tableHeaderCell}>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log, idx) => (
                <tr key={idx} style={{ borderBottom: "1px solid #ddd" }}>
                  <td style={tableCell}>{log.agent_name}</td>
                  <td style={tableCell}>{log.user_input}</td>
                  <td style={tableCell}>{log.output || "N/A"}</td>
                  <td style={tableCell}>{new Date(log.timestamp).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* GPT Audit */}
      <section style={sectionCardStyle}>
        <h2 style={sectionTitleStyle}>🧠 Run GPT Audit</h2>
        <p style={{ marginBottom: "10px" }}>Enter an agent name to evaluate its recent performance:</p>
        <button onClick={runAudit} disabled={loading || !agentName} style={buttonStyle}>
          {loading ? "Running..." : `Generate Summary for ${agentName || "Agent"}`}
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





