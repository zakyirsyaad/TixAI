-- ALTER TABLE script to change UUID columns to TEXT
-- Run this in your Supabase SQL editor

-- First, drop all RLS policies
DROP POLICY IF EXISTS "Users can view their own chats" ON chats;
DROP POLICY IF EXISTS "Users can insert their own chats" ON chats;
DROP POLICY IF EXISTS "Users can update their own chats" ON chats;
DROP POLICY IF EXISTS "Users can delete their own chats" ON chats;

DROP POLICY IF EXISTS "Users can view messages from their own chats" ON messages;
DROP POLICY IF EXISTS "Users can insert messages to their own chats" ON messages;
DROP POLICY IF EXISTS "Users can update messages from their own chats" ON messages;
DROP POLICY IF EXISTS "Users can delete messages from their own chats" ON messages;

DROP POLICY IF EXISTS "Users can view streams from their own chats" ON streams;
DROP POLICY IF EXISTS "Users can insert streams to their own chats" ON streams;
DROP POLICY IF EXISTS "Users can update streams from their own chats" ON streams;
DROP POLICY IF EXISTS "Users can delete streams from their own chats" ON streams;

-- Drop foreign key constraints
ALTER TABLE messages DROP CONSTRAINT IF EXISTS messages_chat_id_fkey;
ALTER TABLE streams DROP CONSTRAINT IF EXISTS streams_chat_id_fkey;

-- Change chats.id from UUID to TEXT
ALTER TABLE chats ALTER COLUMN id TYPE TEXT;

-- Change messages.id from UUID to TEXT
ALTER TABLE messages ALTER COLUMN id TYPE TEXT;

-- Change messages.chat_id from UUID to TEXT
ALTER TABLE messages ALTER COLUMN chat_id TYPE TEXT;

-- Change streams.id from UUID to TEXT
ALTER TABLE streams ALTER COLUMN id TYPE TEXT;

-- Change streams.chat_id from UUID to TEXT
ALTER TABLE streams ALTER COLUMN chat_id TYPE TEXT;

-- Recreate foreign key constraints
ALTER TABLE messages ADD CONSTRAINT messages_chat_id_fkey 
  FOREIGN KEY (chat_id) REFERENCES chats(id) ON DELETE CASCADE;

ALTER TABLE streams ADD CONSTRAINT streams_chat_id_fkey 
  FOREIGN KEY (chat_id) REFERENCES chats(id) ON DELETE CASCADE;

-- Update indexes if needed
DROP INDEX IF EXISTS idx_messages_chat_id;
CREATE INDEX idx_messages_chat_id ON messages(chat_id);

DROP INDEX IF EXISTS idx_streams_chat_id;
CREATE INDEX idx_streams_chat_id ON streams(chat_id);

-- Recreate RLS policies for chats
CREATE POLICY "Users can view their own chats" ON chats
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own chats" ON chats
FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own chats" ON chats
FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own chats" ON chats
FOR DELETE USING (user_id = auth.uid());

-- Recreate RLS policies for messages
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

-- Recreate RLS policies for streams
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