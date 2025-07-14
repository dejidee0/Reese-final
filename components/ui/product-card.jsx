"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Heart, ShoppingCart, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCartStore } from "@/lib/stores/cartStore";
import { getOptimizedImageUrl } from "@/lib/storage";
import { toast } from "sonner";
import Image from "next/image";
import Link from "next/link";

export function ProductCard({ product, viewMode = "grid" }) {
  const [isHovered, setIsHovered] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [imageError, setImageError] = useState(false);
  const { addItem } = useCartStore();

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, "M", 1);
    toast.success("Added to cart!");
  };

  const handleLike = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLiked(!isLiked);
    toast.success(isLiked ? "Removed from wishlist" : "Added to wishlist");
  };
  // Get optimized image URL
  const optimizedImageUrl = getOptimizedImageUrl(product.image_url, {
    width: viewMode === "grid" ? 400 : 200,
    height: viewMode === "grid" ? 400 : 200,
    quality: 85,
  });

  return (
    <Link href={`/product/${product.slug}`}>
      <motion.div
        className="bg-white rounded-lg shadow-lg overflow-hidden cursor-pointer group"
        whileHover={{ y: -5 }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
      >
        <div className="relative aspect-square overflow-hidden">
          {!imageError ? (
            <Image
              src={optimizedImageUrl || product.image_url}
              alt={product.name}
              fill
              className="object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-400">No Image</span>
            </div>
          )}
          {product.is_new && (
            <Badge className="bg-green-500 text-white">New</Badge>
          )}
          {product.is_featured && (
            <Badge className="bg-purple-500 text-white">Featured</Badge>
          )}
          {product.discount_percentage > 0 && (
            <Badge className="bg-red-500 text-white">
              -{product.discount_percentage}%
            </Badge>
          )}

          {/* Hover Actions */}
          <motion.div
            className="absolute top-4 right-4 flex flex-col gap-2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: isHovered ? 1 : 0, x: isHovered ? 0 : 20 }}
            transition={{ duration: 0.2 }}
          >
            <Button
              size="sm"
              variant="outline"
              className="bg-white/90 backdrop-blur-sm"
              onClick={handleLike}
            >
              <Heart
                className={`w-4 h-4 ${
                  isLiked ? "fill-red-500 text-red-500" : ""
                }`}
              />
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="bg-white/90 backdrop-blur-sm"
            >
              <Eye className="w-4 h-4" />
            </Button>
          </motion.div>

          {/* Quick Add to Cart */}
          <motion.div
            className="absolute bottom-4 left-4 right-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 20 }}
            transition={{ duration: 0.2 }}
          >
            <Button
              onClick={handleAddToCart}
              className="w-full bg-gradient-to-r from-purple-600 to-orange-500"
              size="sm"
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              Add to Cart
            </Button>
          </motion.div>
        </div>

        <div className="p-4">
          <h3 className="font-semibold text-lg mb-2 line-clamp-1">
            {product.name}
          </h3>
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {product.description}
          </p>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {product.original_price &&
                product.original_price > product.price && (
                  <span className="text-sm text-gray-400 line-through">
                    ₦{product.original_price.toLocaleString()}
                  </span>
                )}

              {product.rating && (
                <div className="flex items-center gap-1">
                  <span className="text-yellow-400">★</span>
                  <span className="text-sm text-gray-600">
                    {product.rating}
                  </span>
                </div>
              )}
            </div>

            {product.stock_quantity <= 10 && product.stock_quantity > 0 && (
              <p className="text-sm text-orange-600 mt-2">
                Only {product.stock_quantity} left in stock!
              </p>
            )}

            {product.stock_quantity === 0 && (
              <p className="text-sm text-red-600 mt-2">Out of stock</p>
            )}
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
