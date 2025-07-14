"use client";
import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import {
  Trophy,
  Users,
  Clock,
  Plus,
  Eye,
  Vote,
  Award,
  TrendingUp,
  UploadCloud,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useUserStore } from "@/lib/stores/userStore";
import { toast } from "sonner";
import Image from "next/image";
import { v4 as uuidv4 } from "uuid";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Dialog } from "@radix-ui/react-dialog";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";

export function ArenaPage() {
  const [battles, setBattles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userVotes, setUserVotes] = useState({});
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [votingLoading, setVotingLoading] = useState({});
  const [previewUrls, setPreviewUrls] = useState({ a: null, b: null });

  const fileInputA = useRef(null);
  const fileInputB = useRef(null);

  const [newBattle, setNewBattle] = useState({
    title: "",
    description: "",
    image_a_url: "",
    image_b_url: "",
    outfit_a_description: "",
    outfit_b_description: "",
    ends_at: "",
  });

  const { user, addPoints, isAdmin, points } = useUserStore();

  // Compute stats
  const totalBattles = battles.length;
  const totalVotes = battles.reduce((sum, b) => sum + b.votes_a + b.votes_b, 0);
  const userVoteCount = Object.keys(userVotes).length;

  useEffect(() => {
    fetchBattles();
    if (user) {
      fetchUserVotes();
    }

    const battleChannel = supabase
      .channel("realtime:battles")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "battles" },
        () => {
          fetchBattles();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(battleChannel);
    };
  }, [user]);

  const fetchBattles = async () => {
    const { data, error } = await supabase
      .from("battles")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching battles:", error);
      toast.error("Error loading battles");
    } else {
      setBattles(data);
    }
    setLoading(false);
  };

  const fetchUserVotes = async () => {
    const { data, error } = await supabase
      .from("battle_votes")
      .select("battle_id, choice")
      .eq("user_id", user?.id);

    if (!error && data) {
      const votesMap = {};
      data.forEach(({ battle_id, choice }) => {
        votesMap[battle_id] = choice;
      });
      setUserVotes(votesMap);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewBattle((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = async (e, key) => {
    const file = e.target.files[0];
    if (!file) return;

    // Create preview URL
    const url = URL.createObjectURL(file);
    setPreviewUrls((prev) => ({ ...prev, [key]: url }));

    // Upload file to storage
    const filePath = `${uuidv4()}-${file.name}`; // ✅ correct

    const { error } = await supabase.storage
      .from("battles")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (!error) {
      const {
        data: { publicUrl },
      } = supabase.storage.from("battles").getPublicUrl(filePath);
      setNewBattle((prev) => ({ ...prev, [`image_${key}_url`]: publicUrl }));
    } else {
      toast.error("Upload failed");
      setPreviewUrls((prev) => ({ ...prev, [key]: null }));
    }
  };

  const handleCreateBattle = async (e) => {
    e.preventDefault();
    const {
      title,
      description,
      image_a_url,
      image_b_url,
      outfit_a_description,
      outfit_b_description,
      ends_at,
    } = newBattle;

    if (!title || !image_a_url || !image_b_url) {
      toast.error("Please complete all fields including image uploads");
      return;
    }

    const { error, data } = await supabase
      .from("battles")
      .insert([
        {
          title,
          description,
          image_a_url,
          image_b_url,
          outfit_a_description,
          outfit_b_description,
          ends_at,
          is_active: true,
          votes_a: 0,
          votes_b: 0,
        },
      ])
      .select()
      .single();

    if (!error && data) {
      setNewBattle({
        title: "",
        description: "",
        image_a_url: "",
        image_b_url: "",
        outfit_a_description: "",
        outfit_b_description: "",
        ends_at: "",
      });
      setPreviewUrls({ a: null, b: null });
      setIsCreateDialogOpen(false);
      toast.success("Battle created");
    } else {
      toast.error("Failed to create battle");
    }
  };

  const handleVote = async (battleId, choice) => {
    if (!user) {
      toast.error("Please sign in to vote");
      return;
    }

    setVotingLoading((prev) => ({ ...prev, [battleId]: true }));

    // Record user vote
    const { error: voteError } = await supabase
      .from("battle_votes")
      .insert([
        { battle_id: battleId, user_id: user.id, choice: choice.toLowerCase() },
      ]);

    if (voteError) {
      console.error("Vote failed:", voteError);
      toast.error("Vote failed");
      setVotingLoading((prev) => ({ ...prev, [battleId]: false }));
      return;
    }

    // Update vote count
    const { error: updateError } = await supabase.rpc("increment_vote", {
      battle_id: battleId,
      side: choice.toLowerCase(),
    });

    if (updateError) {
      console.error("Vote count update failed:", updateError);
      toast.error("Vote count update failed");
    } else {
      // Update local state
      setUserVotes((prev) => ({ ...prev, [battleId]: choice }));
      setBattles((prev) =>
        prev.map((battle) =>
          battle.id === battleId
            ? {
                ...battle,
                [`votes_${choice.toLowerCase()}`]:
                  battle[`votes_${choice.toLowerCase()}`] + 1,
              }
            : battle
        )
      );
      addPoints(10);
      toast.success("Vote counted! +10 points");
    }

    setVotingLoading((prev) => ({ ...prev, [battleId]: false }));
  };

  const onDialogOpenChange = (open) => {
    setIsCreateDialogOpen(open);
    if (!open) {
      // Cleanup preview URLs
      Object.values(previewUrls).forEach((url) => {
        if (url && url.startsWith("blob:")) {
          URL.revokeObjectURL(url);
        }
      });
      setPreviewUrls({ a: null, b: null });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold mb-4">Style Arena</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Battle it out in real-time styling competitions. Vote on the best
            looks and earn points to level up your status.
          </p>
        </motion.div>

        {/* STATS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            {
              title: "Active Battles",
              icon: Trophy,
              value: totalBattles,
              color: "text-yellow-600",
            },
            {
              title: "Total Votes",
              icon: Users,
              value: totalVotes,
              color: "text-blue-600",
            },
            {
              title: "Your Votes",
              icon: Vote,
              value: userVoteCount,
              color: "text-green-600",
            },
            {
              title: "Points Earned",
              icon: Award,
              value: points,
              color: "text-purple-600",
            },
          ].map((stat, i) => (
            <Card key={i}>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <stat.icon className="w-5 h-5" />
                  {stat.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-3xl font-bold ${stat.color}`}>
                  {typeof stat.value === "number"
                    ? stat.value.toLocaleString()
                    : stat.value}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* ADMIN: CREATE BATTLE */}
        {isAdmin && (
          <div className="mb-8 text-center">
            <Dialog open={isCreateDialogOpen} onOpenChange={onDialogOpenChange}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-purple-600 to-orange-500">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Battle
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>New Style Battle</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateBattle} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Battle Title</Label>
                      <Input
                        name="title"
                        value={newBattle.title}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div>
                      <Label>Ends At</Label>
                      <Input
                        name="ends_at"
                        type="datetime-local"
                        value={newBattle.ends_at}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Textarea
                      name="description"
                      value={newBattle.description}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {["a", "b"].map((key) => (
                      <div key={key}>
                        <Label>Option {key.toUpperCase()} Image</Label>
                        <Input
                          type="file"
                          accept="image/*"
                          ref={key === "a" ? fileInputA : fileInputB}
                          onChange={(e) => handleImageChange(e, key)}
                        />
                        {previewUrls[key] && (
                          <div className="mt-4">
                            <Image
                              src={previewUrls[key]}
                              alt={`Option ${key.toUpperCase()} Preview`}
                              width={200}
                              height={200}
                              className="rounded-lg border"
                            />
                          </div>
                        )}
                        <Label className="mt-2">Description</Label>
                        <Textarea
                          name={`outfit_${key}_description`}
                          value={newBattle[`outfit_${key}_description`]}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    ))}
                  </div>
                  <Button type="submit" className="w-full">
                    Submit Battle
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        )}

        {/* BATTLE DISPLAY */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {battles.map((battle) => {
            const userVote = userVotes[battle.id];
            const hasEnded = new Date(battle.ends_at) < new Date();
            const totalVotes = battle.votes_a + battle.votes_b;
            const aPercentage =
              totalVotes > 0
                ? Math.round((battle.votes_a / totalVotes) * 100)
                : 50;
            const bPercentage =
              totalVotes > 0
                ? Math.round((battle.votes_b / totalVotes) * 100)
                : 50;

            return (
              <Card key={battle.id} className="overflow-hidden">
                <CardHeader>
                  <CardTitle>{battle.title}</CardTitle>
                  <p className="text-gray-500 text-sm">{battle.description}</p>
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <Clock className="w-4 h-4" />
                    Ends: {new Date(battle.ends_at).toLocaleString()}
                    {hasEnded && (
                      <span className="ml-2 text-red-500">(Ended)</span>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    {/* Option A */}
                    <div
                      className={`border-2 rounded-lg p-2 ${
                        userVote === "A" ? "border-green-500 bg-green-50" : ""
                      }`}
                    >
                      <div className="relative aspect-square">
                        <Image
                          src={battle.image_a_url}
                          alt="Option A"
                          fill
                          className="object-cover rounded-lg"
                        />
                      </div>
                      <p className="mt-2 text-sm text-gray-600">
                        {battle.outfit_a_description}
                      </p>
                    </div>

                    {/* Option B */}
                    <div
                      className={`border-2 rounded-lg p-2 ${
                        userVote === "B" ? "border-green-500 bg-green-50" : ""
                      }`}
                    >
                      <div className="relative aspect-square">
                        <Image
                          src={battle.image_b_url}
                          alt="Option B"
                          fill
                          className="object-cover rounded-lg"
                        />
                      </div>
                      <p className="mt-2 text-sm text-gray-600">
                        {battle.outfit_b_description}
                      </p>
                    </div>
                  </div>

                  {/* Voting UI */}
                  <div className="mt-6 space-y-4">
                    <div className="flex justify-between text-sm font-medium">
                      <span>Option A: {battle.votes_a} votes</span>
                      <span>Option B: {battle.votes_b} votes</span>
                    </div>

                    <div className="w-full flex h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="bg-blue-600"
                        style={{ width: `${aPercentage}%` }}
                      ></div>
                      <div
                        className="bg-pink-600"
                        style={{ width: `${bPercentage}%` }}
                      ></div>
                    </div>

                    {!user ? (
                      <p className="text-center py-4 text-gray-500">
                        Sign in to vote
                      </p>
                    ) : hasEnded ? (
                      <div className="text-center py-4 text-gray-500">
                        Voting has ended
                      </div>
                    ) : userVote ? (
                      <div className="text-center py-4 text-green-600 font-medium">
                        You voted for Option {userVote}
                      </div>
                    ) : (
                      <div className="flex gap-4 justify-center mt-4">
                        <Button
                          onClick={() => handleVote(battle.id, "A")}
                          disabled={votingLoading[battle.id]}
                          className="flex-1 bg-blue-600 hover:bg-blue-700"
                        >
                          {votingLoading[battle.id] ? "Voting..." : "Vote A"}
                        </Button>
                        <Button
                          onClick={() => handleVote(battle.id, "B")}
                          disabled={votingLoading[battle.id]}
                          className="flex-1 bg-pink-600 hover:bg-pink-700"
                        >
                          {votingLoading[battle.id] ? "Voting..." : "Vote B"}
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {battles.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="bg-gray-100 border-2 border-dashed rounded-xl w-16 h-16 mx-auto flex items-center justify-center">
              <Trophy className="text-gray-400" />
            </div>
            <h3 className="mt-4 text-xl font-semibold">No active battles</h3>
            <p className="mt-2 text-gray-500">
              Check back later for new style competitions
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
