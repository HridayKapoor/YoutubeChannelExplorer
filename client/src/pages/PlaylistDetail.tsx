import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { fetchPlaylist, fetchPlaylistVideos } from "@/lib/api";
import Header from "@/components/layout/Header";
import PlaylistVideoItem from "@/components/playlist/PlaylistVideoItem";
import VideoPlayer from "@/components/video/VideoPlayer";
import SearchInput from "@/components/ui/SearchInput";
import { ArrowLeft, PlayIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Video } from "@shared/schema";

export default function PlaylistDetail() {
  const [, params] = useRoute("/playlist/:id");
  const playlistId = params?.id || "";
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  
  // Fetch playlist data
  const { data: playlist, isLoading: isLoadingPlaylist } = useQuery({
    queryKey: ["/api/playlists", playlistId],
    queryFn: () => fetchPlaylist(playlistId),
    enabled: !!playlistId
  });
  
  // Fetch playlist videos
  const { data: videos, isLoading: isLoadingVideos } = useQuery({
    queryKey: ["/api/playlists", playlistId, "videos"],
    queryFn: () => fetchPlaylistVideos(playlistId),
    enabled: !!playlistId
  });
  
  const isLoading = isLoadingPlaylist || isLoadingVideos;
  
  // Filter videos based on search query
  const filteredVideos = videos && searchQuery.trim()
    ? videos.filter((video: Video) => 
        video.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (video.description && video.description.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : videos;
  
  const handleVideoClick = (video: Video) => {
    setSelectedVideo(video);
  };
  
  const handleClosePlayer = () => {
    setSelectedVideo(null);
  };
  
  // Play all videos in a new tab
  const handlePlayAll = () => {
    if (videos && videos.length > 0) {
      // Play the first video in our player
      setSelectedVideo(videos[0]);
    }
  };
  
  if (!playlist && !isLoadingPlaylist) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container px-4 py-6 md:py-8">
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <h3 className="text-xl font-medium text-red-500 mb-2">Playlist not found</h3>
            <p className="text-muted-foreground mb-6">
              The playlist you're looking for doesn't exist or has been removed.
            </p>
            <Link href="/">
              <a className="inline-flex items-center justify-center px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Channels
              </a>
            </Link>
          </div>
        </main>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container px-4 py-6 md:py-8">
        {/* Playlist Header */}
        <div className="flex items-center mb-6">
          <Link href={playlist ? `/channel/${playlist.channelId}` : "/"}>
            <a className="mr-4 p-2 rounded-full hover:bg-muted transition-colors duration-200">
              <ArrowLeft className="h-5 w-5" />
            </a>
          </Link>
          
          {isLoadingPlaylist ? (
            <Skeleton className="h-8 w-64" />
          ) : (
            <h3 className="text-xl font-bold">{playlist?.title}</h3>
          )}
        </div>
        
        {/* Playlist Info */}
        <div className="bg-card rounded-xl shadow-md overflow-hidden mb-6">
          <div className="flex flex-col md:flex-row">
            <div className="md:w-2/5 relative">
              {isLoadingPlaylist ? (
                <Skeleton className="w-full h-60 md:h-full" />
              ) : (
                <img 
                  src={playlist?.thumbnailUrl || "https://via.placeholder.com/800x450?text=Playlist"}
                  alt={playlist?.title}
                  className="w-full h-60 md:h-full object-cover md:absolute inset-0"
                />
              )}
            </div>
            <div className="p-6 md:w-3/5">
              {isLoadingPlaylist ? (
                <div className="space-y-4">
                  <Skeleton className="h-8 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-10 w-32" />
                </div>
              ) : (
                <>
                  <h3 className="text-2xl font-bold mb-2">{playlist?.title}</h3>
                  <p className="text-muted-foreground mb-4">
                    {playlist?.itemCount} videos
                  </p>
                  <p className="text-foreground/80 mb-6">
                    {playlist?.description || "No description available."}
                  </p>
                  <Button 
                    onClick={handlePlayAll}
                    disabled={!videos || videos.length === 0}
                  >
                    <PlayIcon className="h-4 w-4 mr-2" />
                    Play All
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
        
        {/* Search */}
        <div className="mb-6">
          <SearchInput 
            placeholder="Search videos in playlist..."
            value={searchQuery}
            onChange={setSearchQuery}
            className="w-full max-w-md"
          />
        </div>
        
        {/* Playlist Videos */}
        <div className="space-y-4">
          {isLoadingVideos ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex flex-col sm:flex-row rounded-lg overflow-hidden">
                <Skeleton className="w-full sm:w-64 h-40" />
                <div className="p-4 space-y-2 w-full">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-16 w-full" />
                </div>
              </div>
            ))
          ) : filteredVideos && filteredVideos.length > 0 ? (
            filteredVideos.map((video: Video) => (
              <PlaylistVideoItem 
                key={video.id} 
                video={video} 
                onClick={handleVideoClick}
              />
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <h3 className="text-xl font-medium mb-2">
                {videos && videos.length > 0 
                  ? "No videos match your search" 
                  : "This playlist is empty"}
              </h3>
              <p className="text-muted-foreground">
                {videos && videos.length > 0 
                  ? "Try adjusting your search query" 
                  : "Try adding videos to this playlist on YouTube"}
              </p>
            </div>
          )}
        </div>
      </main>
      
      {/* Video Player Modal */}
      {selectedVideo && (
        <VideoPlayer videoId={selectedVideo.videoId} playlistId={playlistId} autoplay={true} />
      )}
    </div>
  );
}
