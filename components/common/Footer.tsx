// Shared site footer. It is placed in the root layout so it appears on every page.
export default function Footer() {
  return (
    <footer className="no-print border-t bg-card px-4 py-3 text-xs text-muted-foreground sm:px-8">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 text-center sm:flex-row sm:text-left">
        <p>© 2026 GrowHabits. All rights reserved.</p>

        <p>
          Built by{" "}
          <a
            className="font-medium text-primary transition-colors hover:underline"
            href="https://huzaifasheikh.dev"
            rel="noreferrer"
            target="_blank"
          >
            Huzaifa Sheikh
          </a>
        </p>
      </div>
    </footer>
  );
}
