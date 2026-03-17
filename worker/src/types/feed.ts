export interface Feed {
  id: string;
  user_id: string;
  name: string;
  slug: string;
  description: string | null;
  keywords: string[];
  exact_phrases: string[];
  excluded_keywords: string[];
  or_keywords: string[];
  domains: string[];
  country: string;
  language: string;
  ceid: string;
  time_range: string | null;
  date_after: string | null;
  date_before: string | null;
  generated_url: string;
  is_public: boolean;
  is_active: boolean;
  access_count: number;
  last_accessed: string | null;
  created_at: string;
  updated_at: string;
}

export interface FeedInput {
  name: string;
  slug: string;
  description?: string;
  keywords: string[];
  exact_phrases: string[];
  excluded_keywords: string[];
  or_keywords: string[];
  domains: string[];
  country: string;
  language: string;
  ceid: string;
  time_range?: string;
  date_after?: string;
  date_before?: string;
  is_public: boolean;
}
