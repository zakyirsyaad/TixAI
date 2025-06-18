import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Json } from "@/types/supabase";

interface Organization {
  id: string;
  user_id: string;
  name: string;
  data_json: Json;
  created_at: Date;
}

export default function useGetOrgz() {
  const supabase = createClient();

  const [orgz, setOrgz] = useState<Organization[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getOrganizations = async () => {
      try {
        const { data: organizations, error } = await supabase
          .from("organizations")
          .select("id, user_id, name, data_json, created_at");

        if (error) {
          console.error("Error fetching organizations:", error);
          return;
        }

        setOrgz(organizations);
      } catch (error) {
        console.error("Error fetching organizations:", error);
      } finally {
        setLoading(false);
      }
    };

    getOrganizations();
  }, [supabase]);

  return { orgz, loading };
}
