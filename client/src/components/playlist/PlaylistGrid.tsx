import { useMemo } from "react";
import PlaylistCard from "./PlaylistCard";
import { Playlist } from "@shared/schema";

interface PlaylistGridProps {
  playlists: Playlist[];
  searchQuery: string;
}

export default function PlaylistGrid({ playlists, searchQuery }: PlaylistGridProps) {
  const filteredPlaylists = useMemo(() => {
    if (!searchQuery.trim()) return playlists;
    
    const query = searchQuery.toLowerCase();
    return playlists.filter(playlist => 
      playlist.title.toLowerCase().includes(query) || 
      (playlist.description && playlist.description.toLowerCase().includes(query))
    );
  }, [playlists, searchQuery]);
  
  if (filteredPlaylists.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <h3 className="text-xl font-medium mb-2">No playlists found</h3>
        <p className="text-muted-foreground">
          {playlists.length > 0 
            ? "Try adjusting your search query." 
            : "This channel doesn't have any playlists yet."}
        </p>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredPlaylists.map(playlist => (
        <PlaylistCard key={playlist.id} playlist={playlist} />
      ))}
    </div>
  );
}
