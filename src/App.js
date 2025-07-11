import React, { useState, useEffect } from "react";
import JourneyView from "./JourneyView";
import PieSummary from "./PieSummary";
import ControlChart from "./ControlChart";
import DailyChart from "./DailyChart";

const API_URL = process.env.REACT_APP_API_URL;

export default function App() {
  const [data, setData] = useState([]);
  const [sortColumn, setSortColumn] = useState("utc");
  const [sortOrder, setSortOrder] = useState("desc");
  const [keyInput, setKeyInput] = useState("dmartin");
  const [daysInput, setDaysInput] = useState("30");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [summaryLoaded, setSummaryLoaded] = useState(false);
  const [controlLoaded, setControlLoaded] = useState(false);

  const allReady = summaryLoaded && controlLoaded;

  useEffect(() => {
    console.log("Summary loaded:", summaryLoaded);
    console.log("Control loaded:", controlLoaded);
  }, [summaryLoaded, controlLoaded]);

  const handleQuery = () => {
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
    const queryParams = `?key=${encodeURIComponent(trimmedKey)}&days=${days}`;

    fetch(API_URL + queryParams)
      .then((res) => res.json())
      .then((result) => {
        const cleaned = result.map((r) => ({
          ...r,
          splitName: r.splitName || r.splitname || r.flag,
        }));
        console.log("Sample cleaned impression:", cleaned[0]);
        setData(cleaned);
        setSortColumn("utc");
        setSortOrder("desc");
      })
      .catch((err) => {
        console.error("Fetch error:", err);
        setError("Failed to fetch data.");
      })
      .finally(() => setLoading(false));
  };

  const handleSort = (column) => {
    if (column === sortColumn) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortOrder("asc");
    }
  };

  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif", position: "relative" }}>
      {!allReady && (
        <div style={{
          position: "fixed",
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: "rgba(255, 255, 255, 0.8)",
          zIndex: 9999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "20px",
          color: "#555"
        }}>
          🔄 Loading Impressions Dashboard...
        </div>
      )}

      <h1 style={{ textAlign: "center" }}>Impressions Explorer</h1>

      <section style={sectionStyle}>
        <h2 style={{ marginTop: 0 }}>📊 Overall Impressions Summary</h2>
        <PieSummary onLoaded={() => setSummaryLoaded(true)} />
      </section>

      <section style={sectionStyle}>
        <h2 style={{ marginTop: 0 }}>🧪 Control Treatments by Flag</h2>
        <ControlChart onLoaded={() => setControlLoaded(true)} />
      </section>

      <section style={sectionStyle}>
        <h2 style={{ marginTop: 0 }}>📈 Daily Impressions by Flag</h2>
        <DailyChart />
      </section>

      <section style={sectionStyle}>
        <h2 style={{ marginTop: 0 }}>🔍 User Journey Viewer</h2>
        <div style={{ marginBottom: "16px", textAlign: "center" }}>
          <input
            type="text"
            placeholder="key"
            value={keyInput}
            onChange={(e) => setKeyInput(e.target.value)}
            style={{ marginRight: "8px", padding: "6px" }}
          />
          <input
            type="number"
            placeholder="days"
            value={daysInput}
            onChange={(e) => setDaysInput(e.target.value)}
            style={{ marginRight: "8px", padding: "6px", width: "70px" }}
          />
          <button
            onClick={handleQuery}
            disabled={loading}
            style={{ padding: "6px 12px", opacity: loading ? 0.6 : 1 }}
          >
            {loading ? "Querying…" : "Query"}
          </button>
          {error && (
            <div style={{ color: "red", marginTop: "10px" }}>{error}</div>
          )}
          {loading && !error && (
            <div style={{ marginTop: "10px", color: "#666" }}>
              Running Athena query…
            </div>
          )}
        </div>

        {data.length > 0 && (
          <JourneyView
            data={data}
            sortColumn={sortColumn}
            sortOrder={sortOrder}
            onSort={handleSort}
          />
        )}
      </section>
    </div>
  );
}

const sectionStyle = {
  backgroundColor: "#fff",
  padding: "20px",
  marginBottom: "30px",
  borderRadius: "8px",
  boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
};
