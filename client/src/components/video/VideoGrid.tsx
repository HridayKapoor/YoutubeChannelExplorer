import { useMemo, useState } from "react";
import VideoCard from "./VideoCard";
import VideoPlayer from "./VideoPlayer";
import { Video } from "@shared/schema";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

interface VideoGridProps {
  videos: Video[];
  searchQuery: string;
  pageSize?: number;
  currentPage?: number;
  onPageChange?: (page: number) => void;
  onClick?: (video: Video) => void;
}

export default function VideoGrid({ 
  videos, 
  searchQuery, 
  pageSize = 12,
  currentPage = 1,
  onPageChange = () => {},
  onClick
}: VideoGridProps) {
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  
  const filteredVideos = useMemo(() => {
    if (!searchQuery.trim()) return videos;
    
    const query = searchQuery.toLowerCase();
    return videos.filter(video => 
      video.title.toLowerCase().includes(query) || 
      (video.description && video.description.toLowerCase().includes(query))
    );
  }, [videos, searchQuery]);
  
  // Calculate pagination
  const totalPages = Math.ceil(filteredVideos.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedVideos = filteredVideos.slice(startIndex, startIndex + pageSize);
  
  const handleVideoClick = (video: Video) => {
    if (onClick) {
      // If external click handler provided (for Search page)
      onClick(video);
    } else {
      // Otherwise handle internally
      setSelectedVideo(video);
      setIsPlayerOpen(true);
    }
  };
  
  const handleClosePlayer = () => {
    setSelectedVideo(null);
    setIsPlayerOpen(false);
  };
  
  if (filteredVideos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <h3 className="text-xl font-medium mb-2">No videos found</h3>
        <p className="text-muted-foreground">
          {videos.length > 0 
            ? "Try adjusting your search query." 
            : "This channel doesn't have any videos yet."}
        </p>
      </div>
    );
  }
  
  return (
    <>
      <div className="space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {paginatedVideos.map(video => (
            <VideoCard 
              key={video.id} 
              video={video} 
              onClick={() => handleVideoClick(video)}
            />
          ))}
        </div>
        
        {totalPages > 1 && (
          <Pagination className="mt-8">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  href="#" 
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage > 1) onPageChange(currentPage - 1);
                  }}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
              
              {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                let pageNum;
                
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                  if (i === 4) return (
                    <PaginationItem key={i}>
                      <PaginationEllipsis />
                    </PaginationItem>
                  );
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                  if (i === 0) return (
                    <PaginationItem key={i}>
                      <PaginationEllipsis />
                    </PaginationItem>
                  );
                } else {
                  if (i === 0) return (
                    <PaginationItem key={i}>
                      <PaginationLink 
                        href="#" 
                        onClick={(e) => {
                          e.preventDefault();
                          onPageChange(1);
                        }}
                      >
                        1
                      </PaginationLink>
                    </PaginationItem>
                  );
                  if (i === 1) return (
                    <PaginationItem key={i}>
                      <PaginationEllipsis />
                    </PaginationItem>
                  );
                  if (i === 3) return (
                    <PaginationItem key={i}>
                      <PaginationEllipsis />
                    </PaginationItem>
                  );
                  if (i === 4) return (
                    <PaginationItem key={i}>
                      <PaginationLink 
                        href="#" 
                        onClick={(e) => {
                          e.preventDefault();
                          onPageChange(totalPages);
                        }}
                      >
                        {totalPages}
                      </PaginationLink>
                    </PaginationItem>
                  );
                  
                  pageNum = currentPage + i - 2;
                }
                
                return (
                  <PaginationItem key={i}>
                    <PaginationLink 
                      href="#" 
                      onClick={(e) => {
                        e.preventDefault();
                        onPageChange(pageNum);
                      }}
                      isActive={currentPage === pageNum}
                    >
                      {pageNum}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}
              
              <PaginationItem>
                <PaginationNext 
                  href="#" 
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage < totalPages) onPageChange(currentPage + 1);
                  }}
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>
      
      {/* Video Player Modal */}
      <Dialog open={isPlayerOpen} onOpenChange={setIsPlayerOpen}>
        <DialogContent className="sm:max-w-[900px] p-0 bg-black overflow-hidden">
          <div className="relative">
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute top-2 right-2 z-50 bg-black/60 hover:bg-black/80 text-white"
              onClick={handleClosePlayer}
            >
              <X className="h-4 w-4" />
            </Button>
            
            {selectedVideo && (
              <VideoPlayer videoId={selectedVideo.videoId} autoplay={true} />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
