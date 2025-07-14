/*
  # Create Admin User Setup

  1. Functions
    - Function to create admin user with proper profile setup
    - Function to check if any admin exists
    - Function to promote user to admin

  2. Security
    - Only allow admin creation if no admin exists
    - Proper profile creation with admin privileges
*/

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

-- Function to create first admin user
CREATE OR REPLACE FUNCTION create_first_admin(
  admin_email TEXT,
  admin_password TEXT,
  first_name TEXT DEFAULT 'Admin',
  last_name TEXT DEFAULT 'User'
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_user_id UUID;
  admin_exists BOOLEAN;
BEGIN
  -- Check if admin already exists
  SELECT check_admin_exists() INTO admin_exists;
  
  IF admin_exists THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Admin user already exists'
    );
  END IF;

  -- Create the auth user (this would typically be done via Supabase Auth API)
  -- For now, we'll create a profile that can be linked to a user
  
  -- Generate a UUID for the new user
  new_user_id := gen_random_uuid();
  
  -- Insert admin profile
  INSERT INTO profiles (
    id,
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
    gen_random_uuid(),
    new_user_id,
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
    'message', 'Admin user profile created successfully',
    'user_id', new_user_id
  );
END;
$$;

-- Function to promote existing user to admin
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

-- Create default admin user if none exists
-- This will create a profile that needs to be linked to an actual auth user
DO $$
DECLARE
  admin_exists BOOLEAN;
BEGIN
  SELECT check_admin_exists() INTO admin_exists;
  
  IF NOT admin_exists THEN
    -- Create default admin profile
    INSERT INTO profiles (
      id,
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
      gen_random_uuid(),
      gen_random_uuid(), -- This will need to be updated when actual user signs up
      'admin@reeseblanks.com',
      'Admin',
      'User',
      'vip',
      10000,
      true,
      now(),
      now()
    );
    
    RAISE NOTICE 'Default admin profile created with email: admin@reeseblanks.com';
  END IF;
END $$;