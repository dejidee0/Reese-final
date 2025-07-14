"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, Heart, Share2, Play, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCartStore } from "@/lib/stores/cartStore";
import { useUserStore } from "@/lib/stores/userStore";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import Image from "next/image";
import Link from "next/link";

export function LookbookPage() {
  const [looks, setLooks] = useState([]);
  const [selectedLook, setSelectedLook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hoveredLook, setHoveredLook] = useState(null);
  const [playingVideo, setPlayingVideo] = useState(null);
  const { addItem } = useCartStore();
  const { user } = useUserStore();

  useEffect(() => {
    fetchLooks();
  }, []);

  const fetchLooks = async () => {
    try {
      const { data, error } = await supabase
        .from("lookbook")
        .select(
          `
          *,
          lookbook_products (
            id,
            size,
            products (
              id,
              name,
              slug,
              price,
              image_url,
              stock_quantity
            )
          )
        `
        )
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setLooks(data || []);
    } catch (error) {
      console.error("Error fetching looks:", error);
      toast.error("Error loading lookbook");
    } finally {
      setLoading(false);
    }
  };

  const handleShopLook = (look) => {
    if (!look.lookbook_products || look.lookbook_products.length === 0) {
      toast.error("No products available for this look");
      return;
    }

    let addedCount = 0;
    look.lookbook_products.forEach((item) => {
      if (item.products && item.products.stock_quantity > 0) {
        addItem(item.products, item.size || "M", 1);
        addedCount++;
      }
    });

    toast[addedCount > 0 ? "success" : "error"](
      addedCount > 0
        ? `Added ${addedCount} items to cart!`
        : "No items available to add to cart"
    );
  };

  const handleLikeLook = async (lookId) => {
    if (!user) {
      toast.error("Please login to like looks");
      return;
    }

    try {
      const { data: existingLike } = await supabase
        .from("lookbook_likes")
        .select("id")
        .eq("lookbook_id", lookId)
        .eq("user_id", user.id)
        .single();

      if (existingLike) {
        await supabase
          .from("lookbook_likes")
          .delete()
          .eq("id", existingLike.id);
        await supabase.rpc("decrement_likes_count", { look_id: lookId });
        toast.success("Look unliked");
      } else {
        await supabase
          .from("lookbook_likes")
          .insert({ lookbook_id: lookId, user_id: user.id });
        await supabase.rpc("increment_likes_count", { look_id: lookId });
        toast.success("Look liked!");
      }

      fetchLooks(); // Refresh likes
    } catch (error) {
      console.error("Error updating like:", error);
      toast.error("Error updating like");
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="aspect-[3/4] bg-gray-800 rounded-lg animate-pulse"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="relative h-screen flex items-center justify-center overflow-hidden"
      >
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black z-10" />
          <motion.img
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 10, ease: "easeOut" }}
            src="https://images.pexels.com/photos/1661471/pexels-photo-1661471.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080"
            alt="Lookbook Hero"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="relative z-20 text-center max-w-4xl mx-auto px-4">
          <motion.h1
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-5xl md:text-7xl font-bold mb-6"
          >
            The{" "}
            <span className="block bg-gradient-to-r from-purple-400 to-orange-400 bg-clip-text text-transparent">
              Lookbook
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl md:text-2xl text-gray-300 mb-8"
          >
            Curated styles. Endless inspiration. Shop the complete look.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <Button
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-orange-500 hover:from-purple-700 hover:to-orange-600"
              onClick={() =>
                document
                  .getElementById("looks-grid")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            >
              Explore Looks
            </Button>
          </motion.div>
        </div>

        {/* Floating Effects */}
        <motion.div
          className="absolute top-1/4 right-1/4 w-32 h-32 bg-purple-500/20 rounded-full blur-xl"
          animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-1/4 left-1/4 w-24 h-24 bg-orange-500/20 rounded-full blur-xl"
          animate={{ x: [0, -20, 0], y: [0, 30, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.section>

      {/* Looks Grid */}
      <section id="looks-grid" className="py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold mb-4">Featured Looks</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Discover our latest styled collections and shop the complete look
              with one click.
            </p>
          </motion.div>

          {looks.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-xl font-semibold mb-2">No looks available</h3>
              <p className="text-gray-400">
                Check back soon for new styled collections!
              </p>
            </div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {looks.map((look) => (
                <motion.div
                  key={look.id}
                  variants={itemVariants}
                  className="group cursor-pointer"
                  onMouseEnter={() => setHoveredLook(look.id)}
                  onMouseLeave={() => setHoveredLook(null)}
                  onClick={() => setSelectedLook(look)}
                >
                  <Card className="bg-gray-900 border-gray-800 overflow-hidden">
                    <div className="relative aspect-[3/4] overflow-hidden">
                      {look.video_url ? (
                        <div className="relative w-full h-full">
                          <video
                            src={look.video_url}
                            className="w-full h-full object-cover"
                            muted
                            loop
                            autoPlay={playingVideo === look.id}
                            onLoadedData={() => {
                              if (hoveredLook === look.id) {
                                setPlayingVideo(look.id);
                              }
                            }}
                          />
                          <div className="absolute inset-0 bg-black/20" />
                          <Button
                            variant="ghost"
                            size="sm"
                            className="absolute top-4 right-4 text-white hover:bg-white/20"
                            onClick={(e) => {
                              e.stopPropagation();
                              setPlayingVideo(
                                playingVideo === look.id ? null : look.id
                              );
                            }}
                          >
                            {playingVideo === look.id ? (
                              <Pause className="w-4 h-4" />
                            ) : (
                              <Play className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      ) : (
                        <Image
                          src={look.cover_image}
                          alt={look.title}
                          fill
                          className="object-cover"
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      <div className="absolute bottom-4 left-4 right-4">
                        <div className="flex justify-between items-center text-white">
                          <h3 className="text-xl font-bold">{look.title}</h3>
                          <span className="text-sm text-gray-300">
                            {look.lookbook_products?.length || 0} items
                          </span>
                        </div>
                        <div className="mt-2 flex justify-between items-center">
                          <div className="flex gap-2">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="text-white hover:bg-white/20"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleLikeLook(look.id);
                              }}
                            >
                              <Heart className="w-4 h-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="text-white hover:bg-white/20"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (navigator.share) {
                                  navigator.share({
                                    title: look.title,
                                    text: look.description,
                                    url: window.location.href,
                                  });
                                }
                              }}
                            >
                              <Share2 className="w-4 h-4" />
                            </Button>
                          </div>
                          <Button
                            size="sm"
                            className="bg-gradient-to-r from-purple-600 to-orange-500"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleShopLook(look);
                            }}
                          >
                            <ShoppingBag className="w-4 h-4 mr-1" />
                            Shop Look
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* Modal */}
      <AnimatePresence>
        {selectedLook && (
          <Dialog
            open={!!selectedLook}
            onOpenChange={() => setSelectedLook(null)}
          >
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gray-900 border-gray-800 text-white">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold">
                  {selectedLook.title}
                </DialogTitle>
              </DialogHeader>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="relative aspect-[3/4] rounded-lg overflow-hidden">
                  {selectedLook.video_url ? (
                    <video
                      src={selectedLook.video_url}
                      className="w-full h-full object-cover"
                      controls
                      muted
                      loop
                    />
                  ) : (
                    <Image
                      src={selectedLook.cover_image}
                      alt={selectedLook.title}
                      fill
                      className="object-cover"
                    />
                  )}
                </div>

                <div className="space-y-6">
                  <p className="text-gray-300">{selectedLook.description}</p>
                  <div className="flex items-center gap-4">
                    <Badge className="bg-gradient-to-r from-purple-600 to-orange-500">
                      {selectedLook.category || "Featured"}
                    </Badge>
                    <span className="text-sm text-gray-400">
                      {selectedLook.lookbook_products?.length || 0} items
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-4">
                      Items in this look:
                    </h3>
                    <div className="space-y-3">
                      {selectedLook.lookbook_products?.map((item, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg"
                        >
                          <div className="relative w-16 h-16 rounded-lg overflow-hidden">
                            <Image
                              src={item.products?.image_url}
                              alt={item.products?.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold">
                              {item.products?.name}
                            </h4>
                            <p className="text-sm text-gray-400">
                              Size: {item.size || "M"}
                            </p>
                            <p className="text-lg font-bold">
                              ₦{item.products?.price.toLocaleString()}
                            </p>
                          </div>
                          <Link href={`/product/${item.products?.slug}`}>
                            <Button variant="outline" size="sm">
                              View
                            </Button>
                          </Link>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Button
                      className="flex-1 bg-gradient-to-r from-purple-600 to-orange-500"
                      onClick={() => {
                        handleShopLook(selectedLook);
                        setSelectedLook(null);
                      }}
                    >
                      <ShoppingBag className="w-4 h-4 mr-2" />
                      Shop Complete Look
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleLikeLook(selectedLook.id)}
                    >
                      <Heart className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </div>
  );
}
