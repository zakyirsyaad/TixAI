import Hero from "@/components/layout/landingpage/Hero";
import Navbar from "@/components/layout/landingpage/Navbar";
import { Supported } from "@/components/layout/landingpage/Supported";

export default function Home() {
  return (
    <main className="xl:max-w-6xl mx-auto p-5 space-y-20">
      <Navbar />
      <Hero />
      <Supported />
    </main>
  );
}
