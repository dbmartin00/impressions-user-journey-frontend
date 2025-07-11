// JourneyView.js
import React from "react";
import SparkLines from "./SparkLines";

export default function JourneyView({ data, sortColumn, sortOrder, handleSort }) {
  if (!data || data.length === 0) {
    return null; // nothing to render
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
          }}
        >
          <thead>
            <tr>
              {headers.map((col) => (
                <th
                  key={col}
                  onClick={() => handleSort(col)}
                  style={{
                    cursor: "pointer",
                    borderBottom: "1px solid #ccc",
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
                      borderBottom: "1px solid #eee",
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

        <SparkLines impressions={sortedData} />
      </div>
    </div>
  );
}
