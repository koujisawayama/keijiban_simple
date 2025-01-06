/*
  # Community Activity Platform Schema

  1. New Tables
    - `activities`
      - `id` (uuid, primary key)
      - `content` (text) - The activity content
      - `user_id` (uuid) - Reference to auth.users
      - `created_at` (timestamp)
    
  2. Security
    - Enable RLS on activities table
    - Policies:
      - Users can read all activities
      - Users can only create their own activities
      - Users can only update/delete their own activities
*/

-- Create activities table
CREATE TABLE IF NOT EXISTS activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content text NOT NULL,
  user_id uuid NOT NULL REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Allow users to read all activities
CREATE POLICY "Anyone can view activities"
  ON activities
  FOR SELECT
  USING (true);

-- Allow authenticated users to create activities
CREATE POLICY "Users can create their own activities"
  ON activities
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own activities
CREATE POLICY "Users can update their own activities"
  ON activities
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Allow users to delete their own activities
CREATE POLICY "Users can delete their own activities"
  ON activities
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS activities_user_id_idx ON activities(user_id);
CREATE INDEX IF NOT EXISTS activities_created_at_idx ON activities(created_at DESC);