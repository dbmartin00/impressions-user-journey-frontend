// src/JourneyView.js
import React, { useEffect, useState } from "react";
import SparkLines from "./SparkLines";
import axios from "axios";

const JOURNEY_API = process.env.REACT_APP_API_URL;

export default function JourneyView({ sortColumn, sortOrder, onSort, darkMode, environmentId }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!environmentId) {
      setData([]);
      return;
    }

    console.log("🔍 useEffect in JourneyView");
    setLoading(true);

    axios
      .get(JOURNEY_API)
      .then((res) => {
        console.log("📦 Journey data received:", res.data);
        const allData = res.data || [];
        const filtered = allData.filter(
          (row) => row.environmentId === environmentId
        );
        setData(filtered);
      })
      .catch((err) => {
        console.error("❌ Failed to load journey data:", err);
        setData([]);
      })
      .finally(() => setLoading(false));
  }, [environmentId]);

  if (!environmentId) {
    return <div style={{ padding: "1em", color: "#888" }}>Report inactive (no environment selected).</div>;
  }

  if (loading) {
    return <div style={{ padding: "1em", color: "#ccc" }}>Loading user journeys…</div>;
  }

  if (!data || data.length === 0) {
    return <div style={{ padding: "1em", color: "#666" }}>No user journey data available…</div>;
  }

  const headers = Object.keys(data[0]);

  const sortedData = [...data].sort((a, b) => {
    const valA = a[sortColumn];
    const valB = b[sortColumn];
    if (!valA || !valB) return 0;
    if (sortOrder === "asc") {
      return valA < valB ? -1 : valA > valB ? 1 : 0;
    } else {
      return valA > valB ? -1 : valA < valB ? 1 : 0;
    }
  });

  return (
    <div style={{ display: "flex", alignItems: "flex-start", flexDirection: "column" }}>
      <div style={{ display: "flex", alignItems: "flex-start", width: "100%" }}>
        <table
          style={{
            borderCollapse: "collapse",
            minWidth: "600px",
            maxWidth: "50%",
            marginRight: "20px",
            color: darkMode ? "#ccc" : "#333",
          }}
        >
          <thead>
            <tr>
              {headers.map((col) => (
                <th
                  key={col}
                  onClick={() => onSort(col)}
                  style={{
                    cursor: "pointer",
                    borderBottom: "1px solid #888",
                    padding: "8px",
                    textAlign: "left",
                  }}
                >
                  {col}
                  {sortColumn === col && (
                    <span>{sortOrder === "asc" ? " ▲" : " ▼"}</span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedData.map((row, idx) => (
              <tr key={idx}>
                {headers.map((col) => (
                  <td
                    key={col}
                    style={{
                      padding: "8px",
                      borderBottom: "1px solid #444",
                      fontFamily: "monospace",
                    }}
                  >
                    {row[col]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        {sortedData.length > 0 && <SparkLines impressions={sortedData} darkMode={darkMode} />}
      </div>
    </div>
  );
}
