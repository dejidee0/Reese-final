/*
  # Fix Admin Setup - Remove Foreign Key Constraint Issues

  1. Functions
    - Function to create admin user with proper profile setup
    - Function to check if any admin exists
    - Function to promote user to admin
    - Function to handle new user registration

  2. Security
    - Proper RLS policies
    - Safe admin creation without foreign key violations

  Note: This migration removes the placeholder admin creation that was causing foreign key issues
*/

-- Ensure the profiles table exists with proper structure
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE,
  first_name TEXT,
  last_name TEXT,
  avatar_url TEXT,
  tier TEXT DEFAULT 'guest' CHECK (tier IN ('guest', 'member', 'vip')),
  points INTEGER DEFAULT 0,
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS if not already enabled
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' 
    AND policyname = 'Users can view their own profile'
  ) THEN
    ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
    
    CREATE POLICY "Users can view their own profile" ON profiles 
      FOR SELECT USING (auth.uid() = user_id);
    
    CREATE POLICY "Users can update their own profile" ON profiles 
      FOR UPDATE USING (auth.uid() = user_id);
      
    CREATE POLICY "Users can insert their own profile" ON profiles 
      FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- Function to check if any admin user exists
CREATE OR REPLACE FUNCTION check_admin_exists()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles WHERE is_admin = true
  );
END;
$$;

-- Function to create admin profile for authenticated user
CREATE OR REPLACE FUNCTION create_admin_profile(
  admin_email TEXT,
  first_name TEXT DEFAULT 'Admin',
  last_name TEXT DEFAULT 'User'
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_user_id UUID;
  existing_profile profiles%ROWTYPE;
BEGIN
  -- Get the current authenticated user ID
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'message', 'User must be authenticated'
    );
  END IF;
  
  -- Check if this user already has a profile
  SELECT * INTO existing_profile FROM profiles WHERE user_id = current_user_id;
  
  IF existing_profile.id IS NOT NULL THEN
    -- Update existing profile to admin
    UPDATE profiles 
    SET 
      is_admin = true,
      tier = 'vip',
      points = GREATEST(points, 10000),
      email = admin_email,
      first_name = first_name,
      last_name = last_name,
      updated_at = now()
    WHERE user_id = current_user_id;
    
    RETURN json_build_object(
      'success', true,
      'message', 'Profile updated to admin successfully',
      'user_id', current_user_id
    );
  ELSE
    -- Insert new admin profile
    INSERT INTO profiles (
      user_id,
      email,
      first_name,
      last_name,
      tier,
      points,
      is_admin,
      created_at,
      updated_at
    ) VALUES (
      current_user_id,
      admin_email,
      first_name,
      last_name,
      'vip',
      10000,
      true,
      now(),
      now()
    );

    RETURN json_build_object(
      'success', true,
      'message', 'Admin profile created successfully',
      'user_id', current_user_id
    );
  END IF;
END;
$$;

-- Function to promote existing user to admin by email
CREATE OR REPLACE FUNCTION promote_to_admin(user_email TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_profile profiles%ROWTYPE;
BEGIN
  -- Find user by email
  SELECT * INTO user_profile FROM profiles WHERE email = user_email;
  
  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'message', 'User not found'
    );
  END IF;

  -- Update user to admin
  UPDATE profiles 
  SET 
    is_admin = true,
    tier = 'vip',
    points = GREATEST(points, 10000),
    updated_at = now()
  WHERE email = user_email;

  RETURN json_build_object(
    'success', true,
    'message', 'User promoted to admin successfully'
  );
END;
$$;

-- Function to handle new user registration and create profile
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO profiles (user_id, email, first_name, last_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', 'User'),
    COALESCE(NEW.raw_user_meta_data->>'last_name', '')
  );
  RETURN NEW;
END;
$$;

-- Create trigger for new user registration (if it doesn't exist)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'on_auth_user_created'
  ) THEN
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION handle_new_user();
  END IF;
END $$;