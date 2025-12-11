-- Enable real-time updates for support_team_invitations table
ALTER TABLE support_team_invitations REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE support_team_invitations;