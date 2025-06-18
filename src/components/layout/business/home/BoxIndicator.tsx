import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Star } from "lucide-react";

export default function BoxIndicator() {
  return (
    <section className="grid grid-cols-3 gap-5">
      <Card>
        <CardHeader>
          <CardTitle>Visitor</CardTitle>
          <CardDescription>
            The Visitor feature displays the total accumulated number of
            recorded visitors.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">123123</p>
        </CardContent>
        <CardFooter>
          <p>Trending up 10% in 3 months</p>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Revenue</CardTitle>
          <CardDescription>
            The Revenue feature displays the total accumulated income generated
            from all recorded events.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">123123</p>
        </CardContent>
        <CardFooter>
          <p>Trending up 10% in 3 months</p>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Rating</CardTitle>
          <CardDescription>
            The Rating feature displays the average user rating based on all
            submitted reviews.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center gap-2">
          <p className="text-2xl font-bold">4.9</p>
          <Star />
        </CardContent>
        <CardFooter>
          <p>Trending up 10% in 3 months</p>
        </CardFooter>
      </Card>
    </section>
  );
}
