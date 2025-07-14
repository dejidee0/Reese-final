/*
  # Create Lookbook Tables

  1. New Tables
    - `lookbook` - Main lookbook entries with cover images, videos, and descriptions
    - `lookbook_products` - Junction table linking looks to products with sizes
    - `lookbook_likes` - User likes for lookbook entries

  2. Security
    - Enable RLS on all tables
    - Add policies for public read access and authenticated user interactions
*/

-- Create lookbook table
CREATE TABLE IF NOT EXISTS lookbook (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  cover_image TEXT NOT NULL,
  video_url TEXT,
  category TEXT,
  total_price DECIMAL(10,2) DEFAULT 0,
  likes_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create lookbook_products junction table
CREATE TABLE IF NOT EXISTS lookbook_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lookbook_id UUID REFERENCES lookbook(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  size TEXT DEFAULT 'M',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(lookbook_id, product_id)
);

-- Create lookbook_likes table
CREATE TABLE IF NOT EXISTS lookbook_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lookbook_id UUID REFERENCES lookbook(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(lookbook_id, user_id)
);

-- Enable Row Level Security
ALTER TABLE lookbook ENABLE ROW LEVEL SECURITY;
ALTER TABLE lookbook_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE lookbook_likes ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view active lookbook entries" ON lookbook FOR SELECT USING (is_active = true);
CREATE POLICY "Anyone can view lookbook products" ON lookbook_products FOR SELECT USING (true);
CREATE POLICY "Users can manage their own likes" ON lookbook_likes FOR ALL USING (auth.uid() = user_id);

-- Insert demo lookbook data
INSERT INTO lookbook (title, description, cover_image, category, total_price) VALUES
  (
    'Urban Night Vibes',
    'Perfect for those late-night city adventures. Dark tones with bold accents that make a statement.',
    'https://images.pexels.com/photos/1666071/pexels-photo-1666071.jpeg',
    'Street Style',
    160000
  ),
  (
    'Minimalist Chic',
    'Clean lines and neutral tones for the modern minimalist. Effortless style that speaks volumes.',
    'https://images.pexels.com/photos/1661471/pexels-photo-1661471.jpeg',
    'Casual',
    110000
  ),
  (
    'Neon Dreams',
    'Embrace the future with vibrant colors and tech-inspired pieces. Stand out from the crowd.',
    'https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg',
    'Futuristic',
    125000
  ),
  (
    'Retro Revival',
    'Vintage-inspired pieces with a modern twist. Timeless style that never goes out of fashion.',
    'https://images.pexels.com/photos/1183266/pexels-photo-1183266.jpeg',
    'Vintage',
    147000
  ),
  (
    'Athletic Luxe',
    'Where comfort meets style. Premium athletic wear for the fashion-conscious fitness enthusiast.',
    'https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg',
    'Athletic',
    127000
  )
ON CONFLICT DO NOTHING;

-- Link products to lookbook entries
INSERT INTO lookbook_products (lookbook_id, product_id, size) VALUES
  -- Urban Night Vibes (Hoodie + Pants)
  (
    (SELECT id FROM lookbook WHERE title = 'Urban Night Vibes'),
    (SELECT id FROM products WHERE slug = 'midnight-luxe-hoodie'),
    'L'
  ),
  (
    (SELECT id FROM lookbook WHERE title = 'Urban Night Vibes'),
    (SELECT id FROM products WHERE slug = 'velocity-track-pants'),
    'L'
  ),
  
  -- Minimalist Chic (Tee + Shorts)
  (
    (SELECT id FROM lookbook WHERE title = 'Minimalist Chic'),
    (SELECT id FROM products WHERE slug = 'quantum-fade-tee'),
    'M'
  ),
  (
    (SELECT id FROM lookbook WHERE title = 'Minimalist Chic'),
    (SELECT id FROM products WHERE slug = 'retro-wave-shorts'),
    'M'
  ),
  (
    (SELECT id FROM lookbook WHERE title = 'Minimalist Chic'),
    (SELECT id FROM products WHERE slug = 'apex-chain-necklace'),
    'One Size'
  ),
  
  -- Neon Dreams (Crop Top + Windbreaker)
  (
    (SELECT id FROM lookbook WHERE title = 'Neon Dreams'),
    (SELECT id FROM products WHERE slug = 'neon-nights-crop-top'),
    'S'
  ),
  (
    (SELECT id FROM lookbook WHERE title = 'Neon Dreams'),
    (SELECT id FROM products WHERE slug = 'cyber-mesh-tank'),
    'S'
  ),
  (
    (SELECT id FROM lookbook WHERE title = 'Neon Dreams'),
    (SELECT id FROM products WHERE slug = 'apex-chain-necklace'),
    'One Size'
  ),
  
  -- Retro Revival (Denim + Tee)
  (
    (SELECT id FROM lookbook WHERE title = 'Retro Revival'),
    (SELECT id FROM products WHERE slug = 'shadow-denim-jacket'),
    'M'
  ),
  (
    (SELECT id FROM lookbook WHERE title = 'Retro Revival'),
    (SELECT id FROM products WHERE slug = 'retro-wave-shorts'),
    'M'
  ),
  
  -- Athletic Luxe (Track Pants + Tank)
  (
    (SELECT id FROM lookbook WHERE title = 'Athletic Luxe'),
    (SELECT id FROM products WHERE slug = 'velocity-track-pants'),
    'M'
  ),
  (
    (SELECT id FROM lookbook WHERE title = 'Athletic Luxe'),
    (SELECT id FROM products WHERE slug = 'cyber-mesh-tank'),
    'M'
  ),
  (
    (SELECT id FROM lookbook WHERE title = 'Athletic Luxe'),
    (SELECT id FROM products WHERE slug = 'retro-wave-shorts'),
    'M'
  )
ON CONFLICT DO NOTHING;