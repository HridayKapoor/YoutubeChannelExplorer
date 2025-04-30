import { Card, CardContent } from "@/components/ui/card";
import { Video } from "@shared/schema";
import { formatDuration, formatViewCount, formatTimeAgo } from "@/lib/api";
import { PlayIcon } from "lucide-react";

interface VideoCardProps {
  video: Video;
  onClick?: () => void;
}

export default function VideoCard({ video, onClick }: VideoCardProps) {
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      // Open the video in a new tab
      window.open(`https://www.youtube.com/watch?v=${video.videoId}`, "_blank");
    }
  };
  
  return (
    <Card 
      className="overflow-hidden transition-all duration-200 hover:shadow-md cursor-pointer"
      onClick={handleClick}
    >
      <div className="relative pb-[56.25%] group">
        <img 
          src={video.thumbnailUrl || "https://via.placeholder.com/640x360?text=No+Thumbnail"}
          alt={video.title}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-200">
          <PlayIcon className="h-12 w-12 text-white" />
        </div>
        {video.duration && (
          <span className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
            {formatDuration(video.duration)}
          </span>
        )}
      </div>
      <CardContent className="p-4">
        <h4 className="font-medium text-base line-clamp-2 mb-1">{video.title}</h4>
        <p className="text-sm text-muted-foreground mb-2">
          {formatViewCount(video.viewCount)} • {formatTimeAgo(video.publishedAt)}
        </p>
        <p className="text-sm text-foreground/80 line-clamp-2">{video.description}</p>
      </CardContent>
    </Card>
  );
}
