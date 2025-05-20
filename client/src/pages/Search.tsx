import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import axios from 'axios';
import Header from '@/components/layout/Header';
import PlaylistGrid from '@/components/playlist/PlaylistGrid';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search as SearchIcon, Layers, X } from 'lucide-react';

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
  const [location] = useLocation();
  const urlParams = new URLSearchParams(location.split('?')[1] || '');
  const initialQuery = urlParams.get('q') || '';

  const [query, setQuery] = useState(initialQuery);
  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlaylist, setSelectedPlaylist] = useState<string | null>(null);

  // Search for playlists
  useEffect(() => {
    if (!searchTerm) return;

    const fetchSearchResults = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const playlistResponse = await axios.get('/api/search/playlists', {
          params: { q: searchTerm }
        });

        const formattedPlaylists = playlistResponse.data.items
          .filter((item: SearchPlaylist) => item.id.playlistId)
          .map((item: SearchPlaylist) => ({
            id: 0,
            playlistId: item.id.playlistId,
            channelId: '',
            title: item.snippet.title,
            description: item.snippet.description,
            thumbnailUrl: item.snippet.thumbnails.medium.url,
            itemCount: null,
            createdAt: new Date(),
            channelTitle: item.snippet.channelTitle
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
    window.history.pushState({}, '', `/search?q=${encodeURIComponent(query)}`);
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
                placeholder="Search playlists..."
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

          {searchTerm && !isLoading && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Results for "{searchTerm}"</h2>
              {playlists.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {playlists.map((playlist) => (
                    <div 
                      key={playlist.playlistId} 
                      onClick={() => setSelectedPlaylist(playlist.playlistId)}
                      className="cursor-pointer transition-transform hover:scale-105"
                    >
                      <div className="aspect-video relative overflow-hidden rounded-lg">
                        <img 
                          src={playlist.thumbnailUrl} 
                          alt={playlist.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-black/70 p-2 flex items-center">
                          <Layers className="h-4 w-4 text-white mr-2" />
                          <span className="text-xs text-white">Playlist</span>
                        </div>
                      </div>
                      <div className="mt-2">
                        <h3 className="font-medium line-clamp-2">{playlist.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{playlist.channelTitle}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No playlists found. Try a different search term.</p>
              )}
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
              <h3 className="text-lg font-medium mb-2">Search for YouTube Playlists</h3>
              <p className="text-muted-foreground mb-4">
                Enter a search term above to find playlists directly from YouTube.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}