"use client";
import { createClient } from "@/utils/supabase/client";
import React from "react";
import {
  Card,
  //   CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import useGetUser from "@/hooks/getUser";
import useGetOrgz from "@/hooks/getOrgz";
import { toast } from "sonner";

export default function OrgzProfile() {
  const supabase = createClient();
  const { user, loading } = useGetUser();
  const { orgz } = useGetOrgz();

  const [name, setName] = React.useState<string>("");
  const [isLoading, setIsLoading] = React.useState<boolean>(false);

  async function SaveOrgz() {
    if (!user) return;
    setIsLoading(true);

    if (orgz && orgz.length > 0) {
      // Update existing organization
      const { error } = await supabase
        .from("organizations")
        .update({ name: name })
        .eq("user_id", user.id)
        .select();

      setIsLoading(false);

      if (error) {
        console.error("Error updating organization:", error);
        toast.error("Failed to update organization");
      } else {
        toast.success("Organization successfully updated!");
      }
    } else {
      // Insert new organization
      const { error } = await supabase
        .from("organizations")
        .insert([{ user_id: user.id, name: name }])
        .select();

      setIsLoading(false);

      if (error) {
        console.error("Error saving organization:", error);
        toast.error("Failed to save organization");
      } else {
        toast.success("Organization successfully saved!");
      }
    }
  }

  if (loading) {
    return <div>Loading...</div>;
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Organization</CardTitle>
        <CardDescription>Card Description</CardDescription>
        {/* <CardAction>Card Action</CardAction> */}
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          <Label>Name</Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={orgz?.[0]?.name || ""}
          />
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={SaveOrgz} disabled={isLoading}>
          Save Profile
        </Button>
      </CardFooter>
    </Card>
  );
}
