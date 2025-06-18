-- Enable RLS on the chats table
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;

-- Enable RLS on the messages table
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Enable RLS on the streams table
ALTER TABLE streams ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to select their own chats
CREATE POLICY "Users can view their own chats" ON chats
FOR SELECT USING (user_id = auth.uid());

-- Policy to allow users to insert their own chats
CREATE POLICY "Users can insert their own chats" ON chats
FOR INSERT WITH CHECK (user_id = auth.uid());

-- Policy to allow users to update their own chats
CREATE POLICY "Users can update their own chats" ON chats
FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Policy to allow users to delete their own chats
CREATE POLICY "Users can delete their own chats" ON chats
FOR DELETE USING (user_id = auth.uid());

-- Policy to allow users to select messages from their own chats
CREATE POLICY "Users can view messages from their own chats" ON messages
FOR SELECT USING (
  chat_id IN (
    SELECT id FROM chats WHERE user_id = auth.uid()
  )
);

-- Policy to allow users to insert messages to their own chats
CREATE POLICY "Users can insert messages to their own chats" ON messages
FOR INSERT WITH CHECK (
  chat_id IN (
    SELECT id FROM chats WHERE user_id = auth.uid()
  )
);

-- Policy to allow users to update messages from their own chats
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

-- Policy to allow users to delete messages from their own chats
CREATE POLICY "Users can delete messages from their own chats" ON messages
FOR DELETE USING (
  chat_id IN (
    SELECT id FROM chats WHERE user_id = auth.uid()
  )
);

-- Policy to allow users to select streams from their own chats
CREATE POLICY "Users can view streams from their own chats" ON streams
FOR SELECT USING (
  chat_id IN (
    SELECT id FROM chats WHERE user_id = auth.uid()
  )
);

-- Policy to allow users to insert streams to their own chats
CREATE POLICY "Users can insert streams to their own chats" ON streams
FOR INSERT WITH CHECK (
  chat_id IN (
    SELECT id FROM chats WHERE user_id = auth.uid()
  )
);

-- Policy to allow users to update streams from their own chats
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

-- Policy to allow users to delete streams from their own chats
CREATE POLICY "Users can delete streams from their own chats" ON streams
FOR DELETE USING (
  chat_id IN (
    SELECT id FROM chats WHERE user_id = auth.uid()
  )
); 