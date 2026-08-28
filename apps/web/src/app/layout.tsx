import type { Metadata } from 'next';
import './globals.css';
import 'maplibre-gl/dist/maplibre-gl.css';
import { ThemeRegistry } from '@/components/providers/ThemeRegistry';
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
    <html lang="en" className="dark">
      <body className="bg-zinc-950 text-zinc-100 antialiased min-h-screen flex flex-col font-sans">
        <ThemeRegistry>
          <div className="flex-1 flex flex-col">{children}</div>
          <Footer />
          <FloatingBottomNav />
        </ThemeRegistry>
      </body>
    </html>
  );
}
