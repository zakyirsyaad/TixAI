import BoxIndicator from "@/components/layout/business/home/BoxIndicator";
import { ChartAcummulation } from "@/components/layout/business/home/ChartAccumulation";
import ChatBox from "@/components/layout/business/home/ChatBox";
import React from "react";

export default async function page() {
  return (
    <main className="space-y-5">
      <ChatBox />
      <p className="text-2xl font-medium">Overview Company</p>
      <BoxIndicator />
      <ChartAcummulation />
    </main>
  );
}
