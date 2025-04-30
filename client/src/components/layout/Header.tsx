import { useState } from 'react';
import { Link } from 'wouter';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { PlusIcon, YoutubeIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AddChannelDialog from '@/components/channel/AddChannelDialog';

export default function Header() {
  const [addChannelOpen, setAddChannelOpen] = useState(false);
  
  return (
    <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="container px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <YoutubeIcon className="h-6 w-6 text-red-600" />
          <h1 className="text-xl font-bold font-sans">YourTube</h1>
        </Link>
        
        <div className="flex items-center space-x-4">
          <Button 
            variant="outline" 
            size="sm" 
            className="hidden sm:flex"
            onClick={() => setAddChannelOpen(true)}
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Channel
          </Button>
          
          <Button 
            variant="outline" 
            size="icon" 
            className="sm:hidden"
            onClick={() => setAddChannelOpen(true)}
          >
            <PlusIcon className="h-4 w-4" />
          </Button>
          
          <ThemeToggle />
        </div>
      </div>
      
      <AddChannelDialog 
        open={addChannelOpen} 
        onOpenChange={setAddChannelOpen} 
      />
    </header>
  );
}
