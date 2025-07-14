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
import { supabase } from "@/lib/supabase";
import {
  uploadProductImage,
  uploadProductImages,
  deleteProductImage,
  initializeStorage,
} from "@/lib/storage";
import { toast } from "sonner";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import Image from "next/image";

export function ProductManager() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [categories, setCategories] = useState([]);
  const [mainImageFile, setMainImageFile] = useState(null);
  const [additionalImageFiles, setAdditionalImageFiles] = useState([]);
  const [mainImagePreview, setMainImagePreview] = useState(null);
  const [additionalImagePreviews, setAdditionalImagePreviews] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    long_description: "",
    price: "",
    image_url: "",
    images: [],
    category_id: "",
    is_featured: false,
    is_new: false,
    stock_quantity: "",
    materials: "",
    care_instructions: "",
  });

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select(
          `
          *,
          categories (
            id,
            name,
            slug
          )
        `
        )
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      toast.error("Error fetching products");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("is_active", true)
        .order("name");

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleMainImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMainImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setMainImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleAdditionalImagesChange = (e) => {
    const files = Array.from(e.target.files);
    setAdditionalImageFiles(files);

    // Create previews
    const previews = [];
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        previews.push(e.target.result);
        if (previews.length === files.length) {
          setAdditionalImagePreviews(previews);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeAdditionalImage = (index) => {
    const newFiles = additionalImageFiles.filter((_, i) => i !== index);
    const newPreviews = additionalImagePreviews.filter((_, i) => i !== index);
    setAdditionalImageFiles(newFiles);
    setAdditionalImagePreviews(newPreviews);
  };

  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);

    try {
      let imageUrl = formData.image_url;
      let additionalImages = formData.images || [];

      // Generate slug if not provided
      const slug = formData.slug || generateSlug(formData.name);

      // Upload main image if provided
      if (mainImageFile) {
        const { url } = await uploadProductImage(mainImageFile, slug, true);
        imageUrl = url;
      }

      // Upload additional images if provided
      if (additionalImageFiles.length > 0) {
        const uploadResults = await uploadProductImages(
          additionalImageFiles,
          slug
        );
        additionalImages = uploadResults.map((result) => result.url);
      }

      const productData = {
        ...formData,
        slug,
        price: parseFloat(formData.price),
        stock_quantity: parseInt(formData.stock_quantity),
        image_url: imageUrl,
        images: additionalImages,
        category_id: formData.category_id || null,
      };

      if (editingProduct) {
        const { error } = await supabase
          .from("products")
          .update(productData)
          .eq("id", editingProduct.id);

        if (error) throw error;
        toast.success("Product updated successfully");
      } else {
        const { error } = await supabase.from("products").insert([productData]);

        if (error) throw error;
        toast.success("Product created successfully");
      }

      resetForm();
      setIsDialogOpen(false);
      fetchProducts();
    } catch (error) {
      console.error("Error saving product:", error);
      toast.error("Error saving product");
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      slug: "",
      description: "",
      long_description: "",
      price: "",
      image_url: "",
      images: [],
      category_id: "",
      is_featured: false,
      is_new: false,
      stock_quantity: "",
      materials: "",
      care_instructions: "",
    });
    setMainImageFile(null);
    setAdditionalImageFiles([]);
    setMainImagePreview(null);
    setAdditionalImagePreviews([]);
    setEditingProduct(null);
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      slug: product.slug,
      description: product.description,
      long_description: product.long_description || "",
      price: product.price.toString(),
      image_url: product.image_url,
      images: product.images || [],
      category_id: product.category_id || "",
      is_featured: product.is_featured,
      is_new: product.is_new,
      stock_quantity: product.stock_quantity.toString(),
      materials: product.materials || "",
      care_instructions: product.care_instructions || "",
    });
    setMainImagePreview(product.image_url);
    setAdditionalImagePreviews(product.images || []);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this product?")) {
      try {
        const { error } = await supabase.from("products").delete().eq("id", id);

        if (error) throw error;
        toast.success("Product deleted successfully");
        fetchProducts();
      } catch (error) {
        toast.error("Error deleting product");
      }
    }
  };

  if (loading) {
    return <div>Loading products...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Products</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>Add Product</Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingProduct ? "Edit Product" : "Add New Product"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Product Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={(e) => {
                      handleInputChange(e);
                      // Auto-generate slug
                      if (!formData.slug) {
                        setFormData((prev) => ({
                          ...prev,
                          slug: generateSlug(e.target.value),
                        }));
                      }
                    }}
                    required
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
                <Label htmlFor="long_description">Long Description</Label>
                <Textarea
                  id="long_description"
                  name="long_description"
                  value={formData.long_description}
                  onChange={handleInputChange}
                  rows={4}
                />
              </div>

              {/* Pricing and Inventory */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">Price (₦)</Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="stock_quantity">Stock Quantity</Label>
                  <Input
                    id="stock_quantity"
                    name="stock_quantity"
                    type="number"
                    value={formData.stock_quantity}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="category_id">Category</Label>
                <select
                  id="category_id"
                  name="category_id"
                  value={formData.category_id}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-lg"
                >
                  <option value="">Select Category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Image Upload Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Product Images</h3>

                {/* Main Image Upload */}
                <div>
                  <Label htmlFor="main_image">Main Product Image</Label>
                  <div className="mt-2">
                    <input
                      id="main_image"
                      type="file"
                      accept="image/*"
                      onChange={handleMainImageChange}
                      className="hidden"
                    />
                    <div className="flex items-center gap-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() =>
                          document.getElementById("main_image").click()
                        }
                        className="flex items-center gap-2"
                      >
                        <Upload className="w-4 h-4" />
                        Upload Main Image
                      </Button>
                      {mainImagePreview && (
                        <div className="relative w-20 h-20 rounded-lg overflow-hidden border">
                          <Image
                            src={mainImagePreview}
                            alt="Main image preview"
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Additional Images Upload */}
                <div>
                  <Label htmlFor="additional_images">
                    Additional Images (Optional)
                  </Label>
                  <div className="mt-2">
                    <input
                      id="additional_images"
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleAdditionalImagesChange}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() =>
                        document.getElementById("additional_images").click()
                      }
                      className="flex items-center gap-2 mb-4"
                    >
                      <ImageIcon className="w-4 h-4" />
                      Upload Additional Images
                    </Button>

                    {additionalImagePreviews.length > 0 && (
                      <div className="grid grid-cols-4 gap-2">
                        {additionalImagePreviews.map((preview, index) => (
                          <div
                            key={index}
                            className="relative w-20 h-20 rounded-lg overflow-hidden border"
                          >
                            <Image
                              src={preview}
                              alt={`Additional image ${index + 1}`}
                              fill
                              className="object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => removeAdditionalImage(index)}
                              className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Fallback URL inputs for editing existing products */}
                {editingProduct && (
                  <div className="space-y-2 p-4 bg-gray-50 rounded-lg">
                    <Label className="text-sm text-gray-600">
                      Or update image URLs directly:
                    </Label>
                    <div>
                      <Label htmlFor="image_url">Main Image URL</Label>
                      <Input
                        id="image_url"
                        name="image_url"
                        value={formData.image_url}
                        onChange={handleInputChange}
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Product Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="materials">Materials</Label>
                  <Input
                    id="materials"
                    name="materials"
                    value={formData.materials}
                    onChange={handleInputChange}
                    placeholder="e.g., 100% Cotton"
                  />
                </div>
                <div>
                  <Label htmlFor="care_instructions">Care Instructions</Label>
                  <Input
                    id="care_instructions"
                    name="care_instructions"
                    value={formData.care_instructions}
                    onChange={handleInputChange}
                    placeholder="e.g., Machine wash cold"
                  />
                </div>
              </div>

              {/* Product Flags */}
              <div className="flex gap-6">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is_featured"
                    name="is_featured"
                    checked={formData.is_featured}
                    onChange={handleInputChange}
                  />
                  <Label htmlFor="is_featured">Featured Product</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is_new"
                    name="is_new"
                    checked={formData.is_new}
                    onChange={handleInputChange}
                  />
                  <Label htmlFor="is_new">New Product</Label>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1" disabled={uploading}>
                  <span>
                    {uploading
                      ? "Uploading..."
                      : editingProduct
                      ? "Update Product"
                      : "Create Product"}
                  </span>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    resetForm();
                    setIsDialogOpen(false);
                  }}
                  disabled={uploading}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Products List */}
      <div className="grid gap-4">
        {products.map((product) => (
          <div key={product.id} className="border rounded-lg p-4">
            <div className="flex justify-between items-start">
              <div className="flex gap-4">
                {/* Product Image */}
                <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-100">
                  {product.image_url ? (
                    <Image
                      src={product.image_url}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div>
                  <h3 className="font-semibold text-lg">{product.name}</h3>
                  {product.categories && (
                    <p className="text-sm text-gray-500">
                      {product.categories.name}
                    </p>
                  )}
                  <p className="text-gray-600 text-sm">{product.description}</p>
                  <p className="text-xl font-bold mt-2">
                    ₦{product.price.toLocaleString()}
                  </p>
                  <div className="flex items-center gap-4 mt-1">
                    <p className="text-sm text-gray-500">
                      Stock: {product.stock_quantity}
                    </p>
                    {product.images && product.images.length > 0 && (
                      <p className="text-sm text-gray-500">
                        +{product.images.length} more images
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(product)}
                >
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(product.id)}
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
