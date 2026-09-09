import Link from "next/link";

import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth";
import ThemeToggle from "@/components/common/ThemeToggle";
import MobileNavbarMenu from "@/components/common/MobileNavbarMenu";
import LogoutButton from "@/components/common/LogoutButton";
import { NavigationLinks } from "@/components/common/NavigationLinks";

// This server component appears in the root layout, so it is available on every page.
export default async function Navbar() {
  const user = await getCurrentUser();

  // sticky keeps this header in normal page layout, then pins it at the viewport top while scrolling.
  return (
    <header className="site-navbar no-print sticky top-0 z-50 border-b bg-white">
      <MobileNavbarMenu isSignedIn={Boolean(user)} />

      <nav className="mx-auto hidden w-full max-w-360 grid-cols-[1fr_auto] items-center gap-x-3 gap-y-2 px-5 py-3 sm:grid sm:grid-cols-[1fr_auto_1fr]">
        {/* The app name always leads back to the landing page. */}
        <Link href="/" className="justify-self-start font-fredoka text-2xl font-semibold text-primary transition-transform duration-200 hover:scale-[1.03] motion-reduce:transform-none">
          GrowHabits
        </Link>

        {/* The middle grid column stays centred even when left and right content have different widths. */}
        <div className="col-span-2 row-start-2 flex items-center justify-center gap-4 sm:col-span-1 sm:col-start-2 sm:row-start-1">
          <NavigationLinks />
        </div>

        {/* Theme and account controls stay grouped at the right edge. */}
        <div className="col-start-2 row-start-1 flex items-center gap-4 justify-self-end sm:col-start-3">
          <ThemeToggle />

          {user && (
            <LogoutButton className="text-base" />
          )}

          {!user && (
            <>
              <Link
                href="/login"
                className="rounded-md px-2 py-1 text-lg font-medium text-gray-600 transition duration-200 hover:scale-[1.03] hover:bg-muted hover:text-foreground motion-reduce:transform-none"
              >
                Sign in
              </Link>

              <Button
                className="text-base"
                render={<Link href="/register" />}
                nativeButton={false}
              >
                Sign up
              </Button>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
