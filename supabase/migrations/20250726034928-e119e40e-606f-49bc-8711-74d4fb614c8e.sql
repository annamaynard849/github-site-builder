-- Add more customization fields to memorial pages
ALTER TABLE public.memorial_pages 
ADD COLUMN layout_style VARCHAR(50) DEFAULT 'classic',
ADD COLUMN font_family VARCHAR(50) DEFAULT 'inter',
ADD COLUMN header_style VARCHAR(50) DEFAULT 'hero',
ADD COLUMN show_dates BOOLEAN DEFAULT true,
ADD COLUMN show_timeline BOOLEAN DEFAULT false,
ADD COLUMN show_favorites BOOLEAN DEFAULT false,
ADD COLUMN show_quotes BOOLEAN DEFAULT false,
ADD COLUMN custom_sections JSONB DEFAULT '[]'::jsonb,
ADD COLUMN memorial_music_url TEXT,
ADD COLUMN charity_name TEXT,
ADD COLUMN charity_url TEXT,
ADD COLUMN custom_message TEXT;

-- Create memorial quotes table
CREATE TABLE public.memorial_quotes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  memorial_page_id UUID NOT NULL REFERENCES public.memorial_pages(id) ON DELETE CASCADE,
  quote_text TEXT NOT NULL,
  author VARCHAR(255),
  category VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create memorial timeline table  
CREATE TABLE public.memorial_timeline (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  memorial_page_id UUID NOT NULL REFERENCES public.memorial_pages(id) ON DELETE CASCADE,
  event_date DATE NOT NULL,
  event_title VARCHAR(255) NOT NULL,
  event_description TEXT,
  event_image_url TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create memorial favorites table
CREATE TABLE public.memorial_favorites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  memorial_page_id UUID NOT NULL REFERENCES public.memorial_pages(id) ON DELETE CASCADE,
  category VARCHAR(100) NOT NULL, -- 'food', 'music', 'books', 'movies', 'hobbies', etc.
  item_name VARCHAR(255) NOT NULL,
  item_description TEXT,
  item_image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.memorial_quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memorial_timeline ENABLE ROW LEVEL SECURITY; 
ALTER TABLE public.memorial_favorites ENABLE ROW LEVEL SECURITY;

-- RLS policies for memorial quotes
CREATE POLICY "Memorial quotes are viewable by everyone for public pages" 
ON public.memorial_quotes 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.memorial_pages 
  WHERE memorial_pages.id = memorial_quotes.memorial_page_id 
  AND memorial_pages.is_public = true
));

CREATE POLICY "Memorial page owners can manage quotes" 
ON public.memorial_quotes 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.memorial_pages mp
  JOIN public.loved_ones lo ON lo.id = mp.loved_one_id
  WHERE mp.id = memorial_quotes.memorial_page_id 
  AND lo.admin_user_id = auth.uid()
));

-- RLS policies for memorial timeline
CREATE POLICY "Memorial timeline is viewable by everyone for public pages" 
ON public.memorial_timeline 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.memorial_pages 
  WHERE memorial_pages.id = memorial_timeline.memorial_page_id 
  AND memorial_pages.is_public = true
));

CREATE POLICY "Memorial page owners can manage timeline" 
ON public.memorial_timeline 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.memorial_pages mp
  JOIN public.loved_ones lo ON lo.id = mp.loved_one_id
  WHERE mp.id = memorial_timeline.memorial_page_id 
  AND lo.admin_user_id = auth.uid()
));

-- RLS policies for memorial favorites
CREATE POLICY "Memorial favorites are viewable by everyone for public pages" 
ON public.memorial_favorites 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.memorial_pages 
  WHERE memorial_pages.id = memorial_favorites.memorial_page_id 
  AND memorial_pages.is_public = true
));

CREATE POLICY "Memorial page owners can manage favorites" 
ON public.memorial_favorites 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.memorial_pages mp
  JOIN public.loved_ones lo ON lo.id = mp.loved_one_id
  WHERE mp.id = memorial_favorites.memorial_page_id 
  AND lo.admin_user_id = auth.uid()
));