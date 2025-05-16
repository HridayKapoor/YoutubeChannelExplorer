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
  private channelIdCounter = 1;
  private videoIdCounter = 1;
  private playlistIdCounter = 1;
  private playlistItemIdCounter = 1;

  // Channel operations
  async getChannels(): Promise<Channel[]> {
    return this.channels;
  }

  async getChannel(id: number): Promise<Channel | undefined> {
    return this.channels.find(channel => channel.id === id);
  }

  async getChannelByYoutubeId(channelId: string): Promise<Channel | undefined> {
    return this.channels.find(channel => channel.channelId === channelId);
  }

  async createChannel(channelData: InsertChannel): Promise<Channel> {
    const channel: Channel = {
      ...channelData,
      id: this.channelIdCounter++,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.channels.push(channel);
    return channel;
  }

  async deleteChannel(id: number): Promise<boolean> {
    try {
      // Find playlists to delete
      const channelPlaylists = this.playlists.filter(playlist => playlist.channelId === id.toString());
      
      // Delete playlist items for each playlist
      for (const playlist of channelPlaylists) {
        this.playlistItems = this.playlistItems.filter(item => item.playlistId !== playlist.playlistId);
      }
      
      // Delete playlists
      this.playlists = this.playlists.filter(playlist => playlist.channelId !== id.toString());
      
      // Delete videos
      this.videos = this.videos.filter(video => video.channelId !== id.toString());
      
      // Delete the channel
      const initialLength = this.channels.length;
      this.channels = this.channels.filter(channel => channel.id !== id);
      
      return initialLength > this.channels.length;
    } catch (error) {
      console.error("Error deleting channel:", error);
      return false;
    }
  }

  // Video operations
  async getVideos(channelId: string): Promise<Video[]> {
    return this.videos.filter(video => video.channelId === channelId);
  }

  async getVideo(id: number): Promise<Video | undefined> {
    return this.videos.find(video => video.id === id);
  }

  async getVideoByYoutubeId(videoId: string): Promise<Video | undefined> {
    return this.videos.find(video => video.videoId === videoId);
  }

  async createVideo(videoData: InsertVideo): Promise<Video> {
    const video: Video = {
      ...videoData,
      id: this.videoIdCounter++,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.videos.push(video);
    return video;
  }

  // Playlist operations
  async getPlaylists(channelId: string): Promise<Playlist[]> {
    return this.playlists.filter(playlist => playlist.channelId === channelId);
  }

  async getPlaylist(id: number): Promise<Playlist | undefined> {
    return this.playlists.find(playlist => playlist.id === id);
  }

  async getPlaylistByYoutubeId(playlistId: string): Promise<Playlist | undefined> {
    return this.playlists.find(playlist => playlist.playlistId === playlistId);
  }

  async createPlaylist(playlistData: InsertPlaylist): Promise<Playlist> {
    const playlist: Playlist = {
      ...playlistData,
      id: this.playlistIdCounter++,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.playlists.push(playlist);
    return playlist;
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
    
    const playlistItem: PlaylistItem = {
      ...playlistItemData,
      id: this.playlistItemIdCounter++,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.playlistItems.push(playlistItem);
    return playlistItem;
  }
}

export const storage = new MemStorage();
