-- Drop the foreign key constraint that's preventing Gmail tokens from being stored
ALTER TABLE public.gmail_tokens DROP CONSTRAINT IF EXISTS gmail_tokens_user_id_fkey;