"use client";
import { createClient } from "@/utils/supabase/client";
import React from "react";
import { Loader2, LogOut } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function Logout() {
  const supabase = createClient();
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleLogout = async () => {
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signOut();
    setLoading(false);

    if (error) {
      setError(error.message);
    } else {
      toast.success("Logout Successfull");
      router.push("/login");
    }
  };

  React.useEffect(() => {
    if (error) {
      toast.error("Logout Error");
    }
  }, [error]);

  return (
    <span
      onClick={handleLogout}
      className="flex items-center justify-center gap-2"
    >
      {loading ? (
        <Loader2 className="animate-spin h-4 w-4" />
      ) : (
        <LogOut className="h-4 w-4" />
      )}
      <span>{loading ? "Signing out..." : "Sign Out"}</span>
    </span>
  );
}
