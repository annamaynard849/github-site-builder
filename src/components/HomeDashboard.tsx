import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Heart, Users, LogOut, Settings, Calendar, Flower, Clock, CheckCircle2, HandHeart, Shield, Lightbulb, ClipboardCheck, Smile } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { OnboardingModal } from '@/components/OnboardingModal';

interface Profile {
  first_name: string | null;
  last_name: string | null;
}

export function HomeDashboard() {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<Profile | null>(null);
  const [selectedPath, setSelectedPath] = useState<'recent-loss' | 'planning-ahead' | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  // Check for showOnboarding query parameter
  useEffect(() => {
    const onboardingParam = searchParams.get('showOnboarding');
    if (onboardingParam === 'preplan' && user) {
      setSelectedPath('planning-ahead');
      setShowOnboarding(true);
      // Clear the query parameter
      searchParams.delete('showOnboarding');
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, user]);

  const fetchDashboardData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      console.log('HomeDashboard: Fetching data for user:', user.id);

      // Check if user owns any loved ones
      const { data: ownedLovedOnes, error: ownedError } = await supabase
        .from('loved_ones' as any)
        .select('id')
        .eq('admin_user_id', user.id)
        .limit(1) as any;

      console.log('HomeDashboard: Owned loved ones:', ownedLovedOnes);

      if (ownedError) {
        console.error('HomeDashboard: Error checking owned loved ones:', ownedError);
      }

      // Check if user has support access to any loved ones
      const { data: supportAccess, error: supportError } = await supabase
        .from('loved_one_access' as any)
        .select('loved_one_id')
        .eq('user_id', user.id)
        .limit(1) as any;

      console.log('HomeDashboard: Support access:', supportAccess);

      if (supportError) {
        console.error('HomeDashboard: Error checking support access:', supportError);
      }

      const hasLovedOnes = (ownedLovedOnes && ownedLovedOnes.length > 0) || (supportAccess && supportAccess.length > 0);

      // If user has loved ones (owned or support access), check their cases
      if (hasLovedOnes) {
        console.log('HomeDashboard: User has loved ones, checking cases');
        
        // Check owned cases
        const { data: ownedCases } = await supabase
          .from('cases' as any)
          .select('id')
          .eq('user_id', user.id) as any;

        // Check support access cases
        const { data: supportCases } = await supabase
          .from('loved_one_access' as any)
          .select('loved_one_id')
          .eq('user_id', user.id) as any;

        const totalCases = (ownedCases?.length || 0) + (supportCases?.length || 0);

        if (totalCases === 0) {
          console.log('HomeDashboard: No cases found, staying on welcome screen');
        } else if (totalCases === 1 && ownedCases && ownedCases.length === 1) {
          console.log('HomeDashboard: Single case, navigating directly');
          navigate(`/cases/${ownedCases[0].id}`);
          return;
        } else {
          console.log('HomeDashboard: Multiple cases, navigating to dashboard');
          navigate('/dashboard');
          return;
        }
      }

      console.log('HomeDashboard: User has no loved ones, showing welcome screen');

      // Otherwise fetch profile for welcome screen
      const { data: profileData, error: profileError } = await supabase
        .from('profiles' as any)
        .select('first_name, last_name')
        .eq('user_id', user.id)
        .maybeSingle() as any;

      if (profileError) {
        console.error('HomeDashboard: Profile error:', profileError);
      }
      
      console.log('HomeDashboard: Loaded profile:', profileData);
      setUserProfile(profileData);
    } catch (error) {
      console.error('HomeDashboard: Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };


  const recentLossSupportAreas = [
    {
      id: 'memorial',
      icon: Flower,
      title: 'Honoring Their Memory',
      description: 'Plan services, obituaries, and resting places with dignity.',
      color: 'hsl(var(--primary))',
    },
    {
      id: 'legal-financial',
      icon: FileText,
      title: 'Legal & Financial Matters',
      description: 'Paperwork made simple — we\'ll guide you through death certificates, notifying banks, and estate steps.',
      color: 'hsl(var(--primary))',
    },
    {
      id: 'family',
      icon: Users,
      title: 'Support from Family & Friends',
      description: 'Invite others to share tasks, memories, and support.',
      color: 'hsl(var(--primary))',
    },
  ];

  const planningAheadSupportAreas = [
    {
      id: 'advance-directives',
      icon: FileText,
      title: 'Your Healthcare Wishes',
      description: 'Document your preferences for medical care and end-of-life decisions.',
      color: 'hsl(var(--primary))',
    },
    {
      id: 'estate-planning',
      icon: FileText,
      title: 'Financial & Legal Planning',
      description: 'Organize important documents, accounts, and your intentions.',
      color: 'hsl(var(--primary))',
    },
    {
      id: 'memorial-wishes',
      icon: Heart,
      title: 'Your Memorial Preferences',
      description: 'Share how you\'d like to be remembered and celebrated.',
      color: 'hsl(var(--primary))',
    },
  ];

  const supportAreas = selectedPath === 'recent-loss' 
    ? recentLossSupportAreas 
    : selectedPath === 'planning-ahead' 
    ? planningAheadSupportAreas 
    : [];

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <span className="text-2xl font-playfair font-normal text-foreground tracking-widest">HONORLY</span>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => navigate('/settings')}>
                <Settings className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-12 space-y-12">
        {/* Welcome Section */}
        <div className="text-center space-y-8 max-w-2xl mx-auto">
          <h1 className="text-4xl font-semibold text-foreground leading-tight">
            {userProfile?.first_name ? `Welcome, ${userProfile.first_name}` : 'Welcome to Honorly'}
          </h1>
        </div>

        {/* Personalization Fork */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card 
              className={`cursor-pointer transition-all hover:shadow-md ${
                selectedPath === 'recent-loss' ? 'border-primary shadow-sm bg-primary/5' : 'border-border/50'
              }`}
              onClick={() => setSelectedPath('recent-loss')}
            >
              <CardContent className="p-8">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                    <Heart className="h-7 w-7 text-primary" strokeWidth={1.5} />
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-lg leading-snug">I've just lost someone — I need support now.</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">Get compassionate guidance through this difficult time.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card 
              className={`cursor-pointer transition-all hover:shadow-md ${
                selectedPath === 'planning-ahead' ? 'border-primary shadow-sm bg-primary/5' : 'border-border/50'
              }`}
              onClick={() => setSelectedPath('planning-ahead')}
            >
              <CardContent className="p-8">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                    <Calendar className="h-7 w-7 text-primary" strokeWidth={1.5} />
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-lg leading-snug">I want to prepare for the future.</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">Organize your wishes and give peace of mind to loved ones.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Support Areas - Only show after selection */}
        {selectedPath && (
          <div className="space-y-8">
            {selectedPath === 'recent-loss' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold text-foreground leading-tight text-center">
                  We understand this is incredibly difficult
                </h2>
                <p className="text-base text-muted-foreground leading-relaxed text-center max-w-2xl mx-auto">
                  Losing someone you love is one of life's greatest challenges. The weight of grief combined with all the practical matters can feel overwhelming.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                  <Card className="border-border/50 bg-card/50">
                    <CardContent className="p-6">
                      <div className="flex flex-col items-center text-center space-y-3">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <Clock className="h-6 w-6 text-primary" strokeWidth={1.5} />
                        </div>
                        <p className="text-sm text-foreground font-medium">No timeline to follow</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-border/50 bg-card/50">
                    <CardContent className="p-6">
                      <div className="flex flex-col items-center text-center space-y-3">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <CheckCircle2 className="h-6 w-6 text-primary" strokeWidth={1.5} />
                        </div>
                        <p className="text-sm text-foreground font-medium">One step at a time</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-border/50 bg-card/50">
                    <CardContent className="p-6">
                      <div className="flex flex-col items-center text-center space-y-3">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <HandHeart className="h-6 w-6 text-primary" strokeWidth={1.5} />
                        </div>
                        <p className="text-sm text-foreground font-medium">It's okay to ask for help</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-border/50 bg-card/50">
                    <CardContent className="p-6">
                      <div className="flex flex-col items-center text-center space-y-3">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <Heart className="h-6 w-6 text-primary" strokeWidth={1.5} />
                        </div>
                        <p className="text-sm text-foreground font-medium">Focus on healing</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
            {selectedPath === 'planning-ahead' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold text-foreground leading-tight text-center">
                  Planning ahead is a gift to yourself and your loved ones
                </h2>
                <p className="text-base text-muted-foreground leading-relaxed text-center max-w-2xl mx-auto">
                  Taking time now to organize your wishes brings peace of mind and clarity for the future.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                  <Card className="border-border/50 bg-card/50">
                    <CardContent className="p-6">
                      <div className="flex flex-col items-center text-center space-y-3">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <Shield className="h-6 w-6 text-primary" strokeWidth={1.5} />
                        </div>
                        <p className="text-sm text-foreground font-medium">Peace of mind for you</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-border/50 bg-card/50">
                    <CardContent className="p-6">
                      <div className="flex flex-col items-center text-center space-y-3">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <Heart className="h-6 w-6 text-primary" strokeWidth={1.5} />
                        </div>
                        <p className="text-sm text-foreground font-medium">Ease burden on family</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-border/50 bg-card/50">
                    <CardContent className="p-6">
                      <div className="flex flex-col items-center text-center space-y-3">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <ClipboardCheck className="h-6 w-6 text-primary" strokeWidth={1.5} />
                        </div>
                        <p className="text-sm text-foreground font-medium">Your wishes, clearly documented</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-border/50 bg-card/50">
                    <CardContent className="p-6">
                      <div className="flex flex-col items-center text-center space-y-3">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <Lightbulb className="h-6 w-6 text-primary" strokeWidth={1.5} />
                        </div>
                        <p className="text-sm text-foreground font-medium">Time to think carefully</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
            <h3 className="text-2xl font-medium text-foreground text-center">Where we can support you</h3>
            <div className="space-y-4">
              {supportAreas.map((area) => (
                <Card key={area.id} className="hover:shadow-sm transition-all border-border/50 bg-card/50">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-5">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <area.icon className="h-6 w-6 text-primary" strokeWidth={1.5} />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0 pt-1">
                        <h4 className="font-medium text-foreground mb-2 text-base">{area.title}</h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">{area.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Gentle First Step */}
        {selectedPath && (
          <div className="text-center">
            <Button 
              size="lg" 
              className="text-lg px-12 py-6 h-auto" 
              onClick={() => {
                setShowOnboarding(true);
              }}
            >
              Get started
            </Button>
          </div>
        )}
        {user && selectedPath && (
          <OnboardingModal
            open={showOnboarding}
            onClose={() => setShowOnboarding(false)}
            onComplete={(caseId: string) => {
              setShowOnboarding(false);
              navigate(`/cases/${caseId}?showProfile=1`);
            }}
            path={selectedPath}
            userId={user.id}
          />
        )}
      </div>
    </div>
  );
}