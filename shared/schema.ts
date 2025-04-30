import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// YouTube Channel Schema
export const channels = pgTable("channels", {
  id: serial("id").primaryKey(),
  channelId: text("channel_id").notNull().unique(),
  title: text("title").notNull(),
  description: text("description"),
  customUrl: text("custom_url"),
  thumbnailUrl: text("thumbnail_url"),
  subscriberCount: text("subscriber_count"),
  videoCount: integer("video_count"),
  viewCount: text("view_count"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const channelsRelations = relations(channels, ({ many }) => ({
  videos: many(() => videos),
  playlists: many(() => playlists),
}));

export const insertChannelSchema = createInsertSchema(channels).omit({
  id: true,
  createdAt: true,
});

// YouTube Video Schema
export const videos = pgTable("videos", {
  id: serial("id").primaryKey(),
  videoId: text("video_id").notNull().unique(),
  channelId: text("channel_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  thumbnailUrl: text("thumbnail_url"),
  publishedAt: text("published_at"),
  duration: text("duration"),
  viewCount: text("view_count"),
  likeCount: text("like_count"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const videosRelations = relations(videos, ({ one, many }) => ({
  channel: one(channels, {
    fields: [videos.channelId],
    references: [channels.channelId],
  }),
  playlistItems: many(() => playlistItems),
}));

export const insertVideoSchema = createInsertSchema(videos).omit({
  id: true,
  createdAt: true,
});

// YouTube Playlist Schema
export const playlists = pgTable("playlists", {
  id: serial("id").primaryKey(),
  playlistId: text("playlist_id").notNull().unique(),
  channelId: text("channel_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  thumbnailUrl: text("thumbnail_url"),
  itemCount: integer("item_count"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const playlistsRelations = relations(playlists, ({ one, many }) => ({
  channel: one(channels, {
    fields: [playlists.channelId],
    references: [channels.channelId],
  }),
  playlistItems: many(() => playlistItems),
}));

export const insertPlaylistSchema = createInsertSchema(playlists).omit({
  id: true,
  createdAt: true,
});

// YouTube Playlist Items Schema
export const playlistItems = pgTable("playlist_items", {
  id: serial("id").primaryKey(),
  playlistId: text("playlist_id").notNull(),
  videoId: text("video_id").notNull(),
  position: integer("position").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const playlistItemsRelations = relations(playlistItems, ({ one }) => ({
  playlist: one(playlists, {
    fields: [playlistItems.playlistId],
    references: [playlists.playlistId],
  }),
  video: one(videos, {
    fields: [playlistItems.videoId],
    references: [videos.videoId],
  }),
}));

export const insertPlaylistItemSchema = createInsertSchema(playlistItems).omit({
  id: true,
  createdAt: true,
});

export type Channel = typeof channels.$inferSelect;
export type InsertChannel = z.infer<typeof insertChannelSchema>;

export type Video = typeof videos.$inferSelect;
export type InsertVideo = z.infer<typeof insertVideoSchema>;

export type Playlist = typeof playlists.$inferSelect;
export type InsertPlaylist = z.infer<typeof insertPlaylistSchema>;

export type PlaylistItem = typeof playlistItems.$inferSelect;
export type InsertPlaylistItem = z.infer<typeof insertPlaylistItemSchema>;
