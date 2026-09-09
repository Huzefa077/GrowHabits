"use client";

import { Button } from "@/components/ui/button";

export default function LogoutButton({ className }: { className?: string }) {
  return (
    <form
      action="/api/auth/logout"
      method="POST"
      onSubmit={(event) => {
        if (!window.confirm("Are you sure you want to log out of GrowHabits?")) {
          event.preventDefault();
        }
      }}
    >
      <Button className={className} type="submit" variant="outline">
        Log out
      </Button>
    </form>
  );
}
