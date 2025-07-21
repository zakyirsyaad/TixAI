"use client";
import React from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import useGetUser from "@/hooks/getUser";
import useRevenue from "@/hooks/useRevenue";

export default function page() {
  const { user } = useGetUser();
  const { revenue } = useRevenue(user?.id);
  console.log(revenue);
  return (
    <main className="space-y-5 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold">revenue Page</h1>
      <Table>
        <TableCaption>Data revenue</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Source</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Recieved Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {revenue && revenue.length > 0 ? (
            revenue.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.id.slice(-5)}</TableCell>
                <TableCell>{item.source}</TableCell>
                <TableCell>$ {item.amount.toLocaleString() || "-"}</TableCell>
                <TableCell>
                  {new Date(item.received_at).toLocaleString()}
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={4} className="text-center">
                No revenue data found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </main>
  );
}
