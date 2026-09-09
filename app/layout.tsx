/* ROOT LAYOUT — wraps every URL with the shared fonts, navigation, and planner state. */
import { PlannerProvider } from "@/context/PlannerContext";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import { PageLoaderProvider } from "@/components/common/PageLoader";
import type { Metadata } from "next";
import { Geist, Geist_Mono, Fredoka } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const fredoka = Fredoka({
  variable: "--font-fredoka",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  // This title appears in the browser tab and bookmark name.
  title: "GrowHabits",
  description: "Build consistent routines and support positive habits, one day at a time.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`dark ${geistSans.variable} ${geistMono.variable} ${fredoka.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">

        <PageLoaderProvider>
          {/* The navigation bar is shared by every route in the app. */}
          <Navbar />

          {/* Every page has access to PlannerContext. */}
          <PlannerProvider>
            {children}
          </PlannerProvider>

          {/* A small site-wide footer; no-print keeps it out of paper planners. */}
          <Footer />
        </PageLoaderProvider>

      </body>
    </html>
  );
}
