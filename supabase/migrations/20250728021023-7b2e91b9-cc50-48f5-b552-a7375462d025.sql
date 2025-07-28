-- Create table for storing Gmail OAuth tokens
CREATE TABLE public.gmail_tokens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, email)
);

-- Enable RLS
ALTER TABLE public.gmail_tokens ENABLE ROW LEVEL SECURITY;

-- Create policies - only allow system access for now (will be managed by edge functions)
CREATE POLICY "Service role can manage gmail tokens" 
ON public.gmail_tokens 
FOR ALL 
USING (false);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_gmail_tokens_updated_at
BEFORE UPDATE ON public.gmail_tokens
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();