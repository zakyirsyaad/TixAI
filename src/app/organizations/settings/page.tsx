import ApiConnect from "@/components/layout/business/settings/ApiConnect";
import OrgzProfile from "@/components/layout/business/settings/OrgzProfile";
import React from "react";

export default function page() {
  return (
    <main className="space-y-12 mt-10">
      <section className="space-y-1">
        <h1 className="text-4xl font-medium">
          Set Up Your Organization, Power Up Your AI
        </h1>
        <h2 className="text-muted-foreground">
          Configure your business settings to enable smarter, AI-driven
          experiences tailored to your brand and customer needs.
        </h2>
      </section>

      <OrgzProfile />
      <ApiConnect />
    </main>
  );
}
