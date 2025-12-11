-- Enable full replica identity for support_team_invitations table to capture complete row data
ALTER TABLE support_team_invitations REPLICA IDENTITY FULL;