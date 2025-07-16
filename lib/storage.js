import { supabase } from "./supabase";

// Upload a single product image
export const uploadProductImage = async (
  file,
  productSlug,
  isMainImage = false
) => {
  const fileExt = file.name.split(".").pop();
  let fileName = `${productSlug}/${
    isMainImage ? "main" : Date.now()
  }.${fileExt}`;

  try {
    const { data, error } = await supabase.storage
      .from("products")
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type || "image/jpeg",
      });

    if (error) {
      if (error.message?.includes("already exists")) {
        throw new Error("File already exists");
      }
      throw error;
    }

    const { data: urlData, error: urlError } = supabase.storage
      .from("products")
      .getPublicUrl(fileName);

    if (urlError || !urlData?.publicUrl) {
      throw new Error("Failed to generate public URL");
    }

    return { url: urlData.publicUrl, path: fileName };
  } catch (error) {
    console.error("❌ Error uploading image:", error.message);
    throw error;
  }
};

// Upload multiple product images
export const uploadProductImages = async (files, productSlug) => {
  try {
    const uploadPromises = files.map((file, index) =>
      uploadProductImage(file, productSlug, false)
    );
    const results = await Promise.all(uploadPromises);
    return results;
  } catch (error) {
    console.error("❌ Error uploading multiple images:", error.message);
    throw error;
  }
};

// Delete image from storage
export const deleteProductImage = async (imagePath) => {
  try {
    const { error } = await supabase.storage
      .from("products")
      .remove([imagePath]);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("❌ Error deleting image:", error.message);
    throw error;
  }
};

// Optional: Get optimized image URL with transformations
export const getOptimizedImageUrl = (url, options = {}) => {
  if (!url) return null;

  const { width, height, quality = 80, format = "webp" } = options;

  if (url.includes("supabase")) {
    const baseUrl = url.split("?")[0];
    const params = new URLSearchParams();

    if (width) params.append("width", width);
    if (height) params.append("height", height);
    params.append("quality", quality);
    params.append("format", format);

    return `${baseUrl}?${params.toString()}`;
  }

  return url;
};

export async function uploadLookbookCoverImage(file, lookTitle) {
  const ext = file.name.split(".").pop();

  // ✅ DO NOT prefix with "lookbook/"
  const fileName = `${lookTitle
    .toLowerCase()
    .replace(/\s+/g, "-")}-${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("lookbook") // this is the bucket
    .upload(fileName, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type || "image/jpeg",
    });

  if (uploadError) {
    if (uploadError.message.includes("already exists")) {
      throw new Error("Cover image already exists. Please rename your file.");
    }
    throw uploadError;
  }

  const { data: urlData, error: urlError } = supabase.storage
    .from("lookbook")
    .getPublicUrl(fileName);

  if (urlError || !urlData?.publicUrl) {
    throw new Error("Failed to retrieve cover image URL.");
  }

  return urlData.publicUrl;
}
