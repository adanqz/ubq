
'use client';

import type { FC } from 'react';
import { useState, useEffect, useMemo } from 'react'; // Added useState, useEffect, useMemo
import Link from 'next/link';
import { format, parseISO } from 'date-fns'; // Added date-fns imports
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Settings, Edit, Camera, CheckCircle, Lock, Calendar, Music } from 'lucide-react';
import { mockUsers, mockTrendingItems, mockMusicItems, isCurrentOrFuture } from '@/app/mockData'; // Import mock data, added mockMusicItems, isCurrentOrFuture
import type { User, FutureCheckpoint, MusicItem } from '@/types'; // Added MusicItem
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'; // Import Tabs components
import { ScrollArea } from '@/components/ui/scroll-area'; // Import ScrollArea
import CountdownTimer from '@/components/countdown-timer'; // Import CountdownTimer
import MusicCard from '@/components/music-card'; // Import MusicCard
import { useToast } from '@/hooks/use-toast'; // Import useToast


// Mock current user data for demonstration - Assuming this is the logged-in user
const currentUser = mockUsers.find(u => u.id === 'user4')!; // Using Alex as the current user

const ProfilePage: FC = () => {
   const [hasMounted, setHasMounted] = useState(false);
   const { toast } = useToast(); // Initialize toast

   useEffect(() => {
        setHasMounted(true);
    }, []);

    // Filter future checkpoints for the current user
    const userFutureCheckpoints = useMemo(() => {
        return mockTrendingItems.filter(
            (item): item is FutureCheckpoint => item.type === 'future_checkpoint' && item.userId === currentUser.id
        ).sort((a, b) => parseISO(a.scheduledAt).getTime() - parseISO(b.scheduledAt).getTime()); // Sort by soonest first
    }, []);

    // Filter for public confirmed checkpoints
    const confirmedPublicFutureCheckpoints = useMemo(() => {
        return userFutureCheckpoints.filter(cp => (cp.confirmations ?? 0) > 0);
    }, [userFutureCheckpoints]);

    // Filter for "private" checkpoints
    const privateFutureCheckpoints = useMemo(() => {
         return userFutureCheckpoints.filter(cp => (cp.confirmations ?? 0) === 0);
    }, [userFutureCheckpoints]);

    // Find the latest music item for the current user
    const latestMusicItem = useMemo(() => {
        if (!hasMounted) return null;
        return mockMusicItems
            .filter(item => item.userId === currentUser.id && isCurrentOrFuture(item)) // Filter for user and current/future
            .sort((a, b) => parseISO(b.createdAt).getTime() - parseISO(a.createdAt).getTime()) // Sort newest first
            [0] ?? null; // Get the latest one or null
    }, [hasMounted]);


    // Removed handleMusicClick


  return (
        <div className="flex flex-col md:flex-row min-h-screen bg-background profile-page-wrapper"> {/* Added wrapper class */}
             {/* Inject Custom CSS */}
             {currentUser.customCss && (
                 <style dangerouslySetInnerHTML={{ __html: currentUser.customCss }} />
             )}
            {/* Main Content Area */}
            <div className="flex-grow flex flex-col w-full"> {/* Ensure main content takes full width */}
                {/* Header */}
                <header className="app-header p-4 flex justify-between items-center border-b sticky top-0 bg-background z-10">
                    <Button variant="ghost" size="icon" asChild>
                    <Link href="/" aria-label="Back to Home">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    </Button>
                    <h1 className="text-xl font-semibold text-foreground">Profile</h1>
                    <Button variant="ghost" size="icon" aria-label="Settings">
                    <Settings className="w-5 h-5" />
                    </Button>
                </header>

                {/* Profile Content */}
                <main className="flex-grow p-4 md:p-6 lg:p-8">
                    <Card className="profile-card mx-auto material-elevation-1 overflow-hidden w-full"> {/* Added profile-card class, w-full */}
                    <CardHeader className="p-6 bg-secondary/30"> {/* Targetable: .profile-card .card-header */}
                        <div className="flex flex-col items-center sm:flex-row sm:items-start gap-4">
                        <div className="relative">
                            <Avatar className="h-24 w-24 border-4 border-background ring-1 ring-border avatar"> {/* Targetable: .profile-card .avatar */}
                            <AvatarImage src={currentUser.avatarUrl} alt={currentUser.name} />
                            <AvatarFallback className="text-3xl">{currentUser.name?.charAt(0)?.toUpperCase() || 'U'}</AvatarFallback>
                            </Avatar>
                            <Button
                                variant="outline"
                                size="icon"
                                className="absolute bottom-0 right-0 rounded-full h-8 w-8 border bg-background hover:bg-secondary"
                                aria-label="Change profile picture"
                            >
                                <Camera className="w-4 h-4"/>
                            </Button>
                        </div>
                        <div className="flex-grow text-center sm:text-left pt-2">
                            <CardTitle className="text-2xl font-bold mb-2 card-title">{currentUser.name}</CardTitle> {/* Targetable: .profile-card .card-title */}
                            <CardDescription className="text-muted-foreground card-description"> {/* Targetable: .profile-card .card-description */}
                                Exploring the world, one ubq at a time. Sharing my journey and discoveries.
                            </CardDescription>
                            <Button variant="outline" size="sm" className="mt-3">
                            <Edit className="w-4 h-4 mr-2" /> Edit Profile
                            </Button>
                        </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0 card-content"> {/* Targetable: .profile-card .card-content */}
                        {/* Stats Section */}
                        <div className="flex justify-around items-center p-4 border-b stats-section"> {/* Targetable: .profile-card .stats-section */}
                        <div className="text-center">
                            <p className="text-xl font-bold">{Math.floor(Math.random() * 100) + 1}</p> {/* Mock stats */}
                            <p className="text-sm text-muted-foreground">ubqs</p>
                        </div>
                        <Separator orientation="vertical" className="h-8" />
                        <div className="text-center">
                            <p className="text-xl font-bold">{Math.floor(Math.random() * 5000) + 100}</p>
                            <p className="text-sm text-muted-foreground">Followers</p>
                        </div>
                        <Separator orientation="vertical" className="h-8" />
                        <div className="text-center">
                            <p className="text-xl font-bold">{Math.floor(Math.random() * 1000) + 50}</p>
                            <p className="text-sm text-muted-foreground">Following</p>
                        </div>
                        </div>

                        {/* Latest Music Item - Positioned after stats */}
                         {latestMusicItem && (
                            <div className="p-4 border-b latest-music-section"> {/* Targetable: .profile-card .latest-music-section */}
                                <MusicCard
                                    item={latestMusicItem}
                                    author={currentUser} // The current user is the author
                                    hasMounted={hasMounted}
                                    // Removed onPlayClick prop
                                />
                            </div>
                        )}


                        {/* User's Posts / Future Ubqs Tabs */}
                         <div className="p-4 posts-section"> {/* Targetable: .profile-card .posts-section */}
                             <Tabs defaultValue="past_ubqs" className="w-full"> {/* Changed default to past_ubqs */}
                                 <TabsList className="grid w-full grid-cols-2 rounded-md border mb-4">
                                     {/* Changed order of tabs */}
                                    <TabsTrigger value="past_ubqs" className="py-2">
                                         History
                                     </TabsTrigger>
                                    <TabsTrigger value="future_ubqs" className="py-2">
                                        <Calendar className="w-4 h-4 mr-2"/> Future ubqs
                                    </TabsTrigger>
                                </TabsList>

                                 {/* Past ubqs Content */}
                                 <TabsContent value="past_ubqs" className="m-0 p-4 border rounded-md min-h-[400px]">
                                     <p className="text-sm text-muted-foreground text-center py-6">Your recent ubqs will appear here.</p> {/* Changed placeholder text */}
                                     {/* Add logic to fetch and display past ubqs */}
                                      <div className="text-center mt-4">
                                         <Button asChild variant="link">
                                             <Link href="/past-ubqs">View Past ubqs</Link>
                                         </Button>
                                     </div>
                                 </TabsContent>

                                 {/* Future ubqs Content */}
                                 <TabsContent value="future_ubqs" className="m-0 p-0">
                                     <Tabs defaultValue="public" className="w-full">
                                         <TabsList className="grid w-full grid-cols-2 rounded-md border mb-4">
                                             <TabsTrigger value="public">
                                                <CheckCircle className="w-4 h-4 mr-2"/> Confirmed ({confirmedPublicFutureCheckpoints.length})
                                            </TabsTrigger>
                                            <TabsTrigger value="private">
                                                <Lock className="w-4 h-4 mr-2"/> Private ({privateFutureCheckpoints.length})
                                            </TabsTrigger>
                                         </TabsList>
                                         <ScrollArea className="h-[400px]">
                                             <TabsContent value="public" className="p-1 space-y-3 m-0">
                                                {confirmedPublicFutureCheckpoints.length > 0 ? (
                                                    confirmedPublicFutureCheckpoints.map(cp => (
                                                        <Link key={cp.id} href={`/ubq/${cp.id}`} className="block hover:bg-secondary/50 p-3 rounded-md border transition-colors">
                                                            <p className="font-medium text-sm mb-1">{cp.title}</p>
                                                            <div className="flex items-center text-xs text-muted-foreground gap-2">
                                                                <Calendar className="w-3 h-3" />
                                                                {hasMounted ? <CountdownTimer targetDate={cp.scheduledAt} hasMounted={hasMounted}/> : 'Loading...'}
                                                                {cp.estimatedDuration && <span>· {cp.estimatedDuration}</span>}
                                                            </div>
                                                        </Link>
                                                    ))
                                                ) : (
                                                    <p className="text-sm text-muted-foreground text-center py-6">No upcoming public ubqs confirmed.</p>
                                                )}
                                            </TabsContent>
                                            <TabsContent value="private" className="p-1 space-y-3 m-0">
                                                {privateFutureCheckpoints.length > 0 ? (
                                                     privateFutureCheckpoints.map(cp => (
                                                        <Link key={cp.id} href={`/ubq/${cp.id}`} className="block hover:bg-secondary/50 p-3 rounded-md border transition-colors">
                                                            <p className="font-medium text-sm mb-1">{cp.title}</p>
                                                             <div className="flex items-center text-xs text-muted-foreground gap-2">
                                                                <Calendar className="w-3 h-3" />
                                                                 {hasMounted ? <CountdownTimer targetDate={cp.scheduledAt} hasMounted={hasMounted}/> : 'Loading...'}
                                                                {cp.estimatedDuration && <span>· {cp.estimatedDuration}</span>}
                                                            </div>
                                                        </Link>
                                                    ))
                                                ) : (
                                                     <p className="text-sm text-muted-foreground text-center py-6">No upcoming private ubqs.</p>
                                                )}
                                            </TabsContent>
                                         </ScrollArea>
                                     </Tabs>
                                 </TabsContent>
                             </Tabs>
                         </div>
                    </CardContent>
                    </Card>
                </main>
            </div>
            {/* Sidebar Removed */}
        </div>
  );
};

export default ProfilePage;
