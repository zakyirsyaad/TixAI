"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

export default function useVisitor(user_id?: string) {
  const [visitor, setVisitor] = useState<Record<string, any>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user_id) return;
    const supabase = createClient();

    async function fetchVisitor() {
      setLoading(true);
      try {
        const { data } = await supabase
          .from("visitor")
          .select("*")
          .eq("user_id", user_id);
        setVisitor(data || []);
      } catch {
        setVisitor([]);
      } finally {
        setLoading(false);
      }
    }

    fetchVisitor();
  }, [user_id]);

  return { visitor, loading };
}
