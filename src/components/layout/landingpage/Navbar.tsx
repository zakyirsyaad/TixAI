import React from "react";

import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Navbar() {
  return (
    <header className="flex items-center justify-between">
      <section className="flex items-center gap-5">
        <h1 className="text-2xl font-medium">TixAI</h1>
        <Navigation />
      </section>
      <Link href={"/login"} target="_blank">
        <Button size={"lg"}>Get Started</Button>
      </Link>
    </header>
  );
}
