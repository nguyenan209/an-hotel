"use client";
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
} from "recharts";

interface ChartProps {
  data: any[];
  index: string;
  categories: string[];
  colors?: string[];
  valueFormatter?: (value: number) => string;
  className?: string;
  stack?: boolean;
}

export function BarChart({
  data,
  index,
  categories,
  colors = ["#2563eb", "#f59e0b", "#10b981", "#8b5cf6", "#ef4444"],
  valueFormatter = (value: number) => value.toString(),
  className,
  stack = false,
}: ChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%" className={className}>
      <RechartsBarChart
        data={data}
        margin={{
          top: 10,
          right: 10,
          left: 0,
          bottom: 0,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey={index}
          tick={{ fontSize: 12 }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          tickFormatter={valueFormatter}
          tick={{ fontSize: 12 }}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip
          formatter={(value: number) => [valueFormatter(value), ""]}
          contentStyle={{
            backgroundColor: "white",
            borderRadius: "6px",
            boxShadow:
              "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
            border: "none",
          }}
        />
        <Legend />
        {categories.map((category, i) => (
          <Bar
            key={category}
            dataKey={category}
            fill={colors[i % colors.length]}
            radius={[4, 4, 0, 0]}
            stackId={stack ? "stack" : undefined}
          />
        ))}
      </RechartsBarChart>
    </ResponsiveContainer>
  );
}

interface PieChartProps {
  data: any[];
  index: string;
  category: string;
  colors?: string[];
  valueFormatter?: (value: number) => string;
  className?: string;
}

export function PieChart({
  data,
  index,
  category,
  colors = ["#2563eb", "#f59e0b", "#10b981", "#8b5cf6", "#ef4444"],
  valueFormatter = (value: number) => value.toString(),
  className,
}: PieChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%" className={className}>
      <RechartsPieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={80}
          fill="#8884d8"
          dataKey={category}
          nameKey={index}
          label={({ name, percent }) =>
            `${name}: ${(percent * 100).toFixed(0)}%`
          }
        >
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={entry.fill || colors[index % colors.length]}
            />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: number) => [valueFormatter(value), ""]}
          contentStyle={{
            backgroundColor: "white",
            borderRadius: "6px",
            boxShadow:
              "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
            border: "none",
          }}
        />
        <Legend />
      </RechartsPieChart>
    </ResponsiveContainer>
  );
}

export function DonutChart({
  data,
  index,
  category,
  colors = ["#2563eb", "#f59e0b", "#10b981", "#8b5cf6", "#ef4444"],
  valueFormatter = (value: number) => value.toString(),
  className,
}: PieChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%" className={className}>
      <RechartsPieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          innerRadius={60}
          outerRadius={80}
          fill="#8884d8"
          dataKey={category}
          nameKey={index}
          label={({ name, percent }) =>
            `${name}: ${(percent * 100).toFixed(0)}%`
          }
        >
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={entry.fill || colors[index % colors.length]}
            />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: number) => [valueFormatter(value), ""]}
          contentStyle={{
            backgroundColor: "white",
            borderRadius: "6px",
            boxShadow:
              "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
            border: "none",
          }}
        />
        <Legend />
      </RechartsPieChart>
    </ResponsiveContainer>
  );
}
