import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import axios from "axios";
import { insertChannelSchema, insertVideoSchema, insertPlaylistSchema, insertPlaylistItemSchema } from "@shared/schema";
import { ZodError } from "zod";

// YouTube API key from environment variable
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY || "";
const YOUTUBE_API_BASE = "https://www.googleapis.com/youtube/v3";

export async function registerRoutes(app: Express): Promise<Server> {
  // Validation error handler
  const handleValidationError = (err: any, res: Response) => {
    if (err instanceof ZodError) {
      return res.status(400).json({ 
        message: "Validation error", 
        errors: err.errors 
      });
    }
    return res.status(500).json({ message: "Internal server error" });
  };
  
  // Add a new channel by URL or ID
  app.post("/api/channels", async (req: Request, res: Response) => {
    try {
      const { url } = req.body;
      
      if (!url) {
        return res.status(400).json({ message: "Channel URL is required" });
      }
      
      // Extract channel ID from URL
      let channelId = url;
      
      if (url.includes("youtube.com")) {
        // Handle different YouTube URL formats
        if (url.includes("/channel/")) {
          const match = url.match(/\/channel\/([^\/\?]+)/);
          if (match && match[1]) channelId = match[1];
        } else if (url.includes("/c/") || url.includes("/@")) {
          // For custom URLs or handle, we need to make an initial request
          const match = url.match(/\/(c|@)\/([^\/\?]+)/);
          const customUsername = match && match[2] ? match[2] : null;
          
          if (customUsername) {
            const response = await axios.get(`${YOUTUBE_API_BASE}/search`, {
              params: {
                part: "snippet",
                q: customUsername,
                type: "channel",
                key: YOUTUBE_API_KEY
              }
            });
            
            if (response.data.items && response.data.items.length > 0) {
              channelId = response.data.items[0].id.channelId;
            } else {
              return res.status(404).json({ message: "Channel not found" });
            }
          }
        }
      }
      
      // Check if channel already exists
      const existingChannel = await storage.getChannelByYoutubeId(channelId);
      if (existingChannel) {
        return res.status(200).json(existingChannel);
      }
      
      // Fetch channel data from YouTube API
      const response = await axios.get(`${YOUTUBE_API_BASE}/channels`, {
        params: {
          part: "snippet,statistics,contentDetails",
          id: channelId,
          key: YOUTUBE_API_KEY
        }
      });
      
      if (!response.data.items || response.data.items.length === 0) {
        return res.status(404).json({ message: "Channel not found" });
      }
      
      const channelData = response.data.items[0];
      
      // Prepare channel data
      const channelToInsert = {
        channelId: channelData.id,
        title: channelData.snippet.title,
        description: channelData.snippet.description,
        customUrl: channelData.snippet.customUrl,
        thumbnailUrl: channelData.snippet.thumbnails.high?.url || channelData.snippet.thumbnails.default?.url,
        subscriberCount: channelData.statistics.subscriberCount,
        videoCount: parseInt(channelData.statistics.videoCount),
        viewCount: channelData.statistics.viewCount
      };
      
      // Validate and insert channel
      const validatedData = insertChannelSchema.parse(channelToInsert);
      const channel = await storage.createChannel(validatedData);
      
      // Fetch channel's uploads playlist ID
      const uploadsPlaylistId = channelData.contentDetails.relatedPlaylists.uploads;
      
      // Create an uploads playlist entry
      const uploadsPlaylist = {
        playlistId: uploadsPlaylistId,
        channelId: channelData.id,
        title: "Uploads",
        description: "All videos uploaded to this channel",
        thumbnailUrl: channelData.snippet.thumbnails.high?.url || channelData.snippet.thumbnails.default?.url,
        itemCount: parseInt(channelData.statistics.videoCount)
      };
      
      const validatedPlaylist = insertPlaylistSchema.parse(uploadsPlaylist);
      await storage.createPlaylist(validatedPlaylist);
      
      // Get all playlists for the channel
      await fetchAndStoreChannelPlaylists(channelData.id);
      
      // Get videos for the uploads playlist
      await fetchAndStorePlaylistVideos(uploadsPlaylistId, channelData.id);
      
      return res.status(201).json(channel);
    } catch (err) {
      console.error("Error adding channel:", err);
      return handleValidationError(err, res);
    }
  });
  
  // Get all channels
  app.get("/api/channels", async (_req: Request, res: Response) => {
    try {
      const channels = await storage.getChannels();
      return res.json(channels);
    } catch (err) {
      console.error("Error getting channels:", err);
      return res.status(500).json({ message: "Error getting channels" });
    }
  });
  
  // Get channel by ID
  app.get("/api/channels/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const channel = await storage.getChannel(id);
      
      if (!channel) {
        return res.status(404).json({ message: "Channel not found" });
      }
      
      return res.json(channel);
    } catch (err) {
      console.error("Error getting channel:", err);
      return res.status(500).json({ message: "Error getting channel" });
    }
  });
  
  // Get videos for a channel
  app.get("/api/channels/:channelId/videos", async (req: Request, res: Response) => {
    try {
      const { channelId } = req.params;
      const videos = await storage.getVideos(channelId);
      return res.json(videos);
    } catch (err) {
      console.error("Error getting videos:", err);
      return res.status(500).json({ message: "Error getting videos" });
    }
  });
  
  // Get playlists for a channel
  app.get("/api/channels/:channelId/playlists", async (req: Request, res: Response) => {
    try {
      const { channelId } = req.params;
      const playlists = await storage.getPlaylists(channelId);
      return res.json(playlists);
    } catch (err) {
      console.error("Error getting playlists:", err);
      return res.status(500).json({ message: "Error getting playlists" });
    }
  });
  
  // Get a specific playlist
  app.get("/api/playlists/:playlistId", async (req: Request, res: Response) => {
    try {
      const { playlistId } = req.params;
      const playlist = await storage.getPlaylistByYoutubeId(playlistId);
      
      if (!playlist) {
        return res.status(404).json({ message: "Playlist not found" });
      }
      
      return res.json(playlist);
    } catch (err) {
      console.error("Error getting playlist:", err);
      return res.status(500).json({ message: "Error getting playlist" });
    }
  });
  
  // Get videos for a playlist
  app.get("/api/playlists/:playlistId/videos", async (req: Request, res: Response) => {
    try {
      const { playlistId } = req.params;
      
      // Get playlist items
      const playlistItems = await storage.getPlaylistItems(playlistId);
      
      // Get video details for each item
      const videos = [];
      for (const item of playlistItems) {
        const video = await storage.getVideoByYoutubeId(item.videoId);
        if (video) {
          videos.push({ ...video, position: item.position });
        }
      }
      
      return res.json(videos);
    } catch (err) {
      console.error("Error getting playlist videos:", err);
      return res.status(500).json({ message: "Error getting playlist videos" });
    }
  });
  
  // Fetch and store all playlists for a channel
  async function fetchAndStoreChannelPlaylists(channelId: string) {
    try {
      let nextPageToken: string | undefined = undefined;
      
      do {
        const response = await axios.get(`${YOUTUBE_API_BASE}/playlists`, {
          params: {
            part: "snippet,contentDetails",
            channelId: channelId,
            maxResults: 50,
            pageToken: nextPageToken,
            key: YOUTUBE_API_KEY
          }
        });
        
        if (response.data.items && response.data.items.length > 0) {
          for (const item of response.data.items) {
            const playlistData = {
              playlistId: item.id,
              channelId: channelId,
              title: item.snippet.title,
              description: item.snippet.description,
              thumbnailUrl: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default?.url,
              itemCount: item.contentDetails.itemCount
            };
            
            // Check if playlist already exists
            const existingPlaylist = await storage.getPlaylistByYoutubeId(item.id);
            if (!existingPlaylist) {
              const validatedPlaylist = insertPlaylistSchema.parse(playlistData);
              await storage.createPlaylist(validatedPlaylist);
              
              // Fetch videos for this playlist
              await fetchAndStorePlaylistVideos(item.id, channelId);
            }
          }
        }
        
        nextPageToken = response.data.nextPageToken;
      } while (nextPageToken);
      
    } catch (err) {
      console.error("Error fetching channel playlists:", err);
    }
  }
  
  // Fetch and store videos for a playlist
  async function fetchAndStorePlaylistVideos(playlistId: string, channelId: string) {
    try {
      let nextPageToken: string | undefined = undefined;
      let position = 0;
      
      do {
        const response = await axios.get(`${YOUTUBE_API_BASE}/playlistItems`, {
          params: {
            part: "snippet,contentDetails",
            playlistId: playlistId,
            maxResults: 50,
            pageToken: nextPageToken,
            key: YOUTUBE_API_KEY
          }
        });
        
        if (response.data.items && response.data.items.length > 0) {
          // Extract video IDs for a batch request
          const videoIds = response.data.items.map((item: any) => 
            item.snippet.resourceId.videoId
          ).join(",");
          
          // Fetch video details in a batch
          const videoDetailsResponse = await axios.get(`${YOUTUBE_API_BASE}/videos`, {
            params: {
              part: "snippet,contentDetails,statistics",
              id: videoIds,
              key: YOUTUBE_API_KEY
            }
          });
          
          const videoDetailsMap = new Map();
          if (videoDetailsResponse.data.items) {
            for (const videoDetail of videoDetailsResponse.data.items) {
              videoDetailsMap.set(videoDetail.id, videoDetail);
            }
          }
          
          // Process each playlistItem
          for (const item of response.data.items) {
            const videoId = item.snippet.resourceId.videoId;
            const videoDetails = videoDetailsMap.get(videoId);
            
            if (videoDetails) {
              // Check if video already exists
              let video = await storage.getVideoByYoutubeId(videoId);
              
              if (!video) {
                // Add video to database
                const videoData = {
                  videoId: videoId,
                  channelId: channelId,
                  title: videoDetails.snippet.title,
                  description: videoDetails.snippet.description,
                  thumbnailUrl: videoDetails.snippet.thumbnails.high?.url || videoDetails.snippet.thumbnails.default?.url,
                  publishedAt: videoDetails.snippet.publishedAt,
                  duration: videoDetails.contentDetails.duration,
                  viewCount: videoDetails.statistics.viewCount,
                  likeCount: videoDetails.statistics.likeCount
                };
                
                const validatedVideo = insertVideoSchema.parse(videoData);
                video = await storage.createVideo(validatedVideo);
              }
              
              // Create playlist item entry
              const playlistItemData = {
                playlistId: playlistId,
                videoId: videoId,
                position: position++
              };
              
              const validatedPlaylistItem = insertPlaylistItemSchema.parse(playlistItemData);
              await storage.createPlaylistItem(validatedPlaylistItem);
            }
          }
        }
        
        nextPageToken = response.data.nextPageToken;
      } while (nextPageToken);
      
    } catch (err) {
      console.error("Error fetching playlist videos:", err);
    }
  }

  const httpServer = createServer(app);
  return httpServer;
}
