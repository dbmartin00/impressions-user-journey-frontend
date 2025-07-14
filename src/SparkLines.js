import React from "react";
import "./SparkLines.css";
import { COLOR_MAP } from "./colors";

export default function SparkLines({ impressions, darkMode }) {
  if (!impressions || impressions.length === 0) {
    return <div className="sparkline-stack">No impression data for this environment.</div>;
  }

  const splitMap = {};

  for (const row of impressions) {
    const name = row.splitName || row.splitname || row.flag || "Unknown";
    const utc = row.utc;
    const treatment = row.treatment;
    if (!splitMap[name]) splitMap[name] = [];
    splitMap[name].push({ utc, treatment });
  }

  const sortedSplits = Object.entries(splitMap)
    .map(([splitName, entries]) => {
      entries.sort((a, b) => new Date(a.utc) - new Date(b.utc));
      let changes = 0;
      let last = null;
      for (const e of entries) {
        if (e.treatment !== last) {
          changes++;
          last = e.treatment;
        }
      }
      return { splitName, entries, changes };
    })
    .sort((a, b) => b.changes - a.changes);

  const allTimes = impressions.map((i) => new Date(i.utc).getTime());
  const minTime = Math.min(...allTimes);
  const maxTime = Math.max(...allTimes);
  const timeRange = maxTime - minTime || 1; // prevent divide-by-zero

  const ticks = [];
  for (let i = 0; i < 5; i++) {
    const t = new Date(minTime + (timeRange * i) / 4);
    ticks.push(t.toISOString().split("T")[0]);
  }

  return (
    <div className="sparkline-stack" style={{ maxHeight: "60vh", overflowY: "auto" }}>
      {sortedSplits.map(({ splitName, entries }) => {
        const segments = [];
        let lastTime = minTime;
        let lastTreatment = null;

        const treatmentColors = {};
        let colorIndex = 3; // Start after off/on/control

        const getTreatmentStyle = (treatment) => {
          if (treatment === "off") return { color: COLOR_MAP[0], crosshatch: false };
          if (treatment === "on") return { color: COLOR_MAP[1], crosshatch: false };
          if (treatment === "control") return { color: COLOR_MAP[2], crosshatch: false };

          if (!(treatment in treatmentColors)) {
            if (colorIndex < COLOR_MAP.length) {
              treatmentColors[treatment] = {
                color: COLOR_MAP[colorIndex++],
                crosshatch: false
              };
            } else {
              treatmentColors[treatment] = {
                color: "#888", // fallback hatch color
                crosshatch: true
              };
            }
          }
          return treatmentColors[treatment];
        };

        for (const { utc, treatment } of entries) {
          const time = new Date(utc).getTime();
          if (lastTreatment !== null) {
            const { color, crosshatch } = getTreatmentStyle(lastTreatment);
            segments.push({
              left: ((lastTime - minTime) / timeRange) * 100,
              width: ((time - lastTime) / timeRange) * 100,
              color,
              crosshatch,
              treatment: lastTreatment
            });
          }
          lastTime = time;
          lastTreatment = treatment;
        }

        if (lastTreatment && lastTime < maxTime) {
          const { color, crosshatch } = getTreatmentStyle(lastTreatment);
          segments.push({
            left: ((lastTime - minTime) / timeRange) * 100,
            width: ((maxTime - lastTime) / timeRange) * 100,
            color,
            crosshatch,
            treatment: lastTreatment
          });
        }

        return (
          <div key={splitName} className="sparkline-row">
            <div className="sparkline-label">{splitName}</div>
            <div className="sparkline-bar">
              {segments.map((seg, i) => (
                <div
                  key={i}
                  className={`sparkline-segment ${seg.crosshatch ? "crosshatch" : ""}`}
                  style={{
                    left: `${seg.left}%`,
                    width: `${seg.width}%`,
                    backgroundColor: seg.color
                  }}
                  title={`Split: ${splitName} | Treatment: ${seg.treatment}`}
                  aria-label={`Segment for ${splitName} with treatment ${seg.treatment}`}
                />
              ))}
            </div>
          </div>
        );
      })}

      <div
        className="sparkline-x-axis"
        style={{ color: darkMode ? "#ccc" : "#333" }}
      >
        {ticks.map((label, i) => (
          <div key={i} className="sparkline-x-tick">
            {label}
          </div>
        ))}
      </div>
    </div>
  );
}
