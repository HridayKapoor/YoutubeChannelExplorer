
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/Header";
import VideoGrid from "@/components/video/VideoGrid";
import { fetchWatchLaterVideos } from "@/lib/api";
import SearchInput from "@/components/ui/SearchInput";

export default function WatchLater() {
  const [searchQuery, setSearchQuery] = useState("");
  const { data: videos, isLoading } = useQuery({
    queryKey: ["/api/watch-later"],
    queryFn: fetchWatchLaterVideos
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container px-4 py-6 md:py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl md:text-3xl font-bold">Watch Later</h2>
          <SearchInput
            placeholder="Search videos..."
            value={searchQuery}
            onChange={setSearchQuery}
            className="w-full max-w-sm"
          />
        </div>
        <VideoGrid
          videos={videos || []}
          searchQuery={searchQuery}
          isLoading={isLoading}
        />
      </main>
    </div>
  );
}
