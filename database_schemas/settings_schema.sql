-- Hero Settings Table
CREATE TABLE hero_settings (
  id integer PRIMARY KEY,
  title text NOT NULL,
  subtitle text NOT NULL,
  cta text NOT NULL
);

-- About Settings Table
CREATE TABLE about_settings (
  id integer PRIMARY KEY,
  vision text NOT NULL,
  mission text NOT NULL
);

-- Insert Default Values
INSERT INTO hero_settings (id, title, subtitle, cta) 
VALUES (1, 'We shape the Future of Real Estate', 'ED Infratech is redefining the landscape of modern living and commercial spaces. Discover our world-class projects designed for elegance and sustainability.', 'Explore Projects');

INSERT INTO about_settings (id, vision, mission) 
VALUES (1, 'To be the most trusted real estate developer...', 'To deliver exceptional value...');

-- Enable RLS
ALTER TABLE hero_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE about_settings ENABLE ROW LEVEL SECURITY;

-- Grant API access
GRANT SELECT, INSERT, UPDATE, DELETE ON hero_settings TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON about_settings TO anon;

-- Add policies for Hero
CREATE POLICY "Enable read access for anon" ON hero_settings FOR SELECT TO anon USING (true);
CREATE POLICY "Enable update access for anon" ON hero_settings FOR UPDATE TO anon USING (true);
CREATE POLICY "Enable insert access for anon" ON hero_settings FOR INSERT TO anon WITH CHECK (true);

-- Add policies for About
CREATE POLICY "Enable read access for anon" ON about_settings FOR SELECT TO anon USING (true);
CREATE POLICY "Enable update access for anon" ON about_settings FOR UPDATE TO anon USING (true);
CREATE POLICY "Enable insert access for anon" ON about_settings FOR INSERT TO anon WITH CHECK (true);
