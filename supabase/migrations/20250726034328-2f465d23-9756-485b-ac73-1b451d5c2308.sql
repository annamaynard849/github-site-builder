-- Create memorial pages table
CREATE TABLE public.memorial_pages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  loved_one_id UUID NOT NULL REFERENCES public.loved_ones(id) ON DELETE CASCADE,
  slug VARCHAR(100) NOT NULL UNIQUE,
  title TEXT,
  description TEXT,
  theme_color VARCHAR(7) DEFAULT '#6366f1',
  background_image_url TEXT,
  is_public BOOLEAN DEFAULT true,
  custom_css TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create memorial memories table for photos/videos
CREATE TABLE public.memorial_memories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  memorial_page_id UUID NOT NULL REFERENCES public.memorial_pages(id) ON DELETE CASCADE,
  uploaded_by_user_id UUID REFERENCES public.profiles(user_id),
  uploaded_by_name VARCHAR(255),
  uploaded_by_email VARCHAR(255),
  file_url TEXT NOT NULL,
  file_type VARCHAR(50) NOT NULL,
  caption TEXT,
  memory_date DATE,
  is_approved BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create memorial tributes table for comments/stories
CREATE TABLE public.memorial_tributes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  memorial_page_id UUID NOT NULL REFERENCES public.memorial_pages(id) ON DELETE CASCADE,
  author_user_id UUID REFERENCES public.profiles(user_id),
  author_name VARCHAR(255) NOT NULL,
  author_email VARCHAR(255),
  message TEXT NOT NULL,
  is_approved BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on memorial tables
ALTER TABLE public.memorial_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memorial_memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memorial_tributes ENABLE ROW LEVEL SECURITY;

-- RLS policies for memorial pages
CREATE POLICY "Memorial pages are viewable by everyone" 
ON public.memorial_pages 
FOR SELECT 
USING (is_public = true);

CREATE POLICY "Users can manage memorial pages for their loved ones" 
ON public.memorial_pages 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.loved_ones 
  WHERE loved_ones.id = memorial_pages.loved_one_id 
  AND loved_ones.admin_user_id = auth.uid()
));

-- RLS policies for memorial memories
CREATE POLICY "Memorial memories are viewable by everyone for public pages" 
ON public.memorial_memories 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.memorial_pages 
  WHERE memorial_pages.id = memorial_memories.memorial_page_id 
  AND memorial_pages.is_public = true
));

CREATE POLICY "Users can upload memories to public memorial pages" 
ON public.memorial_memories 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM public.memorial_pages 
  WHERE memorial_pages.id = memorial_memories.memorial_page_id 
  AND memorial_pages.is_public = true
));

CREATE POLICY "Memorial page owners can manage all memories" 
ON public.memorial_memories 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.memorial_pages mp
  JOIN public.loved_ones lo ON lo.id = mp.loved_one_id
  WHERE mp.id = memorial_memories.memorial_page_id 
  AND lo.admin_user_id = auth.uid()
));

-- RLS policies for memorial tributes
CREATE POLICY "Memorial tributes are viewable by everyone for public pages" 
ON public.memorial_tributes 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.memorial_pages 
  WHERE memorial_pages.id = memorial_tributes.memorial_page_id 
  AND memorial_pages.is_public = true
));

CREATE POLICY "Users can add tributes to public memorial pages" 
ON public.memorial_tributes 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM public.memorial_pages 
  WHERE memorial_pages.id = memorial_tributes.memorial_page_id 
  AND memorial_pages.is_public = true
));

CREATE POLICY "Memorial page owners can manage all tributes" 
ON public.memorial_tributes 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.memorial_pages mp
  JOIN public.loved_ones lo ON lo.id = mp.loved_one_id
  WHERE mp.id = memorial_tributes.memorial_page_id 
  AND lo.admin_user_id = auth.uid()
));

-- Create update trigger for memorial pages
CREATE TRIGGER update_memorial_pages_updated_at
BEFORE UPDATE ON public.memorial_pages
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for memorial content
INSERT INTO storage.buckets (id, name, public) 
VALUES ('memorial-content', 'memorial-content', true);

-- Create storage policies for memorial content
CREATE POLICY "Memorial content is publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'memorial-content');

CREATE POLICY "Anyone can upload memorial content" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'memorial-content');

CREATE POLICY "Memorial page owners can manage their content" 
ON storage.objects 
FOR ALL 
USING (bucket_id = 'memorial-content');