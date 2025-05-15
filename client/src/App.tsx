import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import ChannelDetail from "@/pages/ChannelDetail";
import PlaylistDetail from "@/pages/PlaylistDetail";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/channel/:id" component={ChannelDetail} />
      <Route path="/playlist/:id" component={PlaylistDetail} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
