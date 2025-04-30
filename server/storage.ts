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

export class DatabaseStorage implements IStorage {
  // Channel operations
  async getChannels(): Promise<Channel[]> {
    return await db.select().from(channels);
  }

  async getChannel(id: number): Promise<Channel | undefined> {
    const [channel] = await db.select().from(channels).where(eq(channels.id, id));
    return channel;
  }

  async getChannelByYoutubeId(channelId: string): Promise<Channel | undefined> {
    const [channel] = await db.select().from(channels).where(eq(channels.channelId, channelId));
    return channel;
  }

  async createChannel(channelData: InsertChannel): Promise<Channel> {
    const [channel] = await db.insert(channels).values(channelData).returning();
    return channel;
  }

  // Video operations
  async getVideos(channelId: string): Promise<Video[]> {
    return await db.select().from(videos).where(eq(videos.channelId, channelId));
  }

  async getVideo(id: number): Promise<Video | undefined> {
    const [video] = await db.select().from(videos).where(eq(videos.id, id));
    return video;
  }

  async getVideoByYoutubeId(videoId: string): Promise<Video | undefined> {
    const [video] = await db.select().from(videos).where(eq(videos.videoId, videoId));
    return video;
  }

  async createVideo(videoData: InsertVideo): Promise<Video> {
    const [video] = await db.insert(videos).values(videoData).returning();
    return video;
  }

  // Playlist operations
  async getPlaylists(channelId: string): Promise<Playlist[]> {
    return await db.select().from(playlists).where(eq(playlists.channelId, channelId));
  }

  async getPlaylist(id: number): Promise<Playlist | undefined> {
    const [playlist] = await db.select().from(playlists).where(eq(playlists.id, id));
    return playlist;
  }

  async getPlaylistByYoutubeId(playlistId: string): Promise<Playlist | undefined> {
    const [playlist] = await db.select().from(playlists).where(eq(playlists.playlistId, playlistId));
    return playlist;
  }

  async createPlaylist(playlistData: InsertPlaylist): Promise<Playlist> {
    const [playlist] = await db.insert(playlists).values(playlistData).returning();
    return playlist;
  }

  // Playlist item operations
  async getPlaylistItems(playlistId: string): Promise<PlaylistItem[]> {
    return await db.select()
      .from(playlistItems)
      .where(eq(playlistItems.playlistId, playlistId))
      .orderBy(playlistItems.position);
  }

  async createPlaylistItem(playlistItemData: InsertPlaylistItem): Promise<PlaylistItem> {
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

export const storage = new DatabaseStorage();
