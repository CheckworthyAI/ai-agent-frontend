import { useState, useEffect } from "react";
import logo from "./assets/CheckworthyAILogo.png";

const BASE_URL = "https://fastapi-monitoring.fly.dev";

function App() {
  const [showDashboard, setShowDashboard] = useState(window.location.hash === "#dashboard");
  const [monitorData, setMonitorData] = useState(null);
  const [logs, setLogs] = useState([]);
  const [agentNames, setAgentNames] = useState([]);
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);

  const [captureAgentName, setCaptureAgentName] = useState("");
  const [auditAgentName, setAuditAgentName] = useState("");
  const [userInput, setUserInput] = useState("");
  const [output, setOutput] = useState("");

  useEffect(() => {
    const handleHashChange = () => {
      setShowDashboard(window.location.hash === "#dashboard");
    };
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

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
      const names = [...new Set(allLogs.map(log => log.agent_name))];
      setAgentNames(names);
    } catch (error) {
      console.error("Error fetching logs:", error);
    }
  };

  const handleCapture = async () => {
    if (!captureAgentName || !userInput || !output) return alert("All fields are required.");
    try {
      await fetch(`${BASE_URL}/capture-input`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agent_name: captureAgentName,
          user_input: userInput,
          agent_output: output,
          timestamp: new Date().toISOString()
        })
      });
      setCaptureAgentName("");
      setUserInput("");
      setOutput("");
      fetchLogs();
      fetchMonitor();
    } catch (err) {
      console.error("Capture failed:", err);
    }
  };

  const runAudit = async () => {
    if (!auditAgentName) return alert("Please select an agent name.");
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/reason`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agent_name: auditAgentName })
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
          <h1 style={styles.heroTitle}>Monitor And Audit Your AI Agents.</h1>
          <p style={styles.heroSubtitle}>
            Checkworthy AI helps you monitor, evaluate, and trust your LLMs — effortlessly.
          </p>
          <button
            style={styles.ctaButton}
            onClick={() => (window.location.hash = "#dashboard")}
          >
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
          <h2>Start auditing your AI in real-time.</h2>
          <button
            style={styles.ctaButton}
            onClick={() => (window.location.hash = "#dashboard")}
          >
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
          <h1 style={{ margin: 0, color: "#000" }}>Checkworthy AI Dashboard</h1>
          <p style={{ margin: 0, color: "#666" }}>Monitor, analyze, and audit your deployed AI agents</p>
        </div>
      </header>

      <section style={styles.card}>
        <h2 style={styles.sectionTitle}>📊 Stats</h2>
        {monitorData ? (
          <>
            <p><strong>Total Logs:</strong> {monitorData.total_logs}</p>
            <p><strong>Empty Inputs Found:</strong> {monitorData.empty_inputs_found}</p>
            <p><strong>Agents Active:</strong> {Object.keys(monitorData.logs_per_agent).length}</p>
          </>
        ) : (
          <p>Loading stats...</p>
        )}
      </section>

      <section style={styles.card}>
        <h2 style={styles.sectionTitle}>🤖 Agent Activity</h2>
        {monitorData ? (
          <ul>
            {Object.entries(monitorData.logs_per_agent).map(([agent, count]) => (
              <li key={agent}><strong>{agent}</strong>: {count} logs</li>
            ))}
          </ul>
        ) : (
          <p>Loading activity...</p>
        )}
      </section>

      <section style={styles.card}>
        <h2 style={styles.sectionTitle}>📝 Capture Agent Log</h2>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "15px" }}>
          <input placeholder="Agent Name" value={captureAgentName} onChange={(e) => setCaptureAgentName(e.target.value)} style={styles.input} />
          <input placeholder="User Input" value={userInput} onChange={(e) => setUserInput(e.target.value)} style={styles.input} />
          <input placeholder="Agent Output" value={output} onChange={(e) => setOutput(e.target.value)} style={styles.input} />
        </div>
        <button onClick={handleCapture} style={styles.ctaButton}>Submit Log</button>
      </section>

      <section style={styles.card}>
        <h2 style={styles.sectionTitle}>📚 Captured Logs</h2>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={styles.tableHeader}>Agent</th>
                <th style={styles.tableHeader}>User Input</th>
                <th style={styles.tableHeader}>Output</th>
                <th style={styles.tableHeader}>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {logs.length > 0 ? (
                logs.map((log, idx) => (
                  <tr key={idx} style={{ borderBottom: "1px solid #ddd" }}>
                    <td style={styles.tableCell}>{log.agent_name}</td>
                    <td style={styles.tableCell}>{log.user_input}</td>
                    <td style={styles.tableCell}>{log.agent_output || log.output || "N/A"}</td>
                    <td style={styles.tableCell}>{new Date(log.timestamp).toLocaleString()}</td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="4" style={styles.tableCell}>No logs found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section style={styles.card}>
        <h2 style={styles.sectionTitle}>🧠 Run GPT Audit</h2>
        <label style={{ marginBottom: "10px", display: "block", fontWeight: 500, color: "#000" }}>
          Select an agent to evaluate:
        </label>
        <select
          value={auditAgentName}
          onChange={(e) => setAuditAgentName(e.target.value)}
          style={styles.selectBox}
        >
          <option value="">-- Select Agent --</option>
          {agentNames.map((name, idx) => (
            <option key={idx} value={name}>{name}</option>
          ))}
        </select>
        <button onClick={runAudit} disabled={loading || !auditAgentName} style={styles.ctaButton}>
          {loading ? "Running..." : `Generate Summary ${auditAgentName}`}
        </button>
        {summary && (
          <p style={{ marginTop: "15px", whiteSpace: "pre-wrap", color: "#000" }}>
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
    backgroundColor: "#f0f0f0",
    fontFamily: "'Inter', sans-serif",
    padding: "40px 20px",
    textAlign: "center"
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    marginBottom: "40px"
  },
  headerTitle: {
    fontSize: "2.5rem",
    fontWeight: 600,
    margin: 0,
    color: "#000"
  },
  heroLogo: {
    height: "50px"
  },
  hero: {
    maxWidth: "700px",
    margin: "0 auto 60px"
  },
  heroTitle: {
    fontSize: "1.5rem",
    fontWeight: "700",
    marginBottom: "20px",
    color: "#000"
  },
  heroSubtitle: {
    fontSize: "1.2rem",
    color: "#555",
    marginBottom: "30px"
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
    backgroundColor: "#fff",
    padding: "30px",
    borderRadius: "12px",
    border: "1px solid #ddd",
    flex: "1 1 280px",
    maxWidth: "300px",
    textAlign: "left",
    color: "#000"
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
  card: {
    background: "#fff",
    color: "#000",
    borderRadius: "12px",
    padding: "25px",
    marginBottom: "30px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.05)"
  },
  input: {
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    backgroundColor: "#fff",
    color: "#000",
    width: "calc(33% - 10px)",
    flex: "1"
  },
  selectBox: {
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    marginBottom: "20px",
    minWidth: "200px",
    backgroundColor: "#fff",
    color: "#000"
  },
  tableHeader: {
    padding: "10px",
    textAlign: "left",
    fontWeight: "bold",
    backgroundColor: "#f0f0f0",
    color: "#000"
  },
  tableCell: {
    padding: "10px",
    backgroundColor: "#fff",
    color: "#000"
  },
  sectionTitle: {
    color: "#000",
    marginBottom: "15px"
  }
};

export default App;


















