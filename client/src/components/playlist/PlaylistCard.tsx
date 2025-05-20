import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Playlist } from "@shared/schema";
import { Layers } from "lucide-react";

interface PlaylistCardProps {
  playlist: Playlist;
}

export default function PlaylistCard({ playlist }: PlaylistCardProps) {
  return (
    <Link href={`/playlist/${playlist.playlistId}`}>
      <Card className="overflow-hidden transition-all duration-200 hover:shadow-lg cursor-pointer h-full">
        <div className="relative pb-[56.25%]">
          <img 
            src={playlist.thumbnailUrl || "https://via.placeholder.com/640x360?text=No+Thumbnail"}
            alt={playlist.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
            <div className="p-4">
              <h4 className="text-white font-bold text-lg">{playlist.title}</h4>
              <p className="text-white/80 text-sm">{playlist.itemCount} videos</p>
            </div>
          </div>
          <div className="absolute top-2 right-2 bg-black/80 text-white text-sm px-2 py-1 rounded-lg flex items-center">
            <Layers className="h-4 w-4 mr-1" />
            <span>Playlist</span>
          </div>
        </div>
        <CardContent className="p-4">
          <p className="text-sm text-foreground/80 line-clamp-2">
            {playlist.description || "No description available."}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
