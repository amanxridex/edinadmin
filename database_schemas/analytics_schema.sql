-- Analytics Events Table
CREATE TABLE analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_id text NOT NULL,
  path text NOT NULL,
  referrer text,
  user_agent text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Grant API access
GRANT SELECT, INSERT, UPDATE, DELETE ON analytics_events TO anon;

-- Add policies
CREATE POLICY "Enable insert access for anon" ON analytics_events FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Enable read access for anon" ON analytics_events FOR SELECT TO anon USING (true);
