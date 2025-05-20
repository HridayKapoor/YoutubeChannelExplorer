
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchChannels } from "@/lib/api";
import Header from "@/components/layout/Header";
import ChannelGrid from "@/components/channel/ChannelGrid";
import { Button } from "@/components/ui/button";
import { YoutubeIcon, PlusIcon, FolderPlus } from "lucide-react";
import AddChannelDialog from "@/components/channel/AddChannelDialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useFolders } from "@/contexts/FolderContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Home() {
  const [addChannelOpen, setAddChannelOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const { folders, addFolder } = useFolders();
  
  const { data: channels, isLoading, error } = useQuery({
    queryKey: ["/api/channels"],
    queryFn: fetchChannels
  });

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      addFolder(newFolderName.trim());
      setNewFolderName("");
    }
  };
  
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

    const displayChannels = selectedFolder 
      ? channels.filter(channel => 
          folders.find(f => f.id === selectedFolder)?.channelIds.includes(channel.channelId)
        )
      : channels;
    
    return (
      <>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl md:text-3xl font-bold">Your Channels</h2>
            <Select value={selectedFolder || ""} onValueChange={value => setSelectedFolder(value || null)}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="All Channels" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Channels</SelectItem>
                {folders.map(folder => (
                  <SelectItem key={folder.id} value={folder.id}>
                    {folder.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <FolderPlus className="h-4 w-4 mr-2" />
                  New Folder
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Folder</DialogTitle>
                </DialogHeader>
                <div className="flex gap-2">
                  <Input
                    placeholder="Folder name"
                    value={newFolderName}
                    onChange={e => setNewFolderName(e.target.value)}
                  />
                  <Button onClick={handleCreateFolder}>Create</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        
        <ChannelGrid 
          channels={displayChannels} 
          selectedFolder={selectedFolder}
        />
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
