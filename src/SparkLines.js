import React from "react";
import "./SparkLines.css";

// Finalized color rules
const COLOR_MAP = {
  off: "#dc5b62",
  on: "#8cadd3",
  control: "#2d2c2f",
};

const EXTRA_COLORS = [
  "#be9cc1",
  "#ead3ae",
  "#f7d000",
  "#ffa64f",
  "#f88f58",
];

const OVERFLOW_COLOR = "#d9afca";

export default function SparkLines({ impressions }) {
  const splitMap = {};

  for (const { splitName, utc, treatment } of impressions) {
    if (!splitMap[splitName]) splitMap[splitName] = [];
    splitMap[splitName].push({ utc, treatment });
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
  const timeRange = maxTime - minTime;

  const ticks = [];
  for (let i = 0; i < 5; i++) {
    const t = new Date(minTime + (timeRange * i) / 4);
    ticks.push(t.toISOString().split("T")[0]);
  }

  return (
    <div className="sparkline-stack">
      {sortedSplits.map(({ splitName, entries }) => {
        const segments = [];
        let lastTime = minTime;
        let lastTreatment = null;

        const uniqueTreatments = [...new Set(entries.map((e) => e.treatment))];
        const paletteMap = {};
        let colorIndex = 0;

        const getTreatmentStyle = (treatment) => {
          if (COLOR_MAP[treatment]) {
            return { color: COLOR_MAP[treatment], crosshatch: false };
          }
          if (!(treatment in paletteMap)) {
            if (colorIndex < EXTRA_COLORS.length) {
              paletteMap[treatment] = {
                color: EXTRA_COLORS[colorIndex++],
                crosshatch: false,
              };
            } else {
              paletteMap[treatment] = {
                color: OVERFLOW_COLOR,
                crosshatch: true,
              };
            }
          }
          return paletteMap[treatment];
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
              treatment: lastTreatment,
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
            treatment: lastTreatment,
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
                    backgroundColor: seg.color,
                  }}
                  title={`Split: ${splitName}\nTreatment: ${seg.treatment}`}
                />
              ))}
            </div>
          </div>
        );
      })}

      <div className="sparkline-x-axis">
        {ticks.map((label, i) => (
          <div key={i} className="sparkline-x-tick">{label}</div>
        ))}
      </div>
    </div>
  );
}
