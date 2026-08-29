import type { Metadata } from 'next';
import { Inter, Lora, Caveat } from 'next/font/google';
import './globals.css';
import 'maplibre-gl/dist/maplibre-gl.css';
import { ThemeRegistry } from '@/components/providers/ThemeRegistry';
import { AuthProvider } from '@/components/providers/AuthProvider';
import { FloatingBottomNav } from '@/components/layout/FloatingBottomNav';
import { Footer } from '@/components/layout/Footer';

const sansFont = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const displayFont = Lora({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

const accentFont = Caveat({
  subsets: ['latin'],
  variable: '--font-accent',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'UrbanReports | Map-First Civic Issue Reporting Platform',
  description: 'Report potholes, broken streetlights, garbage, water leaks, and track resolution transparently.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${sansFont.variable} ${displayFont.variable} ${accentFont.variable}`}>
      <body className="rural-houses-bg text-[#1f241d] antialiased min-h-screen flex flex-col font-sans overflow-x-hidden selection:bg-[#89a577]/30 selection:text-[#1f241d]">
        <ThemeRegistry>
          <AuthProvider>
            <div className="flex-1 flex flex-col w-full relative pb-28">{children}</div>
            <Footer />
            <FloatingBottomNav />
          </AuthProvider>
        </ThemeRegistry>
      </body>
    </html>

  );
}

