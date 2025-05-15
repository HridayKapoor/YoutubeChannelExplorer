import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { searchYoutube, formatDuration, formatViewCount, formatTimeAgo } from "@/lib/api";
import Header from "@/components/layout/Header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search as SearchIcon, Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

interface VideoResult {
  id: string;
  type: "video";
  title: string;
  description: string;
  channelId: string;
  channelTitle: string;
  thumbnailUrl: string;
  publishedAt: string;
  duration: string;
  viewCount: string;
  likeCount: string;
}

interface PlaylistResult {
  id: string;
  type: "playlist";
  title: string;
  description: string;
  channelId: string;
  channelTitle: string;
  thumbnailUrl: string;
  itemCount: number;
}

type SearchResult = VideoResult | PlaylistResult;

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "video" | "playlist">("all");
  const { toast } = useToast();

  const { data: searchResults, isLoading, error } = useQuery({
    queryKey: ["/api/youtube/search", submittedQuery, activeTab],
    queryFn: async () => {
      if (!submittedQuery) return [];
      return await searchYoutube(submittedQuery, activeTab);
    },
    enabled: !!submittedQuery,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      toast({
        title: "Search query is required",
        description: "Please enter a search term to find videos and playlists.",
        variant: "destructive",
      });
      return;
    }
    setSubmittedQuery(searchQuery);
  };

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value as "all" | "video" | "playlist");
    if (submittedQuery) {
      // Rerun search with new tab value
      setSubmittedQuery(searchQuery);
    }
  };

  const filteredResults = searchResults || [];

  const videos = filteredResults.filter((item: any) => item.type === "video") as VideoResult[];
  const playlists = filteredResults.filter((item: any) => item.type === "playlist") as PlaylistResult[];

  const handleVideoClick = (video: VideoResult) => {
    window.open(`https://www.youtube.com/watch?v=${video.id}`, "_blank");
  };

  const handlePlaylistClick = (playlist: PlaylistResult) => {
    window.open(`https://www.youtube.com/playlist?list=${playlist.id}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container px-4 py-6 md:py-8">
        <h1 className="text-3xl font-bold mb-6">YouTube Search</h1>

        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-grow">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
            <Input
              type="text"
              placeholder="Search for educational videos, tutorials, lectures..."
              value={searchQuery}
              onChange={handleSearchInputChange}
              className="pl-10 h-11"
            />
          </div>
          <Button type="submit" className="h-11">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <SearchIcon className="mr-2 h-4 w-4" />
                Search
              </>
            )}
          </Button>
        </form>

        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-3 mb-6">
            <TabsTrigger value="all">All Results</TabsTrigger>
            <TabsTrigger value="video">Videos</TabsTrigger>
            <TabsTrigger value="playlist">Playlists</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-8">
            {submittedQuery && !isLoading && (
              <>
                {videos.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-semibold">Videos</h2>
                      {videos.length > 5 && (
                        <Button 
                          variant="ghost" 
                          onClick={() => setActiveTab("video")}
                        >
                          See all videos
                        </Button>
                      )}
                    </div>
                    <div className="space-y-4">
                      {videos.slice(0, 5).map((video) => (
                        <VideoSearchItem 
                          key={video.id} 
                          video={video} 
                          onClick={() => handleVideoClick(video)}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {playlists.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-semibold">Playlists</h2>
                      {playlists.length > 4 && (
                        <Button 
                          variant="ghost" 
                          onClick={() => setActiveTab("playlist")}
                        >
                          See all playlists
                        </Button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {playlists.slice(0, 4).map((playlist) => (
                        <PlaylistSearchItem 
                          key={playlist.id} 
                          playlist={playlist} 
                          onClick={() => handlePlaylistClick(playlist)}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {videos.length === 0 && playlists.length === 0 && (
                  <div className="text-center py-12">
                    <h3 className="text-xl font-medium mb-2">No results found</h3>
                    <p className="text-muted-foreground">
                      Try different keywords or phrases to find what you're looking for.
                    </p>
                  </div>
                )}
              </>
            )}

            {isLoading && (
              <div className="space-y-6">
                <div>
                  <Skeleton className="h-8 w-32 mb-4" />
                  <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="flex gap-4">
                        <Skeleton className="h-28 w-48 rounded-md" />
                        <div className="flex-1">
                          <Skeleton className="h-6 w-full mb-2" />
                          <Skeleton className="h-4 w-3/4 mb-2" />
                          <Skeleton className="h-4 w-1/2" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <Skeleton className="h-8 w-32 mb-4" />
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="space-y-2">
                        <Skeleton className="h-36 w-full rounded-md" />
                        <Skeleton className="h-5 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {!submittedQuery && !isLoading && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <SearchIcon className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-xl font-medium mb-2">Search YouTube Videos & Playlists</h3>
                <p className="text-muted-foreground max-w-md mb-6">
                  Enter keywords above to search for educational videos, tutorials, and playlists. We filter out shorts to help you focus on learning.
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="video" className="space-y-4">
            {submittedQuery && !isLoading && (
              <>
                {videos.length > 0 ? (
                  <div className="space-y-4">
                    {videos.map((video) => (
                      <VideoSearchItem 
                        key={video.id} 
                        video={video} 
                        onClick={() => handleVideoClick(video)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <h3 className="text-xl font-medium mb-2">No videos found</h3>
                    <p className="text-muted-foreground">
                      Try different keywords or check the "All Results" tab to see if there are playlists.
                    </p>
                  </div>
                )}
              </>
            )}

            {isLoading && (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex gap-4">
                    <Skeleton className="h-28 w-48 rounded-md" />
                    <div className="flex-1">
                      <Skeleton className="h-6 w-full mb-2" />
                      <Skeleton className="h-4 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="playlist" className="space-y-4">
            {submittedQuery && !isLoading && (
              <>
                {playlists.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {playlists.map((playlist) => (
                      <PlaylistSearchItem 
                        key={playlist.id} 
                        playlist={playlist} 
                        onClick={() => handlePlaylistClick(playlist)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <h3 className="text-xl font-medium mb-2">No playlists found</h3>
                    <p className="text-muted-foreground">
                      Try different keywords or check the "All Results" tab to see if there are videos.
                    </p>
                  </div>
                )}
              </>
            )}

            {isLoading && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-36 w-full rounded-md" />
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

interface VideoSearchItemProps {
  video: VideoResult;
  onClick: () => void;
}

function VideoSearchItem({ video, onClick }: VideoSearchItemProps) {
  return (
    <div
      className="flex flex-col sm:flex-row gap-4 p-2 rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
      onClick={onClick}
    >
      <div className="relative sm:w-48 w-full aspect-video rounded-md overflow-hidden">
        <img
          src={video.thumbnailUrl}
          alt={video.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-2 right-2 bg-background/80 text-foreground text-xs px-1 py-0.5 rounded">
          {formatDuration(video.duration)}
        </div>
      </div>
      <div className="flex-1">
        <h3 className="font-medium line-clamp-2 mb-1">{video.title}</h3>
        <div className="flex items-center text-sm text-muted-foreground mb-1">
          <span>{video.channelTitle}</span>
          <span className="mx-1.5">•</span>
          <span>{formatViewCount(video.viewCount)}</span>
          <span className="mx-1.5">•</span>
          <span>{formatTimeAgo(video.publishedAt)}</span>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2">{video.description}</p>
      </div>
    </div>
  );
}

interface PlaylistSearchItemProps {
  playlist: PlaylistResult;
  onClick: () => void;
}

function PlaylistSearchItem({ playlist, onClick }: PlaylistSearchItemProps) {
  return (
    <div
      className="flex flex-col gap-2 p-2 rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
      onClick={onClick}
    >
      <div className="relative aspect-video rounded-md overflow-hidden">
        <img
          src={playlist.thumbnailUrl}
          alt={playlist.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
          <span className="text-white font-medium">View Playlist</span>
        </div>
        <Badge className="absolute bottom-2 right-2">
          {playlist.itemCount} {playlist.itemCount === 1 ? 'video' : 'videos'}
        </Badge>
      </div>
      <h3 className="font-medium line-clamp-2">{playlist.title}</h3>
      <div className="text-sm text-muted-foreground">
        {playlist.channelTitle}
      </div>
    </div>
  );
}