
import { format, parseISO, formatDistanceToNow, isFuture, isToday, isWithinInterval, startOfDay } from 'date-fns';
import type { Checkpoint, User, FeedItem, FriendPresence, TrendingItem, TrendingPlace, TrendingEvent, Advertisement, FutureCheckpoint, Comment, ExternalLinkItem, MusicItem, ChatMessage } from '@/types';


// Mock data - Added more diverse users and custom CSS examples
export const mockUsers: User[] = [
    { id: 'user1', name: 'Beyoncé', avatarUrl: 'https://picsum.photos/seed/beyonce/50/50', customCss: '.profile-card { background: linear-gradient(to right, #fdbb2d, #22c1c3); color: white; } .profile-card .card-title { color: white !important; text-shadow: 1px 1px 3px black; }' }, // Famous - Example custom CSS
    { id: 'user2', name: 'Drake', avatarUrl: 'https://picsum.photos/seed/drake/50/50' }, // Famous
    { id: 'user3', name: 'Taylor Swift', avatarUrl: 'https://picsum.photos/seed/taylor/50/50' }, // Famous
    { id: 'user4', name: 'Alex', avatarUrl: 'https://picsum.photos/seed/alex/50/50', customCss: '.profile-card .card-title { font-family: "Comic Sans MS", cursive, sans-serif !important; color: papayawhip; }' }, // Friend (Current User) - Example custom CSS
    { id: 'user5', name: 'Chris', avatarUrl: 'https://picsum.photos/seed/chris/50/50' }, // Friend
    { id: 'user6', name: 'Sam', avatarUrl: 'https://picsum.photos/seed/sam/50/50' }, // Friend
    { id: 'user7', name: 'Ryan Reynolds', avatarUrl: 'https://picsum.photos/seed/ryan/50/50' }, // Famous
    { id: 'user8', name: 'Zendaya', avatarUrl: 'https://picsum.photos/seed/zendaya/50/50' }, // Famous
    { id: 'user9', name: 'LocalGuide', avatarUrl: 'https://picsum.photos/seed/guide/50/50' }, // Generic User
    { id: 'user10', name: 'FoodieFan', avatarUrl: 'https://picsum.photos/seed/foodie/50/50' }, // Generic User
    { id: 'user11', name: 'NightOwl', avatarUrl: 'https://picsum.photos/seed/nightowl/50/50' }, // Generic User
    { id: 'user12', name: 'StyleGuru', avatarUrl: 'https://picsum.photos/seed/style/50/50' }, // Generic User
];

// Mock Comments
export const mockComments: Record<string, Comment[]> = {
    'fd1': [
        { id: 'c1', userId: 'user5', text: 'Looks amazing! Gotta try that.', createdAt: new Date(Date.now() - 10 * 60000).toISOString() },
        { id: 'c2', userId: 'user6', text: 'Where exactly is this?', createdAt: new Date(Date.now() - 5 * 60000).toISOString() },
    ],
    'nl1': [
        { id: 'c3', userId: 'user4', text: 'FOMO!', createdAt: new Date(Date.now() - 30 * 60000).toISOString() },
    ],
    'fd3': [
        { id: 'c4', userId: 'user1', text: 'Love that spot!', createdAt: new Date(Date.now() - 2 * 60000).toISOString() },
    ],
    'live1': [
         { id: 'c5', userId: 'user7', text: 'Wow, wish I was there!', createdAt: new Date(Date.now() - 1 * 60000).toISOString() },
         { id: 'c6', userId: 'user3', text: 'So pretty!', createdAt: new Date(Date.now() - 30 * 1000).toISOString() },
    ],
     'ev2': [
        { id: 'c7', userId: 'user4', text: 'Can\'t wait for this!', createdAt: new Date(Date.now() - 60 * 60000).toISOString() },
     ],
};

// --- Mock Chat Messages ---
export const mockChatMessages: ChatMessage[] = [
    { id: 'chat1', userId: 'user5', text: 'Hey everyone, what\'s up?', createdAt: new Date(Date.now() - 15 * 60000).toISOString() },
    { id: 'chat2', userId: 'user6', text: 'Not much, just chilling. Found a cool ubq earlier.', createdAt: new Date(Date.now() - 14 * 60000).toISOString() },
    { id: 'chat3', userId: 'user4', text: 'Oh yeah? Where?', createdAt: new Date(Date.now() - 13 * 60000).toISOString() },
    { id: 'chat4', userId: 'user6', text: 'That taco spot near downtown. fd1.', createdAt: new Date(Date.now() - 12 * 60000).toISOString() },
    { id: 'chat5', userId: 'user5', text: 'Ah, nice! Heard it was good.', createdAt: new Date(Date.now() - 11 * 60000).toISOString() },
    { id: 'chat6', userId: 'user7', text: 'Anyone seen the new movie trailer?', createdAt: new Date(Date.now() - 5 * 60000).toISOString() },
    { id: 'chat7', userId: 'user8', text: 'Not yet, is it good?', createdAt: new Date(Date.now() - 4 * 60000).toISOString() },
    { id: 'chat8', userId: 'user4', text: 'Yeah, looks awesome!', createdAt: new Date(Date.now() - 3 * 60000).toISOString() },
    { id: 'chat9', userId: 'user1', text: 'Planning my next trip ✈️', createdAt: new Date(Date.now() - 1 * 60000).toISOString() },
];



// Mock friend presence data (subset of mockUsers, assuming user4, user5, user6 are friends of the app user)
export const mockFriendPresence: Record<string, FriendPresence[]> = {
    'fd1': [{ userId: 'user5', name: 'Chris', avatarUrl: 'https://picsum.photos/seed/chris/50/50' }], // Chris is at the taco spot
    'nl1': [
        { userId: 'user4', name: 'Alex', avatarUrl: 'https://picsum.photos/seed/alex/50/50' },
        { userId: 'user6', name: 'Sam', avatarUrl: 'https://picsum.photos/seed/sam/50/50' },
    ], // Alex and Sam at the rave
    'fdv2': [{ userId: 'user4', name: 'Alex', avatarUrl: 'https://picsum.photos/seed/alex/50/50' }], // Alex at the coffee shop
    'ev2': [ // Friends attending the Food Truck Festival
        { userId: 'user5', name: 'Chris', avatarUrl: 'https://picsum.photos/seed/chris/50/50' },
        { userId: 'user6', name: 'Sam', avatarUrl: 'https://picsum.photos/seed/sam/50/50' },
    ],
     'tp1': [{ userId: 'user6', name: 'Sam', avatarUrl: 'https://picsum.photos/seed/sam/50/50' }], // Sam is at the Rooftop Bar (Trending Place version)
};

// Add duration and goThereClicks to mock data
// Define Checkpoints explicitly with the 'checkpoint' type
export const mockCheckpoints: Checkpoint[] = [
  // Food & Drink - Some past, some recent/future
  {
    id: 'fd1',
    type: 'checkpoint',
    lat: 40.7580,
    lng: -73.9855,
    title: 'Hidden Gem Taco Spot!',
    description: 'Found the most authentic al pastor tacos just off the main drag. Unbelievable flavor! 🌮 #TacoTuesday #NYCfood',
    mediaUrl: 'https://picsum.photos/seed/tacos/300/200',
    mediaType: 'image',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago (Today)
    userId: 'user4', // Alex (Friend)
    privacy: 'friends',
    duration: '45 mins',
    goThereClicks: 12,
    friendsPresent: mockFriendPresence['fd1'],
    confirmations: 3, // Added confirmations
    comments: mockComments['fd1'], // Added comments
    tags: ['food', 'restaurants'],
  },
  {
    id: 'fd2',
    type: 'checkpoint',
    lat: 34.0430,
    lng: -118.2440,
    title: 'Rooftop Cocktails with a View',
    description: 'Sunset vibes and perfectly crafted old fashioneds. This place is a must-visit. 🍸 #DTLA #CocktailHour',
    mediaUrl: 'https://picsum.photos/seed/rooftopbar/300/200',
    mediaType: 'image',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago (Past) - WILL BE FILTERED OUT by isCurrentOrFuture
    userId: 'user1', // Beyoncé (Famous)
    privacy: 'list',
    allowedLists: ['Inner Circle'],
    duration: '2 hours',
    goThereClicks: 58,
    confirmations: 25,
    comments: [], // Example: Add past comments here if needed
    tags: ['drinks', 'restaurants'],
  },
  {
    id: 'fdv1',
    type: 'checkpoint',
    lat: 48.8588,
    lng: 2.3470,
    title: 'Croissant Perfection',
    description: 'Watch the layers flake! Seriously the best croissant I\'ve ever had. 🥐 #ParisEats #BakeryLife',
    mediaUrl: 'https://picsum.photos/seed/croissant/640/360', // Changed from video URL
    mediaType: 'image', // Changed to image
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago (Past) - WILL BE FILTERED OUT
    userId: 'user3', // Taylor Swift (Famous)
    privacy: 'public',
    duration: 'Just a quick bite!',
    goThereClicks: 103,
    confirmations: 80,
    comments: [],
    tags: ['food', 'restaurants'],
  },
  {
    id: 'fdt1',
    type: 'checkpoint',
    lat: 51.5074,
    lng: -0.1278,
    title: 'Sunday Roast Thoughts',
    description: 'Just finished an incredible Sunday Roast. Perfect Yorkshire puddings and tender beef. Feeling content.',
    mediaType: 'text',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago (Past) - WILL BE FILTERED OUT
    userId: 'user6', // Sam (Friend)
    privacy: 'friends',
    duration: 'A leisurely 1.5 hours',
    goThereClicks: 8,
    confirmations: 1,
    comments: [],
     tags: ['food', 'restaurants'],
  },
  {
    id: 'fd3',
    type: 'checkpoint',
    lat: 35.6895,
    lng: 139.6917,
    title: 'Cozy Coffee Corner',
    description: 'Found this amazing little coffee shop with single-origin pour-overs. Perfect place to work. ☕️ #TokyoCoffee #HiddenGem',
    mediaUrl: 'https://picsum.photos/seed/coffeeshop/300/200',
    mediaType: 'image',
    createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(), // 10 mins ago (Today)
    userId: 'user8', // Zendaya (Famous)
    privacy: 'public',
    duration: 'Spending the morning here',
    goThereClicks: 77,
    confirmations: 42,
    comments: mockComments['fd3'],
    tags: ['food', 'drinks', 'coworking', 'happening now'], // Added 'happening now'
  },
   // NOTE: fd4 was originally a future plan, converted to FutureCheckpoint below

  // Nightlife & Clubs - Some past, some recent/future
  {
    id: 'nl1',
    type: 'checkpoint',
    lat: 52.5200,
    lng: 13.4050,
    title: 'Warehouse Rave Vibes',
    description: 'Found an underground techno party. The energy is insane! Pulsating beats all night long. 🎶 #BerlinTechno #Rave',
    mediaUrl: 'https://picsum.photos/seed/technoclub/300/200',
    mediaType: 'image',
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago (Today)
    userId: 'user2', // Drake (Famous)
    privacy: 'list',
    allowedLists: ['Music Crew'],
    duration: 'All night!',
    goThereClicks: 150,
    friendsPresent: mockFriendPresence['nl1'],
    confirmations: 99,
    comments: mockComments['nl1'],
    tags: ['drinks', 'happenings'],
  },
   {
    id: 'nlv1',
    type: 'checkpoint',
    lat: 25.7617,
    lng: -80.1918,
    title: 'Insane Light Show at the Club',
    description: 'The visuals tonight are next level! Feel the bass drop. 🔥 #MiamiNightlife #Clubbing',
    mediaUrl: 'https://picsum.photos/seed/clublights/640/360', // Changed from video URL
    mediaType: 'image', // Changed to image
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago (Past) - WILL BE FILTERED OUT
    userId: 'user7', // Ryan Reynolds (Famous)
    privacy: 'public',
    duration: 'Until late',
    goThereClicks: 95,
    confirmations: 60,
    comments: [],
    tags: ['drinks', 'happenings'],
  },
  {
    id: 'nlt1',
    type: 'checkpoint',
    lat: 39.9526,
    lng: -75.1652,
    title: 'Chill Dive Bar Find',
    description: 'Sometimes a quiet dive bar with good music is all you need. Great conversation and cheap beers.',
    mediaType: 'text',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago (Past) - WILL BE FILTERED OUT
    userId: 'user4', // Alex (Friend)
    privacy: 'private',
    duration: 'Couple of hours',
    goThereClicks: 3,
    confirmations: 0,
    comments: [],
    tags: ['drinks'],
  },
   {
    id: 'nl2',
    type: 'checkpoint',
    lat: 19.4326,
    lng: -99.1332,
    title: 'Live Salsa Music!',
    description: 'Incredible live band playing salsa. Couldn\'t resist dancing! 💃🕺 #MexicoCityNights #Salsa',
    mediaUrl: 'https://picsum.photos/seed/salsabar/300/200',
    mediaType: 'image',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago (Past) - WILL BE FILTERED OUT
    userId: 'user1', // Beyoncé (Famous)
    privacy: 'public',
    duration: 'Dancing for hours',
    goThereClicks: 112,
    confirmations: 75,
    comments: [],
    tags: ['drinks', 'happenings'],
  },

   // Consumer Goods & Style - Typically represent moments in time, often recent
   {
    id: 'cg1',
    type: 'checkpoint',
    lat: 45.4642,
    lng: 9.1900,
    title: 'Latest Sneaker Drop Acquired!',
    description: 'Managed to grab these limited edition kicks. The details are amazing. 🔥👟 #Sneakerhead #MilanFashion',
    mediaUrl: 'https://picsum.photos/seed/sneakers/300/200',
    mediaType: 'image',
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago (Today)
    userId: 'user8', // Zendaya (Famous)
    privacy: 'list',
    allowedLists: ['Fashion Icons'],
    duration: 'Quick shopping trip',
    goThereClicks: 45,
    confirmations: 18,
    comments: [],
    tags: ['fashion', 'stores'],
  },
  {
    id: 'cg2',
    type: 'checkpoint',
    lat: 37.7749,
    lng: -122.4194,
    title: 'New Smartwatch Unboxing',
    description: 'Finally got my hands on the new XYZ smartwatch. Let\'s see if it lives up to the hype! ⌚ #TechGadget #Unboxing',
    mediaUrl: 'https://picsum.photos/seed/smartwatch/300/200',
    mediaType: 'image',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago (Today)
    userId: 'user5', // Chris (Friend)
    privacy: 'friends',
    duration: 'Unboxing time!',
    goThereClicks: 18,
    confirmations: 5,
    comments: [],
     tags: ['tech', 'stores'],
  },
   {
    id: 'cgv1',
    type: 'checkpoint',
    lat: 34.0522,
    lng: -118.2437,
    title: 'Trying on Vintage Finds',
    description: 'Quick video showing off some amazing vintage jackets I found today. Which one should I keep? 🤔 #VintageFashion #LAStyle',
    mediaUrl: 'https://picsum.photos/seed/vintagefashion/640/360', // Changed from video URL
    mediaType: 'image', // Changed to image
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago (Today)
    userId: 'user3', // Taylor Swift (Famous)
    privacy: 'list',
    allowedLists: ['Style Squad'],
    duration: 'Vintage hunting for 2 hours',
    goThereClicks: 66,
    confirmations: 33,
    comments: [],
     tags: ['fashion', 'stores'],
  },
   {
    id: 'cgt1',
    type: 'checkpoint',
    lat: 47.6062,
    lng: -122.3321,
    title: 'Debating New Headphones',
    description: 'Torn between the Model A and Model B noise-cancelling headphones. Any recommendations? Need them for my commute.',
    mediaType: 'text',
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago (Today)
    userId: 'user6', // Sam (Friend)
    privacy: 'public',
    duration: 'Researching...',
    goThereClicks: 5,
    confirmations: 2,
    comments: [],
    tags: ['tech', 'stores'],
  },
   {
    id: 'cg3',
    type: 'checkpoint',
    lat: 35.6762,
    lng: 139.6998,
    title: 'Exploring Depachika Food Halls',
    description: 'The basement food floors in Japanese department stores are a wonderland! So many gourmet treats. 🍰 #Depachika #TokyoShopping',
    mediaUrl: 'https://picsum.photos/seed/depachika/300/200',
    mediaType: 'image',
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 days ago (Past) - WILL BE FILTERED OUT
    userId: 'user1', // Beyoncé (Famous)
    privacy: 'public',
    duration: 'Browsing for an hour',
    goThereClicks: 88,
    confirmations: 50,
    comments: [],
     tags: ['food', 'stores'],
  },
  // More examples to fill tabs - Ensure some are recent/future
  {
    id: 'fd5',
    type: 'checkpoint',
    lat: 41.9028,
    lng: 12.4964,
    title: 'Perfect Plate of Pasta',
    description: 'Simple cacio e pepe, done right. Absolutely divine. 🍝 #RomeFood #PastaLover',
    mediaUrl: 'https://picsum.photos/seed/pasta/300/200',
    mediaType: 'image',
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 mins ago (Today)
    userId: 'user7', // Ryan Reynolds (Famous)
    privacy: 'public',
    duration: 'Quick lunch',
    goThereClicks: 120,
    confirmations: 85,
    comments: [],
     tags: ['food', 'restaurants', 'happening now'], // Added 'happening now'
  },
   {
    id: 'fdv2',
    type: 'checkpoint',
    lat: 47.6101,
    lng: -122.3421,
    title: 'Latte Art Skills',
    description: 'Check out the barista pouring this beautiful latte art! Mesmerizing. ☕️ #LatteArt #SeattleCoffee',
    mediaUrl: 'https://picsum.photos/seed/latteart/540/960', // Changed from video URL
    mediaType: 'image', // Changed to image
    createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 mins ago (Today)
    userId: 'user5', // Chris (Friend)
    privacy: 'public',
    duration: 'Coffee break',
    goThereClicks: 35,
    friendsPresent: mockFriendPresence['fdv2'],
    confirmations: 10,
    comments: [],
    tags: ['food', 'drinks', 'restaurants', 'happening now'], // Added 'happening now'
  },
  {
    id: 'fdt2',
    type: 'checkpoint',
    lat: 50.8466,
    lng: 4.3517,
    title: 'Belgian Beer Tasting',
    description: 'Sampling some incredible Belgian tripels and quads. So much variety and history in each glass.',
    mediaType: 'text',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago (Past) - WILL BE FILTERED OUT
    userId: 'user4', // Alex (Friend)
    privacy: 'friends',
    duration: 'Evening tasting session',
    goThereClicks: 15,
    confirmations: 4,
    comments: [],
    tags: ['drinks'],
  },
   {
    id: 'cg4',
    type: 'checkpoint',
    lat: 34.1381,
    lng: -118.3534,
    title: 'New Theme Park Merch!',
    description: 'Got the exclusive wand from the Wizarding World! So cool. ✨ #ThemePark #Merchandise',
    mediaUrl: 'https://picsum.photos/seed/themeparkmerch/300/200',
    mediaType: 'image',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago (Past) - WILL BE FILTERED OUT
    userId: 'user3', // Taylor Swift (Famous)
    privacy: 'list',
    allowedLists: ['Theme Park Fans'],
    duration: 'Theme park day!',
    goThereClicks: 99,
    confirmations: 55,
    comments: [],
    tags: ['stores', 'happenings'],
  },
   {
    id: 'cgv2',
    type: 'checkpoint',
    lat: 37.3318,
    lng: -122.0312,
    title: 'First Look: New XYZ Phone',
    description: 'Quick hands-on with the brand new phone. Camera seems impressive! More thoughts soon. #TechReview #NewPhone',
    mediaUrl: 'https://picsum.photos/seed/newphone/640/360', // Changed from video URL
    mediaType: 'image', // Changed to image
    createdAt: new Date(Date.now() - 7 * 60 * 60 * 1000).toISOString(), // 7 hours ago (Today)
    userId: 'user2', // Drake (Famous)
    privacy: 'public',
    duration: 'Reviewing...',
    goThereClicks: 55,
    confirmations: 20,
    comments: [],
    tags: ['tech', 'stores'],
  },
  // --- Added LIVE Checkpoint Examples ---
  {
    id: 'live1',
    type: 'checkpoint',
    lat: 48.8584,
    lng: 2.2945,
    title: 'LIVE from the Eiffel Tower!',
    description: 'Streaming the sparkling lights show happening right now! ✨ #Paris #EiffelTowerLive',
    mediaType: 'live',
    createdAt: new Date().toISOString(), // Always current
    userId: 'user8', // Zendaya
    privacy: 'public',
    duration: 'Streaming now',
    goThereClicks: 250,
    confirmations: 150,
    comments: mockComments['live1'],
    tags: ['happenings', 'happening now'], // Added happening now
  },
  {
    id: 'live2',
    type: 'checkpoint',
    lat: 35.6586,
    lng: 139.7007,
    title: 'Shibuya Scramble - LIVE FEED',
    description: 'Witness the organised chaos of Shibuya Crossing in real-time. So many people! #Tokyo #ShibuyaLive',
    mediaType: 'live',
    createdAt: new Date(Date.now() - 5 * 60000).toISOString(), // Started 5 mins ago
    userId: 'user7', // Ryan Reynolds
    privacy: 'list',
    allowedLists: ['Travel Buddies'],
    duration: 'Ongoing stream',
    goThereClicks: 180,
    confirmations: 100,
    comments: [],
     tags: ['happenings', 'happening now'], // Added happening now
  },
  {
    id: 'live3',
    type: 'checkpoint',
    lat: 34.0407,
    lng: -118.2694,
    title: 'Concert Pre-Show Buzz - LIVE',
    description: 'Feeling the energy build up before the show starts! Streaming the crowd vibes. 🎶 #ConcertLive #LALive',
    mediaType: 'live',
    createdAt: new Date(Date.now() - 15 * 60000).toISOString(), // Started 15 mins ago
    userId: 'user1', // Beyoncé
    privacy: 'friends',
    duration: 'Live until showtime',
    goThereClicks: 310,
    confirmations: 200,
    comments: [],
    tags: ['happenings', 'happening now'], // Added happening now
  },
];

// --- Mock Trending Items --- Filtered for current/future
export const mockTrendingItems: TrendingItem[] = [
    // Trending Places - Keep recent ones
    {
        ...(mockCheckpoints.find(cp => cp.id === 'nl1') as Checkpoint), // Warehouse Rave (Today)
        id: 'tp2',
        type: 'trending_place',
        trendingScore: 88,
        friendsPresent: mockFriendPresence['nl1'],
        confirmations: (mockCheckpoints.find(cp => cp.id === 'nl1') as Checkpoint)?.confirmations, // Propagate confirmations
        comments: (mockCheckpoints.find(cp => cp.id === 'nl1') as Checkpoint)?.comments, // Propagate comments
    },
     {
        ...(mockCheckpoints.find(cp => cp.id === 'fd3') as Checkpoint), // Cozy Coffee Corner (Today)
        id: 'tp3',
        type: 'trending_place',
        trendingScore: 85,
         confirmations: (mockCheckpoints.find(cp => cp.id === 'fd3') as Checkpoint)?.confirmations, // Propagate confirmations
         comments: (mockCheckpoints.find(cp => cp.id === 'fd3') as Checkpoint)?.comments, // Propagate comments
         tags: ['food', 'drinks', 'coworking', 'happening now'], // Added 'happening now' tag
    },
    // Events - Keep future ones
    {
        id: 'ev1',
        type: 'event',
        title: 'Outdoor Movie Night: Classic Cinema',
        description: 'Join us under the stars for a screening of a beloved classic film. Bring blankets and snacks!',
        lat: 34.0736,
        lng: -118.3194,
        imageUrl: 'https://picsum.photos/seed/movienight/300/150',
        startTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // In 2 days
        endTime: new Date(Date.now() + (2 * 24 + 3) * 60 * 60 * 1000).toISOString(), // 3 hours later
        organizer: 'Cinephile Screenings',
        category: 'Film',
        website: '#',
        callToAction: 'Details',
        confirmations: 5, // Add confirmations for events
        comments: [],
        tags: ['happenings'],
    },
    {
        id: 'ev2',
        type: 'event',
        title: 'Weekend Food Truck Festival',
        description: 'Taste the best street food LA has to offer! Live music and family fun.',
        lat: 34.0522,
        lng: -118.2437,
        imageUrl: 'https://picsum.photos/seed/foodtruckfest/300/150',
        startTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // In 5 days
        organizer: 'LA Eats Collective',
        category: 'Food',
        friendsAttending: mockFriendPresence['ev2'],
        website: '#',
        callToAction: 'Get Tickets',
        confirmations: 15,
        comments: mockComments['ev2'],
        tags: ['happenings', 'food', 'restaurants'],
    },
    {
        id: 'ev3',
        type: 'event',
        title: 'Live Jazz Night at The Blue Note',
        description: 'Experience world-class jazz musicians in an intimate setting.',
        lat: 40.7309,
        lng: -74.0006,
        imageUrl: 'https://picsum.photos/seed/jazzclub/300/150',
        startTime: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000 + 20 * 60 * 60 * 1000).toISOString(), // Tomorrow evening
        organizer: 'The Blue Note NYC',
        category: 'Music',
        website: '#',
        callToAction: 'View Schedule',
        confirmations: 8,
        comments: [],
        tags: ['happenings', 'drinks'],
    },
    // Advertisements - Keep active/relevant ones
    {
        id: 'ad1',
        type: 'advertisement',
        advertiser: 'Gourmet Burgers Co.',
        adType: 'nearby',
        title: 'Lunch Special: 15% Off All Burgers!',
        description: 'Stop by today between 11am-2pm for a delicious discount.',
        imageUrl: 'https://picsum.photos/seed/burgerad/300/150',
        callToAction: 'View Menu',
        targetUrl: '#',
        location: { lat: 34.0550, lng: -118.2500 },
        // Add hypothetical start/end time for filtering 'now'
        startTime: new Date(new Date().setHours(11, 0, 0, 0)).toISOString(),
        endTime: new Date(new Date().setHours(14, 0, 0, 0)).toISOString(),
        comments: [],
        tags: ['discounts', 'food', 'restaurants', 'happening now'], // Added 'happening now'
        // Confirmations might not apply to ads
    },
    {
        id: 'ad2',
        type: 'advertisement',
        advertiser: 'StyleThreads Online',
        adType: 'sponsor',
        title: 'Summer Collection Just Dropped!',
        description: 'Explore the latest trends in summer fashion. Free shipping on orders over $50.',
        imageUrl: 'https://picsum.photos/seed/fashionad/300/150',
        callToAction: 'Shop Now',
        targetUrl: '#',
        comments: [],
        tags: ['fashion', 'stores', 'discounts'],
        // No specific time, always relevant
    },
     {
        id: 'ad3',
        type: 'advertisement',
        advertiser: 'QuickCharge EV Stations',
        adType: 'sponsor',
        title: 'Charge Faster, Drive Further.',
        description: 'Find our ultra-fast charging stations near you. Download the app!',
        imageUrl: 'https://picsum.photos/seed/evchargead/300/150',
        callToAction: 'Find Stations',
        targetUrl: '#',
        comments: [],
        tags: ['tech'],
         // No specific time, always relevant
    },
     // Future Checkpoints - Keep all
    {
        id: 'fc1',
        type: 'future_checkpoint',
        userId: 'user7', // Ryan Reynolds
        title: 'Grabbing coffee at Intelligentsia Silver Lake',
        description: 'Might be trying out their new seasonal blend.',
        lat: 34.0880,
        lng: -118.2700,
        scheduledAt: new Date(Date.now() + 1 * 60 * 60 * 1000).toISOString(), // In 1 hour
        estimatedDuration: '30 mins',
        callToAction: 'See Location',
        confirmations: 2, // Add confirmations for future plans
        comments: [],
        tags: ['famous people', 'food', 'drinks'],
    },
    {
        id: 'fc2',
        type: 'future_checkpoint',
        userId: 'user3', // Taylor Swift
        title: 'Browsing vintage shops on Melrose Ave',
        description: 'Looking for unique finds! Might share later.',
        lat: 34.0835,
        lng: -118.3500,
        scheduledAt: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(), // In 4 hours
        estimatedDuration: 'Maybe 2 hours?',
        callToAction: 'See Location',
        confirmations: 1,
        comments: [],
        tags: ['famous people', 'fashion', 'stores'],
    },
      {
        id: 'fc3',
        type: 'future_checkpoint',
        userId: 'user1', // Beyoncé
        title: 'Studio session - new sounds coming!',
        description: 'Locked in. Creating magic.',
        lat: 34.0318,
        lng: -118.3534,
        scheduledAt: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(), // In 8 hours
        estimatedDuration: 'All night',
        callToAction: 'See Location',
        confirmations: 10,
        comments: [],
        tags: ['famous people', 'music'],
    },
     { // Converted fd4 from checkpoint to future_checkpoint
        id: 'fc4',
        type: 'future_checkpoint',
        userId: 'user5', // Chris (Friend)
        title: 'Brunch tomorrow! Avocado toast art.',
        description: 'Can\'t wait for that Avocado toast elevated to an art form! 😍 #SydneyBrunch #AvocadoToast',
        lat: -33.8688,
        lng: 151.2093,
        scheduledAt: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
        estimatedDuration: '1 hour brunch',
        callToAction: 'See Location',
        confirmations: 0,
        comments: [],
        tags: ['food', 'restaurants'],
    },
];

// --- Mock External Link Items ---
export const mockExternalLinks: ExternalLinkItem[] = [
    {
        id: 'ext1',
        type: 'external_link',
        title: 'New Restaurant Opening Downtown!',
        description: 'Local news reports on the highly anticipated opening of "The Gilded Spoon".',
        url: '#', // Placeholder URL
        imageUrl: 'https://picsum.photos/seed/restaurantnews/300/150',
        source: 'Local News Today',
        createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
        tags: ['restaurants', 'food', 'happenings', 'local news', 'happening now'], // Added 'happening now'
    },
    {
        id: 'ext2',
        type: 'external_link',
        title: 'Tech Blog Reviews Latest Gadget',
        description: 'A deep dive into the features and performance of the new XYZ Smartwatch.',
        url: '#', // Placeholder URL
        imageUrl: 'https://picsum.photos/seed/techreview/300/150',
        source: 'GadgetSphere Blog',
        createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago
        tags: ['tech'],
    },
    {
        id: 'ext3',
        type: 'external_link',
        title: 'Travel Guide: Hidden Gems in Europe',
        description: 'Discover lesser-known spots for your next European adventure.',
        url: '#', // Placeholder URL
        imageUrl: 'https://picsum.photos/seed/travelguide/300/150',
        source: 'Wanderlust Magazine',
        createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), // 8 hours ago
        tags: ['travel'],
    },
     {
        id: 'ext4',
        type: 'external_link',
        title: 'City Announces Road Closures This Weekend',
        description: 'Plan your routes accordingly! Main St will be closed for the festival.',
        url: '#', // Placeholder URL
        imageUrl: 'https://picsum.photos/seed/trafficnews/300/150',
        source: 'City Traffic Dept.',
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
        tags: ['traffic', 'happenings', 'local news'],
    },
     {
        id: 'ext5',
        type: 'external_link',
        title: 'Local Band Releases New Single',
        description: 'Listen to the latest track from indie favorites "The Wobbly Sprockets".',
        url: '#', // Placeholder URL
        imageUrl: 'https://picsum.photos/seed/bandnews/300/150',
        source: 'Music Scene Weekly',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        tags: ['music', 'happenings'],
    },
];

// --- Mock Music Items ---
export const mockMusicItems: MusicItem[] = [
    {
        id: 'music1',
        type: 'music',
        title: 'Chill Lo-fi Hip Hop Radio - Beats to Relax/Study to',
        artist: 'Lofi Girl',
        platform: 'youtube',
        url: 'https://www.youtube.com/watch?v=jfKfPfyJRdk', // Example YouTube link
        thumbnailUrl: 'https://picsum.photos/seed/lofigirl/300/150',
        createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 minutes ago
        expiresAt: new Date(Date.now() + 1 * 60 * 60 * 1000).toISOString(), // Expires in 1 hour
        userId: 'user11', // NightOwl
        tags: ['music', 'lofi', 'chill', 'study beats', 'happening now'], // Added 'happening now'
    },
    {
        id: 'music2',
        type: 'music',
        title: 'Discovery - Daft Punk',
        artist: 'Daft Punk',
        platform: 'soundcloud',
        url: 'https://soundcloud.com/daftpunkofficial/sets/discovery', // Example SoundCloud link
        thumbnailUrl: 'https://picsum.photos/seed/daftpunk/300/150',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        expiresAt: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(), // Expires in 4 hours
        userId: 'user2', // Drake sharing some classics
        tags: ['music', 'electronic', 'french house'],
    },
    {
        id: 'music3',
        type: 'music',
        title: 'Bohemian Rhapsody - Queen (Official Video)',
        artist: 'Queen',
        platform: 'youtube',
        url: 'https://www.youtube.com/watch?v=fJ9rUzIMcZQ', // Example YouTube link
        thumbnailUrl: 'https://picsum.photos/seed/queen/300/150',
        createdAt: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(), // 10 hours ago (Will be filtered out by createdAt if feed only shows today)
        // No expiresAt - persists longer? Or relies on createdAt filtering.
        userId: 'user7', // Ryan Reynolds
        tags: ['music', 'rock', 'classic rock'],
    },
     {
        id: 'music4',
        type: 'music',
        title: 'Ambient Mix | Relaxing Music for Sleep, Study, Focus',
        artist: 'Ambient Worlds',
        platform: 'youtube',
        url: 'https://www.youtube.com/watch?v=4oStw0r33so', // Example YouTube link
        thumbnailUrl: 'https://picsum.photos/seed/ambient/300/150',
        createdAt: new Date(Date.now() - 1 * 60 * 1000).toISOString(), // 1 minute ago
        expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // Expires in 30 minutes
        userId: 'user10', // FoodieFan
        tags: ['music', 'ambient', 'relaxing', 'focus', 'happening now'], // Added 'happening now'
    },
];



// Helper function to determine if an item is current or future, considering expiration
export const isCurrentOrFuture = (item: FeedItem): boolean => {
    const now = new Date();
    try {
        if (item.type === 'checkpoint') {
            // Live is always current
            if (item.mediaType === 'live') return true;
            // Checkpoints are considered 'current' if created today
            return isToday(parseISO(item.createdAt));
        } else if (item.type === 'trending_place') {
             // Trending places are based on recent checkpoints, check if created today
             return isToday(parseISO(item.createdAt));
        } else if (item.type === 'event') {
            // Event is current/future if its start time is in the future OR if it's happening now/today
             const startTime = parseISO(item.startTime);
             const endTime = item.endTime ? parseISO(item.endTime) : null;
             return isFuture(startTime) || isToday(startTime) || (endTime ? isWithinInterval(now, { start: startTime, end: endTime }) : false);
        } else if (item.type === 'advertisement') {
            // Ads are current if they have no end time or the end time is in the future/today
             const endTime = item.endTime ? parseISO(item.endTime) : null;
             return !endTime || isFuture(endTime) || isToday(endTime);
        } else if (item.type === 'future_checkpoint') {
            // Always future by definition (until scheduledAt passes)
             return isFuture(parseISO(item.scheduledAt));
        } else if (item.type === 'external_link') {
            // Consider external links 'current' if posted today
            return isToday(parseISO(item.createdAt));
        } else if (item.type === 'music') {
            // Music items are current if posted today AND not expired
            const createdAt = parseISO(item.createdAt);
            const expiresAt = item.expiresAt ? parseISO(item.expiresAt) : null;
            return isToday(createdAt) && (!expiresAt || isFuture(expiresAt)); // Show if today and not expired
        }
    } catch {
        return false; // Invalid date, treat as past
    }
    return false;
};


// Combine checkpoints, trending items, external links, and music items, FILTER for current/future
// The actual sorting/shuffling will happen on the client-side to avoid hydration issues
export const initialFeedItems: FeedItem[] = [
    ...mockCheckpoints,
    ...mockTrendingItems,
    ...mockExternalLinks,
    ...mockMusicItems, // Added music items
].filter(isCurrentOrFuture); // Apply filtering


// Adjusted mock user lists with different names and members
export const mockUserLists: Record<string, string[]> = {
    // Lists for Beyoncé (user1)
    'Inner Circle': ['user4', 'user5'], // Alex, Chris
    'BeyHive VIP': ['user7', 'user8'], // Ryan, Zendaya

    // Lists for Drake (user2)
    'Music Crew': ['user1', 'user3'], // Beyoncé, Taylor
    'OVO Fam': ['user5', 'user6'], // Chris, Sam

    // Lists for Taylor Swift (user3)
    'Style Squad': ['user1', 'user8'], // Beyoncé, Zendaya
    'Swifties Inner Circle': ['user4', 'user6'], // Alex, Sam
    'Theme Park Fans': ['user5', 'user7'], // Chris, Ryan

    // Lists for Alex (user4) - Assuming friends with Chris, Sam
    'Besties': ['user5', 'user6'],
    'Travel Buddies': ['user5'],

    // Lists for Chris (user5) - Assuming friends with Alex, Sam
    'Close Friends': ['user4', 'user6'],
    'Gaming Crew': ['user6'],

    // Lists for Sam (user6) - Assuming friends with Alex, Chris
    'Weekend Warriors': ['user4', 'user5'],

    // Lists for Ryan Reynolds (user7)
    'Movie Night': ['user5', 'user8'], // Chris, Zendaya
    'Aviation Gin Pals': ['user2'], // Drake

    // Lists for Zendaya (user8)
    'Fashion Icons': ['user1', 'user3'], // Beyoncé, Taylor
    'Film Club': ['user7'], // Ryan
};