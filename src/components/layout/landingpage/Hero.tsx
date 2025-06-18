import EmailHome from "@/components/EmailHome";
import { AvatarCircles } from "@/components/magicui/avatar-circles";
import React from "react";
import {
  AnimatedSpan,
  Terminal,
  TypingAnimation,
} from "@/components/magicui/terminal";

export default function Hero() {
  return (
    <section className="grid grid-cols-2 place-items-center">
      <div className="space-y-7">
        <div className="space-y-2">
          <h1 className="text-5xl font-bold">
            Meet Your AI, Grow Your Events.
          </h1>
          <h2 className="text-muted-foreground">
            Leverage powerful AI insights to maximize impact and success for
            esports and beyond.
          </h2>
        </div>
        <EmailHome />
        <div className="flex items-center gap-5">
          <AvatarCircles numPeople={99} avatarUrls={avatars} />
          <p>Joined by 2,000+ Event Organizers</p>
        </div>
      </div>

      <Terminal className="shadow-white/30 shadow-lg">
        <TypingAnimation>&gt; init TixAI --setup</TypingAnimation>

        <AnimatedSpan delay={1500} className="text-green-500">
          <span>✔ Initializing TixAI core.</span>
        </AnimatedSpan>

        <AnimatedSpan delay={2000} className="text-green-500">
          <span>✔ Validating AI models integration.</span>
        </AnimatedSpan>

        <AnimatedSpan delay={2500} className="text-green-500">
          <span>✔ Optimizing ticket management system.</span>
        </AnimatedSpan>

        <AnimatedSpan delay={3000} className="text-green-500">
          <span>✔ Integrating esports analytics.</span>
        </AnimatedSpan>

        <AnimatedSpan delay={3500} className="text-green-500">
          <span>✔ Setting up event scalability.</span>
        </AnimatedSpan>

        <AnimatedSpan delay={4000} className="text-green-500">
          <span>✔ AI-powered insights engine active.</span>
        </AnimatedSpan>

        <AnimatedSpan delay={4500} className="text-green-500">
          <span>✔ Updating performance metrics.</span>
        </AnimatedSpan>

        <AnimatedSpan delay={5000} className="text-green-500">
          <span>✔ Enabling multi-event support.</span>
        </AnimatedSpan>

        <AnimatedSpan delay={5500} className="text-green-500">
          <span>✔ Finalizing configuration.</span>
        </AnimatedSpan>

        <AnimatedSpan delay={6000} className="text-blue-500">
          <span>ℹ Updated configurations:</span>
          <span className="pl-2">- AI_insights.json</span>
        </AnimatedSpan>

        <TypingAnimation delay={6500} className="text-muted-foreground">
          Success! TixAI setup completed.
        </TypingAnimation>

        <TypingAnimation delay={7000} className="text-muted-foreground">
          Ready to optimize your events.
        </TypingAnimation>
      </Terminal>
    </section>
  );
}

const avatars = [
  {
    imageUrl: "https://avatars.githubusercontent.com/u/16860528",
    profileUrl: "https://github.com/dillionverma",
  },
  {
    imageUrl: "https://avatars.githubusercontent.com/u/20110627",
    profileUrl: "https://github.com/tomonarifeehan",
  },
  {
    imageUrl: "https://avatars.githubusercontent.com/u/106103625",
    profileUrl: "https://github.com/BankkRoll",
  },
  {
    imageUrl: "https://avatars.githubusercontent.com/u/59228569",
    profileUrl: "https://github.com/safethecode",
  },
  {
    imageUrl: "https://avatars.githubusercontent.com/u/59442788",
    profileUrl: "https://github.com/sanjay-mali",
  },
  {
    imageUrl: "https://avatars.githubusercontent.com/u/89768406",
    profileUrl: "https://github.com/itsarghyadas",
  },
];
