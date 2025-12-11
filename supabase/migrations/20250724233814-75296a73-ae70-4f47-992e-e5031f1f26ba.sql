-- Create user profiles table (Supabase handles auth separately)
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  role VARCHAR(50) DEFAULT 'user', -- roles: admin, family_member, friend, community
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create loved_ones table for deceased persons
CREATE TABLE public.loved_ones (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  date_of_birth DATE,
  date_of_death DATE,
  birth_certificate_url TEXT,
  death_certificate_url TEXT,
  memorial_website_url TEXT,
  obituary TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create tasks table for managing post-death responsibilities
CREATE TABLE public.tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  loved_one_id UUID NOT NULL REFERENCES public.loved_ones(id) ON DELETE CASCADE,
  assigned_to_user_id UUID REFERENCES public.profiles(user_id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100), -- e.g., 'financial', 'legal', 'personal', 'notifications'
  status VARCHAR(50) DEFAULT 'pending', -- pending, in_progress, completed
  priority VARCHAR(20) DEFAULT 'medium', -- low, medium, high, urgent
  due_date DATE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create shared access table for multiple users to manage one loved_one
CREATE TABLE public.loved_one_access (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  loved_one_id UUID NOT NULL REFERENCES public.loved_ones(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL, -- admin, family_member, friend, community
  granted_by UUID NOT NULL REFERENCES public.profiles(user_id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(loved_one_id, user_id)
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loved_ones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loved_one_access ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view their own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create policies for loved_ones
CREATE POLICY "Users can view loved ones they have access to" 
ON public.loved_ones FOR SELECT 
USING (
  admin_user_id = auth.uid() OR 
  EXISTS (
    SELECT 1 FROM public.loved_one_access 
    WHERE loved_one_id = public.loved_ones.id 
    AND user_id = auth.uid()
  )
);

CREATE POLICY "Admin users can manage their loved ones" 
ON public.loved_ones FOR ALL 
USING (admin_user_id = auth.uid());

-- Create policies for tasks
CREATE POLICY "Users can view tasks for accessible loved ones" 
ON public.tasks FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.loved_ones lo
    WHERE lo.id = tasks.loved_one_id 
    AND (
      lo.admin_user_id = auth.uid() OR 
      EXISTS (
        SELECT 1 FROM public.loved_one_access loa
        WHERE loa.loved_one_id = lo.id 
        AND loa.user_id = auth.uid()
      )
    )
  )
);

CREATE POLICY "Users can manage tasks for accessible loved ones" 
ON public.tasks FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.loved_ones lo
    WHERE lo.id = tasks.loved_one_id 
    AND (
      lo.admin_user_id = auth.uid() OR 
      EXISTS (
        SELECT 1 FROM public.loved_one_access loa
        WHERE loa.loved_one_id = lo.id 
        AND loa.user_id = auth.uid()
        AND loa.role IN ('admin', 'family_member')
      )
    )
  )
);

-- Create policies for loved_one_access
CREATE POLICY "Users can view access for their loved ones" 
ON public.loved_one_access FOR SELECT 
USING (
  user_id = auth.uid() OR 
  EXISTS (
    SELECT 1 FROM public.loved_ones lo
    WHERE lo.id = loved_one_access.loved_one_id 
    AND lo.admin_user_id = auth.uid()
  )
);

CREATE POLICY "Admin users can manage access to their loved ones" 
ON public.loved_one_access FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.loved_ones lo
    WHERE lo.id = loved_one_access.loved_one_id 
    AND lo.admin_user_id = auth.uid()
  )
);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_loved_ones_updated_at
  BEFORE UPDATE ON public.loved_ones
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, first_name, last_name)
  VALUES (
    NEW.id, 
    NEW.raw_user_meta_data ->> 'first_name',
    NEW.raw_user_meta_data ->> 'last_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to auto-create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();