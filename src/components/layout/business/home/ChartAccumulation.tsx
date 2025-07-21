"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import dayjs from "dayjs";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import useGetUser from "@/hooks/getUser";
import useVisitor from "@/hooks/useVisitor";
import useRevenue from "@/hooks/useRevenue";
import useRating from "@/hooks/useRating";

export const description = "An interactive area chart";

const chartConfig = {
  visitors: {
    label: "Visitors",
  },
  desktop: {
    label: "Desktop",
    color: "var(--chart-1)",
  },
  mobile: {
    label: "Mobile",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

export function ChartAcummulation() {
  const { user, loading: userLoading } = useGetUser();
  const { visitor, loading: visitorLoading } = useVisitor(user?.id);
  const { revenue, loading: revenueLoading } = useRevenue(user?.id);
  const { rating, loading: ratingLoading } = useRating(user?.id);
  const [timeRange, setTimeRange] = React.useState("90d");

  if (userLoading || visitorLoading || revenueLoading || ratingLoading)
    return <div>Loading...</div>;

  // Helper: aggregate per date
  const aggregateByDate = <T extends Record<string, unknown>>(
    arr: T[],
    dateField: keyof T,
    valueField: keyof T | null,
    agg: "count" | "sum" | "avg" = "count"
  ) => {
    const map: Record<string, number[]> = {};
    arr.forEach((item: T) => {
      const date = item[dateField]
        ? dayjs(item[dateField] as string).format("YYYY-MM-DD")
        : null;
      if (!date) return;
      if (!map[date]) map[date] = [];
      map[date].push(valueField ? (item[valueField!] as number) ?? 0 : 1);
    });
    const result: Record<string, number> = {};
    Object.entries(map).forEach(([date, values]) => {
      const vals = values as number[];
      if (agg === "count") result[date] = vals.length;
      else if (agg === "sum") result[date] = vals.reduce((a, b) => a + b, 0);
      else if (agg === "avg")
        result[date] = vals.reduce((a, b) => a + b, 0) / vals.length;
    });
    return result;
  };

  const visitorPerDay = aggregateByDate(visitor, "visited_at", null, "count");
  const revenuePerDay = aggregateByDate(
    revenue,
    "received_at",
    "amount",
    "sum"
  );
  const ratingPerDay = aggregateByDate(rating, "rated_at", "rating", "avg");

  // Filter by time range
  const referenceDate = dayjs();
  let daysToSubtract = 90;
  if (timeRange === "30d") daysToSubtract = 30;
  else if (timeRange === "7d") daysToSubtract = 7;
  const startDate = referenceDate.subtract(daysToSubtract, "day");

  // Generate all dates in range
  const daysArray: string[] = [];
  let d = startDate.clone().add(1, "day");
  const endDate = referenceDate.clone().add(1, "day");
  while (d.isBefore(endDate, "day")) {
    daysArray.push(d.format("YYYY-MM-DD"));
    d = d.add(1, "day");
  }

  const chartData = daysArray.map((date) => ({
    date,
    visitor: visitorPerDay[date] || 0,
    revenue: revenuePerDay[date] || 0,
    rating: ratingPerDay[date] || 0,
  }));

  return (
    <Card className="pt-0">
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1">
          <CardTitle>Area Chart - Interactive</CardTitle>
          <CardDescription>
            Showing visitor, revenue, and rating per day for the selected range
          </CardDescription>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger
            className="hidden w-[160px] rounded-lg sm:ml-auto sm:flex"
            aria-label="Select a value"
          >
            <SelectValue placeholder="Last 3 months" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="90d" className="rounded-lg">
              Last 3 months
            </SelectItem>
            <SelectItem value="30d" className="rounded-lg">
              Last 30 days
            </SelectItem>
            <SelectItem value="7d" className="rounded-lg">
              Last 7 days
            </SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="fillVisitor" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--chart-1)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--chart-1)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--chart-2)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--chart-2)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillRating" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--chart-3)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--chart-3)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                });
              }}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    });
                  }}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="visitor"
              type="natural"
              fill="url(#fillVisitor)"
              stroke="var(--chart-1)"
              stackId="a"
            />
            <Area
              dataKey="revenue"
              type="natural"
              fill="url(#fillRevenue)"
              stroke="var(--chart-2)"
              stackId="a"
            />
            <Area
              dataKey="rating"
              type="natural"
              fill="url(#fillRating)"
              stroke="var(--chart-3)"
              stackId="a"
            />
            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
