import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface ChartData {
  name: string;
  value: number;
  percentage?: string;
  category?: string;
}

interface ChartConfig {
  type: "line" | "bar" | "pie" | "area";
  data: ChartData[];
  xAxis?: string;
  yAxis?: string;
}

interface ChartResult {
  title: string;
  description: string;
  config: ChartConfig;
  dataPoints: number;
  totalValue: number;
  averageValue: string;
}

interface ChartRendererProps {
  chartData: ChartResult;
}

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884D8",
  "#82CA9D",
];

export function ChartRenderer({ chartData }: ChartRendererProps) {
  const { config, title, description } = chartData;

  const renderChart = () => {
    switch (config.type) {
      case "pie":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={config.data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percentage }) => `${name}: ${percentage}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {config.data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => [`$${value?.toLocaleString()}`, "Value"]}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );

      case "bar":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={config.data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip
                formatter={(value) => [`$${value?.toLocaleString()}`, "Value"]}
              />
              <Legend />
              <Bar dataKey="value" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        );

      case "line":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={config.data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip
                formatter={(value) => [`$${value?.toLocaleString()}`, "Value"]}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#8884d8"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        );

      case "area":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={config.data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip
                formatter={(value) => [`$${value?.toLocaleString()}`, "Value"]}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#8884d8"
                fill="#8884d8"
                fillOpacity={0.3}
              />
            </AreaChart>
          </ResponsiveContainer>
        );

      default:
        return <div>Unsupported chart type</div>;
    }
  };

  return (
    <div className="w-full p-4 border rounded-lg bg-white">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-600">{description}</p>
      </div>

      <div className="mb-4">{renderChart()}</div>

      <div className="grid grid-cols-3 gap-4 text-sm text-gray-600">
        <div>
          <span className="font-medium">Data Points:</span>{" "}
          {chartData.dataPoints}
        </div>
        <div>
          <span className="font-medium">Total:</span> $
          {chartData.totalValue.toLocaleString()}
        </div>
        <div>
          <span className="font-medium">Average:</span> $
          {parseFloat(chartData.averageValue).toLocaleString()}
        </div>
      </div>
    </div>
  );
}
