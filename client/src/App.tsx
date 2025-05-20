import { Route, Switch, Router } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { ThemeProvider } from "./components/ui/ThemeToggle";
import { Toaster } from "./components/ui/toaster";
import { TooltipProvider } from "./components/ui/tooltip";
import { FolderProvider } from "./contexts/FolderContext";

// Pages
import Home from "./pages/Home";
import ChannelDetail from "./pages/ChannelDetail";
import PlaylistDetail from "./pages/PlaylistDetail";
import WatchLater from "./pages/WatchLater";
import Search from "./pages/Search";
import NotFound from "./pages/not-found";

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <FolderProvider>
          <TooltipProvider>
            <Router>
              <Switch>
                <Route path="/" component={Home} />
                <Route path="/channel/:id" component={ChannelDetail} />
                <Route path="/playlist/:id" component={PlaylistDetail} />
                <Route path="/watch-later" component={WatchLater} />
                <Route path="/search" component={Search} />
                <Route component={NotFound} />
              </Switch>
            </Router>
            <Toaster />
          </TooltipProvider>
        </FolderProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}