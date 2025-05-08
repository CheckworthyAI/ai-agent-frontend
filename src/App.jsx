import { useEffect, useState } from "react";
import axios from "axios";

function App() {
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState({ total_logs: 0, logs_per_agent: {}, empty_inputs_found: 0 });
  const [selectedAgent, setSelectedAgent] = useState("");
  const [numLogs, setNumLogs] = useState(5);
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Fetch logs
    axios.get("http://127.0.0.1:8000/get-logs")
      .then((res) => setLogs(res.data.logs))
      .catch((err) => console.error("Failed to load logs", err));

    // Fetch monitoring stats
    axios.get("http://127.0.0.1:8000/monitor")
      .then((res) => setStats(res.data))
      .catch((err) => console.error("Failed to load monitor stats", err));
  }, []);

  const handleReasonRequest = () => {
    setLoading(true);
    setError("");
    setSummary("");

    axios.post("http://127.0.0.1:8000/reason", {
      agent_name: selectedAgent,
      num_logs: numLogs
    })
      .then((res) => {
        setSummary(res.data.summary || "No summary returned.");
      })
      .catch((err) => {
        setError(err.response?.data?.error || "Something went wrong.");
      })
      .finally(() => setLoading(false));
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800 p-6 font-sans">
      <header className="mb-10">
        <h1 className="text-4xl font-bold text-gray-900 mb-1">AI Agent Monitoring</h1>
        <p className="text-md text-gray-500">Track and analyze the behavior of deployed AI agents in real-time</p>
      </header>

      {/* Monitoring Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-4 shadow rounded">
          <h2 className="text-sm text-gray-500">Total Logs</h2>
          <p className="text-2xl font-bold">{stats.total_logs}</p>
        </div>
        <div className="bg-white p-4 shadow rounded">
          <h2 className="text-sm text-gray-500">Empty Inputs Found</h2>
          <p className="text-2xl font-bold">{stats.empty_inputs_found}</p>
        </div>
        <div className="bg-white p-4 shadow rounded">
          <h2 className="text-sm text-gray-500">Agents Active</h2>
          <p className="text-2xl font-bold">{Object.keys(stats.logs_per_agent).length}</p>
        </div>
      </div>

      {/* Agent Activity Bars */}
      <div className="bg-white p-4 shadow rounded mb-8">
        <h2 className="text-md font-semibold mb-4">Agent Activity</h2>
        <ul>
          {Object.entries(stats.logs_per_agent).map(([agent, count]) => (
            <li key={agent} className="mb-2">
              <div className="flex justify-between text-sm text-gray-700 mb-1">
                <span>{agent}</span>
                <span>{count} logs</span>
              </div>
              <div className="bg-gray-200 rounded h-2">
                <div
                  className="bg-blue-500 h-2 rounded"
                  style={{ width: `${(count / stats.total_logs) * 100}%` }}
                ></div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* GPT Audit Section */}
      <div className="mb-6 bg-white p-4 rounded shadow">
        <h2 className="text-lg font-bold mb-3">Run GPT Audit</h2>
        <div className="flex items-center gap-4 mb-2">
          <select
            className="border p-2 rounded"
            value={selectedAgent}
            onChange={(e) => setSelectedAgent(e.target.value)}
          >
            <option value="">Select an agent</option>
            {Object.keys(stats.logs_per_agent).map((agent) => (
              <option key={agent} value={agent}>
                {agent}
              </option>
            ))}
          </select>

          <input
            type="number"
            className="border p-2 rounded w-24"
            placeholder="Num Logs"
            value={numLogs}
            onChange={(e) => setNumLogs(parseInt(e.target.value))}
          />

          <button
            onClick={handleReasonRequest}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            disabled={!selectedAgent || loading}
          >
            {loading ? "Generating..." : "Generate Summary"}
          </button>
        </div>

        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

        {summary && (
          <div className="bg-gray-50 p-4 rounded border mt-3">
            <h3 className="text-md font-semibold mb-2">Audit Summary for {selectedAgent}</h3>
            <p className="text-gray-800 whitespace-pre-line">{summary}</p>
          </div>
        )}
      </div>

      {/* Logs Table */}
      <div className="bg-white p-4 rounded shadow max-h-[400px] overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4">Captured Logs</h2>
        <table className="w-full border">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-2 text-left">Agent</th>
              <th className="border p-2 text-left">User Input</th>
              <th className="border p-2 text-left">Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log, index) => (
              <tr key={index} className="odd:bg-white even:bg-gray-50">
                <td className="border p-2">{log.agent_name}</td>
                <td className="border p-2">{log.user_input}</td>
                <td className="border p-2">{new Date(log.timestamp).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default App;

