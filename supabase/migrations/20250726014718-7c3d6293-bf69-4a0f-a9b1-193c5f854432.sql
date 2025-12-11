-- Create storage bucket for loved one photos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('loved-one-photos', 'loved-one-photos', true);

-- Create storage policies for loved one photos
CREATE POLICY "Anyone can view loved one photos" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'loved-one-photos');

CREATE POLICY "Users can upload photos for their loved ones" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'loved-one-photos' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update photos for their loved ones" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'loved-one-photos' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete photos for their loved ones" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'loved-one-photos' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Add photo_url and relationship_to_user columns to loved_ones table
ALTER TABLE public.loved_ones 
ADD COLUMN photo_url TEXT,
ADD COLUMN relationship_to_user VARCHAR(100);

-- Update the table comment to reflect new required fields
COMMENT ON TABLE public.loved_ones IS 'Stores information about loved ones. Required fields: first_name, last_name, date_of_birth, date_of_death, photo_url, relationship_to_user';