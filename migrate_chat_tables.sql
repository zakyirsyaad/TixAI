-- Migration script to update chat tables to new schema
-- Run this in your Supabase SQL editor

-- First, drop existing tables if they exist (WARNING: This will delete all existing chat data)
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS chats CASCADE;

-- Create new chats table
CREATE TABLE chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- Create new messages table
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id UUID REFERENCES chats(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
  meta_json JSONB
);

-- Create new streams table
CREATE TABLE streams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id UUID REFERENCES chats(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'closed', 'error'))
);

-- Create indexes for better performance
CREATE INDEX idx_chats_user_id ON chats(user_id);
CREATE INDEX idx_messages_chat_id ON messages(chat_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);
CREATE INDEX idx_streams_chat_id ON streams(chat_id);
CREATE INDEX idx_streams_status ON streams(status);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc', now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for chats table
CREATE TRIGGER update_chats_updated_at 
    BEFORE UPDATE ON chats 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS on all tables
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE streams ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for chats
CREATE POLICY "Users can view their own chats" ON chats
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own chats" ON chats
FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own chats" ON chats
FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own chats" ON chats
FOR DELETE USING (user_id = auth.uid());

-- Create RLS policies for messages
CREATE POLICY "Users can view messages from their own chats" ON messages
FOR SELECT USING (
  chat_id IN (
    SELECT id FROM chats WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert messages to their own chats" ON messages
FOR INSERT WITH CHECK (
  chat_id IN (
    SELECT id FROM chats WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can update messages from their own chats" ON messages
FOR UPDATE USING (
  chat_id IN (
    SELECT id FROM chats WHERE user_id = auth.uid()
  )
) WITH CHECK (
  chat_id IN (
    SELECT id FROM chats WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete messages from their own chats" ON messages
FOR DELETE USING (
  chat_id IN (
    SELECT id FROM chats WHERE user_id = auth.uid()
  )
);

-- Create RLS policies for streams
CREATE POLICY "Users can view streams from their own chats" ON streams
FOR SELECT USING (
  chat_id IN (
    SELECT id FROM chats WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert streams to their own chats" ON streams
FOR INSERT WITH CHECK (
  chat_id IN (
    SELECT id FROM chats WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can update streams from their own chats" ON streams
FOR UPDATE USING (
  chat_id IN (
    SELECT id FROM chats WHERE user_id = auth.uid()
  )
) WITH CHECK (
  chat_id IN (
    SELECT id FROM chats WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete streams from their own chats" ON streams
FOR DELETE USING (
  chat_id IN (
    SELECT id FROM chats WHERE user_id = auth.uid()
  )
); 