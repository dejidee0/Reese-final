"use client";
import { useEffect, useState } from "react";
import { Countdown } from "@/components/ui/countdown";
import { Button } from "@/components/ui/button";
import { useDrops } from "@/lib/hooks/useDrops";
import Link from "next/link";
import Image from "next/image";

export function DropsSection() {
  const { drops, loading } = useDrops();
  const [nextDrop, setNextDrop] = useState(null);

  useEffect(() => {
    if (drops.length > 0) {
      const now = new Date();
      const upcomingDrop = drops.find((drop) => new Date(drop.drop_date) > now);
      setNextDrop(upcomingDrop);
    }
  }, [drops]);

  if (loading || !nextDrop) return null;

  return (
    <section className="py-16 bg-black text-white overflow-x-hidden">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Next Drop</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Get ready for the next exclusive release. Limited quantities,
            unlimited style.
          </p>
        </div>

        {/* Drop Info */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-full">
          {/* Drop Image */}
          <div className="relative w-full aspect-[4/5] md:aspect-square rounded-lg overflow-hidden max-w-full">
            <Image
              src={
                nextDrop.image_url ||
                nextDrop.products?.[0]?.image_url ||
                "/hero3.jpg"
              }
              alt={nextDrop.name}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-6 left-6">
              <span className="bg-gradient-to-r from-purple-600 to-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                UPCOMING DROP
              </span>
            </div>
          </div>

          {/* Drop Details */}
          <div className="space-y-6 w-full">
            <div>
              <h3 className="text-3xl font-bold mb-2 break-words">
                {nextDrop.name}
              </h3>
              <p className="text-gray-400 text-lg break-words">
                {nextDrop.description}
              </p>
            </div>

            <div className="space-y-4">
              <h4 className="text-xl font-semibold">Drop Date</h4>
              <Countdown
                targetDate={nextDrop.drop_date}
                onComplete={() => window.location.reload()}
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="text-gray-400">Starting Price</span>
                <span className="text-2xl font-bold">
                  ₦{nextDrop.starting_price?.toLocaleString() || "TBA"}
                </span>
              </div>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="text-gray-400">Limited Quantity</span>
                <span className="text-lg font-semibold">
                  {nextDrop.quantity || "Exclusive"}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-4">
              <Link href={`/drop/${nextDrop.id}`} className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-orange-500"
                >
                  Set Reminder
                </Button>
              </Link>
              <Link href="/drop" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto border-white text-black hover:bg-white hover:text-black"
                >
                  View All Drops
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
