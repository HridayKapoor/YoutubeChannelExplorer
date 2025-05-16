-- Create channels table
CREATE TABLE IF NOT EXISTS channels (
  id SERIAL PRIMARY KEY,
  channel_id TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  custom_url TEXT,
  thumbnail_url TEXT,
  subscriber_count TEXT,
  video_count INTEGER,
  view_count TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create videos table
CREATE TABLE IF NOT EXISTS videos (
  id SERIAL PRIMARY KEY,
  video_id TEXT NOT NULL UNIQUE,
  channel_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  published_at TEXT,
  duration TEXT,
  view_count TEXT,
  like_count TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create playlists table
CREATE TABLE IF NOT EXISTS playlists (
  id SERIAL PRIMARY KEY,
  playlist_id TEXT NOT NULL UNIQUE,
  channel_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  item_count INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create playlist_items table
CREATE TABLE IF NOT EXISTS playlist_items (
  id SERIAL PRIMARY KEY,
  playlist_id TEXT NOT NULL,
  video_id TEXT NOT NULL,
  position INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Add foreign key constraints
ALTER TABLE videos 
  ADD CONSTRAINT fk_videos_channel 
  FOREIGN KEY (channel_id) 
  REFERENCES channels(channel_id) 
  ON DELETE CASCADE;

ALTER TABLE playlists 
  ADD CONSTRAINT fk_playlists_channel 
  FOREIGN KEY (channel_id) 
  REFERENCES channels(channel_id) 
  ON DELETE CASCADE;

ALTER TABLE playlist_items 
  ADD CONSTRAINT fk_playlist_items_playlist 
  FOREIGN KEY (playlist_id) 
  REFERENCES playlists(playlist_id) 
  ON DELETE CASCADE;

ALTER TABLE playlist_items 
  ADD CONSTRAINT fk_playlist_items_video 
  FOREIGN KEY (video_id) 
  REFERENCES videos(video_id) 
  ON DELETE CASCADE;