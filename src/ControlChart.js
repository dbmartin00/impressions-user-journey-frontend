// ControlChart.js
import { COLOR_MAP } from "./colors";
import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  LabelList
} from "recharts";
import axios from "axios";

const CONTROL_CHART_API_URL = process.env.REACT_APP_CONTROL_ENDPOINT;

export default function ControlChart({ onLoaded }) {
  const [data, setData] = useState([]);

  useEffect(() => {
    axios.get(CONTROL_CHART_API_URL)
      .then((res) => setData(res.data))
      .catch((err) => console.error("Failed to load control counts", err))
      .finally(() => {
        console.log("ControlChart finished loading");
        if (onLoaded) onLoaded();
      });
  }, [onLoaded]);

  if (data.length === 0) return null;

  return (
    <div style={{ width: "100%", height: 500 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 20, right: 30, left: 150, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" />
          <YAxis type="category" dataKey="splitName" width={200} />
          <Tooltip />
          <Bar dataKey="control_count" fill={COLOR_MAP[1]}>
            <LabelList dataKey="control_count" position="right" />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
