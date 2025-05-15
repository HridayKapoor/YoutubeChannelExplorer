import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import VideoPlayer from '../video/VideoPlayer';
import { fetchPlaylistVideos } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

interface PlaylistViewerProps {
  playlistId: string;
  title: string;
  onClose?: () => void;
}

interface PlaylistVideo {
  id: number;
  videoId: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  position?: number;
}

export default function PlaylistViewer({ playlistId, title, onClose }: PlaylistViewerProps) {
  const [videos, setVideos] = useState<PlaylistVideo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    async function loadPlaylistVideos() {
      try {
        setIsLoading(true);
        const fetchedVideos = await fetchPlaylistVideos(playlistId);
        
        // Sort by position if available
        const sortedVideos = fetchedVideos.sort((a: any, b: any) => {
          if (a.position !== undefined && b.position !== undefined) {
            return a.position - b.position;
          }
          return 0;
        });
        
        setVideos(sortedVideos);
      } catch (error) {
        console.error("Error loading playlist videos:", error);
        toast({
          title: "Error loading playlist",
          description: "Could not load playlist videos. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }

    loadPlaylistVideos();
  }, [playlistId, toast]);

  const currentVideo = videos[currentVideoIndex];
  
  const handleNextVideo = () => {
    if (currentVideoIndex < videos.length - 1) {
      setCurrentVideoIndex(currentVideoIndex + 1);
    }
  };

  const handlePreviousVideo = () => {
    if (currentVideoIndex > 0) {
      setCurrentVideoIndex(currentVideoIndex - 1);
    }
  };

  const handleSelectVideo = (index: number) => {
    setCurrentVideoIndex(index);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-lg font-semibold truncate pr-4">{title}</h2>
        {onClose && (
          <Button 
            variant="ghost" 
            size="icon" 
            className="ml-auto"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 h-full">
        <div className="md:col-span-2 space-y-4">
          {isLoading ? (
            <Skeleton className="w-full aspect-video rounded-md" />
          ) : currentVideo ? (
            <div className="space-y-4">
              <VideoPlayer 
                videoId={currentVideo.videoId} 
                title={currentVideo.title} 
              />
              
              <div className="flex justify-between">
                <Button 
                  variant="outline" 
                  onClick={handlePreviousVideo}
                  disabled={currentVideoIndex === 0}
                >
                  Previous
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleNextVideo}
                  disabled={currentVideoIndex === videos.length - 1}
                >
                  Next
                </Button>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">{currentVideo.title}</h3>
                <p className="text-sm text-muted-foreground">{currentVideo.description}</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-40 bg-muted rounded-md">
              <p className="text-muted-foreground">No videos in this playlist</p>
            </div>
          )}
        </div>
        
        <div className="h-full overflow-auto">
          <h3 className="font-medium mb-3">Playlist Videos</h3>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex gap-2">
                  <Skeleton className="h-16 w-28 rounded-md" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-3 w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
              {videos.map((video, index) => (
                <div 
                  key={video.id} 
                  className={`flex gap-2 p-2 rounded-md cursor-pointer ${
                    currentVideoIndex === index ? 'bg-accent' : 'hover:bg-accent/50'
                  }`}
                  onClick={() => handleSelectVideo(index)}
                >
                  <div className="relative flex-shrink-0 w-24 h-16 rounded-md overflow-hidden">
                    <img 
                      src={video.thumbnailUrl || "https://via.placeholder.com/120x90?text=No+Image"} 
                      alt={video.title} 
                      className="w-full h-full object-cover"
                    />
                    {video.position !== undefined && (
                      <div className="absolute bottom-1 right-1 text-xs px-1 bg-background/80 rounded-sm">
                        {video.position + 1}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium line-clamp-2">{video.title}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}