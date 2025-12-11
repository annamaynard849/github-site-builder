-- Create invitations table for support team invites
CREATE TABLE public.support_team_invitations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  loved_one_id UUID NOT NULL REFERENCES public.loved_ones(id) ON DELETE CASCADE,
  invited_by_user_id UUID NOT NULL,
  invited_email VARCHAR(255) NOT NULL,
  invited_first_name VARCHAR(100) NOT NULL,
  invited_last_name VARCHAR(100) NOT NULL,
  relationship_to_loved_one VARCHAR(100),
  role VARCHAR(50) NOT NULL DEFAULT 'support_member',
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  invitation_token UUID NOT NULL DEFAULT gen_random_uuid(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '7 days'),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  accepted_at TIMESTAMP WITH TIME ZONE,
  accepted_by_user_id UUID
);

-- Add indexes for performance
CREATE INDEX idx_support_invitations_loved_one_id ON public.support_team_invitations(loved_one_id);
CREATE INDEX idx_support_invitations_email ON public.support_team_invitations(invited_email);
CREATE INDEX idx_support_invitations_token ON public.support_team_invitations(invitation_token);
CREATE INDEX idx_support_invitations_status ON public.support_team_invitations(status);

-- Enable RLS
ALTER TABLE public.support_team_invitations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can manage invitations for their loved ones" 
ON public.support_team_invitations 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.loved_ones 
    WHERE id = support_team_invitations.loved_one_id 
    AND admin_user_id = auth.uid()
  )
);

CREATE POLICY "Users can view invitations sent to them" 
ON public.support_team_invitations 
FOR SELECT 
USING (invited_email = auth.email());

-- Create trigger for updated_at
CREATE TRIGGER update_support_invitations_updated_at
BEFORE UPDATE ON public.support_team_invitations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add comments
COMMENT ON TABLE public.support_team_invitations IS 'Stores invitations sent to support team members';
COMMENT ON COLUMN public.support_team_invitations.role IS 'Role in support team: support_member, coordinator, etc.';
COMMENT ON COLUMN public.support_team_invitations.status IS 'Invitation status: pending, accepted, expired, cancelled';