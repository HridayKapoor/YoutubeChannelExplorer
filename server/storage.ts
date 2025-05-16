import { db } from "./db";
import { eq, and } from "drizzle-orm";
import {
  channels,
  videos,
  playlists,
  playlistItems,
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
      createdAt: new Date()
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
      createdAt: new Date()
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
      createdAt: new Date()
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
      createdAt: new Date()
    };
    this.playlistItems.push(playlistItem);
    return playlistItem;
  }
}

// Database storage implementation
export class DatabaseStorage implements IStorage {
  // Channel operations
  async getChannels(): Promise<Channel[]> {
    if (!db) return [];
    return await db.select().from(channels);
  }

  async getChannel(id: number): Promise<Channel | undefined> {
    if (!db) return undefined;
    const [channel] = await db.select().from(channels).where(eq(channels.id, id));
    return channel;
  }

  async getChannelByYoutubeId(channelId: string): Promise<Channel | undefined> {
    if (!db) return undefined;
    const [channel] = await db.select().from(channels).where(eq(channels.channelId, channelId));
    return channel;
  }

  async createChannel(channelData: InsertChannel): Promise<Channel> {
    if (!db) throw new Error("Database not available");
    const [channel] = await db.insert(channels).values(channelData).returning();
    return channel;
  }

  async deleteChannel(id: number): Promise<boolean> {
    if (!db) return false;
    try {
      // First find playlists to delete their items
      const channelPlaylists = await db.select().from(playlists).where(eq(playlists.channelId, id.toString()));
      
      // Delete playlist items for each playlist
      for (const playlist of channelPlaylists) {
        await db.delete(playlistItems).where(eq(playlistItems.playlistId, playlist.playlistId));
      }
      
      // Delete playlists
      await db.delete(playlists).where(eq(playlists.channelId, id.toString()));
      
      // Delete videos
      await db.delete(videos).where(eq(videos.channelId, id.toString()));
      
      // Finally delete the channel
      await db.delete(channels).where(eq(channels.id, id));
      
      // Check if the channel was deleted
      const channel = await this.getChannel(id);
      return channel === undefined;
    } catch (error) {
      console.error("Error deleting channel:", error);
      return false;
    }
  }

  // Video operations
  async getVideos(channelId: string): Promise<Video[]> {
    if (!db) return [];
    return await db.select().from(videos).where(eq(videos.channelId, channelId));
  }

  async getVideo(id: number): Promise<Video | undefined> {
    if (!db) return undefined;
    const [video] = await db.select().from(videos).where(eq(videos.id, id));
    return video;
  }

  async getVideoByYoutubeId(videoId: string): Promise<Video | undefined> {
    if (!db) return undefined;
    const [video] = await db.select().from(videos).where(eq(videos.videoId, videoId));
    return video;
  }

  async createVideo(videoData: InsertVideo): Promise<Video> {
    if (!db) throw new Error("Database not available");
    const [video] = await db.insert(videos).values(videoData).returning();
    return video;
  }

  // Playlist operations
  async getPlaylists(channelId: string): Promise<Playlist[]> {
    if (!db) return [];
    return await db.select().from(playlists).where(eq(playlists.channelId, channelId));
  }

  async getPlaylist(id: number): Promise<Playlist | undefined> {
    if (!db) return undefined;
    const [playlist] = await db.select().from(playlists).where(eq(playlists.id, id));
    return playlist;
  }

  async getPlaylistByYoutubeId(playlistId: string): Promise<Playlist | undefined> {
    if (!db) return undefined;
    const [playlist] = await db.select().from(playlists).where(eq(playlists.playlistId, playlistId));
    return playlist;
  }

  async createPlaylist(playlistData: InsertPlaylist): Promise<Playlist> {
    if (!db) throw new Error("Database not available");
    const [playlist] = await db.insert(playlists).values(playlistData).returning();
    return playlist;
  }

  // Playlist item operations
  async getPlaylistItems(playlistId: string): Promise<PlaylistItem[]> {
    if (!db) return [];
    return await db.select()
      .from(playlistItems)
      .where(eq(playlistItems.playlistId, playlistId))
      .orderBy(playlistItems.position);
  }

  async createPlaylistItem(playlistItemData: InsertPlaylistItem): Promise<PlaylistItem> {
    if (!db) throw new Error("Database not available");
    
    // Check if the playlist item already exists
    const [existingItem] = await db.select()
      .from(playlistItems)
      .where(
        and(
          eq(playlistItems.playlistId, playlistItemData.playlistId),
          eq(playlistItems.videoId, playlistItemData.videoId)
        )
      );
    
    if (existingItem) {
      return existingItem;
    }
    
    const [playlistItem] = await db.insert(playlistItems).values(playlistItemData).returning();
    return playlistItem;
  }
}

// Dynamically choose the right storage implementation
export class DbStorageAdapter implements IStorage {
  private memStorage = new MemStorage();
  private dbStorage = new DatabaseStorage();
  // Using in-memory storage since we can't connect to Supabase
  private useDatabase = false;

  constructor() {
    console.log(`Using ${this.useDatabase ? 'database' : 'in-memory'} storage`);
  }

  async getChannels(): Promise<Channel[]> {
    return this.useDatabase ? this.dbStorage.getChannels() : this.memStorage.getChannels();
  }

  async getChannel(id: number): Promise<Channel | undefined> {
    return this.useDatabase ? this.dbStorage.getChannel(id) : this.memStorage.getChannel(id);
  }

  async getChannelByYoutubeId(channelId: string): Promise<Channel | undefined> {
    return this.useDatabase 
      ? this.dbStorage.getChannelByYoutubeId(channelId) 
      : this.memStorage.getChannelByYoutubeId(channelId);
  }

  async createChannel(channel: InsertChannel): Promise<Channel> {
    return this.useDatabase ? this.dbStorage.createChannel(channel) : this.memStorage.createChannel(channel);
  }

  async deleteChannel(id: number): Promise<boolean> {
    return this.useDatabase ? this.dbStorage.deleteChannel(id) : this.memStorage.deleteChannel(id);
  }

  async getVideos(channelId: string): Promise<Video[]> {
    return this.useDatabase ? this.dbStorage.getVideos(channelId) : this.memStorage.getVideos(channelId);
  }

  async getVideo(id: number): Promise<Video | undefined> {
    return this.useDatabase ? this.dbStorage.getVideo(id) : this.memStorage.getVideo(id);
  }

  async getVideoByYoutubeId(videoId: string): Promise<Video | undefined> {
    return this.useDatabase 
      ? this.dbStorage.getVideoByYoutubeId(videoId) 
      : this.memStorage.getVideoByYoutubeId(videoId);
  }

  async createVideo(video: InsertVideo): Promise<Video> {
    return this.useDatabase ? this.dbStorage.createVideo(video) : this.memStorage.createVideo(video);
  }

  async getPlaylists(channelId: string): Promise<Playlist[]> {
    return this.useDatabase ? this.dbStorage.getPlaylists(channelId) : this.memStorage.getPlaylists(channelId);
  }

  async getPlaylist(id: number): Promise<Playlist | undefined> {
    return this.useDatabase ? this.dbStorage.getPlaylist(id) : this.memStorage.getPlaylist(id);
  }

  async getPlaylistByYoutubeId(playlistId: string): Promise<Playlist | undefined> {
    return this.useDatabase 
      ? this.dbStorage.getPlaylistByYoutubeId(playlistId) 
      : this.memStorage.getPlaylistByYoutubeId(playlistId);
  }

  async createPlaylist(playlist: InsertPlaylist): Promise<Playlist> {
    return this.useDatabase ? this.dbStorage.createPlaylist(playlist) : this.memStorage.createPlaylist(playlist);
  }

  async getPlaylistItems(playlistId: string): Promise<PlaylistItem[]> {
    return this.useDatabase 
      ? this.dbStorage.getPlaylistItems(playlistId) 
      : this.memStorage.getPlaylistItems(playlistId);
  }

  async createPlaylistItem(playlistItem: InsertPlaylistItem): Promise<PlaylistItem> {
    return this.useDatabase 
      ? this.dbStorage.createPlaylistItem(playlistItem) 
      : this.memStorage.createPlaylistItem(playlistItem);
  }
}

export const storage = new DbStorageAdapter();
