import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Channel } from "@shared/schema";
import { formatSubscriberCount } from "@/lib/api";

interface ChannelCardProps {
  channel: Channel;
}

export default function ChannelCard({ channel }: ChannelCardProps) {
  return (
    <Link href={`/channel/${channel.id}`}>
      <Card className="overflow-hidden transition-all duration-200 hover:shadow-lg hover:-translate-y-1 cursor-pointer h-full">
        <div className="relative pb-[56.25%]">
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
        </div>
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
    </Link>
  );
}
