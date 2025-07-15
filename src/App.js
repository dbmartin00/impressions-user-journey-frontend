import React, { useState, useEffect } from "react";
import JourneyView from "./JourneyView";
import PieSummary from "./PieSummary";
import ControlChart from "./ControlChart";
import DailyChart from "./DailyChart";
import axios from "axios";

const logo = "/harness_logo.jpg";

export default function App() {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [availableEnvs, setAvailableEnvs] = useState([]);
  const [selectedEnv, setSelectedEnv] = useState("");
  const [sortColumn, setSortColumn] = useState("utc");
  const [sortOrder, setSortOrder] = useState("desc");
  const [keyInput, setKeyInput] = useState("dmartin");
  const [daysInput, setDaysInput] = useState("30");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [summaryLoaded, setSummaryLoaded] = useState(false);
  const [controlLoaded, setControlLoaded] = useState(false);
  const [darkMode, setDarkMode] = useState(true);

  const allReady = summaryLoaded && controlLoaded;
  const theme = darkMode ? dark : light;

  useEffect(() => {
    handleQuery();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedEnv) {
      setFilteredData(data.filter((d) => d.environmentId === selectedEnv));
    }
  }, [selectedEnv, data]);

  const handleQuery = async () => {
    const trimmedKey = keyInput.trim();
    const days = parseInt(daysInput, 10);

    if (trimmedKey.length < 2) {
      setError("Key must be at least 2 characters.");
      return;
    }

    if (isNaN(days) || days < 1 || days > 90) {
      setError("Timespan must be a number between 1 and 90.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const summaryUrl = process.env.REACT_APP_PIE_ENDPOINT;
      const journeyUrl = `${process.env.REACT_APP_API_URL}?key=${encodeURIComponent(trimmedKey)}&days=${days}`;

      const [summaryRes, journeyRes] = await Promise.all([
        axios.get(summaryUrl),
        axios.get(journeyUrl),
      ]);

      const summary = summaryRes.data;
      const journey = journeyRes.data;

      const cleaned = journey.map((r) => ({
        ...r,
        splitName: r.splitName || r.splitname || r.flag,
      }));

      const envs = [...new Set(summary.map((r) => r.environmentId).filter(Boolean))];

      setData(cleaned);
      setAvailableEnvs(envs);

      if (envs.length > 0) {
        setSelectedEnv(envs[0]);
      }

      setSortColumn("utc");
      setSortOrder("desc");
    } catch (err) {
      console.error("Fetch error:", err.message, err.response?.data || err);
      setError("Failed to fetch data.");
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (column) => {
    if (column === sortColumn) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortOrder("asc");
    }
  };

  // Inject spinning keyframes exactly once
  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  return (
    <div style={{ ...theme.app }}>
      {!allReady && (
        <div style={loadingOverlay}>
          <div style={spinnerStyle}></div>
          <div>Loading Impressions Dashboard…</div>
        </div>
      )}

      <header style={{ ...theme.header }}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <img src={logo} alt="Harness" style={{ height: "40px", marginRight: "12px" }} />
          <h1 style={theme.h1}>Impressions Journey</h1>
        </div>
        <div>
          {availableEnvs.length > 0 && (
            <select
              value={selectedEnv}
              onChange={(e) => setSelectedEnv(e.target.value)}
              style={theme.input}
            >
              <option value="">(Select Environment)</option>
              {availableEnvs.map((env) => (
                <option key={env} value={env}>
                  {env}
                </option>
              ))}
            </select>
          )}
          <button onClick={() => setDarkMode(!darkMode)} style={theme.toggleBtn}>
            {darkMode ? "☀ Light Mode" : "🌙 Dark Mode"}
          </button>
        </div>
      </header>

      {selectedEnv === "" && (
        <div style={{ padding: "2em", color: "#999", textAlign: "center", fontSize: "1.2em" }}>
          Please select an environment to view the report.
        </div>
      )}

      <div style={rowStyle}>
        <section style={{ ...theme.section, flex: 1, marginRight: "20px" }}>
          <h2 style={theme.h2}>📊 Overall Impressions Summary</h2>
          <PieSummary environmentId={selectedEnv} onLoaded={() => setSummaryLoaded(true)} />
        </section>

        <section style={{ ...theme.section, flex: 1 }}>
          <h2 style={theme.h2}>🧪 Control Treatments by Flag</h2>
          <ControlChart environmentId={selectedEnv} onLoaded={() => setControlLoaded(true)} />
        </section>
      </div>

      <section style={theme.section}>
        <h2 style={theme.h2}>📈 Daily Impressions by Flag</h2>
        <DailyChart environmentId={selectedEnv} />
      </section>

      <section style={{ ...theme.section, ...theme.journey }}>
        <h2 style={theme.h2}>🔍 User Journey Viewer</h2>
        <div style={{ marginBottom: "16px", textAlign: "center" }}>
          <input
            type="text"
            placeholder="key"
            value={keyInput}
            onChange={(e) => setKeyInput(e.target.value)}
            style={theme.input}
          />
          <input
            type="number"
            placeholder="days"
            value={daysInput}
            onChange={(e) => setDaysInput(e.target.value)}
            style={{ ...theme.input, width: "70px" }}
          />
          <button
            onClick={handleQuery}
            disabled={loading}
            style={{
              ...theme.button,
              opacity: loading ? 0.6 : 1,
              cursor: loading ? "wait" : "pointer",
            }}
          >
            {loading ? "Querying…" : "Query"}
          </button>

          {error && <div style={theme.error}>{error}</div>}
          {loading && !error && <div style={theme.loading}>Running Athena query…</div>}
        </div>

        <JourneyView
          sortColumn={sortColumn}
          sortOrder={sortOrder}
          onSort={handleSort}
          darkMode={darkMode}
          environmentId={selectedEnv}
        />
      </section>
    </div>
  );
}

const light = {
  app: { fontFamily: "sans-serif", padding: "20px", backgroundColor: "#f8f9fa", color: "#222" },
  section: {
    backgroundColor: "#fff",
    padding: "20px",
    marginBottom: "30px",
    borderRadius: "8px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
    width: "80%",
    marginLeft: "auto",
    marginRight: "auto",
  },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "40px" },
  h1: { margin: 0, fontSize: "28px", color: "#333" },
  h2: { marginTop: 0, color: "#222" },
  input: { marginRight: "8px", padding: "6px", borderRadius: "4px", border: "1px solid #ccc" },
  button: { padding: "6px 12px" },
  toggleBtn: {
    fontSize: "14px",
    background: "none",
    border: "1px solid #ccc",
    borderRadius: "4px",
    padding: "6px 10px",
    cursor: "pointer",
    marginLeft: "10px",
  },
  error: { color: "red", marginTop: "10px" },
  loading: { marginTop: "10px", color: "#666" },
  journey: { backgroundColor: "#e6e6e6", borderRadius: "8px", padding: "20px" },
};

const dark = {
  ...light,
  app: { ...light.app, backgroundColor: "#121212", color: "#e0e0e0" },
  section: { ...light.section, backgroundColor: "#1e1e1e", boxShadow: "0 2px 8px rgba(0,0,0,0.3)" },
  h1: { ...light.h1, color: "#e0e0e0" },
  h2: { ...light.h2, color: "#e0e0e0" },
  input: { ...light.input, backgroundColor: "#333", color: "#e0e0e0", border: "1px solid #555" },
  button: { ...light.button, backgroundColor: "#333", color: "#e0e0e0", border: "1px solid #555" },
  toggleBtn: { ...light.toggleBtn, border: "1px solid #888", color: "#e0e0e0" },
  journey: { ...light.journey, backgroundColor: "#2a2a2a" },
};

const rowStyle = {
  display: "flex",
  flexWrap: "wrap",
  justifyContent: "center",
  marginBottom: "30px",
};

const loadingOverlay = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0, 0, 0, 0.85)",
  zIndex: 9999,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "22px",
  color: "#e0e0e0",
  fontFamily: "sans-serif",
};

const spinnerStyle = {
  border: "6px solid #444",
  borderTop: "6px solid #e0e0e0",
  borderRadius: "50%",
  width: "48px",
  height: "48px",
  animation: "spin 1s linear infinite",
  marginBottom: "20px",
};
