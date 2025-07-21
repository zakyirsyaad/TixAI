import { tool as createTool } from "ai";
import { z } from "zod";
import { createClient } from "@/utils/supabase/client";

export const chartstool = createTool({
  description:
    "Generate charts and visualizations for event data analysis. Supports line charts, bar charts, pie charts, and area charts.",
  parameters: z.object({
    chartType: z
      .enum(["line", "bar", "pie", "area"])
      .describe("Type of chart to generate"),
    title: z.string().describe("Title of the chart"),
    data: z
      .array(
        z.object({
          name: z.string().describe("Data point name or label"),
          value: z.number().describe("Numeric value for the data point"),
          category: z
            .string()
            .optional()
            .describe("Optional category for grouping data"),
        })
      )
      .describe("Array of data points for the chart"),
    xAxisLabel: z.string().optional().describe("Label for X-axis"),
    yAxisLabel: z.string().optional().describe("Label for Y-axis"),
    description: z
      .string()
      .optional()
      .describe("Description or context for the chart"),
  }),
  execute: async ({
    chartType,
    title,
    data,
    xAxisLabel,
    yAxisLabel,
    description,
  }) => {
    try {
      // Validate data
      if (!data || data.length === 0) {
        return {
          error: "No data provided for chart generation",
          chartType,
          title,
        };
      }

      // Process data based on chart type
      const processedData = data;
      let chartConfig = {};

      switch (chartType) {
        case "line":
          chartConfig = {
            type: "line",
            data: processedData.map((item) => ({
              name: item.name,
              value: item.value,
              category: item.category || "default",
            })),
            xAxis: xAxisLabel || "Time/Period",
            yAxis: yAxisLabel || "Value",
          };
          break;

        case "bar":
          chartConfig = {
            type: "bar",
            data: processedData.map((item) => ({
              name: item.name,
              value: item.value,
              category: item.category || "default",
            })),
            xAxis: xAxisLabel || "Categories",
            yAxis: yAxisLabel || "Value",
          };
          break;

        case "pie":
          chartConfig = {
            type: "pie",
            data: processedData.map((item) => ({
              name: item.name,
              value: item.value,
              percentage: (
                (item.value /
                  processedData.reduce((sum, d) => sum + d.value, 0)) *
                100
              ).toFixed(1),
            })),
          };
          break;

        case "area":
          chartConfig = {
            type: "area",
            data: processedData.map((item) => ({
              name: item.name,
              value: item.value,
              category: item.category || "default",
            })),
            xAxis: xAxisLabel || "Time/Period",
            yAxis: yAxisLabel || "Value",
          };
          break;
      }

      return {
        success: true,
        chart: {
          title,
          description:
            description || `Generated ${chartType} chart for data analysis`,
          config: chartConfig,
          dataPoints: processedData.length,
          totalValue: processedData.reduce((sum, item) => sum + item.value, 0),
          averageValue: (
            processedData.reduce((sum, item) => sum + item.value, 0) /
            processedData.length
          ).toFixed(2),
        },
      };
    } catch (error) {
      return {
        error: "Failed to generate chart",
        details: error instanceof Error ? error.message : "Unknown error",
        chartType,
        title,
      };
    }
  },
});

// Visitor Tool
export const visitorTool = createTool({
  description: "Simpan data visitor ke tabel visitor Supabase.",
  parameters: z.object({
    user_id: z.string().describe("ID user (uuid)"),
    page_visited: z.string().describe("Halaman yang dikunjungi"),
  }),
  execute: async ({ user_id, page_visited }) => {
    const supabase = createClient();
    const { error } = await supabase
      .from("visitor")
      .insert([{ user_id, page_visited }]);
    if (error) return { success: false, error: error.message };
    return { success: true };
  },
});

// Revenue Tool
export const revenueTool = createTool({
  description: "Simpan data revenue ke tabel revenue Supabase.",
  parameters: z.object({
    user_id: z.string().describe("ID user (uuid)"),
    amount: z.number().describe("Jumlah revenue"),
    source: z.string().describe("Sumber revenue"),
  }),
  execute: async ({ user_id, amount, source }) => {
    const supabase = createClient();
    const { error } = await supabase
      .from("revenue")
      .insert([{ user_id, amount, source }]);
    if (error) return { success: false, error: error.message };
    return { success: true };
  },
});

// Rating Tool
export const ratingTool = createTool({
  description: "Simpan data rating ke tabel rating Supabase.",
  parameters: z.object({
    user_id: z.string().describe("ID user (uuid)"),
    rating: z.number().min(1).max(5).describe("Nilai rating 1-5"),
    comment: z.string().optional().describe("Komentar (opsional)"),
  }),
  execute: async ({ user_id, rating, comment }) => {
    const supabase = createClient();
    const { error } = await supabase
      .from("rating")
      .insert([{ user_id, rating, comment }]);
    if (error) return { success: false, error: error.message };
    return { success: true };
  },
});

// export const balanceTool = createTool({
//   description: "Request the account balance of the user with formated balance",
//   parameters: z.object({
//     address: z.string().describe("The address of the user"),
//   }),

//   execute: async ({ address }) => {
//     try {
//       const balance = await publicClient.getBalance({
//         address: address as `0x${string}`,
//       });
//       return { balance: formatEther(balance) };
//     } catch (error) {
//       console.error(error);
//       return { balance: "0" };
//     }
//   },
// });

// export const sendTransactionTool = createTool({
//   description:
//     "You're going to provide a button that will initiate a transaction to the wallet address the user provided, you are not going to send the transaction",
//   parameters: z.object({
//     to: z.string().describe("The wallet address of the user"),
//     amount: z.string().describe("The amount of eth the transaction"),
//   }),
//   execute: async ({ to, amount }) => {
//     return { to, amount };
//   },
// });

export const tools = {
  visitor: visitorTool,
  revenue: revenueTool,
  rating: ratingTool,
};
