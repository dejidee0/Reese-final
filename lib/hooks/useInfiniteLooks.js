// lib/hooks/useInfiniteLooks.js
import { useCallback, useState } from "react";
import { supabase } from "../supabase";

const PAGE_SIZE = 6;

export function useInfiniteLooks() {
  const [looks, setLooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [cursor, setCursor] = useState(null);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);

    let query = supabase
      .from("lookbook")
      .select(
        `
        *,
        lookbook_products (
          id,
          size,
          products (
            id, name, slug, price, image_url, stock_quantity
          )
        )
      `
      )
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(PAGE_SIZE);

    if (cursor) {
      query = query.gt("created_at", cursor);
    }

    const { data, error } = await query;
    if (error) {
      console.error(error);
      setLoading(false);
      return;
    }

    if (data.length < PAGE_SIZE) {
      setHasMore(false);
    }

    if (data.length > 0) {
      setCursor(data[data.length - 1].created_at);
      setLooks((prev) => [...prev, ...data]);
    }

    setLoading(false);
  }, [cursor, hasMore, loading]);

  return { looks, loadMore, loading, hasMore };
}
