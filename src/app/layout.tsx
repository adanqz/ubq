
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import QueryProvider from '@/components/providers/query-provider';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from "@/components/providers/theme-provider";
import { ClerkProvider } from '@clerk/nextjs';
import { dark } from '@clerk/themes';
import { ClerkStatusProvider } from '@/contexts/clerk-status-context';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'ubq',
  description: 'Share your journey, one checkpoint at a time. Built with Next.js and Clerk.',
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const PLACEHOLDER_PUBLISHABLE_KEY = 'pk_test_YOUR_REPLACE_WITH_ACTUAL_PUBLISHABLE_KEY';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const rawPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const publishableKey = rawPublishableKey ? rawPublishableKey.trim() : "";

  const isClerkKeyActuallyProvided = !!publishableKey;
  const isClerkKeyPlaceholder = publishableKey === PLACEHOLDER_PUBLISHABLE_KEY;

  // Clerk is considered properly configured only if a key is provided AND it's not the placeholder.
  const isClerkProperlyConfigured = isClerkKeyActuallyProvided && !isClerkKeyPlaceholder;

  let uiErrorMessage: string | null = null;
  if (!isClerkKeyActuallyProvided) {
    uiErrorMessage = "Clerk publishableKey (NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) is missing. Please set it in your .env file. Authentication features will be unavailable.";
  } else if (isClerkKeyPlaceholder) {
    uiErrorMessage = `Clerk publishableKey (NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) is set to the placeholder value '${PLACEHOLDER_PUBLISHABLE_KEY}'. Please replace it in your .env file with your actual Clerk Publishable Key. Authentication features will be unavailable.`;
  }

  // Server-side console warning if the UI error message is active
  if (uiErrorMessage && typeof window === 'undefined') {
    console.warn("Clerk Configuration Server Warning:", uiErrorMessage);
  }

  const AppContent = ({ children }: { children: React.ReactNode }) => (
    <html lang="en" suppressHydrationWarning>{/* Ensure no whitespace before <head> */}
      <head />
      <body className={`${inter.variable} antialiased`}> {/* Use Inter font variable */}
        {uiErrorMessage && (
          <div style={{backgroundColor: 'hsl(var(--destructive))', color: 'hsl(var(--destructive-foreground))', padding: '1rem', textAlign: 'center', position: 'fixed', top: 0, width: '100%', zIndex: 10000, fontSize: '0.875rem', borderBottom: '1px solid hsl(var(--border))'}}>
            <strong>Clerk Not Configured:</strong> {uiErrorMessage}
          </div>
        )}
        <div style={{ paddingTop: uiErrorMessage ? '4rem' : '0' }}>
          <QueryProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              {children}
              <Toaster />
            </ThemeProvider>
          </QueryProvider>
        </div>
      </body>
    </html>
  );

  const AppWrapper = ({ children }: { children: React.ReactNode }) => (
    <ClerkStatusProvider value={{ isClerkJSLoadedAndConfigured: isClerkProperlyConfigured }}>
      <AppContent>{children}</AppContent>
    </ClerkStatusProvider>
  );

  if (isClerkProperlyConfigured) {
    return (
      <ClerkProvider
        publishableKey={publishableKey} // This will be a valid, non-placeholder key
        appearance={{
          baseTheme: dark,
        }}
      >
        <AppWrapper>{children}</AppWrapper>
      </ClerkProvider>
    );
  }

  // Fallback rendering if no publishableKey is provided, or if it's a placeholder.
  // AppWrapper will ensure ClerkStatusProvider has isClerkJSLoadedAndConfigured: false.
  return <AppWrapper>{children}</AppWrapper>;
}
