import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { fetchChannels, fetchChannelVideos, fetchChannelPlaylists, formatSubscriberCount } from "@/lib/api";
import Header from "@/components/layout/Header";
import VideoGrid from "@/components/video/VideoGrid";
import PlaylistGrid from "@/components/playlist/PlaylistGrid";
import SearchInput from "@/components/ui/SearchInput";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Layers, Video, RefreshCw } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export default function ChannelDetail() {
  const [, params] = useRoute("/channel/:id");
  const channelId = params?.id ? parseInt(params.id) : 0;
  
  const [tab, setTab] = useState("videos");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("recent");
  const [currentPage, setCurrentPage] = useState(1);
  const [isRefreshingPlaylists, setIsRefreshingPlaylists] = useState(false);
  const { toast } = useToast();
  
  // Fetch channel data
  const { data: channels, isLoading: isLoadingChannel } = useQuery({
    queryKey: ["/api/channels"],
    queryFn: fetchChannels
  });
  
  const channel = channels?.find((c: { id: number }) => c.id === channelId);
  
  // Fetch videos
  const { data: videos, isLoading: isLoadingVideos } = useQuery({
    queryKey: ["/api/channels", channel?.channelId, "videos"],
    queryFn: () => fetchChannelVideos(channel?.channelId || ""),
    enabled: !!channel?.channelId
  });
  
  // Fetch playlists
  const { data: playlists, isLoading: isLoadingPlaylists, refetch: refetchPlaylists } = useQuery({
    queryKey: ["/api/channels", channel?.channelId, "playlists"],
    queryFn: () => fetchChannelPlaylists(channel?.channelId || ""),
    enabled: !!channel?.channelId
  });
  
  // Sort videos based on sort order
  const sortedVideos = videos ? [...videos].sort((a, b) => {
    if (sortOrder === "recent") {
      return new Date(b.publishedAt || 0).getTime() - new Date(a.publishedAt || 0).getTime();
    } else if (sortOrder === "oldest") {
      return new Date(a.publishedAt || 0).getTime() - new Date(b.publishedAt || 0).getTime();
    } else if (sortOrder === "popular") {
      return parseInt(b.viewCount || "0") - parseInt(a.viewCount || "0");
    }
    return 0;
  }) : [];
  
  // Function to refresh playlists from YouTube
  const refreshPlaylists = async () => {
    if (!channel?.channelId || isRefreshingPlaylists) return;
    
    try {
      setIsRefreshingPlaylists(true);
      toast({
        title: "Refreshing playlists...",
        description: "Fetching the latest playlists from YouTube."
      });
      
      await fetchChannelPlaylists(channel.channelId, true);
      await refetchPlaylists();
      
      toast({
        title: "Playlists refreshed",
        description: "All playlists have been updated from YouTube."
      });
    } catch (error) {
      toast({
        title: "Error refreshing playlists",
        description: "There was a problem fetching playlists. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsRefreshingPlaylists(false);
    }
  };
  
  const isLoading = isLoadingChannel || (tab === "videos" && isLoadingVideos) || (tab === "playlists" && isLoadingPlaylists);
  
  if (!channel && !isLoadingChannel) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container px-4 py-6 md:py-8">
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <h3 className="text-xl font-medium text-red-500 mb-2">Channel not found</h3>
            <p className="text-muted-foreground mb-6">
              The channel you're looking for doesn't exist or has been removed.
            </p>
            <button 
              onClick={() => window.location.href = '/'}
              className="inline-flex items-center justify-center px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Channels
            </button>
          </div>
        </main>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container px-4 py-6 md:py-8">
        {/* Channel Header & Nav */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center">
            <button 
              onClick={() => window.location.href = '/'}
              className="mr-4 p-2 rounded-full hover:bg-muted transition-colors duration-200"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            
            <div className="flex items-center">
              {isLoadingChannel ? (
                <>
                  <Skeleton className="w-12 h-12 rounded-full mr-3" />
                  <div>
                    <Skeleton className="h-6 w-40" />
                    <Skeleton className="h-4 w-24 mt-1" />
                  </div>
                </>
              ) : (
                <>
                  <div className="w-12 h-12 rounded-full overflow-hidden mr-3">
                    <img 
                      src={channel?.thumbnailUrl || "https://via.placeholder.com/48?text=Channel"}
                      alt={channel?.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h2 className="text-xl md:text-2xl font-bold">{channel?.title}</h2>
                    <p className="text-sm text-muted-foreground">
                      {formatSubscriberCount(channel?.subscriberCount)}
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
          
          <Tabs value={tab} onValueChange={setTab} className="w-full md:w-auto">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="videos" className="flex items-center">
                <Video className="h-4 w-4 mr-2" />
                Videos
              </TabsTrigger>
              <TabsTrigger value="playlists" className="flex items-center">
                <Layers className="h-4 w-4 mr-2" />
                Playlists
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <SearchInput 
            placeholder={`Search ${tab}...`}
            value={searchQuery}
            onChange={setSearchQuery}
            className="w-full sm:max-w-md"
          />
          
          {tab === "videos" && (
            <div className="flex-shrink-0">
              <Select value={sortOrder} onValueChange={setSortOrder}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Most recent</SelectItem>
                  <SelectItem value="oldest">Oldest first</SelectItem>
                  <SelectItem value="popular">Most viewed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          
          {tab === "playlists" && (
            <div className="flex-shrink-0">
              <Button 
                variant="outline" 
                size="sm"
                onClick={refreshPlaylists}
                disabled={isRefreshingPlaylists || isLoadingPlaylists}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshingPlaylists ? 'animate-spin' : ''}`} />
                {isRefreshingPlaylists ? 'Refreshing...' : 'Refresh Playlists'}
              </Button>
            </div>
          )}
        </div>
        
        {/* Content */}
        <Tabs value={tab} className="w-full">
          <TabsContent value="videos" className="mt-0">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="space-y-3">
                    <Skeleton className="h-40 w-full rounded-lg" />
                    <div className="space-y-2">
                      <Skeleton className="h-5 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <VideoGrid 
                videos={sortedVideos} 
                searchQuery={searchQuery}
                currentPage={currentPage}
                onPageChange={setCurrentPage}
              />
            )}
          </TabsContent>
          
          <TabsContent value="playlists" className="mt-0">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="space-y-3">
                    <Skeleton className="h-40 w-full rounded-lg" />
                    <div className="space-y-2">
                      <Skeleton className="h-5 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <PlaylistGrid 
                playlists={playlists || []} 
                searchQuery={searchQuery} 
              />
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
