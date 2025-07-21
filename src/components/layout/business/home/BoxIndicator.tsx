"use client";
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
import useGetUser from "@/hooks/getUser";
import useVisitor from "@/hooks/useVisitor";
import useRevenue from "@/hooks/useRevenue";
import useRating from "@/hooks/useRating";
import dayjs from "dayjs";

export default function BoxIndicator() {
  const { user, loading: userLoading } = useGetUser();
  const { visitor, loading: visitorLoading } = useVisitor(user?.id);
  const { revenue, loading: revenueLoading } = useRevenue(user?.id);
  const { rating, loading: ratingLoading } = useRating(user?.id);

  if (userLoading || visitorLoading || revenueLoading || ratingLoading)
    return <div>Loading...</div>;

  // Trending calculation
  const now = dayjs();
  const threeMonthsAgo = now.subtract(3, "month");
  const sixMonthsAgo = now.subtract(6, "month");

  // Visitor trending
  const visitorLast3Months = visitor.filter(
    (v) => v.visited_at && dayjs(v.visited_at).isAfter(threeMonthsAgo)
  );
  const visitorPrev3Months = visitor.filter(
    (v) =>
      v.visited_at &&
      dayjs(v.visited_at).isAfter(sixMonthsAgo) &&
      dayjs(v.visited_at).isBefore(threeMonthsAgo)
  );
  const visitorGrowth =
    visitorPrev3Months.length > 0
      ? ((visitorLast3Months.length - visitorPrev3Months.length) /
          visitorPrev3Months.length) *
        100
      : 0;

  // Revenue trending
  const revenueLast3Months = revenue.filter(
    (r) => r.received_at && dayjs(r.received_at).isAfter(threeMonthsAgo)
  );
  const revenuePrev3Months = revenue.filter(
    (r) =>
      r.received_at &&
      dayjs(r.received_at).isAfter(sixMonthsAgo) &&
      dayjs(r.received_at).isBefore(threeMonthsAgo)
  );
  const totalRevenueLast3 = revenueLast3Months.reduce(
    (sum, r) => sum + (r.amount || 0),
    0
  );
  const totalRevenuePrev3 = revenuePrev3Months.reduce(
    (sum, r) => sum + (r.amount || 0),
    0
  );
  const revenueGrowth =
    totalRevenuePrev3 > 0
      ? ((totalRevenueLast3 - totalRevenuePrev3) / totalRevenuePrev3) * 100
      : 0;

  // Rating trending
  const ratingLast3Months = rating.filter(
    (r) => r.rated_at && dayjs(r.rated_at).isAfter(threeMonthsAgo)
  );
  const ratingPrev3Months = rating.filter(
    (r) =>
      r.rated_at &&
      dayjs(r.rated_at).isAfter(sixMonthsAgo) &&
      dayjs(r.rated_at).isBefore(threeMonthsAgo)
  );
  const avgRatingLast3 =
    ratingLast3Months.length > 0
      ? ratingLast3Months.reduce((sum, r) => sum + (r.rating || 0), 0) /
        ratingLast3Months.length
      : 0;
  const avgRatingPrev3 =
    ratingPrev3Months.length > 0
      ? ratingPrev3Months.reduce((sum, r) => sum + (r.rating || 0), 0) /
        ratingPrev3Months.length
      : 0;
  const ratingGrowth =
    avgRatingPrev3 > 0
      ? ((avgRatingLast3 - avgRatingPrev3) / avgRatingPrev3) * 100
      : 0;

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
          <p className="text-2xl font-bold">{visitor.length}</p>
        </CardContent>
        <CardFooter>
          <p>
            Trending {visitorGrowth >= 0 ? "up" : "down"}{" "}
            {Math.abs(visitorGrowth).toFixed(1)}% in 3 months
          </p>
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
          <p className="text-2xl font-bold">
            {revenue
              .reduce((sum, item) => sum + (item.amount || 0), 0)
              .toLocaleString()}
          </p>
        </CardContent>
        <CardFooter>
          <p>
            Trending {revenueGrowth >= 0 ? "up" : "down"}{" "}
            {Math.abs(revenueGrowth).toFixed(1)}% in 3 months
          </p>
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
          <p className="text-2xl font-bold">
            {rating.length > 0
              ? (
                  rating.reduce((sum, item) => sum + (item.rating || 0), 0) /
                  rating.length
                ).toFixed(1)
              : "-"}
          </p>
          <Star />
        </CardContent>
        <CardFooter>
          <p>
            Trending {ratingGrowth >= 0 ? "up" : "down"}{" "}
            {Math.abs(ratingGrowth).toFixed(1)}% in 3 months
          </p>
        </CardFooter>
      </Card>
    </section>
  );
}
