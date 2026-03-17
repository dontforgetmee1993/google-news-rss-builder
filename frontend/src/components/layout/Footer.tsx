export function Footer() {
  return (
    <footer className="border-t mt-auto">
      <div className="container mx-auto px-4 h-14 flex items-center justify-center">
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} RSS Builder &middot; Powered by Google News RSS
        </p>
      </div>
    </footer>
  );
}
