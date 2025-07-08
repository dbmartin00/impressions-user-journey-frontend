import React, { useState } from "react";

const API_URL = process.env.REACT_APP_API_URL;

function SortArrow({ order }) {
  return <span>{order === "asc" ? " ▲" : " ▼"}</span>;
}

export default function AthenaTable() {
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
        setData(result);
        setSortColumn("utc");
        setSortOrder("desc");
      })
      .catch((err) => {
        console.error("Fetch error:", err);
        setError("Failed to fetch data.");
      })
      .finally(() => setLoading(false));
  };

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

  const handleSort = (column) => {
    if (column === sortColumn) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortOrder("asc");
    }
  };

  const headers = data.length ? Object.keys(data[0]) : [];

  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif", textAlign: "center" }}>
      <h2>Impressions User Journey</h2>

      <div style={{ marginBottom: "16px" }}>
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
          <div style={{ marginTop: "10px", color: "#666" }}>Running Athena query…</div>
        )}
      </div>

      {data.length > 0 && (
        <table
          style={{
            borderCollapse: "collapse",
            margin: "0 auto",
            minWidth: "600px",
            maxWidth: "80%",
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
                  {sortColumn === col && <SortArrow order={sortOrder} />}
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
      )}
    </div>
  );
}

