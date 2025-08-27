import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata = {
  title: 'MovieKnight - Movie Search & Recommendations',
  description: 'MovieKnight helps you discover and get personalized movie recommendations based on your preferences.',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full dark bg-neutral-950">
      <body className={`${inter.variable} font-sans antialiased h-full text-gray-100 bg-neutral-950`}> 
        <div className="min-h-full flex flex-col">
          <Navbar />
          {children}
        </div>
      </body>
    </html>
  );
}
