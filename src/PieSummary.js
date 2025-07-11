import React, { useEffect, useState } from "react";
import { ResponsivePie } from "@nivo/pie";

const PIE_ENDPOINT =
  "***REMOVED***";

const COLOR_MAP = [
  "#506886", // off
  "#5b7ebd", // on
  "#2d2c2f", // control
  "#658dc6",
  "#7a9dcb",
  "#93b4d7",
  "#a5b8d0",
  "#adbed3"
];


export default function PieSummary() {
  const [summaryData, setSummaryData] = useState([]);
  const [envId, setEnvId] = useState("");
  const [envOptions, setEnvOptions] = useState([]);

  useEffect(() => {
    fetch(PIE_ENDPOINT)
      .then((res) => res.json())
      .then((data) => {
        console.log("Lambda Pie Data:", data);
        setSummaryData(data);

        const uniqueEnvIds = [...new Set(data.map((d) => d.environmentId))];
        setEnvOptions(uniqueEnvIds);
        if (uniqueEnvIds.length > 0) setEnvId(uniqueEnvIds[0]);
      })
      .catch((err) => console.error("Error loading pie data:", err));
  }, []);

  if (!summaryData || summaryData.length === 0) return null;
  if (!envId) return null;

  const filtered = summaryData
    .filter((d) => d.environmentId === envId)
    .slice(0, 25);

  const pieData = filtered.map((item, index) => ({
    id: item.splitName,
    label: item.splitName,
    value: parseInt(item.unique_key_count, 10),
    color: COLOR_MAP[index % COLOR_MAP.length],
  }));

  return (
    <div style={{ height: "400px", width: "100%" }}>
      <div style={{ marginBottom: "10px" }}>
        <label htmlFor="envPicker" style={{ fontWeight: "bold" }}>
          Environment:
        </label>{" "}
        <select
          id="envPicker"
          value={envId}
          onChange={(e) => setEnvId(e.target.value)}
          style={{ padding: "4px 8px", fontSize: "14px" }}
        >
          {envOptions.map((env) => (
            <option key={env} value={env}>
              {env}
            </option>
          ))}
        </select>
      </div>

      <ResponsivePie
        data={pieData}
        margin={{ top: 40, right: 120, bottom: 80, left: 80 }}
        innerRadius={0.5}
        padAngle={1}
        cornerRadius={3}
        activeOuterRadiusOffset={8}
        colors={(d) => d.data.color}
        borderWidth={1}
        borderColor={{ from: "color", modifiers: [["darker", 0.2]] }}
        arcLinkLabelsSkipAngle={10}
        arcLinkLabelsTextColor="#555"
        arcLinkLabelsThickness={2}
        arcLinkLabelsColor={{ from: "color" }}
        arcLabelsSkipAngle={10}
        arcLabelsTextColor="#222"
        legends={[
          {
            anchor: "bottom",
            direction: "row",
            justify: false,
            translateY: 56,
            itemWidth: 100,
            itemHeight: 14,
            itemTextColor: "#333",
            symbolSize: 14,
            symbolShape: "circle",
          },
        ]}
      />
    </div>
  );
}
