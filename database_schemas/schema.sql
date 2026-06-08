-- 1. Create a table for Hero Settings
CREATE TABLE hero_settings (
  id integer PRIMARY KEY DEFAULT 1,
  title text NOT NULL,
  subtitle text NOT NULL,
  cta text NOT NULL
);

-- Insert initial data
INSERT INTO hero_settings (id, title, subtitle, cta) 
VALUES (1, 'We shape the Future of Real Estate', 'ED Infratech is redefining the landscape of modern living and commercial spaces. Discover our world-class projects designed for elegance and sustainability.', 'Explore Projects');

-- 2. Create a table for About Settings
CREATE TABLE about_settings (
  id integer PRIMARY KEY DEFAULT 1,
  vision text NOT NULL,
  mission text NOT NULL
);

-- Insert initial data
INSERT INTO about_settings (id, vision, mission) 
VALUES (1, 'Founded on the principles of design excellence and structural integrity...', 'Our mission is to consistently deliver exceptional value...');

-- 3. Set up Row Level Security (RLS) so anyone can read/write for now
-- Note: In a production app, you would restrict writes to authenticated admins only.
ALTER TABLE hero_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE about_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON hero_settings FOR SELECT USING (true);
CREATE POLICY "Enable update access for all users" ON hero_settings FOR UPDATE USING (true);
CREATE POLICY "Enable insert access for all users" ON hero_settings FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable read access for all users" ON about_settings FOR SELECT USING (true);
CREATE POLICY "Enable update access for all users" ON about_settings FOR UPDATE USING (true);
CREATE POLICY "Enable insert access for all users" ON about_settings FOR INSERT WITH CHECK (true);
