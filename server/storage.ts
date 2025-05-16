import {
  Channel,
  InsertChannel,
  Video,
  InsertVideo,
  Playlist,
  InsertPlaylist,
  PlaylistItem,
  InsertPlaylistItem,
} from "@shared/schema";

export interface IStorage {
  // Channel operations
  getChannels(): Promise<Channel[]>;
  getChannel(id: number): Promise<Channel | undefined>;
  getChannelByYoutubeId(channelId: string): Promise<Channel | undefined>;
  createChannel(channel: InsertChannel): Promise<Channel>;
  deleteChannel(id: number): Promise<boolean>;
  
  // Video operations
  getVideos(channelId: string): Promise<Video[]>;
  getVideo(id: number): Promise<Video | undefined>;
  getVideoByYoutubeId(videoId: string): Promise<Video | undefined>;
  createVideo(video: InsertVideo): Promise<Video>;
  
  // Playlist operations
  getPlaylists(channelId: string): Promise<Playlist[]>;
  getPlaylist(id: number): Promise<Playlist | undefined>;
  getPlaylistByYoutubeId(playlistId: string): Promise<Playlist | undefined>;
  createPlaylist(playlist: InsertPlaylist): Promise<Playlist>;
  
  // Playlist item operations
  getPlaylistItems(playlistId: string): Promise<PlaylistItem[]>;
  createPlaylistItem(playlistItem: InsertPlaylistItem): Promise<PlaylistItem>;
}

export class MemStorage implements IStorage {
  private channels: Channel[] = [];
  private videos: Video[] = [];
  private playlists: Playlist[] = [];
  private playlistItems: PlaylistItem[] = [];
  
  private nextChannelId = 1;
  private nextVideoId = 1;
  private nextPlaylistId = 1;
  private nextPlaylistItemId = 1;

  // Channel operations
  async getChannels(): Promise<Channel[]> {
    return this.channels;
  }

  async getChannel(id: number): Promise<Channel | undefined> {
    return this.channels.find(c => c.id === id);
  }

  async getChannelByYoutubeId(channelId: string): Promise<Channel | undefined> {
    return this.channels.find(c => c.channelId === channelId);
  }

  async createChannel(channelData: InsertChannel): Promise<Channel> {
    const newChannel: Channel = {
      ...channelData,
      id: this.nextChannelId++,
      createdAt: new Date(),
    };
    this.channels.push(newChannel);
    return newChannel;
  }

  async deleteChannel(id: number): Promise<boolean> {
    try {
      // Get channel playlists
      const channelPlaylists = this.playlists.filter(p => p.channelId === id.toString());
      
      // Delete playlist items for each playlist
      for (const playlist of channelPlaylists) {
        this.playlistItems = this.playlistItems.filter(item => item.playlistId !== playlist.playlistId);
      }
      
      // Delete playlists
      this.playlists = this.playlists.filter(p => p.channelId !== id.toString());
      
      // Delete videos
      this.videos = this.videos.filter(v => v.channelId !== id.toString());
      
      // Finally delete the channel
      const initialLength = this.channels.length;
      this.channels = this.channels.filter(c => c.id !== id);
      
      return this.channels.length < initialLength;
    } catch (error) {
      console.error("Error deleting channel:", error);
      return false;
    }
  }

  // Video operations
  async getVideos(channelId: string): Promise<Video[]> {
    return this.videos.filter(v => v.channelId === channelId);
  }

  async getVideo(id: number): Promise<Video | undefined> {
    return this.videos.find(v => v.id === id);
  }

  async getVideoByYoutubeId(videoId: string): Promise<Video | undefined> {
    return this.videos.find(v => v.videoId === videoId);
  }

  async createVideo(videoData: InsertVideo): Promise<Video> {
    const newVideo: Video = {
      ...videoData,
      id: this.nextVideoId++,
      createdAt: new Date(),
    };
    this.videos.push(newVideo);
    return newVideo;
  }

  // Playlist operations
  async getPlaylists(channelId: string): Promise<Playlist[]> {
    return this.playlists.filter(p => p.channelId === channelId);
  }

  async getPlaylist(id: number): Promise<Playlist | undefined> {
    return this.playlists.find(p => p.id === id);
  }

  async getPlaylistByYoutubeId(playlistId: string): Promise<Playlist | undefined> {
    return this.playlists.find(p => p.playlistId === playlistId);
  }

  async createPlaylist(playlistData: InsertPlaylist): Promise<Playlist> {
    const newPlaylist: Playlist = {
      ...playlistData,
      id: this.nextPlaylistId++,
      createdAt: new Date(),
    };
    this.playlists.push(newPlaylist);
    return newPlaylist;
  }

  // Playlist item operations
  async getPlaylistItems(playlistId: string): Promise<PlaylistItem[]> {
    return this.playlistItems
      .filter(item => item.playlistId === playlistId)
      .sort((a, b) => a.position - b.position);
  }

  async createPlaylistItem(playlistItemData: InsertPlaylistItem): Promise<PlaylistItem> {
    // Check if the playlist item already exists
    const existingItem = this.playlistItems.find(
      item => item.playlistId === playlistItemData.playlistId && 
              item.videoId === playlistItemData.videoId
    );
    
    if (existingItem) {
      return existingItem;
    }
    
    const newPlaylistItem: PlaylistItem = {
      ...playlistItemData,
      id: this.nextPlaylistItemId++,
      createdAt: new Date(),
    };
    this.playlistItems.push(newPlaylistItem);
    return newPlaylistItem;
  }
}

export const storage = new MemStorage();
