
'use client';

import type { FC } from 'react';
import { useState, useEffect, useMemo } from 'react'; // Added useMemo
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { format, parseISO } from 'date-fns'; // Added date-fns imports
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Settings, Edit, Camera, Loader2, User as UserIcon, Save, CheckCircle, Lock, Calendar, Music } from 'lucide-react';
import type { User, FutureCheckpoint, MusicItem } from '@/types'; // Added MusicItem
import { mockUsers, mockTrendingItems, mockMusicItems, isCurrentOrFuture } from '@/app/mockData'; // Import mockTrendingItems, mockMusicItems, isCurrentOrFuture
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'; // Import Tabs components
import { ScrollArea } from '@/components/ui/scroll-area'; // Import ScrollArea
import CountdownTimer from '@/components/countdown-timer'; // Import CountdownTimer
import MusicCard from '@/components/music-card'; // Import MusicCard


// Mock function to get user by ID
const getUserById = (userId: string): User | undefined => {
  // Find user in mock data
  const foundUser = mockUsers.find(user => user.id === userId);
  if (foundUser) {
      // Simulate fetching potential updates or saved state if needed
      // For demo, just return the found user
      return { ...foundUser };
  }
  return undefined;
}

// Mock function to update user data (replace with actual API call)
const updateUser = async (userId: string, updates: Partial<User>): Promise<User | undefined> => {
    console.log(`Updating user ${userId}:`, updates);
    const userIndex = mockUsers.findIndex(u => u.id === userId);
    if (userIndex !== -1) {
        mockUsers[userIndex] = { ...mockUsers[userIndex], ...updates };
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
        return mockUsers[userIndex];
    }
    return undefined;
}

// Mock current user ID (replace with actual auth logic)
const CURRENT_USER_ID = 'user4';

const DynamicProfilePage: FC = () => {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditingCss, setIsEditingCss] = useState(false);
  const [customCss, setCustomCss] = useState('');
  const [isCurrentUserProfile, setIsCurrentUserProfile] = useState(false);
  const [hasMounted, setHasMounted] = useState(false); // Added hasMounted state

  useEffect(() => {
    setHasMounted(true); // Set mounted state
    if (params?.id) {
      setIsLoading(true);
      // Simulate fetching user data
      setTimeout(() => {
        const foundUser = getUserById(params.id);
        if (foundUser) {
          setUser(foundUser);
          const isCurrent = foundUser.id === CURRENT_USER_ID;
          setIsCurrentUserProfile(isCurrent);
          setCustomCss(foundUser.customCss || ''); // Initialize CSS state
        } else {
          console.error("User not found");
          toast({ variant: "destructive", title: "Error", description: "User profile not found." });
        }
        setIsLoading(false);
      }, 300); // Simulate network delay
    } else {
        setIsLoading(false);
    }
  }, [params?.id, toast]);


    const handleEditCssToggle = () => {
        if (!isCurrentUserProfile) return; // Only current user can edit
        setIsEditingCss(!isEditingCss);
        if (isEditingCss && user) {
            // Reset CSS if canceling edit without saving (optional)
             setCustomCss(user.customCss || '');
        }
    };

    const handleSaveCss = async () => {
        if (!isCurrentUserProfile || !user) return;
        setIsLoading(true); // Show loading indicator during save
        const updatedUser = await updateUser(user.id, { customCss });
        if (updatedUser) {
            setUser(updatedUser); // Update local user state
            toast({ title: "Success", description: "Custom CSS saved." });
        } else {
             toast({ variant: "destructive", title: "Error", description: "Failed to save CSS." });
        }
        setIsEditingCss(false);
        setIsLoading(false);
    };

    // Filter future checkpoints for the current profile user
    const userFutureCheckpoints = useMemo(() => {
        if (!user) return [];
        return mockTrendingItems.filter(
            (item): item is FutureCheckpoint => item.type === 'future_checkpoint' && item.userId === user.id
        ).sort((a, b) => parseISO(a.scheduledAt).getTime() - parseISO(b.scheduledAt).getTime()); // Sort by soonest first
    }, [user]);

    // Filter for public confirmed checkpoints (assuming > 0 confirmations means public interest/confirmation)
    const confirmedPublicFutureCheckpoints = useMemo(() => {
        // Assuming Future Checkpoints are public by default in mock data
        return userFutureCheckpoints.filter(cp => (cp.confirmations ?? 0) > 0);
    }, [userFutureCheckpoints]);

    // Filter for "private" checkpoints (assuming those without confirmations are private/less public for demo)
    const privateFutureCheckpoints = useMemo(() => {
         return userFutureCheckpoints.filter(cp => (cp.confirmations ?? 0) === 0);
    }, [userFutureCheckpoints]);

     // Find the latest music item for the current profile user
     const latestMusicItem = useMemo(() => {
        if (!user || !hasMounted) return null;
        return mockMusicItems
            .filter(item => item.userId === user.id && isCurrentOrFuture(item)) // Filter for user and current/future
            .sort((a, b) => parseISO(b.createdAt).getTime() - parseISO(a.createdAt).getTime()) // Sort newest first
            [0] ?? null; // Get the latest one or null
    }, [user, hasMounted]);


    // Removed handleMusicClick


  return (
        <div className="flex min-h-screen bg-background profile-page-wrapper"> {/* Use flex for sidebar layout */}
             {/* Inject Custom CSS for the viewed user's profile */}
             {user?.customCss && (
                 <style dangerouslySetInnerHTML={{ __html: user.customCss }} />
             )}

            {/* Main Content Area (Profile + Sidebar Content when Sidebar is closed on mobile) */}
            <div className="flex-grow flex flex-col w-full"> {/* Ensure main content takes full width */}
                {/* Header */}
                <header className="app-header p-4 flex justify-between items-center border-b sticky top-0 bg-background z-10">
                    <Button variant="ghost" size="icon" onClick={() => router.back()} aria-label="Back">
                    <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <h1 className="text-xl font-semibold text-foreground">Profile</h1>
                    {isCurrentUserProfile ? (
                        <div className="flex items-center gap-2">
                            {/* Toggle Edit CSS Button */}
                            <Button variant={isEditingCss ? "secondary" : "ghost"} size="sm" onClick={handleEditCssToggle}>
                                <Edit className="w-4 h-4 mr-2"/> {isEditingCss ? 'Cancel CSS' : 'Edit CSS'}
                            </Button>
                             {/* Save CSS Button - Show only when editing */}
                             {isEditingCss && (
                                <Button onClick={handleSaveCss} size="sm" disabled={isLoading}>
                                    <Save className="w-4 h-4 mr-2" /> Save CSS
                                </Button>
                             )}
                            <Button variant="ghost" size="icon" aria-label="Settings">
                                <Settings className="w-5 h-5" />
                            </Button>
                        </div>
                    ) : (
                        <div className="w-10"></div> // Placeholder for alignment
                    )}
                </header>

                {/* Profile Content */}
                <main className="flex-grow p-4 md:p-6 lg:p-8">
                    {isLoading ? (
                        <div className="flex justify-center items-center h-64">
                            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : user ? (
                    <Card className="profile-card mx-auto material-elevation-1 overflow-hidden w-full"> {/* Added w-full */}
                        <CardHeader className="p-6 bg-secondary/30"> {/* Targetable: .profile-card .card-header */}
                        <div className="flex flex-col items-center sm:flex-row sm:items-start gap-4">
                            <div className="relative">
                            <Avatar className="h-24 w-24 border-4 border-background ring-1 ring-border avatar"> {/* Targetable: .profile-card .avatar */}
                                <AvatarImage src={user.avatarUrl} alt={user.name} />
                                <AvatarFallback className="text-3xl">{user.name?.charAt(0)?.toUpperCase() || 'U'}</AvatarFallback>
                            </Avatar>
                            {isCurrentUserProfile && (
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="absolute bottom-0 right-0 rounded-full h-8 w-8 border bg-background hover:bg-secondary"
                                    aria-label="Change profile picture"
                                >
                                    <Camera className="w-4 h-4"/>
                                </Button>
                                )}
                            </div>
                            <div className="flex-grow text-center sm:text-left pt-2">
                            <CardTitle className="text-2xl font-bold mb-2 card-title">{user.name}</CardTitle> {/* Targetable: .profile-card .card-title */}
                            <CardDescription className="text-muted-foreground card-description"> {/* Targetable: .profile-card .card-description */}
                                {user.id === 'user1' ? 'Global superstar. Icon. Mother.' :
                                user.id === 'user7' ? 'Actor, Producer, Gin Enthusiast.' :
                                'Exploring the world, one ubq at a time.'}
                            </CardDescription>
                            {isCurrentUserProfile ? (
                                <Button variant="outline" size="sm" className="mt-3">
                                    <Edit className="w-4 h-4 mr-2" /> Edit Profile
                                </Button>
                                ) : (
                                    // Maybe show a Follow/Message button for other users
                                    <Button variant="outline" size="sm" className="mt-3">
                                        <UserIcon className="w-4 h-4 mr-2" /> Follow
                                    </Button>
                                )}
                            </div>
                        </div>
                        </CardHeader>
                        <CardContent className="p-0 card-content"> {/* Targetable: .profile-card .card-content */}
                        {/* Stats Section - Mock data */}
                        <div className="flex justify-around items-center p-4 border-b stats-section"> {/* Targetable: .profile-card .stats-section */}
                            <div className="text-center">
                            <p className="text-xl font-bold">{Math.floor(Math.random() * 100) + 1}</p>
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
                                    author={user} // The profile user is the author
                                    hasMounted={hasMounted}
                                    // Removed onPlayClick prop
                                 />
                            </div>
                        )}


                        {/* Custom CSS Editor - Show only for current user */}
                            {isCurrentUserProfile && isEditingCss && (
                                <div className="p-4 border-b css-editor-section"> {/* Targetable: .profile-card .css-editor-section */}
                                    <h3 className="text-lg font-medium mb-2">Custom Profile CSS</h3>
                                    <Textarea
                                        value={customCss}
                                        onChange={(e) => setCustomCss(e.target.value)}
                                        placeholder="Enter custom CSS here (e.g., .profile-card { background: blue; })"
                                        rows={10}
                                        className="font-mono text-sm bg-muted/30 focus-visible:ring-primary"
                                    />
                                    <p className="text-xs text-destructive mt-2">
                                        <strong>Warning:</strong> Custom CSS can break your profile layout and pose security risks. Use with caution. No validation is performed.
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Target elements like: <code className="bg-muted px-1 py-0.5 rounded">.profile-card</code>, <code className="bg-muted px-1 py-0.5 rounded">.card-title</code>, <code className="bg-muted px-1 py-0.5 rounded">.avatar</code>, <code className="bg-muted px-1 py-0.5 rounded">.card-description</code>, <code className="bg-muted px-1 py-0.5 rounded">.stats-section</code>, etc.
                                    </p>
                                    {/* Removed Save button from here, it's in the header now */}
                                </div>
                            )}

                        {/* User's Posts / Future Ubqs Tabs */}
                         <div className="p-4 posts-section"> {/* Targetable: .profile-card .posts-section */}
                              <Tabs defaultValue="past_ubqs" className="w-full"> {/* Changed default */}
                                 <TabsList className="grid w-full grid-cols-2 rounded-md border mb-4">
                                     {/* Swapped order */}
                                    <TabsTrigger value="past_ubqs" className="py-2">
                                         History
                                     </TabsTrigger>
                                      <TabsTrigger value="future_ubqs" className="py-2">
                                        <Calendar className="w-4 h-4 mr-2"/> Future ubqs
                                    </TabsTrigger>
                                </TabsList>

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
                                         <ScrollArea className="h-[400px]"> {/* Fixed height scroll area */}
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
                    ) : (
                        <Card className="mx-auto p-6 text-center text-destructive w-full"> {/* Added w-full */}
                            <p>User profile not found.</p>
                        </Card>
                    )}
                </main>
             </div>

            {/* Sidebar Removed */}
         </div>
  );
};

export default DynamicProfilePage;
