"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Heart, Share2, Star, Truck, Shield, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useProducts } from "@/lib/hooks/useProducts";
import { useCartStore } from "@/lib/stores/cartStore";
import { useUserStore } from "@/lib/stores/userStore";
import { initializePaystack } from "@/lib/paystack";
import { getOptimizedImageUrl } from "@/lib/storage";
import { toast } from "sonner";
import Image from "next/image";

export function ProductDetails({ slug }) {
  const [product, setProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState("M");
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [imageError, setImageError] = useState({});

  const { getProduct } = useProducts();
  const { addItem } = useCartStore();
  const { user } = useUserStore();

  useEffect(() => {
    const fetchProduct = async () => {
      const productData = await getProduct(slug);
      setProduct(productData);
      setLoading(false);
    };
    fetchProduct();
  }, [slug, getProduct]);

  const handleAddToCart = () => {
    if (!product) return;
    addItem(product, selectedSize, quantity);
    toast.success("Added to cart!");
  };

  const handleBuyNow = () => {
    if (!user) {
      toast.error("Please login to purchase");
      return;
    }

    if (typeof window !== "undefined") {
      initializePaystack(
        user.email,
        product.price * quantity,
        (response) => {
          toast.success("Payment successful!");
          // Handle successful payment
        },
        () => {
          toast.error("Payment cancelled");
        }
      );
    } else {
      toast.error("Payment service not available");
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="aspect-square bg-gray-200 rounded-lg animate-pulse"></div>
          <div className="space-y-4">
            <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
        <p className="text-gray-600">
          The product you're looking for doesn't exist.
        </p>
      </div>
    );
  }

  // Combine main image with additional images, filter out any null/undefined values
  const allImages = [product.image_url, ...(product.images || [])].filter(
    Boolean
  );
  const images = allImages.length > 0 ? allImages : [product.image_url];
  const sizes = ["XS", "S", "M", "L", "XL", "XXL"];

  const handleImageError = (index) => {
    setImageError((prev) => ({ ...prev, [index]: true }));
  };
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Product Images */}
        <div className="space-y-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="aspect-square rounded-lg overflow-hidden relative"
          >
            {!imageError[selectedImage] ? (
              <Image
                src={getOptimizedImageUrl(images[selectedImage], {
                  width: 600,
                  height: 600,
                  quality: 90,
                })}
                alt={product.name}
                fill
                className="object-cover"
                onError={() => handleImageError(selectedImage)}
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <span className="text-gray-400">Image not available</span>
              </div>
            )}
          </motion.div>

          {images.length > 1 && (
            <div className="flex gap-2">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`relative w-20 h-20 rounded-lg overflow-hidden border-2 ${
                    selectedImage === index
                      ? "border-purple-600"
                      : "border-gray-200"
                  }`}
                >
                  <span>
                    {!imageError[`thumb-${index}`] ? (
                      <Image
                        src={getOptimizedImageUrl(image, {
                          width: 80,
                          height: 80,
                          quality: 80,
                        })}
                        alt={`${product.name} ${index + 1}`}
                        fill
                        className="object-cover"
                        onError={() => handleImageError(`thumb-${index}`)}
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-400 text-xs">N/A</span>
                      </div>
                    )}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              {product.is_new && <Badge>New</Badge>}
              {product.is_featured && (
                <Badge variant="secondary">Featured</Badge>
              )}
            </div>
            <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < (product.rating || 4)
                          ? "text-yellow-400 fill-current"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600">
                  ({product.reviews_count || 24} reviews)
                </span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {product.original_price &&
                product.original_price > product.price && (
                  <span className="text-xl text-gray-400 line-through">
                    ₦{product.original_price.toLocaleString()}
                  </span>
                )}
              <span className="text-3xl font-bold">
                ₦{product.price.toLocaleString()}
              </span>
            </div>
          </div>

          <p className="text-gray-600">{product.description}</p>

          {/* Size Selection */}
          <div className="space-y-2">
            <Label>Size</Label>
            <div className="flex gap-2">
              {sizes.map((size) => (
                <Button
                  key={size}
                  variant={selectedSize === size ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedSize(size)}
                >
                  {size}
                </Button>
              ))}
            </div>
          </div>

          {/* Quantity */}
          <div className="space-y-2">
            <Label>Quantity</Label>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
              >
                -
              </Button>
              <span className="w-12 text-center">{quantity}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setQuantity(quantity + 1)}
              >
                +
              </Button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <Button
              onClick={handleAddToCart}
              className="flex-1"
              variant="outline"
            >
              Add to Cart
            </Button>
            <Button
              onClick={handleBuyNow}
              className="flex-1 bg-gradient-to-r from-purple-600 to-orange-500"
            >
              Buy Now
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsLiked(!isLiked)}
            >
              <Heart
                className={`w-5 h-5 ${
                  isLiked ? "fill-red-500 text-red-500" : ""
                }`}
              />
            </Button>
            <Button variant="outline" size="sm">
              <Share2 className="w-5 h-5" />
            </Button>
          </div>

          {/* Features */}
          <div className="border-t pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="font-semibold">Free Shipping</p>
                  <p className="text-sm text-gray-600">
                    On orders over ₦50,000
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="font-semibold">Secure Payment</p>
                  <p className="text-sm text-gray-600">Protected by Paystack</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <RotateCcw className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="font-semibold">Easy Returns</p>
                  <p className="text-sm text-gray-600">30-day return policy</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Product Details Tabs */}
      <div className="mt-16">
        <Tabs defaultValue="description" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="description">Description</TabsTrigger>
            <TabsTrigger value="specs">Specifications</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>
          <TabsContent value="description" className="mt-6">
            <div className="prose max-w-none">
              <p>{product.long_description || product.description}</p>
            </div>
          </TabsContent>
          <TabsContent value="specs" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">Materials</h4>
                <p className="text-gray-600">
                  {product.materials || "Premium cotton blend"}
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Care Instructions</h4>
                <p className="text-gray-600">
                  {product.care_instructions ||
                    "Machine wash cold, tumble dry low"}
                </p>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="reviews" className="mt-6">
            <div className="space-y-4">
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${
                          i < (product.rating || 4)
                            ? "text-yellow-400 fill-current"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-lg font-semibold">
                    {product.rating || 4.5} out of 5
                  </span>
                </div>
                <span className="text-gray-600">
                  Based on {product.reviews_count || 24} reviews
                </span>
              </div>

              <div className="space-y-4">
                {/* Sample reviews */}
                <div className="border-b pb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className="w-4 h-4 text-yellow-400 fill-current"
                        />
                      ))}
                    </div>
                    <span className="font-semibold">Amazing quality!</span>
                  </div>
                  <p className="text-gray-600 mb-2">
                    "Love the fit and feel of this piece. The material is
                    premium and the design is exactly what I was looking for."
                  </p>
                  <span className="text-sm text-gray-500">- Sarah M.</span>
                </div>

                <div className="border-b pb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex items-center gap-1">
                      {[...Array(4)].map((_, i) => (
                        <Star
                          key={i}
                          className="w-4 h-4 text-yellow-400 fill-current"
                        />
                      ))}
                      <Star className="w-4 h-4 text-gray-300" />
                    </div>
                    <span className="font-semibold">Great purchase</span>
                  </div>
                  <p className="text-gray-600 mb-2">
                    "Fast shipping and excellent customer service. The product
                    matches the description perfectly."
                  </p>
                  <span className="text-sm text-gray-500">- Mike D.</span>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
