export type Bindings = {
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  SUPABASE_SERVICE_KEY: string;
  FRONTEND_URL: string;
};

export type Variables = {
  user: { id: string; email: string } | null;
};
