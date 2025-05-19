
'use client';

import type { FC } from 'react';
import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { format, parseISO, isPast, isToday, formatDistanceToNow } from 'date-fns'; // Added formatDistanceToNow
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowLeft, MapPin, Clock, Navigation, Share2, Settings } from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from '@/hooks/use-toast'; // Import useToast
import type { Checkpoint, User, FeedItem, TrendingPlace, TrendingEvent, Comment } from '@/types'; // Import relevant types, added Comment
import CheckpointCard from '@/components/checkpoint-card'; // Reuse CheckpointCard
import { CheckpointSkeletonCard } from '@/components/checkpoint-skeleton-card'; // Reuse skeleton
import { mockUsers, mockCheckpoints, mockTrendingItems } from '@/app/mockData'; // Import mock data

// --- Mock Data (Simulated Past Items) ---
// Filter past items from the imported mock data

// Mock Comments for past items (Keep if you want specific comments for past items, otherwise use comments from main mock data)
const mockPastComments: Record<string, Comment[]> = {
    'fd2': [
        { id: 'pc1', userId: 'user4', text: 'Amazing view!', createdAt: new Date(Date.now() - 23 * 60 * 60 * 1000).toISOString() },
    ],
    'fdv1': [
        { id: 'pc2', userId: 'user8', text: 'I need this croissant in my life.', createdAt: new Date(Date.now() - 47 * 60 * 60 * 1000).toISOString() },
    ],
    // Add more past comments if needed
};


// Helper function to get author info
const getUserById = (userId: string): User | undefined => {
    return mockUsers.find(user => user.id === userId);
}

// Helper function to check if an item is in the past
const isPastItem = (item: FeedItem): boolean => {
    const now = new Date();
    try {
        if (item.type === 'checkpoint') {
            // Checkpoints are past if not created today and not live
             if (item.mediaType === 'live') return false; // Live is never past
             const createdAt = parseISO(item.createdAt);
             return isPast(createdAt) && !isToday(createdAt); // Explicitly check if it's past AND not today
        } else if (item.type === 'trending_place') {
             // Trending places derived from checkpoints, check original creation date
             const createdAt = parseISO(item.createdAt);
             return isPast(createdAt) && !isToday(createdAt);
        } else if (item.type === 'event') {
            // Event is past if its end time is past, or start time is past if no end time
            const endTime = item.endTime ? parseISO(item.endTime) : null;
            const startTime = parseISO(item.startTime);
            return endTime ? isPast(endTime) : isPast(startTime);
        }
        // Ads and Future Checkpoints are generally not considered 'past' in this context
        // Although some ads might expire based on endTime
        else if (item.type === 'advertisement' && item.endTime) {
            return isPast(parseISO(item.endTime));
        }
        return false;
    } catch {
        return true; // Treat errors as past
    }
};

const PastUbqsPage: FC = () => {
  const [pastItems, setPastItems] = useState<FeedItem[]>([]);
  // Removed isLoading state: const [isLoading, setIsLoading] = useState(true);
  const [hasMounted, setHasMounted] = useState(false);
  const [confirmedItems, setConfirmedItems] = useState<Set<string>>(new Set()); // State for confirmed items
  const { toast } = useToast(); // Use toast hook

  useEffect(() => {
      setHasMounted(true);
      // Simulate fetching past data
      // In a real app, this would be an API call
      // Combine all potential past items from imported mock data
      const allPotentialPastItems: FeedItem[] = [
          ...mockCheckpoints, // Contains both past and current/future
          ...mockTrendingItems, // Contains both past and current/future
      ];

       // Filter for unique past items and sort
      const uniquePastItems = Array.from(new Map(allPotentialPastItems.map(item => [item.id, item])).values());
      const filteredPast = uniquePastItems
                                        .filter(isPastItem) // Ensure we only get past items
                                        .sort((a, b) => {
                                            // Use createdAt for checkpoints/trending, startTime for events
                                            const getTime = (item: FeedItem): number => {
                                                 try {
                                                    if (item.type === 'event') return parseISO(item.startTime).getTime();
                                                    if (item.type === 'checkpoint' || item.type === 'trending_place') return parseISO(item.createdAt).getTime();
                                                    // Handle other types if they can be 'past'
                                                 } catch { return 0; }
                                                 return 0;
                                            }
                                            return getTime(b) - getTime(a); // Sort newest past item first
                                        });

      // Merge specific past comments if needed (optional)
      const finalPastItems = filteredPast.map(item => {
          if (mockPastComments[item.id]) {
              return { ...item, comments: [...(item.comments || []), ...mockPastComments[item.id]] };
          }
          return item;
      });


      setPastItems(finalPastItems);
      // Removed: setIsLoading(false);
  }, []);

   const handleGoThereClick = (itemId: string, itemType: FeedItem['type']) => {
       // Placeholder or implement analytics if needed for past items
        const item = pastItems.find(i => i.id === itemId);
        if (item && 'lat' in item && 'lng' in item) {
             const url = `https://www.google.com/maps?q=${item.lat},${item.lng}`;
             window.open(url, '_blank');
        }
   };

    // Handler for confirming an item (similar to home page)
   const handleConfirmClick = (itemId: string, itemType: FeedItem['type']) => {
        if (confirmedItems.has(itemId)) {
            toast({ title: "Already Confirmed", description: "You've already confirmed this.", variant: "cyan" });
            return;
        }

        setPastItems(prevItems =>
            prevItems.map(item => {
                const currentConfirmations = item.confirmations ?? 0;
                return item.id === itemId ? { ...item, confirmations: currentConfirmations + 1 } : item;
            })
        );
        setConfirmedItems(prev => new Set(prev).add(itemId));
        toast({ title: "Confirmed!", description: `You confirmed this past ${itemType.replace('_', ' ')}.` });
   };

   // Handler for adding a comment to a past item
   const handleAddComment = (itemId: string, text: string) => {
       const currentUserId = mockUsers[Math.floor(Math.random() * mockUsers.length)].id; // Use a random user for now
       const newComment: Comment = {
           id: `pc${Date.now()}`,
           userId: currentUserId,
           text: text,
           createdAt: new Date().toISOString(),
       };

       setPastItems(prevItems =>
           prevItems.map(item =>
               item.id === itemId
                   ? { ...item, comments: [...(item.comments || []), newComment] }
                   : item
           )
       );
       toast({ title: "Comment Added", description: "Your comment has been posted." });
   };


  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
       <header className="app-header p-4 flex justify-between items-center border-b sticky top-0 bg-background z-10">
        <Button variant="ghost" size="icon" asChild>
           <Link href="/" aria-label="Back to Home">
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </Button>
        <h1 className="text-xl font-semibold text-foreground">Past ubqs</h1>
         {/* Placeholder for potential future actions like settings */}
        <div className="w-10" />
      </header>

      {/* Main Content */}
      <ScrollArea className="flex-grow">
          <main className="p-4 md:p-6 lg:p-8 max-w-2xl mx-auto"> {/* Centered content */}
             {!hasMounted ? (
                // Show skeletons only if not mounted
                 <div className="space-y-4">
                    {[...Array(10)].map((_, i) => (
                        <CheckpointSkeletonCard key={`past_skel_${i}`} />
                    ))}
                 </div>
             ) : pastItems.length > 0 ? (
                 // Render actual items if mounted and items exist
                 <div className="space-y-4">
                     {pastItems.map((item) => {
                        const author = (item.type === 'checkpoint' || item.type === 'trending_place') ? getUserById(item.userId) : undefined;
                        if (item.type === 'checkpoint') {
                             return (
                                <CheckpointCard
                                    key={item.id}
                                    checkpoint={item}
                                    author={author}
                                    hasMounted={hasMounted}
                                    onGoThereClick={() => handleGoThereClick(item.id, item.type)}
                                    onConfirmClick={() => handleConfirmClick(item.id, item.type)} // Pass handler
                                    onAddComment={handleAddComment} // Pass comment handler
                                    allUsers={mockUsers} // Pass all users
                                />
                            );
                        }
                        // Add rendering logic for other past item types (Events, etc.) if needed
                        // Example for past events (assuming TrendingItemCard can handle past)
                        /*
                        if (item.type === 'event') {
                             return (
                                <TrendingItemCard
                                     key={item.id}
                                     item={item}
                                     hasMounted={hasMounted}
                                     onViewEventClick={handleViewEvent} // Define this if needed
                                     onConfirmClick={() => handleConfirmClick(item.id, item.type)}
                                     onAddComment={handleAddComment}
                                     allUsers={mockUsers}
                                 />
                             );
                         }
                         */
                        return null;
                     })}
                 </div>
             ) : (
                 // Show "No items" message if mounted and no items found
                 <div className="text-center py-12 text-muted-foreground">
                     <p>No past ubqs found.</p>
                 </div>
             )}
          </main>
      </ScrollArea>
    </div>
  );
};

export default PastUbqsPage;
