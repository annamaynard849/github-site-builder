import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Heart, UserPlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function AcceptInvitation() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const token = searchParams.get('token');
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [invitation, setInvitation] = useState<any>(null);
  const [userExists, setUserExists] = useState(false);
  const [isLogin, setIsLogin] = useState(false);
  
  // Form fields for signup
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Form field for login
  const [loginPassword, setLoginPassword] = useState('');

  useEffect(() => {
    if (!token) {
      setError('No invitation token provided');
      setLoading(false);
      return;
    }
    
    validateInvitation();
  }, []);

  const validateInvitation = async () => {
    try {
      const { data, error } = await supabase.rpc('get_invitation_by_token', {
        invitation_token: token
      });

      if (error || !data || (Array.isArray(data) && data.length === 0)) {
        setError('Invalid invitation link');
        setLoading(false);
        return;
      }

      const inv = Array.isArray(data) ? data[0] : data;

      if (new Date(inv.expires_at) < new Date()) {
        setError('Invitation has expired');
        setLoading(false);
        return;
      }

      if (inv.status === 'accepted') {
        setError('Invitation already accepted');
        setLoading(false);
        return;
      }

      let loved: any = null;
      try {
        const { data: lovedOne } = await supabase
          .from('loved_ones')
          .select('first_name, last_name')
          .eq('id', inv.loved_one_id)
          .maybeSingle();
        loved = lovedOne;
      } catch (_) {}

      setInvitation({ ...inv, loved_ones: loved });
      setLoading(false);
    } catch (err) {
      setError('Failed to validate invitation');
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!loginPassword) {
      toast({
        title: "Password required",
        description: "Please enter your password",
        variant: "destructive"
      });
      return;
    }

    try {
      // Try to sign in existing user
      const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
        email: invitation.invited_email,
        password: loginPassword
      });

      if (signInError) throw signInError;

      if (authData.user) {
        await acceptInvitationForUser(authData.user.id);
      }
    } catch (err: any) {
      if (err.message.includes('Invalid login credentials')) {
        toast({
          title: "Wrong password",
          description: "Please check your password and try again, or create a new account",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Error",
          description: err.message || "Failed to sign in",
          variant: "destructive"
        });
      }
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!firstName.trim() || !lastName.trim()) {
      toast({
        title: "Name required",
        description: "Please enter your first and last name",
        variant: "destructive"
      });
      return;
    }
    
    if (password.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters",
        variant: "destructive"
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please ensure both passwords match",
        variant: "destructive"
      });
      return;
    }

    try {
      // Try to sign up the user
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: invitation.invited_email,
        password: password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName
          },
          emailRedirectTo: `${window.location.origin}/`
        }
      });

      if (signUpError) {
        if (signUpError.message.includes('already registered')) {
          setUserExists(true);
          setIsLogin(true);
          toast({
            title: "Account exists",
            description: "This email already has an account. Please sign in instead.",
            variant: "default"
          });
          return;
        }
        throw signUpError;
      }

      if (authData.user) {
        await acceptInvitationForUser(authData.user.id);
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to create account",
        variant: "destructive"
      });
    }
  };

  const acceptInvitationForUser = async (userId: string) => {
    try {
      console.log('Starting invitation acceptance for user:', userId);
      
      // Add to family & friends team
      const { error: accessError } = await supabase.from('loved_one_access').insert({
        loved_one_id: invitation.loved_one_id,
        user_id: userId,
        role: 'support_member',
        granted_by: invitation.invited_by_user_id
      });

      if (accessError) {
        console.error('Error creating loved_one_access:', accessError);
        // Don't throw here - continue with invitation update
      } else {
        console.log('Successfully created loved_one_access record');
      }

      // Update invitation status regardless of access record creation
      const { error: invitationError } = await supabase
        .from('support_team_invitations')
        .update({
          status: 'accepted',
          accepted_at: new Date().toISOString(),
          accepted_by_user_id: userId
        })
        .eq('id', invitation.id);

      if (invitationError) {
        console.error('Error updating invitation:', invitationError);
        throw invitationError;
      }
      console.log('Successfully updated invitation status');

      toast({
        title: "Welcome!",
        description: "Successfully joined the family & friends team",
      });

      console.log('Navigating to dashboard...');
      setTimeout(() => {
        navigate('/');
      }, 1000); // Add delay to ensure toast shows
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to accept invitation",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        {/* Logo Header */}
        <div className="mb-8">
          <span className="text-2xl font-playfair font-normal text-foreground tracking-widest">HONORLY</span>
        </div>
        
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5" />
              Loading...
            </CardTitle>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        {/* Logo Header */}
        <div className="mb-8">
          <span className="text-2xl font-playfair font-normal text-foreground tracking-widest">HONORLY</span>
        </div>
        
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Invitation Invalid</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <Button onClick={() => navigate('/')} className="w-full mt-4">
              Go Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!invitation) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center">
      {/* Logo Header */}
      <div className="mb-8">
        <span className="text-2xl font-playfair font-normal text-foreground tracking-widest">HONORLY</span>
      </div>
      
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Join {invitation.loved_ones?.first_name}'s Family & Friends Team
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center mb-6">
            <p className="text-sm text-muted-foreground mb-2">
              You've been invited to support
            </p>
            <p className="font-semibold">
              {invitation.loved_ones?.first_name} {invitation.loved_ones?.last_name}
            </p>
          </div>

          {isLogin ? (
            /* Login form for existing users */
            <div className="space-y-4">
              <Alert>
                <AlertDescription>
                  An account already exists with this email. Please sign in to join the family & friends team.
                </AlertDescription>
              </Alert>
              
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <Label>Email</Label>
                  <Input value={invitation.invited_email} disabled />
                </div>
                
                <div>
                  <Label>Password</Label>
                  <Input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                  />
                </div>

                <Button type="submit" className="w-full">
                  Sign In & Join Team
                </Button>
                
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => setIsLogin(false)}
                >
                  New user? Create account instead
                </Button>
              </form>
            </div>
          ) : (
            /* Signup form for new users */
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>First Name</Label>
                  <Input
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="First name"
                    required
                  />
                </div>
                <div>
                  <Label>Last Name</Label>
                  <Input
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Last name"
                    required
                  />
                </div>
              </div>
              
              <div>
                <Label>Email</Label>
                <Input value={invitation.invited_email} disabled />
              </div>
              
              <div>
                <Label>Password</Label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a password"
                  required
                />
              </div>
              
              <div>
                <Label>Confirm Password</Label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  required
                />
              </div>

              <Button type="submit" className="w-full">
                Create Account & Join Team
              </Button>
              
              <Button 
                type="button" 
                variant="outline" 
                className="w-full" 
                onClick={() => setIsLogin(true)}
              >
                Already have an account? Sign in
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}