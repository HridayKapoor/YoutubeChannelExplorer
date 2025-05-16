import { useState, useEffect } from 'react';
import { useSearch } from 'wouter/use-location';
import axios from 'axios';
import Header from '@/components/layout/Header';
import VideoGrid from '@/components/video/VideoGrid';
import PlaylistGrid from '@/components/playlist/PlaylistGrid';
import VideoPlayer from '@/components/video/VideoPlayer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search as SearchIcon, Video, Layers, X } from 'lucide-react';

// Define video and playlist types
interface SearchVideo {
  id: {
    videoId: string;
  };
  snippet: {
    title: string;
    description: string;
    thumbnails: {
      medium: {
        url: string;
      };
    };
    channelTitle: string;
    publishedAt: string;
  };
}

interface SearchPlaylist {
  id: {
    playlistId: string;
  };
  snippet: {
    title: string;
    description: string;
    thumbnails: {
      medium: {
        url: string;
      };
    };
    channelTitle: string;
  };
}

export default function Search() {
  const [search] = useSearch();
  const urlParams = new URLSearchParams(search);
  const initialQuery = urlParams.get('q') || '';

  const [query, setQuery] = useState(initialQuery);
  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const [tab, setTab] = useState<'videos' | 'playlists'>('videos');
  const [videos, setVideos] = useState<any[]>([]);
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Search for videos and playlists
  useEffect(() => {
    if (!searchTerm) return;

    const fetchSearchResults = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Search for videos
        const videoResponse = await axios.get('/api/search/videos', {
          params: { q: searchTerm }
        });
        
        // Convert YouTube API response to our app's format
        const formattedVideos = videoResponse.data.items
          .filter((item: SearchVideo) => item.id.videoId) // Filter out non-video items
          .map((item: SearchVideo) => ({
            id: 0, // Placeholder ID
            videoId: item.id.videoId,
            channelId: '', // Not used for search results
            title: item.snippet.title,
            description: item.snippet.description,
            thumbnailUrl: item.snippet.thumbnails.medium.url,
            publishedAt: item.snippet.publishedAt,
            duration: null,
            viewCount: null,
            likeCount: null,
            createdAt: new Date(),
            channelTitle: item.snippet.channelTitle // Additional field for display
          }));
        
        setVideos(formattedVideos);
        
        // Search for playlists
        const playlistResponse = await axios.get('/api/search/playlists', {
          params: { q: searchTerm }
        });
        
        // Convert YouTube API response to our app's format
        const formattedPlaylists = playlistResponse.data.items
          .filter((item: SearchPlaylist) => item.id.playlistId) // Filter out non-playlist items
          .map((item: SearchPlaylist) => ({
            id: 0, // Placeholder ID
            playlistId: item.id.playlistId,
            channelId: '', // Not used for search results
            title: item.snippet.title,
            description: item.snippet.description,
            thumbnailUrl: item.snippet.thumbnails.medium.url,
            itemCount: null,
            createdAt: new Date(),
            channelTitle: item.snippet.channelTitle // Additional field for display
          }));
        
        setPlaylists(formattedPlaylists);
      } catch (err) {
        console.error('Error searching YouTube:', err);
        setError('Failed to search YouTube. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSearchResults();
  }, [searchTerm]);

  // Handle search form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchTerm(query);
    // Update URL with search query
    window.history.pushState({}, '', `/search?q=${encodeURIComponent(query)}`);
    setCurrentPage(1); // Reset page when searching
  };

  // Handle video click
  const handleVideoClick = (video: any) => {
    setSelectedVideo(video.videoId);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container px-4 py-6 md:py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-4">Search YouTube</h1>
          
          <form onSubmit={handleSubmit} className="flex gap-2 mb-6">
            <div className="relative flex-grow">
              <Input
                type="text"
                placeholder="Search videos and playlists..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pr-10"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <Button type="submit">
              <SearchIcon className="h-4 w-4 mr-2" />
              Search
            </Button>
          </form>
          
          {selectedVideo && (
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-xl font-semibold">Now Playing</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedVideo(null)}
                  className="text-muted-foreground"
                >
                  <X className="h-4 w-4 mr-1" /> Close
                </Button>
              </div>
              <div className="aspect-video w-full max-w-3xl mx-auto rounded-md overflow-hidden">
                <VideoPlayer videoId={selectedVideo} />
              </div>
            </div>
          )}
          
          {searchTerm && !isLoading && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Results for "{searchTerm}"</h2>
              <Tabs value={tab} onValueChange={(value) => setTab(value as 'videos' | 'playlists')}>
                <TabsList className="grid w-full max-w-md grid-cols-2">
                  <TabsTrigger value="videos" className="flex items-center">
                    <Video className="h-4 w-4 mr-2" />
                    Videos ({videos.length})
                  </TabsTrigger>
                  <TabsTrigger value="playlists" className="flex items-center">
                    <Layers className="h-4 w-4 mr-2" />
                    Playlists ({playlists.length})
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="videos" className="mt-6">
                  {videos.length > 0 ? (
                    <VideoGrid 
                      videos={videos} 
                      searchQuery=""
                      currentPage={currentPage}
                      onPageChange={setCurrentPage}
                      onClick={handleVideoClick}
                    />
                  ) : (
                    <p className="text-muted-foreground">No videos found. Try a different search term.</p>
                  )}
                </TabsContent>
                
                <TabsContent value="playlists" className="mt-6">
                  {playlists.length > 0 ? (
                    <PlaylistGrid playlists={playlists} searchQuery="" />
                  ) : (
                    <p className="text-muted-foreground">No playlists found. Try a different search term.</p>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          )}
          
          {isLoading && (
            <div className="mt-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="space-y-3">
                    <Skeleton className="h-40 w-full rounded-lg" />
                    <div className="space-y-2">
                      <Skeleton className="h-5 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {error && (
            <div className="mt-6 p-4 border border-red-200 bg-red-50 text-red-700 rounded-md">
              {error}
            </div>
          )}
          
          {!searchTerm && !isLoading && (
            <div className="mt-6 text-center p-6 border border-dashed rounded-lg">
              <SearchIcon className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
              <h3 className="text-lg font-medium mb-2">Search for YouTube Videos & Playlists</h3>
              <p className="text-muted-foreground mb-4">
                Enter a search term above to find videos and playlists directly from YouTube.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}