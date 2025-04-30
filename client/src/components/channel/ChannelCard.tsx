import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Channel } from "@shared/schema";
import { formatSubscriberCount, deleteChannel } from "@/lib/api";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

interface ChannelCardProps {
  channel: Channel;
}

export default function ChannelCard({ channel }: ChannelCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (confirm(`Are you sure you want to delete ${channel.title}?`)) {
      try {
        setIsDeleting(true);
        await deleteChannel(channel.id);
        toast({
          title: "Channel deleted",
          description: `${channel.title} has been removed from your collection.`,
        });
        // Invalidate channels query to refetch the list
        queryClient.invalidateQueries({ queryKey: ['/api/channels'] });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete channel. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <Card className="overflow-hidden transition-all duration-200 hover:shadow-lg hover:-translate-y-1 h-full group">
      <Link href={`/channel/${channel.id}`}>
        <div className="relative pb-[56.25%] cursor-pointer">
          <img 
            src={channel.thumbnailUrl || "https://via.placeholder.com/640x360?text=No+Thumbnail"}
            alt={channel.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
            <div className="p-4">
              <h3 className="text-white font-bold text-lg truncate">{channel.title}</h3>
              <p className="text-white/80 text-sm">{formatSubscriberCount(channel.subscriberCount)}</p>
            </div>
          </div>
          
          {/* Delete button */}
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button 
              variant="destructive" 
              size="sm" 
              className="h-8 w-8 p-0" 
              onClick={handleDelete}
              disabled={isDeleting}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Link>
      <CardContent className="p-4">
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">{channel.videoCount} videos</span>
          <span className="text-sm text-muted-foreground">
            {channel.description ? (
              <span className="text-sm text-muted-foreground line-clamp-2">{channel.description}</span>
            ) : (
              <span className="text-sm text-muted-foreground">No description</span>
            )}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
