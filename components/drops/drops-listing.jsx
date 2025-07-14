"use client";
import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Countdown } from "@/components/ui/countdown";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { useUserStore } from "@/lib/stores/userStore";
import { toast } from "sonner";
import Image from "next/image";
import Link from "next/link";

export function DropsListing() {
  const [drops, setDrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [upcomingDrops, setUpcomingDrops] = useState([]);
  const [pastDrops, setPastDrops] = useState([]);
  const [waitlists, setWaitlists] = useState({});
  const { user } = useUserStore();

  const fetchDrops = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("drops")
        .select("*")
        .order("drop_date", { ascending: true });

      if (error) throw error;
      setDrops(data || []);
    } catch (error) {
      toast.error("Error fetching drops");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchWaitlists = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("waitlists")
        .select("drop_id")
        .eq("user_id", user.id);

      if (error) throw error;

      const waitlistMap = {};
      data.forEach((item) => {
        waitlistMap[item.drop_id] = true;
      });
      setWaitlists(waitlistMap);
    } catch (error) {
      console.error("Error fetching waitlists:", error);
    }
  }, [user]);

  useEffect(() => {
    fetchDrops();
    fetchWaitlists();
  }, [fetchDrops, fetchWaitlists]);

  useEffect(() => {
    if (drops.length > 0) {
      const now = new Date();
      const upcoming = drops.filter((drop) => new Date(drop.drop_date) > now);
      const past = drops.filter((drop) => new Date(drop.drop_date) <= now);

      setUpcomingDrops(upcoming);
      setPastDrops(past);
    }
  }, [drops]);

  const handleJoinWaitlist = async (dropId) => {
    if (!user) {
      toast.error("Please login to join waitlist");
      return;
    }

    try {
      const { error } = await supabase.from("waitlists").insert({
        user_id: user.id,
        drop_id: dropId,
        email: user.email,
      });

      if (error) throw error;

      setWaitlists((prev) => ({ ...prev, [dropId]: true }));
      toast.success(
        "Added to waitlist! You'll be notified when the drop goes live."
      );
    } catch (error) {
      if (error.code === "23505") {
        toast.error("You're already on the waitlist for this drop");
      } else {
        toast.error("Error joining waitlist");
      }
    }
  };

  const getTimeUntilDrop = (dropDate) => {
    const now = new Date();
    const drop = new Date(dropDate);
    const diff = drop - now;

    if (diff <= 0) return null;

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return { days, hours, minutes, seconds };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-lg h-96 animate-pulse"
              ></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold mb-4">Exclusive Drops</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Limited releases, premium quality. Don't miss out on these exclusive
            pieces.
          </p>
        </motion.div>

        {/* Upcoming Drops */}
        {upcomingDrops.length > 0 && (
          <div className="mb-8">
            <Card className="bg-gradient-to-r from-purple-600 to-orange-500 text-white">
              <CardHeader>
                <CardTitle className="text-2xl">🔥 Next Drop Alert</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                  <div>
                    <h3 className="text-xl font-bold mb-2">
                      {upcomingDrops[0].name}
                    </h3>
                    <p className="mb-4">{upcomingDrops[0].description}</p>
                    <p className="text-lg">
                      Starting at ₦
                      {upcomingDrops[0].starting_price?.toLocaleString()}
                    </p>
                  </div>
                  <div className="text-center">
                    <Countdown targetDate={upcomingDrops[0].drop_date} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {upcomingDrops.length > 0 && (
          <div className="mb-16">
            <h2 className="text-2xl font-bold mb-8">Upcoming Drops</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingDrops.map((drop, index) => (
                <motion.div
                  key={drop.id}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-white rounded-lg shadow-lg overflow-hidden"
                >
                  <div className="relative aspect-square">
                    <Image
                      src={
                        drop.image_url ||
                        "https://images.pexels.com/photos/1661471/pexels-photo-1661471.jpeg"
                      }
                      alt={drop.name}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute top-4 left-4">
                      <Badge className="bg-gradient-to-r from-purple-600 to-orange-500">
                        UPCOMING
                      </Badge>
                    </div>
                  </div>

                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-2">{drop.name}</h3>
                    <p className="text-gray-600 mb-4">{drop.description}</p>

                    <div className="mb-4">
                      {getTimeUntilDrop(drop.drop_date) ? (
                        <Countdown targetDate={drop.drop_date} />
                      ) : (
                        <Badge variant="secondary">Live Now!</Badge>
                      )}
                    </div>

                    <div className="flex justify-between items-center mb-4">
                      <span className="text-sm text-gray-500">Starting at</span>
                      <span className="text-xl font-bold">
                        ₦{drop.starting_price?.toLocaleString()}
                      </span>
                    </div>

                    <Button
                      onClick={() => handleJoinWaitlist(drop.id)}
                      disabled={waitlists[drop.id]}
                      className="w-full bg-gradient-to-r from-purple-600 to-orange-500"
                    >
                      <span>
                        {waitlists[drop.id] ? "On Waitlist ✓" : "Join Waitlist"}
                      </span>
                    </Button>

                    {drop.quantity && (
                      <p className="text-sm text-gray-500 mt-2 text-center">
                        Only {drop.quantity} pieces available
                      </p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Past Drops */}
        {pastDrops.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-8">Past Drops</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pastDrops.map((drop, index) => (
                <motion.div
                  key={drop.id}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-white rounded-lg shadow-lg overflow-hidden opacity-75"
                >
                  <div className="relative aspect-square">
                    <Image
                      src={
                        drop.image_url ||
                        "https://images.pexels.com/photos/1661471/pexels-photo-1661471.jpeg"
                      }
                      alt={drop.name}
                      fill
                      className="object-cover grayscale"
                    />
                    <div className="absolute top-4 left-4">
                      <Badge variant="secondary">SOLD OUT</Badge>
                    </div>
                  </div>

                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-2">{drop.name}</h3>
                    <p className="text-gray-600 mb-4">{drop.description}</p>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">
                        Dropped on{" "}
                        {new Date(drop.drop_date).toLocaleDateString()}
                      </span>
                      <span className="text-lg font-bold line-through text-gray-400">
                        ₦{drop.starting_price?.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
