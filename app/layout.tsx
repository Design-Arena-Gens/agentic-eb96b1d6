import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Influencer Auto Poster',
  description: 'Daily Instagram AI influencer posts and videos',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
