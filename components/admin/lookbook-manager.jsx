"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import Image from "next/image";

export function LookbookManager() {
  const [looks, setLooks] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [coverImageFile, setCoverImageFile] = useState(null);
  const [coverImagePreview, setCoverImagePreview] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    cover_image: "",
    category: "",
    total_price: 0,
  });

  useEffect(() => {
    fetchLooks();
    fetchProducts();
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
              price,
              image_url
            )
          )
        `
        )
        .order("created_at", { ascending: false });

      if (error) throw error;
      setLooks(data || []);
    } catch (error) {
      toast.error("Error fetching looks");
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("id, name, slug, price, image_url")
        .eq("is_active", true)
        .order("name");

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "cover_image") return; // we handle file differently
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  const handleCoverImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCoverImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setCoverImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleProductSelection = (product, isSelected) => {
    if (isSelected) {
      setSelectedProducts((prev) => [...prev, { ...product, size: "M" }]);
    } else {
      setSelectedProducts((prev) => prev.filter((p) => p.id !== product.id));
    }
  };

  const updateProductSize = (productId, size) => {
    setSelectedProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, size } : p))
    );
  };

  const calculateTotalPrice = () => {
    return selectedProducts.reduce(
      (total, product) => total + product.price,
      0
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!coverImageFile) {
      toast.error("Please upload a cover image.");
      return;
    }

    if (selectedProducts.length === 0) {
      toast.error("Please select at least one product.");
      return;
    }

    try {
      const uploadedUrl = await uploadLookbookCoverImage(
        coverImageFile,
        formData.title
      );

      const lookData = {
        ...formData,
        cover_image: uploadedUrl,
        total_price: calculateTotalPrice(),
        is_active: true,
      };

      const { data: look, error } = await supabase
        .from("lookbook")
        .insert([lookData])
        .select()
        .single();

      if (error) throw error;

      const lookProducts = selectedProducts.map((product) => ({
        lookbook_id: look.id,
        product_id: product.id,
        size: product.size,
      }));

      const { error: productsError } = await supabase
        .from("lookbook_products")
        .insert(lookProducts);

      if (productsError) throw productsError;

      toast.success("Look created successfully");
      setIsDialogOpen(false);
      setSelectedProducts([]);
      setFormData({
        title: "",
        description: "",
        cover_image: "",

        category: "",
        total_price: 0,
      });
      setCoverImageFile(null);
      setCoverImagePreview(null);
      fetchLooks();
    } catch (error) {
      toast.error(error.message || "Error creating look");
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this look?")) {
      try {
        // Delete look products first
        await supabase.from("lookbook_products").delete().eq("lookbook_id", id);

        // Then delete the look
        const { error } = await supabase.from("lookbook").delete().eq("id", id);

        if (error) throw error;
        toast.success("Look deleted successfully");
        fetchLooks();
      } catch (error) {
        toast.error("Error deleting look");
      }
    }
  };

  if (loading) {
    return <div>Loading looks...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Lookbook</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>Create Look</Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Look</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Look Title</Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    placeholder="e.g., Street Style, Formal, Casual"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div>
                <Label htmlFor="cover_image">Cover Image</Label>
                <input
                  id="cover_image"
                  type="file"
                  accept="image/*"
                  onChange={handleCoverImageChange}
                  className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50"
                />
                {coverImagePreview && (
                  <div className="mt-2 w-24 h-32 relative rounded overflow-hidden border">
                    <Image
                      src={coverImagePreview}
                      alt="Preview"
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
              </div>

              <div>
                <Label>Select Products for this Look</Label>
                <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto border rounded p-2">
                  {products.map((product) => (
                    <label
                      key={product.id}
                      className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded"
                    >
                      <input
                        type="checkbox"
                        checked={selectedProducts.some(
                          (p) => p.id === product.id
                        )}
                        onChange={(e) =>
                          handleProductSelection(product, e.target.checked)
                        }
                      />
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-8 h-8 object-cover rounded"
                      />
                      <div className="flex-1">
                        <span className="text-sm">{product.name}</span>
                        <p className="text-xs text-gray-500">
                          ₦{product.price.toLocaleString()}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {selectedProducts.length > 0 && (
                <div>
                  <Label>Selected Products & Sizes</Label>
                  <div className="space-y-2 max-h-40 overflow-y-auto border rounded p-2">
                    {selectedProducts.map((product) => (
                      <div
                        key={product.id}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded"
                      >
                        <span className="text-sm">{product.name}</span>
                        <select
                          value={product.size}
                          onChange={(e) =>
                            updateProductSize(product.id, e.target.value)
                          }
                          className="text-sm border rounded px-2 py-1"
                        >
                          <option value="XS">XS</option>
                          <option value="S">S</option>
                          <option value="M">M</option>
                          <option value="L">L</option>
                          <option value="XL">XL</option>
                          <option value="XXL">XXL</option>
                        </select>
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    Total Price: ₦{calculateTotalPrice().toLocaleString()}
                  </p>
                </div>
              )}

              <div className="flex gap-2">
                <Button type="submit" className="flex-1">
                  Create Look
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {looks.map((look) => (
          <div key={look.id} className="border rounded-lg p-4">
            <div className="flex justify-between items-start">
              <div className="flex gap-4">
                <div className="relative w-24 h-32 rounded-lg overflow-hidden">
                  <Image
                    src={look.cover_image}
                    alt={look.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{look.title}</h3>
                  {look.category && (
                    <Badge variant="secondary" className="mb-2">
                      {look.category}
                    </Badge>
                  )}
                  <p className="text-gray-600 mb-2">{look.description}</p>
                  <p className="text-lg font-bold">
                    Total: ₦{look.total_price?.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-500">
                    {look.lookbook_products?.length || 0} products
                  </p>
                  <p className="text-sm text-gray-500">
                    {look.likes_count || 0} likes
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(look.id)}
                >
                  Delete
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
