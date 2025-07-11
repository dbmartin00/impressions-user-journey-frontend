// src/PieSummary.js
import React, { useEffect, useState } from "react";
import { ResponsivePie } from "@nivo/pie";
import axios from "axios";
import { COLOR_MAP } from "./colors";

const PIE_ENDPOINT = process.env.REACT_APP_PIE_ENDPOINT;

export default function PieSummary({ onLoaded }) {
  console.log('PieSummary onLoaded - ' + onLoaded);
  const [summaryData, setSummaryData] = useState([]);
  const [envId, setEnvId] = useState("");
  const [envOptions, setEnvOptions] = useState([]);

  useEffect(() => {
    console.log('PieSummary useEffect');
    const fetchData = async () => {
      // console.log("PIE_ENDPOINT =", PIE_ENDPOINT);
      try {
        const res = await axios.get(PIE_ENDPOINT);
        console.log("Lambda Pie Data:", res.data);
        const data = res.data;
        setSummaryData(data);

        const uniqueEnvIds = [...new Set(data.map((d) => d.environmentId))];
        setEnvOptions(uniqueEnvIds);
        if (uniqueEnvIds.length > 0) setEnvId(uniqueEnvIds[0]);
      } catch (err) {
        console.error("Error loading pie data:", err);
      } finally {
        console.log("PieSummary finished loading");
        if (onLoaded) onLoaded();
      }
    };

    fetchData();
  }, [onLoaded]);

  // if (!summaryData || summaryData.length === 0 || !envId) return null;
  if (!summaryData || summaryData.length === 0 || !envId) {
    return <div style={{ padding: "1em", color: "#666" }}>Loading summary data…</div>;
  }

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
