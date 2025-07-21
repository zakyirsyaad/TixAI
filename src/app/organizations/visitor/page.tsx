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
import useVisitor from "@/hooks/useVisitor";
import useGetUser from "@/hooks/getUser";

export default function page() {
  const { user } = useGetUser();
  const { visitor } = useVisitor(user?.id);
  console.log(visitor);
  return (
    <main className="space-y-5 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold">Visitor Page</h1>
      <Table>
        <TableCaption>Data Visitor</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Event Visited</TableHead>
            <TableHead>Device Info</TableHead>
            <TableHead>Visited At</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {visitor && visitor.length > 0 ? (
            visitor.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.id.slice(-5)}</TableCell>
                <TableCell>{item.page_visited}</TableCell>
                <TableCell>{item.device_info || "-"}</TableCell>
                <TableCell>
                  {new Date(item.visited_at).toLocaleString()}
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={4} className="text-center">
                No visitor data found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </main>
  );
}
