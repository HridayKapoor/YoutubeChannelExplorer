import { Video } from "@shared/schema";
import { Card } from "@/components/ui/card";
import { formatDuration, formatViewCount, formatTimeAgo } from "@/lib/api";
import { PlayIcon } from "lucide-react";

interface PlaylistVideoItemProps {
  video: Video & { position?: number };
  onClick?: (video: Video) => void;
}

export default function PlaylistVideoItem({ video, onClick }: PlaylistVideoItemProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onClick) {
      onClick(video);
    } else {
      // Open the video in a new tab if no click handler provided
      window.open(`https://www.youtube.com/watch?v=${video.videoId}`, "_blank");
    }
  };
  
  return (
    <Card 
      className="bg-background rounded-lg shadow-sm overflow-hidden flex flex-col sm:flex-row hover:shadow-md transition-shadow duration-200 cursor-pointer"
      onClick={handleClick}
    >
      <div className="sm:w-64 relative flex-shrink-0">
        <div className="relative pb-[56.25%] sm:pb-0 sm:h-full">
          <img 
            src={video.thumbnailUrl || "https://via.placeholder.com/240x135?text=No+Thumbnail"}
            alt={video.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity duration-200">
            <PlayIcon className="h-10 w-10 text-white" />
          </div>
          {video.duration && (
            <span className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
              {formatDuration(video.duration)}
            </span>
          )}
        </div>
        {typeof video.position === 'number' && (
          <div className="absolute top-0 left-0 bg-black/80 text-white font-bold w-8 h-8 flex items-center justify-center">
            {video.position + 1}
          </div>
        )}
      </div>
      <div className="p-4 flex flex-col justify-between flex-grow">
        <div>
          <h4 className="font-medium text-lg mb-1">{video.title}</h4>
          <p className="text-sm text-muted-foreground mb-2">
            {formatViewCount(video.viewCount || undefined)} • {formatTimeAgo(video.publishedAt || undefined)}
          </p>
          <p className="text-sm text-foreground/80 line-clamp-2">{video.description}</p>
        </div>
      </div>
    </Card>
  );
}
