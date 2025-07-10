import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";

// Build a unique numeric level per treatment
function buildTreatmentMap(treatments) {
  const map = {};
  let level = 0;
  for (const t of treatments) {
    if (!(t in map)) {
      map[t] = level++;
    }
  }
  return map;
}

export default function TreatmentTimelineChart({ impressions }) {
  const flagList = Array.from(new Set(impressions.map((i) => i.flag)));
  const flagIndexMap = Object.fromEntries(flagList.map((f, i) => [f, i]));

  const allTimes = new Set();
  const unified = [];

  // Organize treatments by time
  for (const impression of impressions) {
    const { flag, utc, treatment } = impression;
    allTimes.add(utc);
  }

  const sortedTimes = Array.from(allTimes).sort();
  const rows = {};

  for (const time of sortedTimes) {
    rows[time] = { utc: time };
  }

  for (const flag of flagList) {
    const flagImpressions = impressions
      .filter((i) => i.flag === flag)
      .sort((a, b) => new Date(a.utc) - new Date(b.utc));

    const treatmentMap = buildTreatmentMap(flagImpressions.map((i) => i.treatment));
    let last = null;

    for (const impression of flagImpressions) {
      const { utc, treatment } = impression;
      const base = flagIndexMap[flag] * 10;
      const level = treatmentMap[treatment];
      const y = base + level;
      if (last === y) continue;
      last = y;
      if (!rows[utc]) rows[utc] = { utc };
      rows[utc][flag] = y;
    }
  }

  const data = Object.values(rows);

  return (
    <div style={{ marginTop: 30 }}>
      <h3>Flag Treatment Timeline</h3>
      <LineChart
        width={900}
        height={flagList.length * 80}
        data={data}
        margin={{ top: 10, right: 30, left: 50, bottom: 30 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="utc"
          tickFormatter={(str) => str.split("T")[0]}
          interval="preserveStartEnd"
        />
        <YAxis
          domain={[0, flagList.length * 10]}
          tickFormatter={(val) => {
            const idx = Math.floor(val / 10);
            return flagList[idx] || '';
          }}
        />
        <Tooltip />
        <Legend />
        {flagList.map((flag) => (
          <Line
            key={flag}
            type="stepAfter"
            dataKey={flag}
            strokeWidth={2}
            dot={false}
          />
        ))}
      </LineChart>
    </div>
  );
}
