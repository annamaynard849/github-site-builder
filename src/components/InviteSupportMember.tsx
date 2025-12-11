import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface InviteSupportMemberProps {
  lovedOneId: string;
  lovedOneName: string;
  trigger?: React.ReactNode;
}

export function InviteSupportMember({ lovedOneId, lovedOneName, trigger }: InviteSupportMemberProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    relationship: '',
    personal_message: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.first_name || !formData.last_name || !formData.email) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);

      // Security validations
      const { SecurityUtils } = await import('@/lib/security');
      
      // Rate limiting for invitations
      const rateLimitPassed = await SecurityUtils.checkSensitiveOperationLimit('invite_support_member', 5);
      if (!rateLimitPassed) {
        toast({
          title: "Too many attempts",
          description: "Too many invitation attempts. Please try again later.",
          variant: "destructive",
        });
        return;
      }

      // Validate and sanitize inputs
      if (!SecurityUtils.isValidEmail(formData.email)) {
        toast({
          title: "Invalid email",
          description: "Please enter a valid email address.",
          variant: "destructive",
        });
        return;
      }

      if (!SecurityUtils.isValidName(formData.first_name) || !SecurityUtils.isValidName(formData.last_name)) {
        toast({
          title: "Invalid name",
          description: "Names can only contain letters, spaces, hyphens, and apostrophes.",
          variant: "destructive",
        });
        return;
      }

      // Validate personal message if provided
      if (formData.personal_message) {
        const messageValidation = SecurityUtils.validateAndSanitizeContent(formData.personal_message, 1000);
        if (!messageValidation.valid) {
          toast({
            title: "Invalid message",
            description: messageValidation.errors.join('. '),
            variant: "destructive",
          });
          return;
        }
      }

      // Get current user and their profile
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Not authenticated');
      }

      // Get user's profile for their name
      const { data: profile } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('user_id', user.id)
        .single();

      const inviterName = profile?.first_name && profile?.last_name 
        ? `${profile.first_name} ${profile.last_name}`
        : user.email || 'Someone';

      // Check if user is trying to invite themselves
      if (formData.email.toLowerCase().trim() === user.email?.toLowerCase()) {
        toast({
          title: "Invalid invitation",
          description: "You cannot invite yourself to the family & friends team",
          variant: "destructive"
        });
        return;
      }

      // Sanitize inputs before database insertion
      const sanitizedData = {
        email: formData.email.toLowerCase().trim(),
        first_name: SecurityUtils.sanitizeText(formData.first_name.trim()),
        last_name: SecurityUtils.sanitizeText(formData.last_name.trim()),
        relationship: formData.relationship ? SecurityUtils.sanitizeText(formData.relationship.trim()) : null,
        personal_message: formData.personal_message ? SecurityUtils.sanitizeText(formData.personal_message) : ''
      };

      // Create invitation record
      const { data: invitation, error: inviteError } = await supabase
        .from('support_team_invitations')
        .insert({
          loved_one_id: lovedOneId,
          invited_by_user_id: user.id,
          invited_email: sanitizedData.email,
          invited_first_name: sanitizedData.first_name,
          invited_last_name: sanitizedData.last_name,
          relationship_to_loved_one: sanitizedData.relationship,
          role: 'support_member'
        })
        .select()
        .single();

      if (inviteError) {
        throw inviteError;
      }

      // Send invitation email via edge function with sanitized data
      console.log('About to invoke send-support-invitation function');
      const { data: emailResponse, error: emailError } = await supabase.functions.invoke('send-support-invitation', {
        body: {
          invitation_id: invitation.id,
          invited_email: sanitizedData.email,
          invited_name: `${sanitizedData.first_name} ${sanitizedData.last_name}`,
          loved_one_name: lovedOneName,
          inviter_name: inviterName,
          relationship: sanitizedData.relationship,
          personal_message: sanitizedData.personal_message,
          invitation_token: invitation.invitation_token
        }
      });

      console.log('Email function response:', emailResponse);
      console.log('Email function error:', emailError);

      // Log security event
      await SecurityUtils.logSecurityEvent('support_invitation_sent', {
        inviteeEmail: sanitizedData.email,
        lovedOneId,
        relationship: sanitizedData.relationship
      });

      if (emailError) {
        console.error('Email sending error:', emailError);
        console.error('Full email error details:', JSON.stringify(emailError, null, 2));
        // Don't fail the whole process if email fails
        toast({
          title: "Invitation created", 
          description: `Invitation saved but email may not have been sent: ${emailError.message || 'Unknown error'}. You can share the link manually.`,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Invitation sent!",
          description: `Invitation email sent to ${formData.first_name} ${formData.last_name}`,
          variant: "default"
        });
      }

      // Reset form and close dialog
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        relationship: '',
        personal_message: ''
      });
      setOpen(false);

    } catch (error: any) {
      console.error('Error sending invitation:', error);
      toast({
        title: "Error sending invitation",
        description: error.message || "Please try again",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const defaultTrigger = (
    <Button size="sm">
      <Plus className="h-4 w-4 mr-2" />
      Invite Support
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Invite Family & Friends Member</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first_name">First Name *</Label>
              <Input
                id="first_name"
                value={formData.first_name}
                onChange={(e) => handleInputChange('first_name', e.target.value)}
                placeholder="Enter first name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last_name">Last Name *</Label>
              <Input
                id="last_name"
                value={formData.last_name}
                onChange={(e) => handleInputChange('last_name', e.target.value)}
                placeholder="Enter last name"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="Enter email address"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="relationship">Relationship to {lovedOneName}</Label>
            <Select onValueChange={(value) => handleInputChange('relationship', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select relationship" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="spouse">Spouse</SelectItem>
                <SelectItem value="partner">Partner</SelectItem>
                <SelectItem value="child">Child</SelectItem>
                <SelectItem value="parent">Parent</SelectItem>
                <SelectItem value="sibling">Sibling</SelectItem>
                <SelectItem value="grandchild">Grandchild</SelectItem>
                <SelectItem value="grandparent">Grandparent</SelectItem>
                <SelectItem value="aunt_uncle">Aunt/Uncle</SelectItem>
                <SelectItem value="cousin">Cousin</SelectItem>
                <SelectItem value="nephew_niece">Nephew/Niece</SelectItem>
                <SelectItem value="close_friend">Close Friend</SelectItem>
                <SelectItem value="friend">Friend</SelectItem>
                <SelectItem value="neighbor">Neighbor</SelectItem>
                <SelectItem value="colleague">Colleague</SelectItem>
                <SelectItem value="caregiver">Caregiver</SelectItem>
                <SelectItem value="attorney">Attorney</SelectItem>
                <SelectItem value="accountant">Accountant</SelectItem>
                <SelectItem value="funeral_director">Funeral Director</SelectItem>
                <SelectItem value="clergy">Clergy/Religious Leader</SelectItem>
                <SelectItem value="support_group">Support Group Member</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="personal_message">Personal Message (Optional)</Label>
            <Textarea
              id="personal_message"
              value={formData.personal_message}
              onChange={(e) => handleInputChange('personal_message', e.target.value)}
              placeholder="Add a personal message to include in the invitation..."
              rows={3}
            />
          </div>

          <div className="flex items-center justify-between pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>Sending...</>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Invitation
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}