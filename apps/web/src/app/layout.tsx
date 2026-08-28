import type { Metadata } from 'next';
import './globals.css';
import 'maplibre-gl/dist/maplibre-gl.css';
import { ThemeRegistry } from '@/components/providers/ThemeRegistry';
import { AuthProvider } from '@/components/providers/AuthProvider';
import { FloatingBottomNav } from '@/components/layout/FloatingBottomNav';
import { Footer } from '@/components/layout/Footer';

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
    <html lang="en">
      <body className="bg-[#f5f3ee] text-[#09090b] antialiased min-h-screen flex flex-col font-sans overflow-x-hidden">
        <ThemeRegistry>
          <AuthProvider>
            <div className="flex-1 flex flex-col w-full relative">{children}</div>
            <Footer />
            <FloatingBottomNav />
          </AuthProvider>
        </ThemeRegistry>
      </body>
    </html>
  );
}
