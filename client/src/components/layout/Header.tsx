import { useState } from 'react';
import { Link } from 'wouter';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { PlusIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AddChannelDialog from '@/components/channel/AddChannelDialog';
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import { cn } from "@/lib/utils"

function Navigation() {
  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuLink asChild>
            <Link href="/" className={cn(navigationMenuTriggerStyle(), "h-9")}>
              Channels
            </Link>
          </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink asChild>
            <Link href="/watch-later" className={cn(navigationMenuTriggerStyle(), "h-9")}>
              Watch Later
            </Link>
          </NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}

export default function Header() {
  const [addChannelOpen, setAddChannelOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="container px-4 h-14 flex items-center justify-between">
        <Navigation />

        <div className="flex items-center space-x-3">
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