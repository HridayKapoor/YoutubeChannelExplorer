import { apiRequest } from "@/lib/queryClient";

// Channel API functions
export async function addChannel(url: string) {
  const response = await apiRequest("POST", "/api/channels", { url });
  return await response.json();
}

export async function fetchChannels() {
  const response = await apiRequest("GET", "/api/channels");
  return await response.json();
}

export async function deleteChannel(id: number) {
  const response = await apiRequest("DELETE", `/api/channels/${id}`);
  return await response.json();
}

// Video API functions
export async function fetchChannelVideos(channelId: string) {
  const response = await apiRequest("GET", `/api/channels/${channelId}/videos`);
  return await response.json();
}

// Playlist API functions
export async function fetchChannelPlaylists(channelId: string, refresh: boolean = false) {
  const url = `/api/channels/${channelId}/playlists${refresh ? '?refresh=true' : ''}`;
  const response = await apiRequest("GET", url);
  return await response.json();
}

export async function fetchPlaylist(playlistId: string) {
  const response = await apiRequest("GET", `/api/playlists/${playlistId}`);
  return await response.json();
}

export async function fetchPlaylistVideos(playlistId: string) {
  const response = await apiRequest("GET", `/api/playlists/${playlistId}/videos`);
  return await response.json();
}

// Utility function to format subscriber counts
export function formatSubscriberCount(count: string | undefined): string {
  if (!count) return "0 subscribers";
  
  const num = parseInt(count);
  if (isNaN(num)) return "0 subscribers";
  
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M subscribers';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K subscribers';
  } else {
    return num + ' subscribers';
  }
}

// Format video duration from ISO 8601 format
export function formatDuration(isoDuration: string | undefined): string {
  if (!isoDuration) return "0:00";
  
  const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return "0:00";
  
  const hours = parseInt(match[1] || "0");
  const minutes = parseInt(match[2] || "0");
  const seconds = parseInt(match[3] || "0");
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  } else {
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  }
}

// Format view count
export function formatViewCount(count: string | undefined): string {
  if (!count) return "0 views";
  
  const num = parseInt(count);
  if (isNaN(num)) return "0 views";
  
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M views';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K views';
  } else {
    return num + ' views';
  }
}

// Format time ago from published date
export function formatTimeAgo(dateString: string | undefined): string {
  if (!dateString) return "";
  
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  let interval = seconds / 31536000; // years
  
  if (interval > 1) {
    return Math.floor(interval) + " years ago";
  }
  interval = seconds / 2592000; // months
  if (interval > 1) {
    return Math.floor(interval) + " months ago";
  }
  interval = seconds / 86400; // days
  if (interval > 1) {
    return Math.floor(interval) + " days ago";
  }
  interval = seconds / 3600; // hours
  if (interval > 1) {
    return Math.floor(interval) + " hours ago";
  }
  interval = seconds / 60; // minutes
  if (interval > 1) {
    return Math.floor(interval) + " minutes ago";
  }
  return Math.floor(seconds) + " seconds ago";
}
