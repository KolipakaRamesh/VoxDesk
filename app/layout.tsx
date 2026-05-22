import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'VoxDesk — AI Voice Receptionist',
    template: '%s | VoxDesk',
  },
  description:
    'VoxDesk is an AI-powered voice receptionist platform for service-based businesses. Automate appointment booking with natural voice conversations.',
  keywords: ['AI receptionist', 'voice booking', 'appointment automation', 'VoxDesk'],
  authors: [{ name: 'VoxDesk' }],
  robots: 'noindex, nofollow', // MVP — not public-facing
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>{children}</body>
    </html>
  );
}
