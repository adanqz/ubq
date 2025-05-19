
'use client';

import type { FC } from 'react';
import { useState, useEffect, useMemo, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { format, parseISO, formatDistanceToNow, isFuture, isToday, isWithinInterval, startOfDay } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea, ScrollAreaViewport } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { PlusCircle, Share2, Settings, MapPin, Loader2, Image as ImageIcon, Video, Type, Navigation, TrendingUp, Radio, Sparkles, ExternalLink, Clock, Users, User as UserIconLucide, PauseCircle, PlayCircle, Search, Compass, Bell, Check, Fuel, Pill, Store, ShoppingBag, Shield, TrafficCone, LinkIcon, Heart, Ticket, Utensils, GlassWater, Wine, Newspaper, Music, LayoutGrid, Send, MessageSquare, LogIn, UserPlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Checkpoint, User, FeedItem, FriendPresence, TrendingItem, TrendingPlace, TrendingEvent, Advertisement, FutureCheckpoint, Comment, ExternalLinkItem, MusicItem, ChatMessage } from '@/types';
import CheckpointForm from '@/components/checkpoint-form';
import UserListManager from '@/components/user-list-manager';
import CheckpointCard from '@/components/checkpoint-card';
import TrendingItemCard, { TrendingItemSkeletonCard } from '@/components/trending-item-card';
import { CheckpointSkeletonCard } from '@/components/checkpoint-skeleton-card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel"
import Autoplay from "embla-carousel-autoplay"
import SearchInput from '@/components/search-input';
import { Badge } from '@/components/ui/badge';
import ExternalLinkCard, { ExternalLinkSkeletonCard } from '@/components/external-link-card';
import MusicCard, { MusicSkeletonCard } from '@/components/music-card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import MapComponent from '@/components/map-component';
import ChatWindow from '@/components/chat-window';
import { cn } from '@/lib/utils';
import { useUser, UserButton, SignInButton, SignUpButton } from "@clerk/nextjs";
import { useClerkStatus } from '@/contexts/clerk-status-context';


import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { mockUsers, mockCheckpoints, mockTrendingItems, mockComments, mockFriendPresence, mockUserLists, initialFeedItems, isCurrentOrFuture, mockExternalLinks, mockMusicItems, mockChatMessages } from '@/app/mockData';
import CountdownTimer from '@/components/countdown-timer';
import { ThemeToggle } from '@/components/theme-toggle';


// Define friend IDs based on a default user (user4 for now, until Clerk user's friends are integrated)
const friendIds = new Set(mockUserLists['Alex']?.flat() || ['user5', 'user6']);


const localServiceLinks = [
    { name: 'Food', icon: Utensils, href: '/explore?q=food' },
    { name: 'Drinks', icon: GlassWater, href: '/explore?q=drinks' },
    { name: 'Liquorstore', icon: Wine, href: '/explore?q=liquor+store' },
    { name: 'Happenings', icon: Sparkles, href: '/explore?q=happenings' },
    { name: 'Gas Stations', icon: Fuel, href: '/explore?q=gas+station' },
    { name: 'Pharmacy', icon: Pill, href: '/explore?q=pharmacy' },
    { name: 'Stores', icon: Store, href: '/explore?q=store' },
    { name: 'Malls', icon: ShoppingBag, href: '/explore?q=mall' },
    { name: 'Police Stations', icon: Shield, href: '/explore?q=police+station' },
    { name: 'Traffic', icon: TrafficCone, href: '/explore?q=traffic' },
    { name: 'Local News', icon: Newspaper, href: '/explore?q=local+news' },
]


const DEFAULT_LOCATION: [number, number] = [34.0522, -118.2437];

const CarouselItemCard: FC<{ item: FeedItem, hasMounted: boolean }> = ({ item, hasMounted }) => {
    const handleItemClick = () => {
        let url: string | undefined;
        if (item.type === 'checkpoint' || item.type === 'trending_place' || item.type === 'future_checkpoint' || item.type === 'event') {
            if (item.id) url = `/ubq/${item.id}`;
        }
        else if (item.type === 'advertisement') url = item.targetUrl;
        else if (item.type === 'external_link') url = item.url;
        else if (item.type === 'music') url = item.url;

        if (url) {
             if (url.startsWith('http')) {
                window.open(url, '_blank');
             } else {
                window.location.href = url;
             }
        }
    };

    let imageUrl: string | undefined;
    let isVideo = false;
    let aiHint = "checkpoint image user content vertical phone";

    if (item.type === 'checkpoint') {
        if (item.mediaType === 'video' || item.mediaUrl?.match(/\.(mp4|webm|mov)$/i)) {
            isVideo = true;
        }
        imageUrl = item.mediaUrl;
    } else {
        imageUrl = (item as any).mediaUrl || (item as any).imageUrl;
         if (imageUrl?.match(/\.(mp4|webm|mov)$/i)) {
             isVideo = true;
         }
    }

    let displayImageUrl = imageUrl;
    if (isVideo && imageUrl?.endsWith('.gif')) {
        displayImageUrl = imageUrl;
        aiHint = "video preview animated gif vertical";
    } else if (isVideo) {
        displayImageUrl = `https://picsum.photos/seed/${item.id}_vid_placeholder/200/350`; // Vertical aspect ratio
        aiHint = "video placeholder static vertical";
    } else if (!imageUrl) {
        displayImageUrl = `https://picsum.photos/seed/${item.id}/200/350`; // Vertical aspect ratio
        aiHint = "placeholder image vertical phone";
    } else {
         // Ensure non-video/gif items also use vertical aspect for consistency in this carousel
        if (!isVideo && !displayImageUrl?.endsWith('.gif') && !displayImageUrl?.includes('/200/350')) {
            // displayImageUrl = `${displayImageUrl?.split('?')[0]}/200/350`; // A bit hacky for picsum
             displayImageUrl = `https://picsum.photos/seed/${item.id}_img_placeholder/200/350`; // More robust placeholder
        }
        aiHint = "advertisement event food promotion fashion tech checkpoint music vertical";
    }


    let callToActionText = 'View ubq';

    const renderTimestamp = () => {
        if (!hasMounted) return <Skeleton className="h-3 w-16 inline-block" />;
        let dateIso: string | undefined;
        if (item.type === 'checkpoint') dateIso = item.createdAt;
        else if (item.type === 'trending_place') dateIso = item.createdAt;
        else if (item.type === 'music') dateIso = item.createdAt;

        if (!dateIso) return null;

        try {
            const dateObj = parseISO(dateIso);
             if (isToday(dateObj)) {
                return <span className="text-xs font-medium text-white/90">{formatDistanceToNow(dateObj, { addSuffix: true })}</span>;
            }
            return <span className="text-xs text-white/80">{formatDistanceToNow(dateObj, { addSuffix: true })}</span>;
        } catch {
             return <span className="text-xs text-destructive">Invalid date</span>;
        }
    }

    const getIcon = () => {
         if (item.type === 'checkpoint') return <Heart className="w-3 h-3 text-pink-400"/>;
         if (item.type === 'trending_place') return <TrendingUp className="w-3 h-3 text-primary"/>;
         if (item.type === 'event') return <Ticket className="w-3 h-3 text-accent" />;
         if (item.type === 'advertisement') return <ShoppingBag className="w-3 h-3 text-yellow-500" />;
         if (item.type === 'future_checkpoint') return <Rocket className="w-3 h-3 text-purple-500" />;
         if (item.type === 'external_link') return <LinkIcon className="w-3 h-3 text-blue-400" />;
         if (item.type === 'music') return <Music className="w-3 h-3 text-teal-400" />;
         return null;
    }

    const getSecondaryText = () => {
         if ((item.type === 'checkpoint' || item.type === 'trending_place' || item.type === 'future_checkpoint' || item.type === 'music') && 'userId' in item) {
            return getUserById(item.userId)?.name || '';
         }
         if (item.type === 'event') return item.organizer || '';
         if (item.type === 'advertisement') return item.advertiser || '';
         if (item.type === 'external_link') return item.source || '';
         return '';
    }

    return (
        <Card className="relative overflow-hidden material-elevation-1 aspect-[9/16] flex flex-col text-white rounded-lg group h-full"> {/* Enforce 9/16 aspect ratio */}
             <div className={cn("jsx-85dec1a65f548a2a absolute inset-0 z-0", !hasMounted && "animate-pulse rounded-md bg-muted")}>
                  {hasMounted && displayImageUrl ? (
                     <Image
                        src={displayImageUrl}
                        alt={item.title}
                        fill
                        style={{ objectFit: 'cover' }}
                        className="opacity-80 group-hover:opacity-60 transition-opacity duration-300"
                        data-ai-hint={aiHint}
                        onError={(e) => console.error("Image Error:", e, displayImageUrl)}
                        unoptimized={displayImageUrl?.endsWith('.gif')} // Ensure GIF is unoptimized
                     />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  )}
                  {isVideo && (
                    <div className="absolute top-2 right-2 bg-black/50 rounded-full p-1">
                        <Video className="w-3 h-3 text-white/90" />
                    </div>
                  )}
             </div>

            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent z-10" />

            <CardContent className="relative z-20 p-3 flex-grow flex flex-col justify-end">
                 {item.type === 'checkpoint' || item.type === 'trending_place' ? (
                    <Link href={`/ubq/${item.id}`} passHref>
                        <h3 className="text-sm font-semibold leading-tight line-clamp-2 mb-1 hover:underline text-shadow-sm">
                             {item.title}
                        </h3>
                    </Link>
                 ) : (
                     <h3 className="text-sm font-semibold leading-tight line-clamp-2 mb-1 text-shadow-sm">
                         {item.title}
                    </h3>
                 )}
                <div className="flex items-center justify-between mt-auto pt-2">
                     <span className="text-xs text-white/80 flex items-center gap-1 overflow-hidden">
                        {getIcon()}
                        <span className="truncate">{getSecondaryText()}</span>
                        <span className="flex-shrink-0 mx-1">·</span>
                        <span className="flex-shrink-0">{renderTimestamp()}</span>
                    </span>
                    <Button variant="ghost" size="sm" className="h-auto px-2 py-1 text-xs text-white hover:bg-white/20 flex-shrink-0" onClick={handleItemClick}>
                        {callToActionText}
                    </Button>
                </div>
            </CardContent>
            <style jsx>{`
                .text-shadow-sm {
                    text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
                }
            `}</style>
        </Card>
    );
};

const mockNotifications = [
    { id: 'n1', userId: 'user5', type: 'confirm', itemId: 'fd1', text: 'Chris confirmed your ubq: "Hidden Gem Taco Spot!"', createdAt: new Date(Date.now() - 5 * 60000).toISOString() },
    { id: 'n2', userId: 'user6', type: 'comment', itemId: 'fd1', text: 'Sam commented on your ubq: "Where exactly is this?"', createdAt: new Date(Date.now() - 10 * 60000).toISOString() },
    { id: 'n3', userId: 'user4', type: 'confirm', itemId: 'nl1', text: 'Alex confirmed your ubq: "Warehouse Rave Vibes"', createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString() },
    { id: 'n4', userId: 'user1', type: 'comment', itemId: 'fd3', text: 'Beyoncé commented: "Love that spot!"', createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString() },
];

const getUserById = (userId: string): User | undefined => {
    return mockUsers.find(user => user.id === userId);
}

const shuffleArray = <T,>(array: T[]): T[] => {
    let currentIndex = array.length, randomIndex;
    while (currentIndex !== 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }
    return array;
}

const Home: FC = () => {
  const { isClerkJSLoadedAndConfigured } = useClerkStatus();
  
  // Conditionally use Clerk hooks only if Clerk is configured
  const clerkAuth = isClerkJSLoadedAndConfigured ? useUser() : { isSignedIn: false, user: null, isLoaded: true };
  const isSignedIn = clerkAuth.isSignedIn;
  const clerkUser = clerkAuth.user;
  const isClerkHookLoaded = clerkAuth.isLoaded;


  const [currentLocation, setCurrentLocation] = useState<[number, number] | null>(null);
  const [allItems, setAllItems] = useState<FeedItem[]>(initialFeedItems);
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [userListsState, setUserListsState] = useState<Record<string, string[]>>(mockUserLists);
  const [isCheckpointFormOpen, setIsCheckpointFormOpen] = useState(false);
  const [isUserListManagerOpen, setIsUserListManagerOpen] = useState(false);
  const [selectedMapLocation, setSelectedMapLocation] = useState<[number, number] | null>(null);
  const [locationForForm, setLocationForForm] = useState<[number, number] | null>(null);
  const { toast } = useToast();
  const [hasMounted, setHasMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'trending' | 'live' | 'photo' | 'video' | 'text' | 'external' | 'music'>('all');
  const [isFeedScrolling, setIsFeedScrolling] = useState(true);
  const [confirmedItems, setConfirmedItems] = useState<Set<string>>(new Set());
  const [hasNotifications, setHasNotifications] = useState(true);
  const [peopleNearYou, setPeopleNearYou] = useState<User[]>([]);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const feedScrollRef = useRef<HTMLDivElement>(null);
  const feedScrollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const friendsCarouselPlugin = useRef<ReturnType<typeof Autoplay> | null>(null);
  const peopleNearYouPlugin = useRef<ReturnType<typeof Autoplay> | null>(null);

  const currentUserForProfileCard = useMemo(() => {
    if (isClerkHookLoaded && isSignedIn && clerkUser) {
      const mockEquivalent = mockUsers.find(m_user => m_user.id === clerkUser.id || m_user.name === clerkUser.firstName);
      return {
        id: clerkUser.id,
        name: clerkUser.fullName || clerkUser.firstName || "User",
        avatarUrl: clerkUser.imageUrl || mockEquivalent?.avatarUrl,
        customCss: mockEquivalent?.customCss,
      };
    }
    return mockUsers.find(u => u.id === 'user4')!; // Fallback to default mock user
  }, [isClerkHookLoaded, isSignedIn, clerkUser]);

  const allOtherUsers = useMemo(() => mockUsers.filter(u => u.id !== currentUserForProfileCard.id), [currentUserForProfileCard.id]);

    useEffect(() => {
         if (!hasMounted) return;
         setPeopleNearYou(allOtherUsers.slice(0, 8));
         const interval = setInterval(() => {
             setPeopleNearYou(prevPeople => {
                 let updatedPeople = [...prevPeople];
                 const shouldAdd = Math.random() > 0.7;
                 const shouldRemove = Math.random() > 0.5;
                 if (shouldRemove && updatedPeople.length > 3) {
                     const randomIndex = Math.floor(Math.random() * updatedPeople.length);
                     updatedPeople.splice(randomIndex, 1);
                 }
                 if (shouldAdd && updatedPeople.length < allOtherUsers.length) {
                     const availableToAdd = allOtherUsers.filter(u => !updatedPeople.some(p => p.id === u.id));
                     if (availableToAdd.length > 0) {
                         const randomIndex = Math.floor(Math.random() * availableToAdd.length);
                         updatedPeople.push(availableToAdd[randomIndex]);
                     }
                 }
                  return updatedPeople.slice(0, 15);
             });
         }, 5000);
         return () => clearInterval(interval);
    }, [hasMounted, allOtherUsers]);

  useEffect(() => {
    setHasMounted(true);
    setAllItems(prevItems => shuffleArray([...prevItems]));
    if (navigator.geolocation) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          setCurrentLocation([position.coords.latitude, position.coords.longitude]);
        },
        (error: GeolocationPositionError) => {
          console.error(`Error getting location: Code ${error.code} - ${error.message || '(no message)'}.`, error); // Log error message if available, handle empty message and log the full object
          if (!currentLocation) {
             let errorMessage = 'Could not retrieve your current location. Using default.';
             switch(error.code) {
                case error.PERMISSION_DENIED:
                    errorMessage = "Location access denied. Using default location.";
                    break;
                case error.POSITION_UNAVAILABLE:
                    errorMessage = "Location information is unavailable. Using default location.";
                    break;
                case error.TIMEOUT:
                    errorMessage = "Location request timed out. Using default location.";
                    break;
                default:
                    errorMessage = "An unknown error occurred while retrieving location. Using default location.";
             }
            toast({
              title: 'Location Error',
              description: errorMessage,
              variant: 'cyan',
            });
            setCurrentLocation(DEFAULT_LOCATION);
          }
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );
      return () => navigator.geolocation.clearWatch(watchId);
    } else {
      console.error('Geolocation is not supported by this browser.');
      if (!currentLocation) {
        toast({
          title: 'Location Error',
          description: 'Geolocation is not supported by this browser. Using default.',
          variant: 'cyan',
        });
        setCurrentLocation(DEFAULT_LOCATION);
      }
    }
  }, [toast]);

   useEffect(() => {
      if (hasMounted) {
          friendsCarouselPlugin.current = Autoplay({ delay: 4000, stopOnInteraction: true, stopOnMouseEnter: true });
          peopleNearYouPlugin.current = Autoplay({ delay: 3000, stopOnInteraction: true, stopOnMouseEnter: true });
      }
      return () => {
        if (friendsCarouselPlugin.current) {
            friendsCarouselPlugin.current.destroy();
            friendsCarouselPlugin.current = null;
        }
        if (peopleNearYouPlugin.current) {
            peopleNearYouPlugin.current.destroy();
            peopleNearYouPlugin.current = null;
        }
      }
   }, [hasMounted]);

   useEffect(() => {
     const scrollFeed = () => {
       if (feedScrollRef.current) {
         const { scrollTop, scrollHeight, clientHeight } = feedScrollRef.current;
         if (scrollTop + clientHeight >= scrollHeight - 5 || scrollTop === 0) {
            if (feedScrollIntervalRef.current) clearInterval(feedScrollIntervalRef.current);
            setTimeout(() => {
               if (feedScrollRef.current) feedScrollRef.current.scrollTop = 0;
                if (isFeedScrolling && hasMounted) {
                    feedScrollIntervalRef.current = setInterval(scrollFeed, 50);
                }
            }, 1500);
         } else {
           feedScrollRef.current.scrollTop += 1;
         }
       }
     };

     if (isFeedScrolling && hasMounted) {
       if (feedScrollIntervalRef.current) clearInterval(feedScrollIntervalRef.current);
       feedScrollIntervalRef.current = setInterval(scrollFeed, 50);
     } else {
       if (feedScrollIntervalRef.current) {
         clearInterval(feedScrollIntervalRef.current);
         feedScrollIntervalRef.current = null;
       }
     }
     return () => {
       if (feedScrollIntervalRef.current) {
         clearInterval(feedScrollIntervalRef.current);
         feedScrollIntervalRef.current = null;
       }
     };
   }, [isFeedScrolling, hasMounted]);

  const handleAddCheckpointClick = () => {
    if (!isSignedIn) {
      toast({ title: "Login Required", description: "Please sign in to add a ubq.", variant: "destructive" });
      return;
    }
    const locationToUse = currentLocation ?? DEFAULT_LOCATION;
    setLocationForForm(locationToUse);
    setSelectedMapLocation(null);
    setIsCheckpointFormOpen(true);
  };

    const handleNearbyPeopleClick = () => {
        toast({
            title: "Nearby People",
            description: "Feature coming soon! This will show a map of users near your location.",
            variant: "cyan",
        });
    };

    const handleNotificationsClick = () => {
        if (!isSignedIn) {
          toast({ title: "Login Required", description: "Please sign in to view notifications.", variant: "destructive" });
          return;
        }
        if (hasNotifications) {
             mockNotifications.slice(0, 3).forEach((notif, index) => {
                const commenter = getUserById(notif.userId);
                 toast({
                     title: (
                         <div className="flex items-center gap-2">
                             <Avatar className="h-6 w-6">
                                 <AvatarImage src={commenter?.avatarUrl} alt={commenter?.name} />
                                 <AvatarFallback>{commenter?.name?.charAt(0)?.toUpperCase()}</AvatarFallback>
                             </Avatar>
                             <span className="font-semibold">{commenter?.name}</span>
                             <span>{notif.type === 'confirm' ? 'confirmed' : 'commented on'} your ubq</span>
                         </div>
                     ),
                     description: (
                        <Link href={`/ubq/${notif.itemId}`} className="text-sm text-muted-foreground hover:underline">
                             {notif.text.split(':').slice(-1).join(':').trim()}
                        </Link>
                     ),
                     duration: 5000 + index * 500,
                     variant: "default",
                     action: (
                         <Link href={`/ubq/${notif.itemId}`} passHref>
                            <Button variant="outline" size="sm">View</Button>
                         </Link>
                    ),
                 });
             });
            setHasNotifications(false);
        } else {
            toast({
                title: "Notifications",
                description: "No new notifications.",
                variant: "cyan"
            });
        }
    };

  const handleAddCheckpointSubmit = (newCheckpointData: Omit<Checkpoint, 'id' | 'createdAt' | 'userId' | 'lat' | 'lng' | 'goThereClicks' | 'type' | 'friendsPresent' | 'confirmations' | 'comments'>) => {
    if (!isSignedIn || !clerkUser) {
      toast({ title: "Login Required", description: "Cannot save checkpoint without being logged in.", variant: "destructive" });
      return;
    }
    if (!locationForForm) {
         toast({ title: "Location Missing", description: "Cannot save checkpoint without a location.", variant: "destructive" });
        return;
    };

    const newCheckpoint: Checkpoint = {
      id: String(Date.now()),
      type: 'checkpoint',
      ...newCheckpointData,
      lat: locationForForm[0],
      lng: locationForForm[1],
      createdAt: new Date().toISOString(),
      userId: clerkUser.id, // Use Clerk user ID
      goThereClicks: 0,
      confirmations: 0,
      comments: [],
    };
    if (isCurrentOrFuture(newCheckpoint)) {
        setAllItems((prev) => [newCheckpoint, ...shuffleArray([...prev])]);
    } else {
        console.log("New checkpoint is in the past and won't be added to the current feed:", newCheckpoint);
    }
    setIsCheckpointFormOpen(false);
    setLocationForForm(null);
    setSelectedMapLocation(null);
    toast({
      title: newCheckpoint.mediaType === 'live' ? 'Stream Started!' : 'ubq Added!',
      description: `"${newCheckpoint.title}" has been successfully shared.`,
    });
  };

  const handleAddMusicUbqClick = () => {
      if (!isSignedIn) {
        toast({ title: "Login Required", description: "Please sign in to add a music ubq.", variant: "destructive" });
        return;
      }
      toast({
          title: "Add Music Ubq",
          description: "Feature coming soon! This will allow you to share music links.",
          variant: "cyan",
      });
  };

  const handleSaveUserLists = (updatedLists: Record<string, string[]>) => {
      if (!isSignedIn) {
        toast({ title: "Login Required", description: "Please sign in to save lists.", variant: "destructive" });
        return;
      }
      setUserListsState(updatedLists);
      setIsUserListManagerOpen(false);
      toast({
          title: "Lists Updated",
          description: "Your sharing lists have been saved.",
      });
  };

    const handleCancelCheckpointForm = () => {
        setIsCheckpointFormOpen(false);
        setLocationForForm(null);
        setSelectedMapLocation(null);
    };

   const incrementGoThereClick = (itemId: string, itemType: FeedItem['type']) => {
       if (itemType === 'checkpoint' || itemType === 'trending_place') {
           setAllItems(prevItems =>
               prevItems.map(item =>
                   (item.type === 'checkpoint' || item.type === 'trending_place') && item.id === itemId
                       ? { ...item, goThereClicks: (item.goThereClicks || 0) + 1 }
                       : item
               )
           );
       }
   };

   const handleConfirmClick = (itemId: string, itemType: FeedItem['type']) => {
        if (!isSignedIn) {
          toast({ title: "Login Required", description: "Please sign in to confirm items.", variant: "destructive" });
          return;
        }
        if (confirmedItems.has(itemId)) {
             toast({ title: "Already Confirmed", description: "You've already confirmed this.", variant: "cyan" });
            return;
        }
        setAllItems(prevItems =>
            prevItems.map(item => {
                const currentConfirmations = item.confirmations ?? 0;
                return item.id === itemId ? { ...item, confirmations: currentConfirmations + 1 } : item;
            })
        );
        setConfirmedItems(prev => new Set(prev).add(itemId));
        toast({ title: "Confirmed!", description: `You confirmed this ${itemType.replace('_', ' ')}.` });
   };

   const handleAddComment = (itemId: string, text: string) => {
       if (!isSignedIn || !clerkUser) {
         toast({ title: "Login Required", description: "Please sign in to add comments.", variant: "destructive" });
         return;
       }
       const newComment: Comment = {
           id: `c${Date.now()}`,
           userId: clerkUser.id, // Use Clerk user ID
           text: text,
           createdAt: new Date().toISOString(),
       };
       setAllItems(prevItems =>
           prevItems.map(item =>
               item.id === itemId
                   ? { ...item, comments: [...(item.comments || []), newComment] }
                   : item
           )
       );
       toast({ title: "Comment Added", description: "Your comment has been posted." });
   };

    const handleViewEvent = (event: TrendingEvent) => {
        console.log("View event:", event.title);
        toast({ title: `Viewing Event: ${event.title}`});
    };

    const handleAdClick = (ad: Advertisement) => {
        console.log("Ad clicked:", ad.title);
        toast({ title: `Opening Ad: ${ad.advertiser}` });
    };

     const handleGoThereGeneric = (itemId: string, itemType: FeedItem['type']) => {
        const item = allItems.find(item => item.id === itemId);
         if (item && (itemType === 'checkpoint' || itemType === 'trending_place') && 'lat' in item && 'lng' in item) {
            incrementGoThereClick(itemId, itemType);
             const url = `https://www.google.com/maps?q=${item.lat},${item.lng}`;
             window.open(url, '_blank');
         } else {
             console.warn(`Could not open map, location missing, invalid or not applicable to item type: ${itemType}`);
         }
     };

     const handleExternalLinkClick = (url: string) => {
        window.open(url, '_blank');
        toast({
            title: "Opening External Link",
            description: "Be cautious when opening links from unknown sources.",
            variant: "cyan",
            duration: 5000,
        });
    };

    const toggleFeedScroll = () => {
        setIsFeedScrolling(prev => !prev);
    };

    const handleSearch = (query: string) => {
        console.log("Search submitted:", query);
        toast({
            title: "Search Triggered",
            description: `You searched for: ${query}`,
        });
    };

   const toggleChat = () => {
     if (!isSignedIn) {
       toast({ title: "Login Required", description: "Please sign in to use the chat.", variant: "destructive" });
       return;
     }
     setIsChatOpen(prev => !prev);
   };

  const availableUserLists = useMemo(() => Object.keys(userListsState), [userListsState]);

   const mapCenter = useMemo(() => {
        return currentLocation ?? DEFAULT_LOCATION;
   }, [currentLocation]);

   const mapItems = useMemo(() => allItems.filter(item => 'lat' in item && 'lng' in item), [allItems]);

  const filteredItems = useMemo(() => {
    const currentFutureItems = hasMounted ? shuffleArray([...allItems]) : allItems;
    switch (activeTab) {
        case 'trending':
            return currentFutureItems
                    .filter((item): item is TrendingItem => item.type !== 'checkpoint' && item.type !== 'external_link' && item.type !== 'music');
        case 'live':
            return currentFutureItems.filter((item): item is Checkpoint => item.type === 'checkpoint' && item.mediaType === 'live');
        case 'photo':
            return currentFutureItems.filter((item): item is Checkpoint => item.type === 'checkpoint' && item.mediaType === 'image');
        case 'video':
            return currentFutureItems.filter((item): item is Checkpoint => item.type === 'checkpoint' && item.mediaType === 'video');
        case 'text':
            return currentFutureItems.filter((item): item is Checkpoint => item.type === 'checkpoint' && item.mediaType === 'text');
         case 'external':
            return currentFutureItems.filter((item): item is ExternalLinkItem => item.type === 'external_link');
         case 'music':
            return currentFutureItems.filter((item): item is MusicItem => item.type === 'music');
        case 'all':
        default:
            return currentFutureItems;
    }
  }, [allItems, activeTab, hasMounted]);

     const friendsCarouselItems = useMemo(() => {
        const baseItems = allItems.filter((item): item is Checkpoint =>
            item.type === 'checkpoint' &&
            friendIds.has(item.userId)
        );
         return hasMounted ? shuffleArray([...baseItems]) : baseItems;
     }, [allItems, friendIds, hasMounted]);

      const searchPlaceholder = useMemo(() => {
          if (currentLocation) {
              return `Ubq's nearby (${currentLocation[0].toFixed(4)}, ${currentLocation[1].toFixed(4)})`;
          }
          return `Ubq's nearby (longitude latitude)`;
      }, [currentLocation]);

       const MyProfileCard: FC<{ user: User; onAddUbq: () => void; onShareUbq: () => void; onAddMusic: () => void }> = ({ user, onAddUbq, onShareUbq, onAddMusic }) => (
           <Card className="relative overflow-hidden material-elevation-1 aspect-[9/16] flex flex-col text-white rounded-lg group h-full">
               <div className="absolute inset-0 z-0">
                   <Image
                       src={user.avatarUrl || `https://picsum.photos/seed/${user.id}/200/350`}
                       alt={`${user.name}'s profile`}
                       fill
                       style={{ objectFit: 'cover' }}
                       className="opacity-80 group-hover:opacity-60 transition-opacity duration-300"
                       data-ai-hint="profile picture user avatar vertical"
                       unoptimized={user.avatarUrl?.endsWith('.gif')}
                   />
               </div>
               <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent z-10" />
               <CardContent className="relative z-20 p-3 flex-grow flex flex-col justify-end">
                   <Link href={isClerkHookLoaded && isSignedIn ? "/user" : "/profile"} passHref className="block mb-auto hover:opacity-80 transition-opacity">
                       <div className="flex items-center gap-2">
                            {isClerkHookLoaded && isSignedIn ? (
                                <UserButton afterSignOutUrl="/" appearance={{ elements: { avatarBox: "h-7 w-7" } }} />
                            ) : (
                                <Avatar className="h-7 w-7 border-2 border-background">
                                    <AvatarImage src={user.avatarUrl} alt={user.name} />
                                    <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                                </Avatar>
                            )}
                           <span className="text-sm font-semibold text-shadow-sm bg-gradient-to-r from-yellow-400 via-magenta-500 to-cyan-400 text-transparent bg-clip-text">{user.name}</span>
                       </div>
                   </Link>
                   <div className="flex items-center justify-around mt-4">
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="ghost" size="icon" className="text-white/80 hover:text-white hover:bg-white/20 rounded-full" onClick={onAddUbq}>
                                        <PlusCircle className="w-5 h-5"/>
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent side="bottom"><p>New Ubq</p></TooltipContent>
                            </Tooltip>
                             <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="ghost" size="icon" className="text-white/80 hover:text-white hover:bg-white/20 rounded-full" onClick={onShareUbq}>
                                        <Send className="w-5 h-5"/>
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent side="bottom"><p>Send Ubq / Manage Lists</p></TooltipContent>
                            </Tooltip>
                             <Tooltip>
                                <TooltipTrigger asChild>
                                     <Button variant="ghost" size="icon" className="text-white/80 hover:text-white hover:bg-white/20 rounded-full" onClick={onAddMusic}>
                                        <Music className="w-5 h-5"/>
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent side="bottom"><p>New Music Ubq</p></TooltipContent>
                            </Tooltip>
                         </TooltipProvider>
                   </div>
               </CardContent>
                <style jsx>{`
                   .text-shadow-sm {
                       text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
                   }
               `}</style>
           </Card>
       );

     const handleGoThereClick = (itemId: string, itemType: FeedItem['type']) => {
        const item = allItems.find(item => item.id === itemId);
         if (item && (itemType === 'checkpoint' || itemType === 'trending_place') && 'lat' in item && 'lng' in item) {
            incrementGoThereClick(itemId, itemType);
             const url = `https://www.google.com/maps?q=${item.lat},${item.lng}`;
             window.open(url, '_blank');
         } else {
             console.warn(`Could not open map, location missing, invalid or not applicable to item type: ${itemType}`);
         }
     };

  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="app-header p-4 flex justify-between items-center border-b sticky top-0 z-30">
        <div className="flex items-center gap-1">
           <MapPin className="w-6 h-6 text-cyan-400" />
           <h1 className="text-xl font-semibold">
                <span className="text-yellow-400">u</span>
                <span className="text-magenta-400">b</span>
                <span className="text-gray-400">q</span>
           </h1>
        </div>
        <div className="flex-grow max-w-xs md:max-w-sm lg:max-w-md mx-4">
             <SearchInput onSearch={handleSearch} placeholder={searchPlaceholder} />
        </div>
        <div className="flex items-center gap-1">
            {isClerkJSLoadedAndConfigured && isClerkHookLoaded && isSignedIn ? (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="button-ghost text-white bg-cyan-500 hover:bg-cyan-600 relative"
                  onClick={toggleChat}
                  aria-label="Toggle Chat"
                  >
                  <MessageSquare className="w-5 h-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="button-ghost text-black bg-yellow-400 hover:bg-yellow-500 relative"
                  onClick={handleNotificationsClick}
                  aria-label="View Notifications"
                  >
                  <Bell className="w-5 h-5" />
                  {hasNotifications && (
                      <span className="absolute top-1.5 right-1.5 block h-2 w-2 rounded-full bg-destructive ring-1 ring-background" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="button-ghost text-white bg-magenta-400 hover:bg-magenta-500"
                  onClick={handleNearbyPeopleClick}
                  aria-label="Show nearby people map"
                  disabled={!hasMounted || !currentLocation}
                  >
                  <Users className="w-5 h-5" />
                </Button>
                <Dialog open={isUserListManagerOpen} onOpenChange={setIsUserListManagerOpen}>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="button-ghost text-black bg-gray-300 hover:bg-gray-400" aria-label="Manage Sharing Lists">
                        <Share2 className="w-5 h-5" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Manage Sharing Lists</DialogTitle>
                    </DialogHeader>
                    <UserListManager
                        users={users.filter(u => friendIds.has(u.id))}
                        initialLists={userListsState}
                        onSave={handleSaveUserLists}
                    />
                  </DialogContent>
                </Dialog>
                <UserButton afterSignOutUrl="/"/>
              </>
            ) : isClerkJSLoadedAndConfigured && isClerkHookLoaded ? (
              <>
                <SignUpButton mode="modal">
                  <Button variant="ghost" className="text-sm">
                    <UserPlus className="mr-2 h-4 w-4" /> Sign Up
                  </Button>
                </SignUpButton>
                <SignInButton mode="modal">
                  <Button variant="outline" className="text-sm">
                    <LogIn className="mr-2 h-4 w-4" /> Sign In
                  </Button>
                </SignInButton>
              </>
            ) : (
              <Skeleton className="h-10 w-32" /> // Placeholder while Clerk loads
            )}
           <ThemeToggle />
        </div>
      </header>

      <div className="flex flex-grow overflow-hidden">

        <aside className="w-64 h-full bg-card border-r border-border p-4 hidden md:flex flex-col sticky top-[73px] self-start">
             <Link href={isClerkHookLoaded && isSignedIn ? "/user" : "/profile"} className="flex items-center gap-3 mb-4 p-2 rounded-md hover:bg-secondary transition-colors">
                {isClerkJSLoadedAndConfigured && isClerkHookLoaded && isSignedIn && clerkUser ? (
                  <UserButton appearance={{ elements: { avatarBox: "h-8 w-8" } }} />
                ) : isClerkJSLoadedAndConfigured && isClerkHookLoaded ? (
                  <Avatar className="h-8 w-8">
                       <AvatarImage src={currentUserForProfileCard.avatarUrl} alt={currentUserForProfileCard.name} />
                       <AvatarFallback>{currentUserForProfileCard.name.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                ) : (
                  <Skeleton className="h-8 w-8 rounded-full"/>
                )}
                <span className="font-semibold text-foreground">
                  {isClerkJSLoadedAndConfigured && isClerkHookLoaded ? currentUserForProfileCard.name : <Skeleton className="h-5 w-20" />}
                </span>
             </Link>
            <Separator className="my-2"/>
             <h3 className="text-sm font-semibold text-muted-foreground mb-2 px-2">Local (5 kms):</h3>
             <nav className="flex flex-col gap-1">
                {localServiceLinks.map(link => (
                     <Button key={link.name} variant="ghost" className="justify-start text-muted-foreground hover:text-foreground" asChild>
                         <Link href={link.href}>
                             <link.icon className="w-4 h-4 mr-2" />
                            {link.name}
                         </Link>
                     </Button>
                 ))}
            </nav>
            <div className="mt-auto pt-4 text-xs text-muted-foreground">
                &copy; {new Date().getFullYear()} ubq
            </div>
        </aside>

        <main className="flex-grow flex flex-col md:flex-row overflow-hidden">
          <div className="w-full md:w-[61.8%] h-full md:h-full relative bg-background flex flex-col p-2 md:p-4 overflow-auto">

                <div className="mb-2 md:mb-4 flex-shrink-0">
                   <div className="flex items-stretch gap-2">
                        <div className="basis-[40%] sm:basis-[35%] md:basis-1/3 lg:basis-1/4 xl:basis-1/5 flex-shrink-0">
                           {isClerkJSLoadedAndConfigured && isClerkHookLoaded ? (
                            <MyProfileCard
                                user={currentUserForProfileCard}
                                onAddUbq={handleAddCheckpointClick}
                                onShareUbq={() => setIsUserListManagerOpen(true)}
                                onAddMusic={handleAddMusicUbqClick}
                            />
                           ) : (
                             <Card className="overflow-hidden material-elevation-1 aspect-[9/16] flex flex-col rounded-lg h-full">
                                <Skeleton className="relative w-full h-full">
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                                    <div className="absolute bottom-0 left-0 right-0 p-3">
                                        <Skeleton className="h-7 w-7 rounded-full mb-auto" />
                                        <div className="flex items-center justify-around mt-4">
                                            <Skeleton className="h-8 w-8 rounded-full" />
                                            <Skeleton className="h-8 w-8 rounded-full" />
                                            <Skeleton className="h-8 w-8 rounded-full" />
                                        </div>
                                    </div>
                                 </Skeleton>
                            </Card>
                           )}
                        </div>
                       <div className="flex-grow overflow-hidden">
                           <Carousel
                               opts={{ align: "start", loop: true }}
                               plugins={friendsCarouselPlugin.current ? [friendsCarouselPlugin.current] : []}
                               className="w-full h-full" // Ensure carousel fills the container
                               onMouseEnter={() => friendsCarouselPlugin.current?.stop()}
                               onMouseLeave={() => friendsCarouselPlugin.current?.play()}
                           >
                               <CarouselContent className="-ml-2 h-full"> {/* Ensure content takes full height */}
                                   {hasMounted && friendsCarouselItems.length > 0 ? friendsCarouselItems.map((item) => (
                                       <CarouselItem key={item.id} className="basis-[80%] sm:basis-[65%] md:basis-[40%] lg:basis-1/3 xl:basis-1/4 pl-2 h-full"> {/* Adjust basis for vertical */}
                                           <CarouselItemCard item={item} hasMounted={hasMounted}/>
                                       </CarouselItem>
                                   )) : !hasMounted ? [...Array(5)].map((_, i) => (
                                        <CarouselItem key={`fs_skel-${i}`} className="basis-[80%] sm:basis-[65%] md:basis-[40%] lg:basis-1/3 xl:basis-1/4 pl-2 h-full">
                                           <Card className="overflow-hidden material-elevation-1 aspect-[9/16] flex flex-col rounded-lg h-full">
                                               <Skeleton className="relative w-full h-full">
                                                   <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                                                   <div className="absolute bottom-0 left-0 right-0 p-3">
                                                       <Skeleton className="h-4 w-3/4 mb-2" />
                                                       <div className="flex items-center justify-between pt-1">
                                                           <Skeleton className="h-4 w-16" />
                                                           <Skeleton className="h-6 w-12" />
                                                       </div>
                                                   </div>
                                                </Skeleton>
                                           </Card>
                                        </CarouselItem>
                                   )) : (
                                        <CarouselItem className="basis-full pl-2 h-full">
                                           <Card className="overflow-hidden material-elevation-1 aspect-[9/16] flex flex-col items-center justify-center text-center p-4 bg-secondary/50 rounded-lg h-full">
                                               <CardContent className="p-0">
                                                    <Heart className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                                                   <p className="text-sm text-muted-foreground">No recent ubqs from your friends.</p>
                                               </CardContent>
                                           </Card>
                                        </CarouselItem>
                                   )}
                               </CarouselContent>
                           </Carousel>
                       </div>
                   </div>
               </div>

               <div className="flex-grow rounded-lg overflow-hidden border mb-2 md:mb-4 bg-secondary/50 min-h-[200px] md:min-h-[300px]">
                   <MapComponent center={mapCenter} checkpoints={mapItems} />
               </div>

                <Button
                    asChild
                    className="w-full py-2 text-base font-semibold material-elevation-1 hover:material-elevation-2 bg-gray-800 text-white relative overflow-hidden p-[2px] mb-2 md:mb-4 rounded-lg h-10" // Adjusted height
                >
                    <Link href="/explore" className="relative z-10 flex items-center justify-center w-full h-full bg-gray-800 rounded-[inherit] p-0">
                         <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-green-500 p-[2px] rounded-[inherit]" style={{ WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)', WebkitMaskComposite: 'xor', maskComposite: 'exclude' }}></div>
                         <span className="relative flex items-center">
                             <Compass className="w-5 h-5 mr-2" />
                             See all the ubq's at 5km radius
                         </span>
                    </Link>
                </Button>

                <div className="mb-2 text-sm text-muted-foreground flex items-center gap-1.5">
                    <MapPin className="w-4 h-4" />
                    <span>Near my location:</span>
                    {hasMounted && currentLocation ? (
                        <span className="font-mono">{currentLocation[0].toFixed(4)}, {currentLocation[1].toFixed(4)}</span>
                    ) : (
                        <Skeleton className="h-4 w-24 inline-block" />
                    )}
                </div>

               <div className="mb-2 md:mb-4 flex-shrink-0">
                  <h3 className="text-sm font-semibold text-muted-foreground mb-2">People Near You</h3>
                  <Carousel
                      opts={{
                          align: "start",
                          loop: false,
                      }}
                      plugins={peopleNearYouPlugin.current ? [peopleNearYouPlugin.current] : []}
                      className="w-full"
                      onMouseEnter={() => peopleNearYouPlugin.current?.stop()}
                      onMouseLeave={() => peopleNearYouPlugin.current?.play()}
                  >
                      <CarouselContent className="-ml-2">
                          {hasMounted && peopleNearYou.length > 0 ? peopleNearYou.map((user) => (
                              <CarouselItem key={user.id} className="basis-auto pl-2">
                                 <TooltipProvider delayDuration={100}>
                                      <Tooltip>
                                          <TooltipTrigger asChild>
                                              <Link href={`/profile/${user.id}`} aria-label={`View ${user.name}'s profile`}>
                                                   <div className="relative">
                                                      <Avatar className="h-12 w-12 border-2 border-background hover:ring-2 hover:ring-primary transition-all cursor-pointer">
                                                          <AvatarImage src={user.avatarUrl} alt={user.name} />
                                                          <AvatarFallback>{user.name?.charAt(0)?.toUpperCase() || '?'}</AvatarFallback>
                                                      </Avatar>
                                                      <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-green-500 ring-2 ring-background" />
                                                    </div>
                                              </Link>
                                          </TooltipTrigger>
                                          <TooltipContent side="bottom">
                                              <p>{user.name}</p>
                                          </TooltipContent>
                                      </Tooltip>
                                  </TooltipProvider>
                              </CarouselItem>
                          )) : !hasMounted ? [...Array(8)].map((_, i) => (
                              <CarouselItem key={`pny_skel-${i}`} className="basis-auto pl-2">
                                   <div className="relative">
                                      <Skeleton className="h-12 w-12 rounded-full" />
                                      <Skeleton className="absolute bottom-0 right-0 h-3 w-3 rounded-full ring-2 ring-background" />
                                   </div>
                              </CarouselItem>
                          )) : (
                              <CarouselItem className="basis-full pl-2">
                                  <Card className="overflow-hidden material-elevation-1 h-12 flex items-center justify-center text-center p-2 bg-secondary/50 rounded-lg">
                                      <CardContent className="p-0">
                                          <p className="text-xs text-muted-foreground">No other users nearby currently.</p>
                                      </CardContent>
                                  </Card>
                              </CarouselItem>
                          )}
                      </CarouselContent>
                  </Carousel>
              </div>
          </div>

          <div className="w-full md:w-[38.2%] h-full bg-card border-l border-border overflow-hidden flex flex-col">
               <TooltipProvider>
                   <Tabs defaultValue="all" onValueChange={(value) => setActiveTab(value as any)} className="w-full flex-shrink-0">
                       <TabsList className="grid w-full grid-cols-8 rounded-none border-b">
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <TabsTrigger value="all"><LayoutGrid className="w-4 h-4" /></TabsTrigger>
                                </TooltipTrigger>
                                <TooltipContent><p>All</p></TooltipContent>
                            </Tooltip>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                     <TabsTrigger value="trending" className="text-primary data-[state=active]:border-primary">
                                        <TrendingUp className="w-4 h-4" />
                                     </TabsTrigger>
                                </TooltipTrigger>
                                <TooltipContent><p>Trending</p></TooltipContent>
                            </Tooltip>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                     <TabsTrigger value="live" className="text-destructive data-[state=active]:border-destructive">
                                        <Radio className="w-4 h-4" />
                                     </TabsTrigger>
                                </TooltipTrigger>
                                <TooltipContent><p>Live</p></TooltipContent>
                            </Tooltip>
                             <Tooltip>
                                <TooltipTrigger asChild>
                                    <TabsTrigger value="photo"><ImageIcon className="w-4 h-4" /></TabsTrigger>
                                </TooltipTrigger>
                                <TooltipContent><p>Photos</p></TooltipContent>
                            </Tooltip>
                             <Tooltip>
                                <TooltipTrigger asChild>
                                    <TabsTrigger value="video"><Video className="w-4 h-4" /></TabsTrigger>
                                </TooltipTrigger>
                                <TooltipContent><p>Videos</p></TooltipContent>
                            </Tooltip>
                             <Tooltip>
                                <TooltipTrigger asChild>
                                    <TabsTrigger value="text"><Type className="w-4 h-4" /></TabsTrigger>
                                </TooltipTrigger>
                                <TooltipContent><p>Text</p></TooltipContent>
                            </Tooltip>
                             <Tooltip>
                                <TooltipTrigger asChild>
                                    <TabsTrigger value="external"><LinkIcon className="w-4 h-4" /></TabsTrigger>
                                </TooltipTrigger>
                                <TooltipContent><p>Links</p></TooltipContent>
                            </Tooltip>
                             <Tooltip>
                                <TooltipTrigger asChild>
                                    <TabsTrigger value="music"><Music className="w-4 h-4" /></TabsTrigger>
                                </TooltipTrigger>
                                <TooltipContent><p>Music</p></TooltipContent>
                            </Tooltip>
                      </TabsList>
                  </Tabs>
              </TooltipProvider>
              <div className="p-4 border-b flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-foreground">
                      {activeTab === 'all' && 'Recent ubq\'s'}
                      {activeTab === 'trending' && 'Trending Now'}
                      {activeTab === 'live' && 'Live Now'}
                      {activeTab === 'photo' && 'Recent Photos'}
                      {activeTab === 'video' && 'Recent Videos'}
                      {activeTab === 'text' && 'Recent Text ubq\'s'}
                      {activeTab === 'external' && 'Recent Links'}
                      {activeTab === 'music' && 'Recent Music'}
                  </h2>
                   <Button variant="ghost" size="icon" onClick={toggleFeedScroll} className="text-muted-foreground hover:text-foreground">
                      {isFeedScrolling ? <PauseCircle className="w-5 h-5" /> : <PlayCircle className="w-5 h-5" />}
                      <span className="sr-only">{isFeedScrolling ? 'Pause Autoscroll' : 'Resume Autoscroll'}</span>
                   </Button>
              </div>
             <ScrollArea className="flex-grow" viewportRef={feedScrollRef}>
                 <div className="space-y-4 p-4">
                    {!hasMounted ? (
                         [...Array(10)].map((_, i) => {
                             if (activeTab === 'trending') return <TrendingItemSkeletonCard key={`trend_skel_${i}`} />;
                             if (activeTab === 'external') return <ExternalLinkSkeletonCard key={`ext_skel_${i}`} />;
                             if (activeTab === 'music') return <MusicSkeletonCard key={`music_skel_${i}`} />;
                             return <CheckpointSkeletonCard key={`cp_skel_${i}`} />;
                         })
                     ) : filteredItems.length > 0 ? (
                         filteredItems.map((item) => {
                             const author = (item.type === 'checkpoint' || item.type === 'trending_place' || item.type === 'future_checkpoint' || item.type === 'music')
                                             ? getUserById(item.userId || '')
                                             : undefined;

                             if (item.type === 'checkpoint') {
                                 return (
                                     <CheckpointCard
                                         key={item.id}
                                         checkpoint={item}
                                         author={author}
                                         hasMounted={hasMounted}
                                         onGoThereClick={(itemId) => handleGoThereClick(itemId, 'checkpoint')}
                                         onConfirmClick={(itemId) => handleConfirmClick(itemId, 'checkpoint')}
                                         onAddComment={handleAddComment}
                                         allUsers={users}
                                     />
                                 );
                             } else if (item.type === 'external_link') {
                                  return (
                                      <ExternalLinkCard
                                          key={item.id}
                                          item={item}
                                          hasMounted={hasMounted}
                                          onOpenLink={handleExternalLinkClick}
                                      />
                                  );
                             } else if (item.type === 'music') {
                                  return (
                                      <MusicCard
                                          key={item.id}
                                          item={item}
                                          author={author}
                                          hasMounted={hasMounted}
                                      />
                                  );
                              } else {
                                 return (
                                     <TrendingItemCard
                                         key={item.id}
                                         item={item}
                                         author={author}
                                         hasMounted={hasMounted}
                                         onGoThereClick={'lat' in item && 'lng' in item ? () => handleGoThereClick(item.id, item.type) : undefined}
                                         onViewEventClick={item.type === 'event' ? handleViewEvent : undefined}
                                         onAdClick={item.type === 'advertisement' ? handleAdClick : undefined}
                                         onConfirmClick={(itemId) => handleConfirmClick(itemId, item.type)}
                                         onAddComment={handleAddComment}
                                         allUsers={users}
                                     />
                                 );
                             }
                         })
                    ) : (
                         <p className="text-muted-foreground text-center py-6 px-4">
                             No {activeTab !== 'all' ? `${activeTab} ` : ''}items found for now or the future.
                         </p>
                    )}
                 </div>
            </ScrollArea>
          </div>
        </main>
      </div>

      <Dialog open={isCheckpointFormOpen} onOpenChange={handleCancelCheckpointForm}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create New ubq</DialogTitle>
             {locationForForm && (
                <DialogDescription>
                    At location: {locationForForm[0].toFixed(4)}, {locationForForm[1].toFixed(4)}
                </DialogDescription>
            )}
          </DialogHeader>
          {locationForForm ? (
            <CheckpointForm
              onSubmit={handleAddCheckpointSubmit}
              onCancel={handleCancelCheckpointForm}
              userLists={availableUserLists}
            />
          ) : (
             <div className="p-6 text-center text-muted-foreground">
                <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                Acquiring location coordinates...
            </div>
          )}
        </DialogContent>
      </Dialog>

       <ChatWindow
          isOpen={isChatOpen}
          onClose={toggleChat}
          messages={mockChatMessages}
          users={mockUsers}
       />
    </div>
  );
};

export default Home;

