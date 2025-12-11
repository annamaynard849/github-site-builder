-- Enable real-time for support team tables
ALTER TABLE public.support_team_invitations REPLICA IDENTITY FULL;
ALTER TABLE public.loved_one_access REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.support_team_invitations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.loved_one_access;