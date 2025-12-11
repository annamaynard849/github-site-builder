-- Create table to store grief support answers
CREATE TABLE public.grief_support_answers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  question_key VARCHAR(100) NOT NULL,
  answer TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, question_key)
);

-- Enable RLS
ALTER TABLE public.grief_support_answers ENABLE ROW LEVEL SECURITY;

-- Create policies for grief support answers
CREATE POLICY "Users can manage their own grief support answers" 
ON public.grief_support_answers FOR ALL 
USING (user_id = auth.uid());