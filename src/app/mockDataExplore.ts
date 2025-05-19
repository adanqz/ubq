
import type { FeedItem, User, FriendPresence, Comment } from '@/types';

// Mock User Data (copied from home for consistency)
export const mockUsers: User[] = [
    { id: 'user1', name: 'Beyoncé', avatarUrl: 'https://picsum.photos/seed/beyonce/50/50' },
    { id: 'user2', name: 'Drake', avatarUrl: 'https://picsum.photos/seed/drake/50/50' },
    { id: 'user3', name: 'Taylor Swift', avatarUrl: 'https://picsum.photos/seed/taylor/50/50' },
    { id: 'user4', name: 'Alex', avatarUrl: 'https://picsum.photos/seed/alex/50/50' },
    { id: 'user5', name: 'Chris', avatarUrl: 'https://picsum.photos/seed/chris/50/50' },
    { id: 'user6', name: 'Sam', avatarUrl: 'https://picsum.photos/seed/sam/50/50' },
    { id: 'user7', name: 'Ryan Reynolds', avatarUrl: 'https://picsum.photos/seed/ryan/50/50' },
    { id: 'user8', name: 'Zendaya', avatarUrl: 'https://picsum.photos/seed/zendaya/50/50' },
];

// Mock friend presence data (relevant to explore items)
export const mockExploreFriendPresence: Record<string, FriendPresence[]> = {
    'explore-coworking-1': [{ userId: 'user4', name: 'Alex', avatarUrl: 'https://picsum.photos/seed/alex/50/50' }],
    'explore-icecream-1': [{ userId: 'user5', name: 'Chris', avatarUrl: 'https://picsum.photos/seed/chris/50/50' }],
    'explore-drinks-1': [{ userId: 'user6', name: 'Sam', avatarUrl: 'https://picsum.photos/seed/sam/50/50' }],
    'explore-recipe-2': [{ userId: 'user5', name: 'Chris', avatarUrl: 'https://picsum.photos/seed/chris/50/50' }],
};

// Mock Comments for Explore Items
export const mockExploreComments: Record<string, Comment[]> = {
    'explore-recipe-1': [
        { id: 'ec1', userId: 'user5', text: 'Yum, sourdough pizza!', createdAt: new Date(Date.now() - 1 * 60000).toISOString() },
    ],
    'explore-coworking-1': [
        { id: 'ec2', userId: 'user7', text: 'Need a good focus spot, thanks!', createdAt: new Date(Date.now() - 120 * 60000).toISOString() },
    ],
    'explore-drinks-1': [
        { id: 'ec3', userId: 'user8', text: 'Adding this to my list.', createdAt: new Date(Date.now() - 30 * 60000).toISOString() },
        { id: 'ec4', userId: 'user2', text: 'Heard good things.', createdAt: new Date(Date.now() - 20 * 60000).toISOString() },
    ],
    'explore-happenings-1': [
        { id: 'ec5', userId: 'user6', text: 'Sounds fun!', createdAt: new Date(Date.now() - 10 * 60 * 60000).toISOString() },
    ]
};


// Mock Data for Explore Page (Enhanced) - Adjusted dates, added confirmations and comments
export const mockExploreItems: FeedItem[] = [
  {
    id: 'explore-recipe-1',
    type: 'checkpoint',
    lat: 34.0522, lng: -118.2437,
    title: 'Amazing Homemade Pizza Night!', // Present tense
    description: 'Making sourdough pizza crust tonight! So chewy and delicious.',
    mediaUrl: 'https://picsum.photos/seed/pizzarecipe/300/400',
    mediaType: 'image',
    createdAt: new Date(Date.now() - 2 * 60000).toISOString(), // 2 mins ago (Today)
    userId: 'user4',
    privacy: 'public',
    tags: ['recipes', 'food', 'happening now'],
    duration: 'Evening project',
    goThereClicks: 5,
    confirmations: 2,
    comments: mockExploreComments['explore-recipe-1'],
  },
  {
    id: 'explore-construction-1',
    type: 'checkpoint', // Progress on a construction project
    lat: 34.0600, lng: -118.2500,
    title: 'Framing Almost Done!',
    description: 'Making good progress on the new office build-out.',
    mediaUrl: 'https://picsum.photos/seed/construction/300/250',
    mediaType: 'image',
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago (Today)
    userId: 'user5',
    privacy: 'public',
    tags: ['construction'],
    duration: 'Ongoing',
    goThereClicks: 2,
    confirmations: 1,
    comments: [],
  },
   {
    id: 'explore-job-1',
    type: 'advertisement', // Job Posting Ad - Always considered current/relevant
    advertiser: 'Tech Innovations Inc.',
    adType: 'sponsor',
    title: 'Hiring: Frontend Developer',
    description: 'Join our dynamic team! React experience required. Apply now.',
    imageUrl: 'https://picsum.photos/seed/jobad/300/150',
    callToAction: 'Apply Here',
    targetUrl: '#',
    tags: ['jobs'],
    comments: [],
    // Confirmations don't typically apply to ads
  },
  {
    id: 'explore-coworking-1',
    type: 'trending_place', // Coworking Space - Based on recent activity
    lat: 34.0450, lng: -118.2550,
    title: 'Productive Day at WeWork DTLA',
    description: 'Great focus zone and free coffee. Highly recommend.',
    mediaUrl: 'https://picsum.photos/seed/coworking/300/300',
    mediaType: 'image',
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago (Today)
    userId: 'user6',
    privacy: 'public',
    trendingScore: 80,
    tags: ['coworking'],
    duration: 'Full day',
    goThereClicks: 15,
    friendsPresent: mockExploreFriendPresence['explore-coworking-1'],
    confirmations: 7,
    comments: mockExploreComments['explore-coworking-1'],
  },
    {
    id: 'explore-meeting-1',
    type: 'event', // Scheduled Meeting / Networking Event
    title: 'Startup Networking Mixer',
    description: 'Connect with fellow entrepreneurs and investors.',
    lat: 34.0500, lng: -118.2600,
    imageUrl: 'https://picsum.photos/seed/networking/300/200',
    startTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 19 * 60 * 60 * 1000).toISOString(), // In 3 days, evening (Future)
    endTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 22 * 60 * 60 * 1000).toISOString(), // 3 hours later
    organizer: 'LA Tech Hub',
    category: 'Networking',
    website: '#',
    callToAction: 'RSVP',
    tags: ['meetings', 'happenings'],
    confirmations: 3, // Confirmations for events (e.g., RSVPs)
    comments: [],
  },
    {
    id: 'explore-icecream-1',
    type: 'checkpoint', // Ice Cream Spot
    lat: 34.0700, lng: -118.2800,
    title: 'Salt & Straw Delight',
    description: 'Trying the Honey Lavender flavor - divine!',
    mediaUrl: 'https://picsum.photos/seed/icecream/300/350',
    mediaType: 'image',
    createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 minutes ago (Today)
    userId: 'user4',
    privacy: 'friends',
    tags: ['ice cream', 'food', 'happening now'],
    duration: '20 mins',
    goThereClicks: 22,
    friendsPresent: mockExploreFriendPresence['explore-icecream-1'],
    confirmations: 10,
    comments: [],
  },
  {
    id: 'explore-drinks-1',
    type: 'trending_place', // Bar / Drinks Spot
    lat: 34.0800, lng: -118.3000,
    title: 'Craft Cocktails at The Varnish',
    description: 'Hidden gem with amazing speakeasy vibes.',
    mediaUrl: 'https://picsum.photos/seed/cocktailbar/300/450',
    mediaType: 'image',
    createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(), // 45 minutes ago (Today)
    userId: 'user1', // Beyoncé
    privacy: 'public',
    trendingScore: 92,
    tags: ['drinks'],
    duration: 'Evening',
    goThereClicks: 68,
    friendsPresent: mockExploreFriendPresence['explore-drinks-1'],
    confirmations: 45,
    comments: mockExploreComments['explore-drinks-1'],
  },
    {
    id: 'explore-restaurant-1',
    type: 'trending_place', // Restaurant
    lat: 34.0650, lng: -118.2900,
    title: 'Dinner at Bestia',
    description: 'Incredible Italian food, especially the pasta.',
    mediaUrl: 'https://picsum.photos/seed/bestia/300/280',
    mediaType: 'image',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago (Today)
    userId: 'user8', // Zendaya
    privacy: 'public',
    trendingScore: 89,
    tags: ['restaurants', 'food'],
    duration: '2 hours',
    goThereClicks: 95,
    confirmations: 60,
    comments: [],
  },
  {
    id: 'explore-famous-1',
    type: 'future_checkpoint', // Famous person's plan
    userId: 'user2', // Drake
    title: 'Might hit the studio later tonight',
    description: 'Feeling inspired.',
    lat: 34.0900, lng: -118.3500,
    scheduledAt: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(), // In 6 hours (Today - Future)
    estimatedDuration: 'Late',
    callToAction: 'See Area',
    tags: ['famous people'],
    confirmations: 1, // Future plans can have confirmations (e.g., interest)
    comments: [],
  },
   {
    id: 'explore-discount-1',
    type: 'advertisement', // Discount Offer
    advertiser: 'Local Coffee Roasters',
    adType: 'nearby',
    title: 'Happy Hour! 50% Off Espresso Drinks',
    description: 'Today from 2 PM - 4 PM only!',
    imageUrl: 'https://picsum.photos/seed/coffeediscount/300/180',
    callToAction: 'Get Offer',
    targetUrl: '#',
    location: { lat: 34.0530, lng: -118.2450 },
    tags: ['next hour offers', 'discounts', 'food', 'drinks', 'happening now'], // Added happening now tag
    startTime: new Date(new Date().setHours(14, 0, 0, 0)).toISOString(),
    endTime: new Date(new Date().setHours(16, 0, 0, 0)).toISOString(),
    comments: [],
  },
  {
    id: 'explore-recipe-2',
    type: 'checkpoint',
    lat: 34.0522, lng: -118.2437,
    title: 'Quick Weeknight Pasta Recipe',
    description: 'Simple, delicious, and ready in 20 minutes.',
    mediaUrl: 'https://picsum.photos/seed/pastarecipe/300/320',
    mediaType: 'image',
    createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(), // 10 minutes ago (Today)
    userId: 'user6',
    privacy: 'public',
    tags: ['recipes', 'food', 'happening now'],
    duration: '20 mins prep',
    goThereClicks: 18,
    friendsPresent: mockExploreFriendPresence['explore-recipe-2'],
    confirmations: 8,
    comments: [],
  },
   {
    id: 'explore-happenings-1',
    type: 'event',
    title: 'Art Walk Downtown',
    description: 'Explore local galleries and street art.',
    lat: 34.0400, lng: -118.2500,
    imageUrl: 'https://picsum.photos/seed/artwalk/300/220',
    startTime: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(), // In 4 days (Future)
    endTime: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000).toISOString(), // 4 hours duration
    organizer: 'DTLA Art Collective',
    category: 'Art',
    website: '#',
    callToAction: 'Learn More',
    tags: ['happenings'],
    confirmations: 12,
    comments: mockExploreComments['explore-happenings-1'],
  },
   {
    id: 'explore-icecream-2',
    type: 'checkpoint',
    lat: 34.0600, lng: -118.3100,
    title: 'Gelato Stop',
    description: 'Pistachio and Stracciatella combo hits the spot.',
    mediaUrl: 'https://picsum.photos/seed/gelato/300/400',
    mediaType: 'image',
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago (Today)
    userId: 'user5',
    privacy: 'friends',
    tags: ['ice cream', 'food'],
    duration: 'Quick stop',
    goThereClicks: 30,
    confirmations: 15,
    comments: [],
  },
   {
    id: 'explore-live-1',
    type: 'checkpoint',
    lat: 34.0580, lng: -118.2450,
    title: 'LIVE from Grand Park Fountain Show!',
    description: 'Streaming the colorful water display now!',
    mediaType: 'live', // Live type
    createdAt: new Date().toISOString(), // Current time
    userId: 'user7', // Ryan Reynolds
    privacy: 'public',
    tags: ['happenings', 'happening now'], // Add happening now tag
    duration: 'Streaming now',
    goThereClicks: 50,
    confirmations: 30,
    comments: [],
   },
   {
    id: 'explore-event-month',
    type: 'event',
    title: 'Monthly Tech Meetup',
    description: 'Discussing the future of AI in development.',
    lat: 34.0300, lng: -118.2000,
    imageUrl: 'https://picsum.photos/seed/techmeetup/300/180',
    startTime: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(), // In 15 days (Future)
    endTime: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(), // 2 hours
    organizer: 'Dev Guild',
    category: 'Technology',
    website: '#',
    callToAction: 'Register',
    tags: ['meetings', 'happenings'],
    confirmations: 22,
    comments: [],
  },
];
