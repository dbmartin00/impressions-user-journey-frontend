// src/PieSummary.js
import React, { useEffect, useState } from "react";
import { ResponsivePie } from "@nivo/pie";
import { COLOR_MAP } from "./colors";
import axios from "axios";

const MTK_API_URL = "https://v2izbwoeqbbxxuim2urfyrlspi0fwzez.lambda-url.us-west-2.on.aws/";

export default function PieSummary({ environmentId, onLoaded }) {
  const [data, setData] = useState([]);

  useEffect(() => {
    if (!environmentId) return;

    axios.get(MTK_API_URL)
      .then((res) => {
        const filtered = res.data.filter(
          (item) => item.environmentId === environmentId
        );
        setData(filtered);
      })
      .catch((err) => {
        console.error("Failed to load MTK summary data:", err);
        setData([]);
      })
      .finally(() => {
        if (onLoaded) onLoaded();
      });
  }, [environmentId, onLoaded]);

  if (!data || data.length === 0) {
    return <div style={{ padding: "1em", color: "#666" }}>No summary data available…</div>;
  }

  const pieData = data.slice(0, 25).map((item, index) => ({
    id: item.splitName || item.splitname || item.flag,
    label: item.splitName || item.splitname || item.flag,
    value: parseInt(item.unique_key_count, 10),
    color: COLOR_MAP[index % COLOR_MAP.length],
  }));

  return (
    <div style={{ height: "400px", width: "100%" }}>
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
        arcLinkLabelsTextColor="#ccc"
        arcLinkLabelsThickness={2}
        arcLinkLabelsColor={{ from: "color" }}
        arcLabelsSkipAngle={10}
        arcLabelsTextColor="#ddd"
        legends={[]}
      />
    </div>
  );
}
