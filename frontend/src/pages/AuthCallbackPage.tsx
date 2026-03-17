import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function AuthCallbackPage() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setError("Verification timed out. Please try signing in again.");
    }, 10_000);

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN") {
        clearTimeout(timeout);
        navigate("/dashboard", { replace: true });
      }
    });

    // Also handle the case where the hash is already processed
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        clearTimeout(timeout);
        navigate("/dashboard", { replace: true });
      }
    });

    return () => {
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, [navigate]);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[70vh] px-4 text-center">
        <div className="space-y-4">
          <p className="text-destructive font-medium">{error}</p>
          <a href="/login" className="text-sm text-primary underline">Try again</a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[70vh]">
      <div className="text-center space-y-3">
        <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm text-muted-foreground">Verifying your login...</p>
      </div>
    </div>
  );
}
