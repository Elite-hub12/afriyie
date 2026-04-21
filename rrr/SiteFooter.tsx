export function SiteFooter() {
  return (
    <footer className="border-t border-border mt-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8 text-sm text-muted-foreground flex flex-col sm:flex-row gap-2 items-center justify-between">
        <p>© {new Date().getFullYear()} Afriyie Tools. All-in-one utilities.</p>
        <p className="text-xs">Built with care for everyday tasks.</p>
      </div>
    </footer>
  );
}
