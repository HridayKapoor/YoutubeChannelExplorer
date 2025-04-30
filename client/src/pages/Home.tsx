import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchChannels } from "@/lib/api";
import Header from "@/components/layout/Header";
import ChannelGrid from "@/components/channel/ChannelGrid";
import SearchInput from "@/components/ui/SearchInput";
import { Button } from "@/components/ui/button";
import { YoutubeIcon, PlusIcon } from "lucide-react";
import AddChannelDialog from "@/components/channel/AddChannelDialog";
import { Skeleton } from "@/components/ui/skeleton";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [addChannelOpen, setAddChannelOpen] = useState(false);
  
  const { data: channels, isLoading, error } = useQuery({
    queryKey: ["/api/channels"],
    queryFn: fetchChannels
  });
  
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-48 w-full rounded-lg" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>
          ))}
        </div>
      );
    }
    
    if (error) {
      return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <h3 className="text-xl font-medium text-red-500 mb-2">Error loading channels</h3>
          <p className="text-muted-foreground mb-6">
            {error instanceof Error ? error.message : "An unknown error occurred"}
          </p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      );
    }
    
    if (!channels || channels.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-16 md:py-32 text-center">
          <div className="w-32 h-32 bg-primary/10 rounded-full flex items-center justify-center mb-8">
            <YoutubeIcon className="h-16 w-16 text-primary/80" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Welcome to YourTube</h2>
          <p className="text-muted-foreground max-w-md mb-8">
            Your elegant YouTube channel manager. Add your favorite channels to keep track of their videos and playlists.
          </p>
          <Button 
            size="lg"
            onClick={() => setAddChannelOpen(true)}
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Your First Channel
          </Button>
        </div>
      );
    }
    
    return (
      <>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl md:text-3xl font-bold">Your Channels</h2>
          <SearchInput 
            placeholder="Search channels..." 
            value={searchQuery} 
            onChange={setSearchQuery}
            className="w-full max-w-sm"
          />
        </div>
        
        <ChannelGrid channels={channels} searchQuery={searchQuery} />
      </>
    );
  };
  
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container px-4 py-6 md:py-8">
        {renderContent()}
      </main>
      
      <AddChannelDialog 
        open={addChannelOpen} 
        onOpenChange={setAddChannelOpen} 
      />
    </div>
  );
}
