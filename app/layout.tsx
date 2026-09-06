import type {Metadata} from 'next';
import './globals.css'; // Global styles

export const metadata: Metadata = {
  title: 'OrthoBond AI — AI-Assisted Orthodontic Verification & Care Platform',
  description: 'AI-assisted orthodontic care platform connecting continuous patient monitoring with Gemini-powered visual bracket verification for clinicians.',
  openGraph: {
    title: 'OrthoBond AI — AI-Assisted Orthodontic Verification & Care Platform',
    description: 'AI-assisted orthodontic care platform connecting continuous patient monitoring with Gemini-powered visual bracket verification for clinicians.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'OrthoBond AI — AI-Assisted Orthodontic Verification & Care Platform',
    description: 'AI-assisted orthodontic care platform connecting continuous patient monitoring with Gemini-powered visual bracket verification for clinicians.',
  },
  icons: {
    icon: '/icon.svg',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
