// src/ControlChart.js
import React, { useEffect, useState } from "react";
import { ResponsiveBar } from "@nivo/bar";
import axios from "axios";
import { COLOR_MAP } from "./colors";

const CONTROL_API = "https://nccehglheg7pfy422dhmok5wu40rzwow.lambda-url.us-west-2.on.aws/";

export default function ControlChart({ environmentId, onLoaded }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!environmentId) return;

    setLoading(true);
    axios
      .get(CONTROL_API)
      .then((res) => {
        console.log("raw control chart data:", res.data);

        const cleaned = res.data.map((item, index) => {
          const raw = parseInt(item.control_count, 10);
          const count = isNaN(raw) ? 0 : raw;

          return {
            flag: item.splitName || item.splitname || item.flag || `Flag ${index + 1}`,
            count,
            color: COLOR_MAP[index % COLOR_MAP.length],
          };
        });

        setData(cleaned);
      })
      .catch((err) => {
        console.error("❌ Failed to load control chart data:", err);
        setData([]);
      })
      .finally(() => {
        setLoading(false);
        if (onLoaded) onLoaded();
      });
  }, [environmentId, onLoaded]);

  if (loading) {
    return <div style={{ padding: "1em", color: "#666" }}>Loading control chart…</div>;
  }

  if (!data || data.length === 0) {
    return <div style={{ padding: "1em", color: "#666" }}>No control chart data available…</div>;
  }

  return (
    <div style={{ height: `${data.length * 35 + 100}px`, width: "100%" }}>
      <ResponsiveBar
        data={data}
        keys={["count"]}
        indexBy="flag"
        layout="horizontal"
        margin={{ top: 20, right: 30, bottom: 50, left: 120 }}
        padding={0.3}
        colors={({ data }) => data.color}
        axisBottom={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          tickColor: "#ccc",
          legend: "Control Count",
          legendPosition: "middle",
          legendOffset: 40,
          style: {
            fill: "#ccc",
          }
        }}
        axisLeft={{
          tickSize: 5,
          tickPadding: 5,
          tickColor: "#ccc",
          style: {
            fill: "#ccc",
          }
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
        }}
        labelSkipWidth={100}
        labelTextColor="#fff"
      />
    </div>
  );
}
