import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { analytics } from "@/lib/analytics";
import { AuthSecurity, SecurityUtils } from "@/lib/security";

export default function AuthPage() {
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [error, setError] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);
  const [showResetForm, setShowResetForm] = useState(false);
  const [activeTab, setActiveTab] = useState('signup');
  const [prefillEmail, setPrefillEmail] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check if user is already logged in
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate('/');
      }
    };
    checkUser();
  }, [navigate]);

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const firstName = formData.get('firstName') as string;
    const lastName = formData.get('lastName') as string;

    try {
      // Use enhanced security validation
      const validatedData = await AuthSecurity.secureSignUp(email, password, firstName, lastName);
      
      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signUp({
        email: validatedData.email,
        password: validatedData.password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            first_name: validatedData.firstName,
            last_name: validatedData.lastName,
          },
        },
      });

      // Send custom verification email via edge function
      if (data?.user && !data?.session) {
        try {
          const confirmUrl = `${window.location.origin}/auth?type=signup&email=${encodeURIComponent(validatedData.email)}`;
          await supabase.functions.invoke('send-verification-email', {
            body: {
              email: validatedData.email,
              confirmationUrl: confirmUrl,
              token: data.user.id,
            },
          });
        } catch (emailError) {
          console.error('Error sending verification email:', emailError);
          // Don't fail the signup if email sending fails
        }
      }

      if (error) {
        await SecurityUtils.logSecurityEvent('signup_error', { email: validatedData.email, error: error.message });
        
        // Handle specific error cases
        if (error.message.includes("User already registered")) {
          setError("An account with this email already exists. Switching to sign in...");
          setPrefillEmail(validatedData.email);
          setTimeout(() => {
            setActiveTab('signin');
            setError('');
          }, 1500);
        } else if (error.message.includes("Invalid email")) {
          setError("Please enter a valid email address");
        } else if (error.message.includes("Password")) {
          setError("Password must meet security requirements");
        } else {
          setError(error.message);
        }
        return;
      }

      analytics.trackSignUp('email');

      if (data?.session) {
        // Email confirmation is disabled; user is already signed in
        toast({
          title: "Account created!",
          description: "You're signed in and ready to go.",
        });
        navigate('/');
      } else {
        // Email confirmation is enabled; no session until user verifies
        toast({
          title: "Verify your email",
          description: "We sent a verification link. Please check your inbox.",
        });
      }
    } catch (error: any) {
      console.error("Signup error:", error);
      setError(error.message || "An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      // Use enhanced security validation
      const validatedData = await AuthSecurity.secureSignIn(email, password);
      
      const { error } = await supabase.auth.signInWithPassword({
        email: validatedData.email,
        password: validatedData.password,
      });

      if (error) {
        await AuthSecurity.logFailedAttempt(validatedData.email, error.message);
        console.error("Sign in error:", error);
        setError("Invalid email or password. Please try again.");
        return;
      }

      analytics.trackLogin('email');
      navigate('/');
    } catch (error: any) {
      console.error("Sign in error:", error);
      setError(error.message || "An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setResetLoading(true);
    setError('');
    setResetSuccess(false);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('resetEmail') as string;

    try {
      // Use enhanced security validation
      const validatedData = await AuthSecurity.securePasswordReset(email);
      
      const { error } = await supabase.auth.resetPasswordForEmail(validatedData.email, {
        redirectTo: `${window.location.origin}/auth`,
      });

      if (error) {
        await SecurityUtils.logSecurityEvent('password_reset_error', { email: validatedData.email, error: error.message });
        setError(error.message);
        return;
      }

      setResetSuccess(true);
      toast({
        title: "Password reset email sent",
        description: "Please check your email for reset instructions.",
      });
    } catch (error: any) {
      console.error("Password reset error:", error);
      setError(error.message || "An unexpected error occurred. Please try again.");
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-primary">Welcome to Honorly</h1>
        </div>

        <Card>
          <CardContent className="pt-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {showResetForm ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Reset Password</h3>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => {
                      setShowResetForm(false);
                      setResetSuccess(false);
                      setError('');
                    }}
                  >
                    ← Back to Sign In
                  </Button>
                </div>
                
                {resetSuccess ? (
                  <div className="text-center space-y-4">
                    <p className="text-green-600">Password reset email sent! Please check your inbox.</p>
                    <Button 
                      variant="outline" 
                      onClick={() => setResetSuccess(false)}
                    >
                      Send Another Reset Email
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handlePasswordReset} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="resetEmail">Email Address</Label>
                      <Input
                        id="resetEmail"
                        name="resetEmail"
                        type="email"
                        required
                        placeholder="Enter your email address"
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      We'll send you a link to reset your password.
                    </p>
                    <Button type="submit" className="w-full" disabled={resetLoading}>
                      {resetLoading ? "Sending Reset Email..." : "Send Reset Email"}
                    </Button>
                  </form>
                )}
              </div>
            ) : (
              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="signup">Sign Up</TabsTrigger>
                  <TabsTrigger value="signin">Sign In</TabsTrigger>
                </TabsList>

                <TabsContent value="signup" className="space-y-4">
                  <form onSubmit={handleSignUp} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          name="firstName"
                          type="text"
                          required
                          placeholder="Enter your first name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          name="lastName"
                          type="text"
                          required
                          placeholder="Enter your last name"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        required
                        placeholder="Enter your email"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        name="password"
                        type="password"
                        required
                        placeholder="Create a strong password (min 8 characters)"
                        minLength={8}
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? "Creating Account..." : "Create Account"}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="signin" className="space-y-4">
                  <form onSubmit={handleSignIn} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signin-email">Email</Label>
                      <Input
                        id="signin-email"
                        name="email"
                        type="email"
                        required
                        placeholder="Enter your email"
                        defaultValue={prefillEmail}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signin-password">Password</Label>
                      <Input
                        id="signin-password"
                        name="password"
                        type="password"
                        required
                        placeholder="Enter your password"
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? "Signing In..." : "Sign In"}
                    </Button>
                    <div className="text-center">
                      <button
                        type="button"
                        onClick={() => {
                          setShowResetForm(true);
                          setError('');
                        }}
                        className="text-sm text-muted-foreground hover:text-primary transition-colors"
                      >
                        Forgot your password?
                      </button>
                    </div>
                  </form>
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>

        <div className="text-center">
          <Link to="/welcome" className="text-sm text-muted-foreground hover:text-primary transition-colors inline-block">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}