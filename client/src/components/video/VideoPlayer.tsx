import React from 'react';

interface VideoPlayerProps {
  videoId: string;
  playlistId?: string;
  autoplay?: boolean;
  className?: string;
}

export default function VideoPlayer({
  videoId,
  playlistId,
  autoplay = true,
  className = ""
}: VideoPlayerProps) {
  // Using privacy-enhanced youtube-nocookie.com domain to reduce tracking/ads
  const baseUrl = 'https://www.youtube-nocookie.com/embed/';
  
  // Build the URL with parameters
  let url = `${baseUrl}${videoId}?rel=0`;
  
  // Add autoplay parameter if enabled
  if (autoplay) {
    url += '&autoplay=1';
  }
  
  // Add playlist parameter if provided
  if (playlistId) {
    url += `&list=${playlistId}`;
  }

  return (
    <div className={`aspect-video w-full ${className}`}>
      <iframe
        src={url}
        title="YouTube video player"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="w-full h-full"
      ></iframe>
    </div>
  );
}