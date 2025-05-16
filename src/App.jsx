import { useState, useEffect } from "react";
import logo from "./assets/CheckworthyAILogo.png";

const BASE_URL = "https://fastapi-monitoring.fly.dev";

function App() {
  const [showDashboard, setShowDashboard] = useState(false);
  const [monitorData, setMonitorData] = useState(null);
  const [logs, setLogs] = useState([]);
  const [agentNames, setAgentNames] = useState([]);
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [agentName, setAgentName] = useState("");
  const [userInput, setUserInput] = useState("");
  const [output, setOutput] = useState("");

  useEffect(() => {
    if (showDashboard) {
      fetchMonitor();
      fetchLogs();
    }
  }, [showDashboard]);

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
      const allLogs = data.logs || [];
      setLogs(allLogs);

      // Extract unique agent names
      const names = [...new Set(allLogs.map(log => log.agent_name))];
      setAgentNames(names);
    } catch (error) {
      console.error("Error fetching logs:", error);
    }
  };

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
    if (!agentName) return alert("Please select an agent name.");
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

  if (!showDashboard) {
    return (
      <div style={styles.landingWrapper}>
        <header style={styles.header}>
          <img src={logo} alt="Checkworthy AI Logo" style={styles.heroLogo} />
          <h2 style={styles.headerTitle}>Checkworthy AI</h2>
        </header>

        <section style={styles.hero}>
          <h1 style={styles.heroTitle}>Audit your AI agents.<br />Automatically.</h1>
          <p style={styles.heroSubtitle}>
            Checkworthy AI helps you monitor, evaluate, and trust your LLMs — effortlessly.
          </p>
          <button style={styles.ctaButton} onClick={() => setShowDashboard(true)}>
            Launch Dashboard
          </button>
        </section>

        <section style={styles.featuresSection}>
          <div style={styles.featureCard}>
            <h3>🧠 GPT-Powered Audits</h3>
            <p>Automatically review AI agent responses for accuracy, relevance, and tone.</p>
          </div>
          <div style={styles.featureCard}>
            <h3>📊 Live Metrics</h3>
            <p>Track agent activity, empty inputs, and response quality — in real time.</p>
          </div>
          <div style={styles.featureCard}>
            <h3>🔍 Trust Layer for LLMs</h3>
            <p>Give your team insights to fix broken agents and prevent hallucinations.</p>
          </div>
        </section>

        <section style={styles.bottomCTA}>
          <h2>Start auditing your AI in seconds.</h2>
          <button style={styles.ctaButton} onClick={() => setShowDashboard(true)}>
            Open Dashboard
          </button>
          <p style={{ marginTop: "20px" }}>
            Or contact us: <a href="mailto:siddhartha@checkworthyai.com">siddhartha@checkworthyai.com</a>
          </p>
        </section>
      </div>
    );
  }

  return (
    <div style={styles.dashboardContainer}>
      <header style={{ display: "flex", alignItems: "center", marginBottom: "30px" }}>
        <img src={logo} alt="Checkworthy AI Logo" style={{ height: "50px", marginRight: "15px" }} />
        <div>
          <h1 style={{ margin: 0 }}>Checkworthy AI Dashboard</h1>
          <p style={{ margin: 0, color: "#666" }}>Monitor, analyze, and audit your deployed AI agents</p>
        </div>
      </header>

      {monitorData && (
        <section style={styles.card}>
          <h2>📊 Stats</h2>
          <p><strong>Total Logs:</strong> {monitorData.total_logs}</p>
          <p><strong>Empty Inputs Found:</strong> {monitorData.empty_inputs_found}</p>
          <p><strong>Agents Active:</strong> {Object.keys(monitorData.logs_per_agent).length}</p>
        </section>
      )}

      {monitorData && (
        <section style={styles.card}>
          <h2>🤖 Agent Activity</h2>
          <ul>
            {Object.entries(monitorData.logs_per_agent).map(([agent, count]) => (
              <li key={agent}><strong>{agent}</strong>: {count} logs</li>
            ))}
          </ul>
        </section>
      )}

      <section style={styles.card}>
        <h2>📝 Capture Agent Log</h2>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "15px" }}>
          <input placeholder="Agent Name" value={agentName} onChange={(e) => setAgentName(e.target.value)} style={styles.input} />
          <input placeholder="User Input" value={userInput} onChange={(e) => setUserInput(e.target.value)} style={styles.input} />
          <input placeholder="Agent Output" value={output} onChange={(e) => setOutput(e.target.value)} style={styles.input} />
        </div>
        <button onClick={handleCapture} style={styles.ctaButton}>Submit Log</button>
      </section>

      <section style={styles.card}>
        <h2>📚 Captured Logs</h2>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "#eee" }}>
                <th style={styles.tableHeader}>Agent</th>
                <th style={styles.tableHeader}>User Input</th>
                <th style={styles.tableHeader}>Output</th>
                <th style={styles.tableHeader}>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log, idx) => (
                <tr key={idx} style={{ borderBottom: "1px solid #ddd" }}>
                  <td style={styles.tableCell}>{log.agent_name}</td>
                  <td style={styles.tableCell}>{log.user_input}</td>
                  <td style={styles.tableCell}>{log.agent_output || log.output || "N/A"}</td>
                  <td style={styles.tableCell}>{new Date(log.timestamp).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section style={styles.card}>
        <h2>🧠 Run GPT Audit</h2>
        <label style={{ marginBottom: "10px", display: "block", fontWeight: 500 }}>
          Select an agent to evaluate:
        </label>
        <select
          value={agentName}
          onChange={(e) => setAgentName(e.target.value)}
          style={{
            padding: "10px",
            borderRadius: "8px",
            border: "1px solid #ccc",
            marginBottom: "20px",
            minWidth: "200px"
          }}
        >
          <option value="">-- Select Agent --</option>
          {agentNames.map((name, idx) => (
            <option key={idx} value={name}>{name}</option>
          ))}
        </select>

        <button onClick={runAudit} disabled={loading || !agentName} style={styles.ctaButton}>
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

const styles = {
  landingWrapper: {
    minHeight: "100vh",
    width: "100vw",
    overflowX: "hidden",
    backgroundColor: "#f0f0f0",
    fontFamily: "'Inter', sans-serif",
    color: "#111",
    padding: "40px 20px",
    boxSizing: "border-box"
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    marginBottom: "40px"
  },
  headerTitle: {
    fontSize: "1.5rem",
    fontWeight: 600,
    margin: 0
  },
  heroLogo: {
    height: "40px"
  },
  hero: {
    maxWidth: "700px",
    margin: "0 auto 60px",
    textAlign: "center"
  },
  heroTitle: {
    fontSize: "2.8rem",
    fontWeight: "600",
    marginBottom: "20px"
  },
  heroSubtitle: {
    fontSize: "1.2rem",
    color: "#555",
    marginBottom: "30px",
    lineHeight: "1.6"
  },
  ctaButton: {
    padding: "14px 28px",
    fontSize: "1rem",
    backgroundColor: "#111",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer"
  },
  featuresSection: {
    display: "flex",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: "20px",
    maxWidth: "1000px",
    margin: "0 auto 80px"
  },
  featureCard: {
    backgroundColor: "#f0f0f0",
    padding: "30px",
    borderRadius: "12px",
    border: "1px solid #ddd",
    flex: "1 1 280px",
    maxWidth: "300px",
    textAlign: "left"
  },
  bottomCTA: {
    maxWidth: "700px",
    margin: "0 auto",
    paddingTop: "40px",
    borderTop: "1px solid #ccc",
    textAlign: "center"
  },
  dashboardContainer: {
    backgroundColor: "#f0f0f0",
    minHeight: "100vh",
    width: "100vw",
    padding: "40px",
    fontFamily: "'Inter', sans-serif",
    boxSizing: "border-box",
    overflowX: "hidden"
  },
  input: {
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    width: "calc(33% - 10px)",
    flex: "1"
  },
  tableHeader: {
    padding: "10px",
    textAlign: "left",
    fontWeight: "bold"
  },
  tableCell: {
    padding: "10px"
  },
  card: {
    background: "#fff",
    borderRadius: "12px",
    padding: "25px",
    marginBottom: "30px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.05)"
  }
};

export default App;










