import React, { useState } from "react";
import JourneyView from "./JourneyView";
import PieSummary from "./PieSummary";

const API_URL = process.env.REACT_APP_API_URL;

function SortArrow({ order }) {
  return <span>{order === "asc" ? " ▲" : " ▼"}</span>;
}

export default function App() {
  const [data, setData] = useState([]);
  const [sortColumn, setSortColumn] = useState("utc");
  const [sortOrder, setSortOrder] = useState("desc");
  const [keyInput, setKeyInput] = useState("dmartin");
  const [daysInput, setDaysInput] = useState("30");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
    <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <h1 style={{ textAlign: "center" }}>Impressions Explorer</h1>

      {/* SECTION 1: OVERALL SUMMARY */}
      <section
        style={{
          backgroundColor: "#f8f9fa",
          padding: "20px",
          marginBottom: "30px",
          borderRadius: "8px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
        }}
      >
        <h2 style={{ marginTop: 0 }}>📊 Overall Impressions Summary</h2>
        <PieSummary />
      </section>

      {/* SECTION 2: USER JOURNEY */}
      <section
        style={{
          backgroundColor: "#fff",
          padding: "20px",
          borderRadius: "8px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
        }}
      >
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
