import { useState, useEffect, useCallback } from "react";
import { apiFetch } from "../lib/api";
import type { Feed } from "../types/feed";

interface FeedsResponse {
  feeds: Feed[];
  total: number;
  page: number;
}

export function useFeeds() {
  const [feeds, setFeeds] = useState<Feed[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchFeeds = useCallback(async (page = 1, search = "") => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page: String(page) });
      if (search) params.set("search", search);
      const res = await apiFetch<FeedsResponse>(`/api/feeds?${params}`);
      setFeeds(res.feeds);
      setTotal(res.total);
      setCurrentPage(page);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load feeds");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFeeds();
  }, [fetchFeeds]);

  async function deleteFeed(id: string) {
    await apiFetch(`/api/feeds/${id}`, { method: "DELETE" });
    await fetchFeeds(currentPage);
  }

  async function toggleActive(id: string, isActive: boolean) {
    await apiFetch(`/api/feeds/${id}`, {
      method: "PUT",
      body: JSON.stringify({ is_active: isActive }),
    });
    setFeeds((prev) =>
      prev.map((f) => (f.id === id ? { ...f, is_active: isActive } : f))
    );
  }

  return {
    feeds,
    loading,
    error,
    total,
    currentPage,
    fetchFeeds,
    deleteFeed,
    toggleActive,
    refetch: () => fetchFeeds(currentPage),
  };
}
