"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

export default function useRating(user_id?: string) {
  const [rating, setRating] = useState<Record<string, any>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user_id) return;
    const supabase = createClient();

    async function fetchRating() {
      setLoading(true);
      try {
        const { data } = await supabase
          .from("rating")
          .select("*")
          .eq("user_id", user_id);
        setRating(data || []);
      } catch {
        setRating([]);
      } finally {
        setLoading(false);
      }
    }

    fetchRating();
  }, [user_id]);

  return { rating, loading };
}
