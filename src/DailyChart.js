import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer
} from "recharts";
import { COLOR_MAP } from "./colors";

const DAILY_API_URL = process.env.REACT_APP_DAILY_ENDPOINT;

export default function DailyChart() {
  // const [rawData, setRawData] = useState([]);
  const [, setRawData] = useState([]);

  const [chartData, setChartData] = useState([]);
  const [flagNames, setFlagNames] = useState([]);
  const [selectedFlag, setSelectedFlag] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(DAILY_API_URL)
      .then((res) => res.json())
      .then((raw) => {
        setRawData(raw);

        // Aggregate total count per flag
        const flagTotals = {};
        for (const row of raw) {
          const flag = row.splitName;
          const count = parseInt(row.impression_count, 10);
          flagTotals[flag] = (flagTotals[flag] || 0) + count;
        }

        const sortedFlags = Object.entries(flagTotals)
          .sort((a, b) => b[1] - a[1])
          .map(([flag]) => flag);

        setFlagNames(sortedFlags);
        setSelectedFlag("All");

        // Format data for "All"
        const grouped = {};
        for (const row of raw) {
          const date = row.impression_date.slice(0, 10);
          const flag = row.splitName;
          const count = parseInt(row.impression_count, 10);
          if (!grouped[date]) grouped[date] = { date, All: 0 };
          grouped[date][flag] = count;
          grouped[date]["All"] += count;
        }

        const final = Object.values(grouped);
        setChartData(final);
      })
      .catch((err) => console.error("Failed to load daily impressions", err))
      .finally(() => setLoading(false));
  }, []);

  const handleSelect = (e) => {
    setSelectedFlag(e.target.value);
  };

  const chartReady = chartData.length > 0 && !loading;

  return (
    <div style={{ width: "100%", height: 500 }}>
      <div style={{ marginBottom: "10px", fontSize: "14px" }}>
        <label style={{ fontWeight: "bold", marginRight: "8px" }}>
          Flag:
        </label>
        <select
          value={selectedFlag}
          onChange={handleSelect}
          style={{ padding: "4px 8px" }}
        >
          <option value="All">All</option>
          {flagNames.map((flag) => (
            <option key={flag} value={flag}>
              {flag}
            </option>
          ))}
        </select>
      </div>

      {loading && (
        <div style={{ color: "#666", paddingTop: "10px" }}>
          Loading daily impressions…
        </div>
      )}

      {chartReady && (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 20, right: 30, bottom: 5, left: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey={selectedFlag}
              stroke={COLOR_MAP[1]} // "on" color
              strokeWidth={2}
              dot={{ r: 2 }}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

