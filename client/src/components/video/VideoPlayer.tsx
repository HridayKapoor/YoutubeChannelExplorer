import React from 'react';
import { Card } from '@/components/ui/card';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface VideoPlayerProps {
  videoId: string;
  title?: string;
  onClose?: () => void;
}

export default function VideoPlayer({ videoId, title, onClose }: VideoPlayerProps) {
  // Use youtube-nocookie.com domain for more privacy and less ads
  const embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`;

  return (
    <Card className="w-full overflow-hidden shadow-lg relative">
      {onClose && (
        <Button 
          variant="ghost" 
          size="icon" 
          className="absolute top-2 right-2 z-10 bg-background/80 hover:bg-background"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
      
      <div className="aspect-video w-full">
        <iframe
          src={embedUrl}
          title={title || "YouTube Video Player"}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full"
        ></iframe>
      </div>
    </Card>
  );
}