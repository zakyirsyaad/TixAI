# Chat System Refactor

## Overview

Sistem chat telah direfactor sesuai dengan skema database yang baru untuk mendukung fitur chat yang lebih robust dengan streaming dan persistence yang lebih baik.

## Database Schema Baru

### 1. Tabel `chats`

```sql
CREATE TABLE chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);
```

### 2. Tabel `messages`

```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id UUID REFERENCES chats(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
  meta_json JSONB
);
```

### 3. Tabel `streams` (Opsional untuk fitur resume)

```sql
CREATE TABLE streams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id UUID REFERENCES chats(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'closed', 'error'))
);
```

## Fitur Baru

### 1. ChatBox sebagai Entry Point

- User mengetik pesan pertama di ChatBox di halaman home
- Sistem otomatis membuat chat baru dengan title dari pesan pertama
- User diarahkan ke halaman chat individual `/chat/[id]`

### 2. AI Response Otomatis

- Saat user masuk ke halaman chat, AI langsung merespons pesan pertama
- Streaming response dengan persistence ke database
- Error handling yang lebih baik

### 3. Chat Management

- List semua chat user
- Delete chat dengan cascade ke messages
- Update chat title
- Proper RLS policies untuk isolasi data

## File yang Diperbarui

### 1. Database & Types

- `create_chat_tables.sql` - Script untuk membuat tabel baru
- `migrate_chat_tables.sql` - Script migrasi (hapus data lama)
- `supabase_chat_policies.sql` - RLS policies yang diperbarui
- `src/types/supabase.ts` - Type definitions yang diperbarui

### 2. Chat Store

- `src/tools/chat-store.ts` - Completely refactored dengan fungsi baru:
  - `createChat(title?)` - Buat chat baru dengan optional title
  - `loadChat(chatId)` - Load messages untuk chat tertentu
  - `saveMessages(chatId, messages)` - Save messages ke chat
  - `createStream(chatId, streamId)` - Create stream untuk chat
  - `updateStreamStatus(streamId, status)` - Update status stream
  - `getLatestStream(chatId)` - Get latest active stream
  - `updateChatTitle(chatId, title)` - Update judul chat
  - `deleteChat(chatId)` - Delete chat dan semua messages
  - `getUserChats()` - Get semua chat user

### 3. Components

- `src/components/layout/business/home/ChatBox.tsx` - Updated untuk create chat dengan title
- `src/components/layout/business/chat/chat.tsx` - Better error handling dan debugging
- `src/components/layout/business/chat/ChatList.tsx` - Sudah compatible

### 4. API Routes

- `src/app/api/chat/route.ts` - Updated untuk menggunakan fungsi baru dan better error handling

### 5. Pages

- `src/app/organizations/chat/[id]/page.tsx` - Better error handling
- `src/app/organizations/chat/list/page.tsx` - Sudah compatible

## Cara Implementasi

### 1. Database Migration

```bash
# Jalankan script migrasi di Supabase SQL Editor
# File: migrate_chat_tables.sql
```

### 2. Update Types

```bash
# Generate types baru dari Supabase
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/supabase.ts
```

### 3. Test Flow

1. User login
2. User mengetik pesan di ChatBox di halaman home
3. Sistem create chat baru dengan title dari pesan
4. User diarahkan ke `/organizations/chat/[id]`
5. AI langsung merespons dengan streaming
6. Messages tersimpan di database
7. User bisa lanjut chat atau kembali ke list

## Error Handling

### 1. User tidak terautentikasi

- Redirect ke login page
- Clear error message

### 2. Data organisasi kosong

- Tampilkan pesan "Please Add Data Event Organizations First"
- User harus tambah data dulu

### 3. Chat tidak ditemukan

- Redirect ke chat list
- Clear error message

### 4. Database error

- Log error untuk debugging
- Tampilkan user-friendly error message

## Performance Optimizations

### 1. Database Indexes

- `idx_chats_user_id` - Untuk query chat per user
- `idx_messages_chat_id` - Untuk query messages per chat
- `idx_messages_created_at` - Untuk sorting messages
- `idx_streams_chat_id` - Untuk query streams per chat
- `idx_streams_status` - Untuk query active streams

### 2. Cascade Deletes

- Delete chat otomatis delete semua messages dan streams
- Tidak perlu manual cleanup

### 3. Optimized Queries

- Hanya load messages yang diperlukan
- Proper pagination untuk chat list
- Efficient RLS policies

## Security

### 1. Row Level Security (RLS)

- User hanya bisa akses chat mereka sendiri
- Messages dan streams terisolasi per user
- Proper authentication checks

### 2. Input Validation

- Validate message content
- Sanitize user input
- Check user permissions

### 3. Error Handling

- Tidak expose sensitive information
- Proper error logging
- User-friendly error messages

## Testing Checklist

- [ ] User bisa create chat baru dari ChatBox
- [ ] Chat title otomatis dari pesan pertama
- [ ] AI langsung respond di halaman chat
- [ ] Messages tersimpan di database
- [ ] Chat list menampilkan semua chat user
- [ ] Delete chat berfungsi dengan cascade
- [ ] Error handling untuk berbagai scenario
- [ ] RLS policies berfungsi dengan benar
- [ ] Streaming response berfungsi
- [ ] Performance acceptable untuk banyak messages

## Troubleshooting

### 1. Chat tidak ter-create

- Check user authentication
- Check database permissions
- Check RLS policies

### 2. AI tidak respond

- Check organization data exists
- Check API key configuration
- Check streaming setup

### 3. Messages tidak tersimpan

- Check database connection
- Check message format
- Check RLS policies

### 4. Performance issues

- Check database indexes
- Check query optimization
- Check caching strategy
