// src/DailyChart.js
import React, { useEffect, useState } from "react";
import { ResponsiveScatterPlot } from "@nivo/scatterplot";
import axios from "axios";
import { COLOR_MAP } from "./colors";

const DAILY_API = "https://focplr5qecine545onui7xrtmy0helse.lambda-url.us-west-2.on.aws/";

export default function DailyChart() {
  const [rawData, setRawData] = useState([]);
  const [data, setData] = useState([]);
  const [flags, setFlags] = useState([]);
  const [selectedFlag, setSelectedFlag] = useState("All");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    axios
      .get(DAILY_API)
      .then((res) => {
        console.log("✅ Raw daily data:", res.data);

        const grouped = {};
        const totalImpressions = {};

        res.data.forEach((entry) => {
          const name =
            entry.spltName || entry.splitName || entry.splitname || entry.flag || "Unknown";
          const date = entry.impression_date.split(" ")[0];
          const count = parseInt(entry.impression_count, 10) || 0;

          if (!grouped[name]) grouped[name] = [];
          grouped[name].push({ x: date, y: count });

          totalImpressions[name] = (totalImpressions[name] || 0) + count;
        });

        const structured = Object.entries(grouped).map(([name, points]) => ({
          id: name,
          data: points.sort((a, b) => new Date(a.x) - new Date(b.x)),
        }));

        const sortedFlags = Object.entries(totalImpressions)
          .sort((a, b) => b[1] - a[1])
          .map(([name]) => name);

        setRawData(structured);
        setFlags(sortedFlags);
        setSelectedFlag("All");
        setData(structured);
      })
      .catch((err) => {
        console.error("❌ Failed to load daily chart data:", err);
        setRawData([]);
        setData([]);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (selectedFlag === "All") {
      setData(rawData);
    } else {
      setData(rawData.filter((series) => series.id === selectedFlag));
    }
  }, [selectedFlag, rawData]);

  if (loading) {
    return <div style={{ padding: "1em", color: "#666" }}>Loading daily chart…</div>;
  }

  if (!data || data.length === 0) {
    return <div style={{ padding: "1em", color: "#666" }}>No daily data available…</div>;
  }

  // ⏱ Create 7 evenly spaced ticks
  const allDates = Array.from(new Set(data.flatMap((s) => s.data.map((d) => d.x))));
  const sortedDates = allDates.sort((a, b) => new Date(a) - new Date(b));
  const tickCount = 7;
  const tickInterval = Math.max(1, Math.floor((sortedDates.length - 1) / (tickCount - 1)));
  const tickValues = Array.from({ length: tickCount }, (_, i) =>
    sortedDates[Math.min(i * tickInterval, sortedDates.length - 1)]
  );

  return (
    <div style={{ width: "100%" }}>
      <div style={{ marginBottom: "1em", color: "#ccc" }}>
        <label htmlFor="flag-select" style={{ marginRight: "8px" }}>
          Filter by flag:
        </label>
        <select
          id="flag-select"
          value={selectedFlag}
          onChange={(e) => setSelectedFlag(e.target.value)}
          style={{
            padding: "6px 10px",
            borderRadius: "4px",
            backgroundColor: "#333",
            color: "#eee",
            border: "1px solid #555",
            fontSize: "1em",
          }}
        >
          <option value="All">All</option>
          {flags.map((flag) => (
            <option key={flag} value={flag}>
              {flag}
            </option>
          ))}
        </select>
      </div>

      <div style={{ height: "400px", width: "100%" }}>
        <ResponsiveScatterPlot
          data={data}
          margin={{ top: 20, right: 40, bottom: 60, left: 60 }}
          xScale={{ type: "point" }}
          yScale={{ type: "linear", min: "auto", max: "auto" }}
          colors="#c5c5c5"
          axisBottom={{
            tickValues,
            tickRotation: 45,
            tickSize: 5,
            tickPadding: 5,
            legend: "Date",
            legendOffset: 40,
            legendPosition: "middle",
            tickColor: "#ccc",
          }}
          axisLeft={{
            legend: "Count",
            legendOffset: -40,
            legendPosition: "middle",
            tickColor: "#ccc",
          }}
          theme={{
            axis: {
              ticks: {
                line: { stroke: "#ccc" },
                text: { fill: "#ccc" },
              },
              domain: {
                line: { stroke: "#ccc" },
              },
            },
            grid: {
              line: { stroke: "transparent" },
            },
            background: "transparent",
          }}
          nodeSize={8}
          tooltip={({ node }) => (
            <div
              style={{
                background: "#222",
                color: "#fff",
                padding: "6px 9px",
                borderRadius: "4px",
                fontSize: "0.85em",
              }}
            >
              <strong>{node.serieId}</strong>
              <br />
              Date: {node.data.x}
              <br />
              Count: {node.data.y}
            </div>
          )}
          useMesh={true}
        />
      </div>
    </div>
  );
}
