/*
  # Seed Demo Data for ReeseBlank Platform

  1. Categories
    - Create product categories for organization

  2. Demo Products
    - Insert 10 premium demo products with real images
    - Set proper pricing, descriptions, and metadata
    - Mark some as featured and new

  3. Demo Drops
    - Create upcoming and past drops
    - Link products to drops

  4. Demo Battles
    - Create active style battles for the arena
    - Set proper voting data and end dates
*/

-- Insert Categories
INSERT INTO categories (name, slug, description, image_url) VALUES
  ('Hoodies & Sweatshirts', 'hoodies', 'Premium hoodies and sweatshirts for ultimate comfort', 'https://images.pexels.com/photos/1666071/pexels-photo-1666071.jpeg'),
  ('T-Shirts & Tops', 'tshirts', 'Luxury t-shirts and tops with unique designs', 'https://images.pexels.com/photos/1661471/pexels-photo-1661471.jpeg'),
  ('Bottoms', 'bottoms', 'Designer pants, joggers, and shorts', 'https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg'),
  ('Outerwear', 'outerwear', 'Premium jackets and outerwear pieces', 'https://images.pexels.com/photos/1124468/pexels-photo-1124468.jpeg'),
  ('Accessories', 'accessories', 'Premium accessories and jewelry', 'https://images.pexels.com/photos/1637652/pexels-photo-1637652.jpeg')
ON CONFLICT (slug) DO NOTHING;

-- Insert Demo Products
INSERT INTO products (name, slug, description, long_description, price, original_price, discount_percentage, image_url, images, category_id, is_featured, is_new, stock_quantity, materials, care_instructions, rating, reviews_count) VALUES
  (
    'Midnight Luxe Hoodie',
    'midnight-luxe-hoodie',
    'Premium heavyweight hoodie with embroidered logo. Perfect for street style.',
    'This premium hoodie combines comfort with luxury. Made from high-quality cotton blend with a soft fleece interior. Features an embroidered logo and kangaroo pocket. Perfect for layering or wearing solo.',
    85000,
    120000,
    29,
    'https://images.pexels.com/photos/1666071/pexels-photo-1666071.jpeg',
    ARRAY['https://images.pexels.com/photos/1666071/pexels-photo-1666071.jpeg', 'https://images.pexels.com/photos/1183266/pexels-photo-1183266.jpeg'],
    (SELECT id FROM categories WHERE slug = 'hoodies'),
    true,
    true,
    50,
    'Premium cotton blend (80% cotton, 20% polyester)',
    'Machine wash cold, tumble dry low, do not bleach',
    4.8,
    124
  ),
  (
    'Quantum Fade Tee',
    'quantum-fade-tee',
    'Gradient print luxury t-shirt with premium cotton construction.',
    'A statement piece featuring our signature gradient fade design. Made from premium organic cotton with a comfortable regular fit. The unique print process ensures vibrant colors that won''t fade.',
    35000,
    45000,
    22,
    'https://images.pexels.com/photos/1661471/pexels-photo-1661471.jpeg',
    ARRAY['https://images.pexels.com/photos/1661471/pexels-photo-1661471.jpeg', 'https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg'],
    (SELECT id FROM categories WHERE slug = 'tshirts'),
    true,
    false,
    100,
    'Organic cotton (100%)',
    'Machine wash cold, hang dry, iron on low heat',
    4.6,
    89
  ),
  (
    'Velocity Track Pants',
    'velocity-track-pants',
    'Technical joggers with reflective details and premium comfort.',
    'Performance meets style in these technical track pants. Features moisture-wicking fabric, reflective details for night visibility, and an adjustable waistband for the perfect fit.',
    75000,
    90000,
    17,
    'https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg',
    ARRAY['https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg', 'https://images.pexels.com/photos/1598508/pexels-photo-1598508.jpeg'],
    (SELECT id FROM categories WHERE slug = 'bottoms'),
    false,
    true,
    75,
    'Technical polyester blend with moisture-wicking properties',
    'Machine wash cold, tumble dry low, do not iron reflective details',
    4.7,
    67
  ),
  (
    'Urban Elite Bomber',
    'urban-elite-bomber',
    'Premium bomber jacket with luxury finishes and street-ready style.',
    'This bomber jacket elevates streetwear to new heights. Features premium materials, luxury hardware, and a comfortable fit that works for any occasion.',
    125000,
    150000,
    17,
    'https://images.pexels.com/photos/1124468/pexels-photo-1124468.jpeg',
    ARRAY['https://images.pexels.com/photos/1124468/pexels-photo-1124468.jpeg', 'https://images.pexels.com/photos/1183266/pexels-photo-1183266.jpeg'],
    (SELECT id FROM categories WHERE slug = 'outerwear'),
    true,
    false,
    30,
    'Premium nylon shell with polyester lining',
    'Dry clean only',
    4.9,
    156
  ),
  (
    'Neon Nights Crop Top',
    'neon-nights-crop-top',
    'Vibrant crop top with glow-in-the-dark accents for night events.',
    'Stand out in the crowd with this eye-catching crop top. Features glow-in-the-dark elements and a comfortable stretch fit perfect for festivals and night events.',
    42000,
    55000,
    24,
    'https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg',
    ARRAY['https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg', 'https://images.pexels.com/photos/1661471/pexels-photo-1661471.jpeg'],
    (SELECT id FROM categories WHERE slug = 'tshirts'),
    true,
    true,
    60,
    'Stretch cotton blend with special glow pigments',
    'Hand wash cold, air dry, avoid direct sunlight',
    4.5,
    78
  ),
  (
    'Apex Chain Necklace',
    'apex-chain-necklace',
    'Premium titanium chain with logo pendant and luxury finish.',
    'Complete your look with this statement necklace. Made from premium titanium with our signature logo pendant. Hypoallergenic and built to last.',
    45000,
    55000,
    18,
    'https://images.pexels.com/photos/1637652/pexels-photo-1637652.jpeg',
    ARRAY['https://images.pexels.com/photos/1637652/pexels-photo-1637652.jpeg'],
    (SELECT id FROM categories WHERE slug = 'accessories'),
    true,
    false,
    25,
    'Premium titanium with gold-plated accents',
    'Clean with soft cloth, store in provided pouch',
    4.8,
    92
  ),
  (
    'Shadow Denim Jacket',
    'shadow-denim-jacket',
    'Distressed denim jacket with custom patches and vintage wash.',
    'This vintage-inspired denim jacket features custom distressing, unique patches, and a perfectly broken-in feel. Each piece is individually treated for a one-of-a-kind look.',
    95000,
    115000,
    17,
    'https://images.pexels.com/photos/1183266/pexels-photo-1183266.jpeg',
    ARRAY['https://images.pexels.com/photos/1183266/pexels-photo-1183266.jpeg', 'https://images.pexels.com/photos/1124468/pexels-photo-1124468.jpeg'],
    (SELECT id FROM categories WHERE slug = 'outerwear'),
    false,
    true,
    40,
    '100% premium denim cotton',
    'Machine wash cold inside out, hang dry',
    4.6,
    103
  ),
  (
    'Cyber Mesh Tank',
    'cyber-mesh-tank',
    'Futuristic mesh tank top with metallic accents and breathable design.',
    'Step into the future with this innovative mesh tank. Features metallic threading, breathable construction, and a bold silhouette that makes a statement.',
    38000,
    48000,
    21,
    'https://images.pexels.com/photos/1598508/pexels-photo-1598508.jpeg',
    ARRAY['https://images.pexels.com/photos/1598508/pexels-photo-1598508.jpeg', 'https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg'],
    (SELECT id FROM categories WHERE slug = 'tshirts'),
    false,
    true,
    55,
    'Technical mesh with metallic threading',
    'Hand wash cold, air dry, do not wring',
    4.4,
    67
  ),
  (
    'Retro Wave Shorts',
    'retro-wave-shorts',
    'Vintage-inspired shorts with bold graphics and comfortable fit.',
    'These retro-inspired shorts bring back the best of vintage streetwear. Features bold graphics, comfortable elastic waistband, and premium cotton construction.',
    52000,
    65000,
    20,
    'https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg',
    ARRAY['https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg'],
    (SELECT id FROM categories WHERE slug = 'bottoms'),
    true,
    false,
    70,
    'Premium cotton with vintage wash treatment',
    'Machine wash warm, tumble dry medium',
    4.7,
    85
  ),
  (
    'Holographic Windbreaker',
    'holographic-windbreaker',
    'Iridescent windbreaker with color-shifting technology and weather protection.',
    'This cutting-edge windbreaker features holographic material that shifts colors in different lighting. Lightweight, water-resistant, and perfect for making a statement.',
    110000,
    135000,
    19,
    'https://images.pexels.com/photos/1666071/pexels-photo-1666071.jpeg',
    ARRAY['https://images.pexels.com/photos/1666071/pexels-photo-1666071.jpeg', 'https://images.pexels.com/photos/1124468/pexels-photo-1124468.jpeg'],
    (SELECT id FROM categories WHERE slug = 'outerwear'),
    true,
    true,
    35,
    'Holographic polyester with water-resistant coating',
    'Spot clean only, do not machine wash',
    4.8,
    112
  )
ON CONFLICT (slug) DO NOTHING;

-- Insert Demo Drops
INSERT INTO drops (name, description, drop_date, starting_price, quantity, image_url) VALUES
  (
    'Neon Nights Collection',
    'Limited edition neon-inspired streetwear collection featuring glow-in-the-dark elements and vibrant colors.',
    '2024-03-15 18:00:00+00',
    50000,
    100,
    'https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg'
  ),
  (
    'Urban Legends Drop',
    'Exclusive collaboration with street artists featuring unique designs and premium materials.',
    '2024-03-20 20:00:00+00',
    75000,
    50,
    'https://images.pexels.com/photos/1124468/pexels-photo-1124468.jpeg'
  ),
  (
    'Cyber Future Collection',
    'Futuristic designs with holographic materials and tech-inspired aesthetics.',
    '2024-03-25 19:00:00+00',
    85000,
    75,
    'https://images.pexels.com/photos/1598508/pexels-photo-1598508.jpeg'
  ),
  (
    'Retro Revival',
    'Vintage-inspired pieces with modern twists and premium construction.',
    '2024-02-01 18:00:00+00',
    60000,
    80,
    'https://images.pexels.com/photos/1183266/pexels-photo-1183266.jpeg'
  )
ON CONFLICT DO NOTHING;

-- Link products to drops
INSERT INTO drop_products (drop_id, product_id, drop_price, quantity) VALUES
  (
    (SELECT id FROM drops WHERE name = 'Neon Nights Collection'),
    (SELECT id FROM products WHERE slug = 'neon-nights-crop-top'),
    42000,
    30
  ),
  (
    (SELECT id FROM drops WHERE name = 'Neon Nights Collection'),
    (SELECT id FROM products WHERE slug = 'cyber-mesh-tank'),
    38000,
    25
  ),
  (
    (SELECT id FROM drops WHERE name = 'Urban Legends Drop'),
    (SELECT id FROM products WHERE slug = 'urban-elite-bomber'),
    125000,
    20
  ),
  (
    (SELECT id FROM drops WHERE name = 'Urban Legends Drop'),
    (SELECT id FROM products WHERE slug = 'shadow-denim-jacket'),
    95000,
    30
  ),
  (
    (SELECT id FROM drops WHERE name = 'Cyber Future Collection'),
    (SELECT id FROM products WHERE slug = 'holographic-windbreaker'),
    110000,
    35
  ),
  (
    (SELECT id FROM drops WHERE name = 'Retro Revival'),
    (SELECT id FROM products WHERE slug = 'retro-wave-shorts'),
    52000,
    40
  )
ON CONFLICT DO NOTHING;

-- Insert Demo Battles
INSERT INTO battles (title, description, image_a_url, image_b_url, outfit_a_description, outfit_b_description, votes_a, votes_b, ends_at) VALUES
  (
    'Street vs. Formal',
    'Which look wins: streetwear comfort or formal elegance?',
    'https://images.pexels.com/photos/1666071/pexels-photo-1666071.jpeg',
    'https://images.pexels.com/photos/1661471/pexels-photo-1661471.jpeg',
    'Relaxed hoodie with distressed jeans and fresh sneakers',
    'Tailored blazer with slim pants and leather shoes',
    156,
    89,
    '2024-03-15 23:59:59+00'
  ),
  (
    'Monochrome vs. Color Pop',
    'Black and white minimalism or bold color statement?',
    'https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg',
    'https://images.pexels.com/photos/1637652/pexels-photo-1637652.jpeg',
    'All-black ensemble with subtle texture play',
    'Vibrant color-blocked outfit with neon accents',
    203,
    178,
    '2024-03-18 23:59:59+00'
  ),
  (
    'Vintage vs. Futuristic',
    'Retro vibes or cutting-edge tech wear?',
    'https://images.pexels.com/photos/1183266/pexels-photo-1183266.jpeg',
    'https://images.pexels.com/photos/1598508/pexels-photo-1598508.jpeg',
    'Classic denim jacket with vintage band tee',
    'Holographic materials with tech accessories',
    134,
    167,
    '2024-03-20 23:59:59+00'
  ),
  (
    'Comfort vs. Style',
    'Cozy comfort or sharp style statement?',
    'https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg',
    'https://images.pexels.com/photos/1124468/pexels-photo-1124468.jpeg',
    'Oversized hoodie with joggers and slides',
    'Fitted bomber with tailored pants and boots',
    98,
    142,
    '2024-03-22 23:59:59+00'
  )
ON CONFLICT DO NOTHING;