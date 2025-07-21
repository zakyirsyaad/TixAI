"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

export default function useRevenue(user_id?: string) {
  const [revenue, setRevenue] = useState<Record<string, any>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user_id) return;
    const supabase = createClient();

    async function fetchRevenue() {
      setLoading(true);
      try {
        const { data } = await supabase
          .from("revenue")
          .select("*")
          .eq("user_id", user_id);
        setRevenue(data || []);
      } catch {
        setRevenue([]);
      } finally {
        setLoading(false);
      }
    }

    fetchRevenue();
  }, [user_id]);

  return { revenue, loading };
}
