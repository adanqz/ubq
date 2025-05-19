
'use client';

import type { FC } from 'react';
import { useState, useMemo, useEffect, useRef, useCallback } from 'react'; // Added useRef, useCallback
import Link from 'next/link';
import Image from 'next/image';
import { format, parseISO, isToday, isTomorrow, isThisWeek, isThisMonth, startOfDay, endOfDay, addDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isFuture, isWithinInterval, formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge'; // Ensure Badge is imported
import { ArrowLeft, Search, Utensils, Building, Briefcase, Users, Calendar, Gift, IceCream, Beer, GlassWater, Star, Sparkles, Clock, MapPin, Navigation, ExternalLink, Radio, TrendingUp, CalendarDays, CalendarCheck, ShoppingBag, Rocket, Ticket, Check, Loader2 } from 'lucide-react'; // Added Loader2
import SearchInput from '@/components/search-input';
import type { FeedItem, User, FriendPresence, TrendingItem, FutureCheckpoint, Checkpoint, TrendingPlace, TrendingEvent, Advertisement, Comment } from '@/types';
import FriendPresenceIndicator from '@/components/friend-presence-indicator';
import CountdownTimer from '@/components/countdown-timer';
import CheckpointCard from '@/components/checkpoint-card';
import TrendingItemCard, { TrendingItemSkeletonCard } from '@/components/trending-item-card';
import { useToast } from '@/hooks/use-toast';
import { mockUsers, mockExploreItems, mockExploreComments, mockExploreFriendPresence } from '@/app/mockDataExplore';

// Helper function to get author info
const getUserById = (userId: string): User | undefined => {
    return mockUsers.find(user => user.id === userId);
}

// Interest Categories + Time Filters
const interests = [
  { name: 'Recipes', icon: Utensils, tag: 'recipes' },
  { name: 'Construction', icon: Building, tag: 'construction' },
  { name: 'Jobs', icon: Briefcase, tag: 'jobs' },
  { name: 'Coworking', icon: Users, tag: 'coworking' },
  { name: 'Meetings', icon: Calendar, tag: 'meetings' },
  { name: 'Happenings', icon: Sparkles, tag: 'happenings' },
  { name: 'Ice Cream', icon: IceCream, tag: 'ice cream' },
  { name: 'Drinks', icon: Beer, tag: 'drinks' },
  { name: 'Food', icon: GlassWater, tag: 'food' },
  { name: 'Restaurants', icon: Utensils, tag: 'restaurants' },
  { name: 'Famous People', icon: Star, tag: 'famous people' },
  { name: 'Offers', icon: Gift, tag: 'discounts' }, // Combines discounts & offers
  { name: 'Next Hour', icon: Clock, tag: 'next hour offers' }, // Should overlap with 'happening now'
];

const timeFilters = [
  { name: 'Now', icon: Radio, tag: 'happening now' },
  { name: 'Today', icon: CalendarDays, tag: 'happening today' },
  { name: 'Tomorrow', icon: CalendarCheck, tag: 'happening tomorrow' },
  { name: 'This Week', icon: Calendar, tag: 'happening this week' },
  { name: 'This Month', icon: Calendar, tag: 'happening this month' },
];

// Helper function to render date/time information with emphasis
const renderItemDate = (item: FeedItem, hasMounted: boolean): React.ReactNode => {
    if (!hasMounted) {
      return <Skeleton className="h-4 w-20 inline-block" />;
    }

    try {
        const now = new Date();
        if (item.type === 'checkpoint') {
            if (item.mediaType === 'live') return <Badge variant="live"><Radio className="w-3 h-3 mr-1"/>Live</Badge>;
            const date = parseISO(item.createdAt);
            if (isToday(date)) {
                // Emphasize relative time
                return <span className="text-xs font-medium text-foreground/80">{formatDistanceToNow(date, { addSuffix: true })}</span>;
            }
        } else if (item.type === 'trending_place') {
             const date = parseISO(item.createdAt);
             if (isToday(date)) {
                 // Emphasize relative time
                 return <span className="text-xs font-medium text-foreground/80">{formatDistanceToNow(date, { addSuffix: true })}</span>;
             }
        } else if (item.type === 'event') {
             const startDate = parseISO(item.startTime);
             if (isToday(startDate)) return <Badge variant="outline" className="font-medium text-foreground/80">Today {format(startDate, 'p')}</Badge>;
             if (isTomorrow(startDate)) return <Badge variant="outline" className="font-medium text-foreground/80">Tomorrow {format(startDate, 'p')}</Badge>;
             return <span className="text-xs text-muted-foreground">{format(startDate, 'MMM d, p')}</span>; // Keep future dates standard
        } else if (item.type === 'advertisement') {
             if (item.startTime) {
                 const start = parseISO(item.startTime);
                 const end = item.endTime ? parseISO(item.endTime) : null;
                 if (isWithinInterval(now, { start, end: end || start })) {
                      return <Badge variant="live"><Clock className="w-3 h-3 mr-1"/>Active Now</Badge>;
                 }
             }
             return <Badge variant={item.adType === 'nearby' ? 'nearby' : 'sponsor'}>{item.adType}</Badge>;
        } else if (item.type === 'future_checkpoint') {
            // Emphasize countdown
            return <div className="text-purple-600 font-medium"><CountdownTimer targetDate={item.scheduledAt} hasMounted={hasMounted}/></div>;
        }
    } catch (e) {
      console.error("Error formatting date for item:", item.id, e);
      return <span className="text-xs text-destructive">Invalid date</span>;
    }
    return null; // Default fallback
}

// Helper to get relevant time for filtering
const getItemTime = (item: FeedItem): Date | null => {
    try {
        if ((item.type === 'checkpoint' || item.type === 'trending_place')) {
            const createdAt = parseISO(item.createdAt);
            return isToday(createdAt) ? createdAt : null; // Only return if today
        }
        else if (item.type === 'event' || item.type === 'advertisement' || item.type === 'future_checkpoint') {
            const timeStr = item.startTime || (item as FutureCheckpoint).scheduledAt;
            if (!timeStr) return null;
            const timeObj = parseISO(timeStr);
             // Return only if it's today or in the future
            return (isToday(timeObj) || isFuture(timeObj)) ? timeObj : null;
        }
    } catch {
        return null;
    }
    return null;
};

// Helper function to determine if an item is current or future (used for initial filtering)
const isCurrentOrFuture = (item: FeedItem): boolean => {
    const now = new Date();
    try {
        if (item.type === 'checkpoint') {
            if (item.mediaType === 'live') return true; // Live is always current
            return isToday(parseISO(item.createdAt)); // Checkpoints must be from today
        } else if (item.type === 'trending_place') {
            return isToday(parseISO(item.createdAt)); // Trending must be based on today's activity
        } else if (item.type === 'event') {
            const startTime = parseISO(item.startTime);
            const endTime = item.endTime ? parseISO(item.endTime) : null;
            return isToday(startTime) || isFuture(startTime) || (endTime ? isWithinInterval(now, { start: startTime, end: endTime }) : false);
        } else if (item.type === 'advertisement') {
            const endTime = item.endTime ? parseISO(item.endTime) : null;
            return !endTime || isToday(endTime) || isFuture(endTime);
        } else if (item.type === 'future_checkpoint') {
            return true; // Always future
        }
    } catch {
        return false; // Treat errors as past/invalid
    }
    return false;
};

const ITEMS_PER_PAGE = 10; // Number of items to load each time

const ExplorePage: FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [items, setItems] = useState<FeedItem[]>([]); // State to hold filtered items displayed
    const [hasMounted, setHasMounted] = useState(false); // Track mount status
    const [confirmedItems, setConfirmedItems] = useState<Set<string>>(new Set()); // State for confirmed items
    const { toast } = useToast();
    const [currentLocation, setCurrentLocation] = useState<[number, number] | null>(null);


    // Infinite Scroll State
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const observerRef = useRef<IntersectionObserver | null>(null);
    const loadMoreRef = useRef<HTMLDivElement | null>(null);

    // Memoize all possible items from mock data
    const allAvailableItems = useMemo(() => mockExploreItems.filter(isCurrentOrFuture), []);

    // Fetch current location
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setCurrentLocation([position.coords.latitude, position.coords.longitude]);
                },
                (error) => {
                    console.error("Error getting location in Explore page:", error);
                    // Handle error or set default location if needed
                }
            );
        }
    }, []);


    // Filtered items based on current filters and page (runs on client after mount)
    useEffect(() => {
        if (!hasMounted) return; // Only run filtering logic on the client

        setIsLoadingMore(true); // Indicate loading starts

        const now = new Date();
        const todayStart = startOfDay(now);
        const todayEnd = endOfDay(now);
        const tomorrowStart = startOfDay(addDays(now, 1));
        const tomorrowEnd = endOfDay(addDays(now, 1));
        const weekStart = startOfWeek(now, { weekStartsOn: 1 });
        const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
        const monthStart = startOfMonth(now);
        const monthEnd = endOfMonth(now);

        const filteredAvailable = allAvailableItems.filter(item => {
             const termMatch = searchTerm ? (
                item.title?.toLowerCase().includes(searchTerm) ||
                item.description?.toLowerCase().includes(searchTerm) ||
                (item.type === 'advertisement' && item.advertiser?.toLowerCase().includes(searchTerm)) ||
                (item.type === 'event' && item.organizer?.toLowerCase().includes(searchTerm)) ||
                 (item.type === 'checkpoint' && getUserById(item.userId)?.name.toLowerCase().includes(searchTerm)) ||
                 (item.type === 'trending_place' && getUserById(item.userId)?.name.toLowerCase().includes(searchTerm)) ||
                 (item.type === 'future_checkpoint' && getUserById(item.userId)?.name.toLowerCase().includes(searchTerm))
            ) : true;

            const itemTags = (item as any).tags || []; // Assuming tags exist
            const interestTags = selectedTags.filter(tag => !timeFilters.some(tf => tf.tag === tag));
            const interestTagMatch = interestTags.length > 0 ? interestTags.some(tag => itemTags.includes(tag)) : true;

            // Time Filtering
            const activeTimeFilter = selectedTags.find(tag => timeFilters.some(tf => tf.tag === tag));
             let timeMatch = true;
            if (activeTimeFilter) {
                 const itemTime = getItemTime(item);

                 if (activeTimeFilter === 'happening now') {
                     timeMatch = (item.tags?.includes('happening now') || (item.type === 'checkpoint' && item.mediaType === 'live'));
                     if (!timeMatch && item.type === 'advertisement' && item.startTime) {
                         try {
                             const start = parseISO(item.startTime);
                             const end = item.endTime ? parseISO(item.endTime) : null;
                             if (isWithinInterval(now, { start, end: end || start })) timeMatch = true;
                         } catch {}
                     }
                 } else if (!itemTime) {
                    timeMatch = false;
                 } else {
                     switch (activeTimeFilter) {
                        case 'happening today':
                            timeMatch = itemTime >= todayStart && itemTime <= todayEnd;
                            break;
                        case 'happening tomorrow':
                            timeMatch = itemTime >= tomorrowStart && itemTime <= tomorrowEnd;
                            break;
                        case 'happening this week':
                            timeMatch = itemTime >= todayStart && itemTime <= weekEnd;
                            break;
                        case 'happening this month':
                            timeMatch = itemTime >= todayStart && itemTime <= monthEnd;
                            break;
                        default:
                            timeMatch = true;
                    }
                 }
            }

            return termMatch && interestTagMatch && timeMatch;
        });

        const endIndex = page * ITEMS_PER_PAGE;
        const newItems = filteredAvailable.slice(0, endIndex);
        setItems(newItems);
        setHasMore(endIndex < filteredAvailable.length);
        setIsLoadingMore(false); // Indicate loading finished

    }, [allAvailableItems, searchTerm, selectedTags, page, hasMounted]); // Include hasMounted

    // Load more items function
    const loadMoreItems = useCallback(() => {
        if (isLoadingMore || !hasMore) return;
        setPage(prevPage => prevPage + 1);
    }, [isLoadingMore, hasMore]);


     // Effect for Intersection Observer
     useEffect(() => {
         if (!hasMounted) return; // Only setup observer on the client

         observerRef.current = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
                loadMoreItems();
            }
         });

         const currentLoadMoreRef = loadMoreRef.current;
         if (currentLoadMoreRef) {
             observerRef.current.observe(currentLoadMoreRef);
         }

         return () => {
             if (observerRef.current && currentLoadMoreRef) {
                 observerRef.current.unobserve(currentLoadMoreRef);
             }
         };
     }, [hasMore, isLoadingMore, loadMoreItems, hasMounted]); // Include hasMounted

    // Reset page when filters change
    useEffect(() => {
        if (!hasMounted) return;
        setPage(1); // Reset to page 1 whenever search term or tags change
        // hasMore is determined by the filtering useEffect
    }, [searchTerm, selectedTags, hasMounted]); // Include hasMounted

    useEffect(() => {
        setHasMounted(true); // Component did mount
    }, []);


    const handleSearch = (query: string) => {
        setSearchTerm(query.toLowerCase());
    };

    const toggleTag = (tag: string) => {
        const isTimeFilter = timeFilters.some(tf => tf.tag === tag);
        const currentTimeFilters = selectedTags.filter(t => timeFilters.some(tf => tf.tag === t));

        if (isTimeFilter) {
            if (selectedTags.includes(tag)) {
                setSelectedTags(prev => prev.filter(t => t !== tag));
            } else {
                setSelectedTags(prev => [...prev.filter(t => !currentTimeFilters.includes(t)), tag]);
            }
        } else {
             setSelectedTags(prev =>
                prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
            );
        }
    };

     const handleGoThereClick = (lat: number, lng: number) => {
        const url = `https://www.google.com/maps?q=${lat},${lng}`;
        window.open(url, '_blank');
    };

    // Handler for confirming an item - Needs to update the original source if we want persistence
    const handleConfirmClick = (itemId: string, itemType: FeedItem['type']) => {
        if (confirmedItems.has(itemId)) {
            toast({ title: "Already Confirmed", description: "You've already confirmed this.", variant: "cyan" });
            return;
        }
        // Update mockExploreItems directly (or a copy) - THIS IS NOT IDEAL FOR REAL APPS
         const itemIndex = mockExploreItems.findIndex(item => item.id === itemId);
         if (itemIndex > -1) {
             const currentConfirmations = mockExploreItems[itemIndex].confirmations ?? 0;
             mockExploreItems[itemIndex] = { ...mockExploreItems[itemIndex], confirmations: currentConfirmations + 1 };
         }
         // // --- OR --- Update local 'items' state if you don't mutate original mock
         setItems(prevItems =>
            prevItems.map(item => {
                const currentConfirmations = item.confirmations ?? 0;
                return item.id === itemId ? { ...item, confirmations: currentConfirmations + 1 } : item;
            })
         );
        setConfirmedItems(prev => new Set(prev).add(itemId));
        toast({ title: "Confirmed!", description: `You confirmed this ${itemType.replace('_', ' ')}.` });
    };

     // Handler for adding a comment - Needs to update the original source if we want persistence
   const handleAddComment = (itemId: string, text: string) => {
       const currentUserId = mockUsers[Math.floor(Math.random() * mockUsers.length)].id; // Use a random user for now
       const newComment: Comment = {
           id: `ec${Date.now()}`,
           userId: currentUserId,
           text: text,
           createdAt: new Date().toISOString(),
       };

        // Update mockExploreItems directly (or a copy) - THIS IS NOT IDEAL FOR REAL APPS
        const itemIndex = mockExploreItems.findIndex(item => item.id === itemId);
        if (itemIndex > -1) {
            mockExploreItems[itemIndex] = {
                ...mockExploreItems[itemIndex],
                comments: [...(mockExploreItems[itemIndex].comments || []), newComment]
             };
        }
       // --- OR --- Update local 'items' state if you don't mutate original mock
       setItems(prevItems =>
           prevItems.map(item =>
               item.id === itemId
                   ? { ...item, comments: [...(item.comments || []), newComment] }
                   : item
           )
       );
       toast({ title: "Comment Added", description: "Your comment has been posted." });
   };


     // Handlers for specific trending item interactions
    const handleViewEvent = (event: TrendingEvent) => {
        if (event.website) window.open(event.website, '_blank');
        else toast({ title: `Event: ${event.title}`, description: 'No website available.' });
    };

    const handleAdClick = (ad: Advertisement) => {
        window.open(ad.targetUrl, '_blank');
        toast({ title: `Opening Ad: ${ad.advertiser}` });
    };


    // Removed getItemHeight function
    const searchPlaceholder = useMemo(() => {
        if (currentLocation) {
            return `Ubq's nearby (${currentLocation[0].toFixed(4)}, ${currentLocation[1].toFixed(4)})`;
        }
        return `Ubq's nearby (longitude latitude)`;
    }, [currentLocation]);


    return (
        <div className="flex flex-col min-h-screen bg-background">
            {/* Header */}
            <header className="app-header p-4 flex justify-between items-center border-b sticky top-0 bg-background z-20">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/" aria-label="Back to Home">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                </Button>
                <div className="flex-grow max-w-md mx-4">
                    <SearchInput onSearch={handleSearch} placeholder={searchPlaceholder} /> {/* Updated placeholder */}
                </div>
                <div className="w-10"></div>
            </header>

            {/* Interest & Time Filters */}
            <div className="sticky top-[69px] bg-background z-10 border-b">
                <ScrollArea className="w-full flex-shrink-0">
                    <div className="flex space-x-2 p-4">
                        {timeFilters.map(filter => (
                            <Button
                                key={filter.tag}
                                variant={selectedTags.includes(filter.tag) ? "default" : "outline"}
                                size="sm"
                                onClick={() => toggleTag(filter.tag)}
                                className="flex-shrink-0"
                            >
                                <filter.icon className="w-4 h-4 mr-2" />
                                {filter.name}
                            </Button>
                        ))}
                         <div className="border-l h-6 my-auto mx-2"></div>
                        {interests.map(interest => (
                            <Button
                                key={interest.tag}
                                variant={selectedTags.includes(interest.tag) ? "default" : "outline"}
                                size="sm"
                                onClick={() => toggleTag(interest.tag)}
                                className="flex-shrink-0"
                            >
                                <interest.icon className="w-4 h-4 mr-2" />
                                {interest.name}
                            </Button>
                        ))}
                    </div>
                </ScrollArea>
            </div>


            {/* Main Content - Masonry Grid */}
            <main className="flex-grow p-4 md:p-6 lg:p-8">
                 <div className="masonry-grid">
                    {/* Initial loading state before mount */}
                    {!hasMounted && [...Array(10)].map((_, i) => (
                        <div key={`skel-${i}`} className={`masonry-item mb-4 break-inside-avoid`}>
                           <TrendingItemSkeletonCard />
                        </div>
                    ))}
                    {/* Actual items after mount */}
                    {hasMounted && items.map(item => {
                         const author = (item.type === 'checkpoint' || item.type === 'trending_place' || item.type === 'future_checkpoint') ? getUserById(item.userId) : undefined;

                         return (
                             <div key={item.id} className={`masonry-item mb-4 break-inside-avoid`}> {/* Ensure styling allows natural height */}
                                 {item.type === 'checkpoint' ? (
                                     <CheckpointCard
                                         checkpoint={item as Checkpoint}
                                         author={author}
                                         hasMounted={hasMounted}
                                         onGoThereClick={() => handleGoThereClick(item.lat, item.lng)} // Corrected handler
                                         onConfirmClick={handleConfirmClick}
                                         onAddComment={handleAddComment}
                                         allUsers={mockUsers}
                                     />
                                 ) : (
                                     <TrendingItemCard
                                         item={item as TrendingItem}
                                         author={author}
                                         hasMounted={hasMounted}
                                         onGoThereClick={'lat' in item && 'lng' in item ? () => handleGoThereClick(item.lat, item.lng) : undefined} // Corrected handler
                                         onViewEventClick={item.type === 'event' ? handleViewEvent : undefined}
                                         onAdClick={item.type === 'advertisement' ? handleAdClick : undefined}
                                         onConfirmClick={handleConfirmClick}
                                         onAddComment={handleAddComment}
                                         allUsers={mockUsers}
                                     />
                                 )}
                             </div>
                         );
                     })}
                </div>
                 {/* Load More Trigger / Indicator */}
                 <div ref={loadMoreRef} className="h-10 flex justify-center items-center">
                     {isLoadingMore && <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />}
                     {!isLoadingMore && !hasMore && items.length > 0 && hasMounted && (
                         <p className="text-center text-muted-foreground">No more items to load.</p>
                     )}
                 </div>
                {!isLoadingMore && items.length === 0 && hasMounted && (
                    <p className="text-center text-muted-foreground mt-8">No items match your search or filters for now or the future.</p>
                )}
                {/* Removed initial loading state div, handled by skeleton rendering */}
            </main>
             {/* Basic CSS for Masonry */}
            <style jsx>{`
                .masonry-grid {
                    column-count: 2;
                    column-gap: 1rem;
                }
                .masonry-item {
                    display: inline-block; /* Important for masonry */
                    width: 100%; /* Ensure items take full column width */
                    vertical-align: top; /* Align items to the top */
                    margin-bottom: 1rem;
                    break-inside: avoid; /* Re-added break-inside */
                }
                /* Responsive adjustments */
                @media (min-width: 640px) {
                    .masonry-grid { column-count: 3; }
                }
                @media (min-width: 1024px) {
                    .masonry-grid { column-count: 4; }
                }
                 @media (min-width: 1280px) {
                    .masonry-grid { column-count: 5; }
                }
            `}</style>
        </div>
    );
};

export default ExplorePage;
