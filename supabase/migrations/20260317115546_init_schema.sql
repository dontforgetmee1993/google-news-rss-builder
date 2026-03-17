CREATE TABLE public.feeds (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id       UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name          VARCHAR(255) NOT NULL,
  slug          VARCHAR(100) UNIQUE NOT NULL,
  description   TEXT,
  keywords      TEXT[] DEFAULT '{}',
  exact_phrases TEXT[] DEFAULT '{}',
  excluded_keywords TEXT[] DEFAULT '{}',
  or_keywords   TEXT[] DEFAULT '{}',
  domains       TEXT[] DEFAULT '{}',
  country       VARCHAR(5) DEFAULT 'US',
  language      VARCHAR(10) DEFAULT 'en-US',
  ceid          VARCHAR(20) DEFAULT 'US:en',
  time_range    VARCHAR(10),
  date_after    DATE,
  date_before   DATE,
  generated_url TEXT NOT NULL,
  is_public     BOOLEAN DEFAULT false,
  is_active     BOOLEAN DEFAULT true,
  access_count  INTEGER DEFAULT 0,
  last_accessed TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_feeds_user_id ON public.feeds(user_id);
CREATE INDEX idx_feeds_slug ON public.feeds(slug);
CREATE INDEX idx_feeds_is_active ON public.feeds(is_active);

ALTER TABLE public.feeds ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own feeds"
  ON public.feeds FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own feeds"
  ON public.feeds FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own feeds"
  ON public.feeds FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own feeds"
  ON public.feeds FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Public feeds viewable by everyone"
  ON public.feeds FOR SELECT USING (is_public = true);

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER feeds_updated_at
  BEFORE UPDATE ON public.feeds
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
