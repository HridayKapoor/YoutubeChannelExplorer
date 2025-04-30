import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { addChannel } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { YoutubeIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";

interface AddChannelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const formSchema = z.object({
  url: z.string().min(1, "Channel URL is required").refine(
    (val) => val.includes("youtube.com") || val.startsWith("UC"),
    "Please enter a valid YouTube channel URL or ID"
  ),
});

export default function AddChannelDialog({ open, onOpenChange }: AddChannelDialogProps) {
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      url: "",
    },
  });
  
  const addChannelMutation = useMutation({
    mutationFn: addChannel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/channels"] });
      toast({
        title: "Channel added successfully",
        description: "The channel and its content have been added to your collection.",
      });
      form.reset();
      onOpenChange(false);
    },
    onError: (error) => {
      toast({
        title: "Failed to add channel",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    },
  });
  
  function onSubmit(values: z.infer<typeof formSchema>) {
    addChannelMutation.mutate(values.url);
  }
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <YoutubeIcon className="h-6 w-6 text-primary" />
            </div>
          </div>
          <DialogTitle>Add YouTube Channel</DialogTitle>
          <DialogDescription>
            Enter the URL of a YouTube channel to add it to your collection.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      placeholder="https://www.youtube.com/c/channelname"
                      {...field}
                      disabled={addChannelMutation.isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                disabled={addChannelMutation.isPending}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={addChannelMutation.isPending}
              >
                {addChannelMutation.isPending ? "Adding..." : "Add Channel"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
