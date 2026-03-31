import './globals.css';
import { AuthProvider } from '../context/AuthContext';
import { ToastProvider } from '../context/ToastContext';
import Navbar from '../components/Navbar';
import Toast from '../components/Toast';

export const metadata = {
  title: 'NIS Ranking | Leaderboard',
  description: 'Vote for the most outstanding students',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="bg-background text-indigo-50">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:opsz,wght@9..40,400;500;700&family=Playfair+Display:ital,wght@0,600;0,700;1,600;1,700&display=swap" rel="stylesheet" />
      </head>
      <body className="relative min-h-screen overscroll-none antialiased selection:bg-accent-gold/30 selection:text-white flex flex-col">
        {/* Overlay Grain Texture */}
        <div className="fixed inset-0 z-0 bg-noise pointer-events-none" />
        
        <ToastProvider>
          <AuthProvider>
            <Navbar />
            <main className="relative z-20 pt-24 pb-12 px-4 sm:px-6 max-w-4xl mx-auto w-full flex-grow flex flex-col">
              {children}
            </main>
            <Toast />
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
