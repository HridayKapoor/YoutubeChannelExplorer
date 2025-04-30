import { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";
import { Video } from "@shared/schema";

interface VideoPlayerProps {
  video: Video;
  onClose: () => void;
}

export default function VideoPlayer({ video, onClose }: VideoPlayerProps) {
  const [isFullScreen, setIsFullScreen] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  // Close the player when Escape key is pressed
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // Handle clicking outside the player to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  // Create YouTube embed URL
  const getYouTubeEmbedUrl = (videoId: string) => {
    // Use nocookie domain and add parameters to optimize the player
    return `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`;
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 ${isFullScreen ? 'p-0' : ''}`}>
      <div 
        ref={modalRef}
        className={`relative bg-background rounded-lg overflow-hidden ${isFullScreen ? 'w-full h-full' : 'w-full max-w-5xl'}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold">{video.title}</h3>
          <button
            onClick={onClose}
            className="rounded-full p-1 hover:bg-muted transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        {/* Player */}
        <div className="relative w-full" style={{ paddingTop: '56.25%' }}>
          <iframe
            className="absolute top-0 left-0 w-full h-full"
            src={getYouTubeEmbedUrl(video.videoId)}
            title={video.title}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          ></iframe>
        </div>
        
        {/* Video Info */}
        <div className="p-4">
          <div className="mb-2 text-sm text-muted-foreground">
            Published: {new Date(video.publishedAt || "").toLocaleDateString()}
          </div>
          <p className="text-sm text-muted-foreground line-clamp-3">
            {video.description}
          </p>
        </div>
      </div>
    </div>
  );
}