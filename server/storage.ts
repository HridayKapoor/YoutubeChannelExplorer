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
  private channels: Map<number, Channel>;
  private videos: Map<number, Video>;
  private playlists: Map<number, Playlist>;
  private playlistItems: Map<number, PlaylistItem>;
  
  private channelIdCounter: number;
  private videoIdCounter: number;
  private playlistIdCounter: number;
  private playlistItemIdCounter: number;

  constructor() {
    this.channels = new Map();
    this.videos = new Map();
    this.playlists = new Map();
    this.playlistItems = new Map();
    
    this.channelIdCounter = 1;
    this.videoIdCounter = 1;
    this.playlistIdCounter = 1;
    this.playlistItemIdCounter = 1;
  }

  // Channel operations
  async getChannels(): Promise<Channel[]> {
    return Array.from(this.channels.values());
  }

  async getChannel(id: number): Promise<Channel | undefined> {
    return this.channels.get(id);
  }

  async getChannelByYoutubeId(channelId: string): Promise<Channel | undefined> {
    return Array.from(this.channels.values()).find(
      (channel) => channel.channelId === channelId
    );
  }

  async createChannel(channelData: InsertChannel): Promise<Channel> {
    const id = this.channelIdCounter++;
    const createdAt = new Date();
    const channel: Channel = { ...channelData, id, createdAt };
    this.channels.set(id, channel);
    return channel;
  }

  // Video operations
  async getVideos(channelId: string): Promise<Video[]> {
    return Array.from(this.videos.values()).filter(
      (video) => video.channelId === channelId
    );
  }

  async getVideo(id: number): Promise<Video | undefined> {
    return this.videos.get(id);
  }

  async getVideoByYoutubeId(videoId: string): Promise<Video | undefined> {
    return Array.from(this.videos.values()).find(
      (video) => video.videoId === videoId
    );
  }

  async createVideo(videoData: InsertVideo): Promise<Video> {
    const id = this.videoIdCounter++;
    const createdAt = new Date();
    const video: Video = { ...videoData, id, createdAt };
    this.videos.set(id, video);
    return video;
  }

  // Playlist operations
  async getPlaylists(channelId: string): Promise<Playlist[]> {
    return Array.from(this.playlists.values()).filter(
      (playlist) => playlist.channelId === channelId
    );
  }

  async getPlaylist(id: number): Promise<Playlist | undefined> {
    return this.playlists.get(id);
  }

  async getPlaylistByYoutubeId(playlistId: string): Promise<Playlist | undefined> {
    return Array.from(this.playlists.values()).find(
      (playlist) => playlist.playlistId === playlistId
    );
  }

  async createPlaylist(playlistData: InsertPlaylist): Promise<Playlist> {
    const id = this.playlistIdCounter++;
    const createdAt = new Date();
    const playlist: Playlist = { ...playlistData, id, createdAt };
    this.playlists.set(id, playlist);
    return playlist;
  }

  // Playlist item operations
  async getPlaylistItems(playlistId: string): Promise<PlaylistItem[]> {
    return Array.from(this.playlistItems.values())
      .filter((item) => item.playlistId === playlistId)
      .sort((a, b) => a.position - b.position);
  }

  async createPlaylistItem(playlistItemData: InsertPlaylistItem): Promise<PlaylistItem> {
    const id = this.playlistItemIdCounter++;
    const createdAt = new Date();
    const playlistItem: PlaylistItem = { ...playlistItemData, id, createdAt };
    this.playlistItems.set(id, playlistItem);
    return playlistItem;
  }
}

export const storage = new MemStorage();
