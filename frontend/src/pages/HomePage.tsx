import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { Rss, Search, Star } from "lucide-react";

export default function HomePage() {
  const { user } = useAuth();

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
          Custom Google News RSS Feeds
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
          Create personalized RSS feeds with keyword, domain, country, and time filters.
          Use them in any RSS reader — Feedly, Inoreader, Thunderbird, and more.
        </p>
        <Link
          to={user ? "/feeds/new" : "/login"}
          className="inline-flex items-center justify-center h-11 px-8 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          Get Started
        </Link>
      </section>

      {/* How it works */}
      <section className="border-t bg-muted/30">
        <div className="container mx-auto px-4 py-16">
          <h2 className="text-2xl font-bold text-center mb-12">How it works</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="flex flex-col items-center text-center gap-3">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Search className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold">1. Configure</h3>
              <p className="text-sm text-muted-foreground">
                Set your keywords, domains, country, language, and time filters to target exactly the news you care about.
              </p>
            </div>
            <div className="flex flex-col items-center text-center gap-3">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Star className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold">2. Preview</h3>
              <p className="text-sm text-muted-foreground">
                See matching news articles in real-time before saving. Refine your filters until you get the perfect feed.
              </p>
            </div>
            <div className="flex flex-col items-center text-center gap-3">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Rss className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold">3. Subscribe</h3>
              <p className="text-sm text-muted-foreground">
                Get a unique proxy RSS URL to paste into any RSS reader. Your feed stays fresh and updates automatically.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
