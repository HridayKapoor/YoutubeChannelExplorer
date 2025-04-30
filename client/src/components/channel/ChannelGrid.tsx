import { useMemo } from "react";
import ChannelCard from "./ChannelCard";
import { Channel } from "@shared/schema";

interface ChannelGridProps {
  channels: Channel[];
  searchQuery: string;
}

export default function ChannelGrid({ channels, searchQuery }: ChannelGridProps) {
  const filteredChannels = useMemo(() => {
    if (!searchQuery.trim()) return channels;
    
    const query = searchQuery.toLowerCase();
    return channels.filter(channel => 
      channel.title.toLowerCase().includes(query) || 
      (channel.description && channel.description.toLowerCase().includes(query))
    );
  }, [channels, searchQuery]);
  
  if (filteredChannels.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <h3 className="text-xl font-medium mb-2">No channels found</h3>
        <p className="text-muted-foreground">
          {channels.length > 0 
            ? "Try adjusting your search query." 
            : "Add your first YouTube channel to get started."}
        </p>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {filteredChannels.map(channel => (
        <ChannelCard key={channel.id} channel={channel} />
      ))}
    </div>
  );
}
