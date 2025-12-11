import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Heart, LogOut, Settings, Plus, User, Sparkles, Calendar, CheckCircle2, ArrowRight, MessageCircle, FileText, HandHeart } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import EmotionalReflection from '@/components/EmotionalReflection';
import { OnboardingModal } from '@/components/OnboardingModal';

interface CaseWithLovedOne {
  id: string;
  type: 'PREPLAN' | 'LOSS';
  status: string;
  created_at: string;
  loved_ones: {
    id: string;
    first_name: string;
    last_name: string;
    photo_url: string | null;
    date_of_birth: string | null;
    date_of_death: string | null;
    admin_user_id?: string;
  };
}

interface SupportAccessItem {
  loved_one_id: string;
  role: string;
  granted_by: string;
  loved_ones: {
    id: string;
    first_name: string;
    last_name: string;
    photo_url: string | null;
    date_of_birth: string | null;
    date_of_death: string | null;
    admin_user_id: string;
  };
}

interface TaskSummary {
  caseId: string;
  lovedOneName: string;
  pendingCount: number;
  totalCount: number;
}

interface UserProfile {
  first_name: string | null;
  last_name: string | null;
  created_at: string;
}

export default function CaseSwitcher() {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [cases, setCases] = useState<CaseWithLovedOne[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'all' | 'PREPLAN' | 'LOSS'>('all');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [taskSummaries, setTaskSummaries] = useState<TaskSummary[]>([]);
  const [userType, setUserType] = useState<'primary' | 'support' | 'both'>('primary');
  const [showPlanningOnboarding, setShowPlanningOnboarding] = useState(false);
  const [supportedLovedOnes, setSupportedLovedOnes] = useState<SupportAccessItem[]>([]);
  const [invitedByNames, setInvitedByNames] = useState<Record<string, string>>({});

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate('/auth');
      return;
    }

    // Check for filter in URL
    const filter = searchParams.get('type');
    if (filter === 'PREPLAN' || filter === 'LOSS') {
      setActiveFilter(filter);
    }

    fetchUserProfile();
    fetchCases();
  }, [user, authLoading, navigate, searchParams]);

  const fetchUserProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('first_name, last_name, created_at')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      setUserProfile(data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const isNewUser = () => {
    // Treat user as new if:
    // - they have no cases at all yet, OR
    if (cases.length === 0 && supportedLovedOnes.length === 0) return true;

    // - their profile was created within the last 7 days, OR
    if (userProfile?.created_at) {
      const createdAt = new Date(userProfile.created_at);
      const hoursSinceCreation = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60);
      if (hoursSinceCreation < 24 * 7) return true;
    }

    // - they have a case created recently (first setup)
    const recentCase = cases.some(c => {
      const created = new Date(c.created_at);
      const hours = (Date.now() - created.getTime()) / (1000 * 60 * 60);
      return hours < 72; // 3 days
    });
    if (recentCase) return true;

    return false;
  };

  const fetchCases = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Fetch cases where user is the owner
      const { data: ownedCasesData, error: ownedError } = await supabase
        .from('cases' as any)
        .select(`
          id,
          type,
          status,
          created_at,
          loved_ones (
            id,
            first_name,
            last_name,
            photo_url,
            date_of_birth,
            date_of_death,
            admin_user_id
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false }) as any;

      if (ownedError) throw ownedError;

      // Fetch loved ones where user is a support team member
      const { data: supportData, error: supportError } = await supabase
        .from('loved_one_access')
        .select(`
          loved_one_id,
          role,
          granted_by,
          loved_ones (
            id,
            first_name,
            last_name,
            photo_url,
            date_of_birth,
            date_of_death,
            admin_user_id
          )
        `)
        .eq('user_id', user.id);

      if (supportError) throw supportError;

      const ownedCases = (ownedCasesData as CaseWithLovedOne[]) || [];
      const supportAccess = (supportData as SupportAccessItem[]) || [];

      // Fetch names of people who invited support members
      const inviterIds = supportAccess.map(s => s.granted_by).filter(Boolean);
      if (inviterIds.length > 0) {
        const { data: inviterProfiles } = await supabase
          .from('profiles')
          .select('user_id, first_name, last_name')
          .in('user_id', inviterIds);

        const namesMap: Record<string, string> = {};
        inviterProfiles?.forEach(profile => {
          namesMap[profile.user_id] = `${profile.first_name || ''} ${profile.last_name || ''}`.trim();
        });
        setInvitedByNames(namesMap);
      }

      // Determine user type
      if (ownedCases.length > 0 && supportAccess.length > 0) {
        setUserType('both');
      } else if (supportAccess.length > 0) {
        setUserType('support');
      } else {
        setUserType('primary');
      }

      setCases(ownedCases);
      setSupportedLovedOnes(supportAccess);
    } catch (error) {
      console.error('Error fetching cases:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const filteredCases = activeFilter === 'all' 
    ? cases 
    : cases.filter(c => c.type === activeFilter);

  const hasPreplanCases = cases.some(c => c.type === 'PREPLAN');
  const hasLossCases = cases.some(c => c.type === 'LOSS');

  if (authLoading || loading) {
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
    <div className="min-h-screen bg-gradient-to-br from-[hsl(40,25%,97%)] via-[hsl(0,0%,98%)] to-[hsl(35,20%,96%)]">
      {/* Header */}
      <div className="border-b border-border/30 bg-card/70 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <span className="text-2xl font-playfair font-light text-foreground tracking-widest">HONORLY</span>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={() => navigate('/settings')} className="hover:bg-muted/50">
                <Settings className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={handleSignOut} className="hover:bg-muted/50">
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-16">
        {/* Welcome Section */}
        <div className="mb-16">
          <h1 className="text-3xl md:text-4xl font-playfair font-light mb-4 text-foreground">
            Welcome{isNewUser() ? '' : ' back'}{userProfile?.first_name ? `, ${userProfile.first_name}` : ''}.
          </h1>
          <p className="text-lg text-muted-foreground font-light leading-relaxed max-w-3xl">
            {userType === 'support' ? (
              supportedLovedOnes.length === 1 ? (
                `You're supporting the family of ${supportedLovedOnes[0].loved_ones.first_name} ${supportedLovedOnes[0].loved_ones.last_name}.`
              ) : (
                "You're part of a support team helping families manage their journey."
              )
            ) : (
              "This is your space to plan ahead or honor those you love. We're here to help you take the next step — wherever you are in your journey."
            )}
          </p>
        </div>

        {/* Emotional Reflection - Breathing Moment */}
        <div className="mb-16">
          <EmotionalReflection />
        </div>

        {/* Your Loved Ones Section - MOVED UP */}
        {(cases.length > 0 || supportedLovedOnes.length > 0) && (
          <div className="mb-20">
            <div className="bg-gradient-to-br from-[hsl(40,35%,96%)] via-[hsl(40,30%,97%)] to-[hsl(35,25%,96%)] rounded-3xl p-8 md:p-12 shadow-sm border border-[hsl(40,20%,90%)]">
              <div className="flex items-center justify-between mb-10">
                <h2 className="text-2xl font-playfair font-light text-foreground">
                  Your Loved Ones
                </h2>
                <Tabs value={activeFilter} onValueChange={(v) => setActiveFilter(v as any)}>
                  <TabsList className="h-10 bg-card/60 p-1 rounded-full shadow-sm border border-border/50">
                    <TabsTrigger value="all" className="rounded-full text-sm">All</TabsTrigger>
                    <TabsTrigger value="PREPLAN" className="rounded-full text-sm">Planning</TabsTrigger>
                    <TabsTrigger value="LOSS" className="rounded-full text-sm">In Memory</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              {/* Loved Ones Grid */}
              {filteredCases.length === 0 && supportedLovedOnes.length === 0 && cases.length > 0 ? (
                <Card className="border-dashed border-2 bg-card/30">
                  <CardContent className="py-12 text-center">
                    <p className="text-muted-foreground">
                      No {activeFilter === 'PREPLAN' ? 'planning' : activeFilter === 'LOSS' ? 'in memory' : ''} profiles found
                    </p>
                  </CardContent>
                </Card>
              ) : (filteredCases.length > 0 || supportedLovedOnes.length > 0) ? (
                <div className="grid gap-6 md:grid-cols-2">
                  {/* Owned Cases */}
                  {filteredCases.map((caseItem) => {
                    const isPlanning = caseItem.type === 'PREPLAN';
                    const firstName = caseItem.loved_ones.first_name;
                    const dateRange = caseItem.loved_ones.date_of_birth 
                      ? `${new Date(caseItem.loved_ones.date_of_birth).getFullYear()}${caseItem.loved_ones.date_of_death ? ` — ${new Date(caseItem.loved_ones.date_of_death).getFullYear()}` : ''}`
                      : '';
                    
                    return (
                      <Card 
                        key={caseItem.id}
                        className={`cursor-pointer transition-all duration-300 overflow-hidden group hover:scale-[1.02] border ${
                          isPlanning 
                            ? 'bg-gradient-to-br from-card via-[hsl(210,30%,99%)] to-[hsl(210,25%,97%)] border-[hsl(210,20%,88%)] shadow-md hover:shadow-lg' 
                            : 'bg-gradient-to-br from-card via-[hsl(340,25%,99%)] to-[hsl(340,20%,97%)] border-[hsl(340,15%,88%)] shadow-md hover:shadow-lg'
                        }`}
                        onClick={() => navigate(`/cases/${caseItem.id}`)}
                      >
                        <CardContent className="p-8">
                          <div className="flex items-start gap-6">
                            <div className="relative flex-shrink-0">
                              <Avatar className="h-20 w-20 border-4 border-background shadow-md group-hover:scale-105 transition-transform">
                                <AvatarImage src={caseItem.loved_ones.photo_url || undefined} />
                                <AvatarFallback className={isPlanning ? 'bg-[hsl(210,25%,94%)]' : 'bg-[hsl(340,20%,94%)]'}>
                                  <User className="h-10 w-10" />
                                </AvatarFallback>
                              </Avatar>
                              {isPlanning ? (
                                <div className="absolute -bottom-2 -right-2 bg-primary text-primary-foreground rounded-full p-2 shadow-md">
                                  <Sparkles className="h-4 w-4" />
                                </div>
                              ) : (
                                <div className="absolute -bottom-2 -right-2 bg-gradient-to-br from-[hsl(340,55%,70%)] to-[hsl(340,55%,60%)] text-white rounded-full p-2 shadow-md">
                                  <Heart className="h-4 w-4 fill-current" />
                                </div>
                              )}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <h3 className="font-playfair font-semibold text-xl mb-2 text-foreground">
                                {caseItem.loved_ones.first_name} {caseItem.loved_ones.last_name}
                              </h3>
                              <p className="text-sm text-muted-foreground/80 font-light mb-2 italic">
                                {isPlanning ? 'Planning Ahead' : `In Memory of ${firstName}`}
                              </p>
                              {dateRange && (
                                <p className="text-sm text-muted-foreground mb-2">
                                  {dateRange}
                                </p>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                  
                  {/* Support Team Access */}
                  {supportedLovedOnes.map((supportItem) => {
                    const lovedOne = supportItem.loved_ones;
                    const dateRange = lovedOne.date_of_birth 
                      ? `${new Date(lovedOne.date_of_birth).getFullYear()}${lovedOne.date_of_death ? ` — ${new Date(lovedOne.date_of_death).getFullYear()}` : ''}`
                      : '';
                    const invitedByName = invitedByNames[supportItem.granted_by] || 'Family';
                    
                    return (
                      <Card 
                        key={lovedOne.id}
                        className="cursor-pointer transition-all duration-300 overflow-hidden group hover:scale-[1.02] border bg-gradient-to-br from-card via-[hsl(150,25%,99%)] to-[hsl(150,20%,97%)] border-[hsl(150,20%,88%)] shadow-md hover:shadow-lg"
                        onClick={() => navigate(`/cases/${lovedOne.id}`)}
                      >
                        <CardContent className="p-8">
                          <div className="flex items-start gap-6">
                            <div className="relative flex-shrink-0">
                              <Avatar className="h-20 w-20 border-4 border-background shadow-md group-hover:scale-105 transition-transform">
                                <AvatarImage src={lovedOne.photo_url || undefined} />
                                <AvatarFallback className="bg-[hsl(150,25%,94%)]">
                                  <User className="h-10 w-10" />
                                </AvatarFallback>
                              </Avatar>
                              <div className="absolute -bottom-2 -right-2 bg-gradient-to-br from-[hsl(150,45%,70%)] to-[hsl(150,40%,60%)] text-white rounded-full p-2 shadow-md">
                                <HandHeart className="h-4 w-4" />
                              </div>
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2 mb-2">
                                <h3 className="font-playfair font-semibold text-xl text-foreground">
                                  {lovedOne.first_name} {lovedOne.last_name}
                                </h3>
                                <Badge variant="secondary" className="bg-[hsl(150,35%,92%)] text-[hsl(150,50%,35%)] border-[hsl(150,30%,85%)] text-xs">
                                  Support Role
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground/80 font-light mb-2 italic">
                                Invited by {invitedByName}
                              </p>
                              {dateRange && (
                                <p className="text-sm text-muted-foreground mb-2">
                                  {dateRange}
                                </p>
                              )}
                              <div className="mt-3 pt-3 border-t border-border/30">
                                <p className="text-xs text-muted-foreground/70 font-light">
                                  You're part of the support team
                                </p>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              ) : null}
            </div>
          </div>
        )}

        {/* We're Here for You - Guidance Section */}
        {(cases.length > 0 || supportedLovedOnes.length > 0) && (
          <div className="mb-20">
            <h2 className="text-2xl font-playfair font-light mb-8 text-foreground">
              We're Here for You
            </h2>
            
            {/* Asymmetric, guided layout */}
            <div className="space-y-6">
              {/* Primary card - full width */}
              <Card className="border-none bg-gradient-to-br from-[hsl(35,40%,96%)] via-[hsl(35,35%,97%)] to-card shadow-md hover:shadow-lg transition-all cursor-pointer" onClick={() => navigate('/chat')}>
                <CardContent className="p-10">
                  <div className="flex items-center gap-8">
                    <div className="w-20 h-20 bg-gradient-to-br from-[hsl(35,45%,80%)] to-[hsl(35,40%,70%)] rounded-2xl flex items-center justify-center shadow-md flex-shrink-0">
                      <HandHeart className="h-10 w-10 text-[hsl(35,50%,35%)]" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-playfair text-2xl font-semibold text-foreground mb-2">Need Support?</h3>
                      <p className="text-base text-muted-foreground font-light leading-relaxed mb-4">
                        We're here for you every step of the way — from logistics to emotional care
                      </p>
                      <Button variant="ghost" className="group hover:bg-[hsl(35,30%,88%)] -ml-4">
                        <span>Reach Out</span>
                        <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Secondary cards - side by side */}
              <div className="grid md:grid-cols-2 gap-6">
                {userType === 'support' && (
                  <Card className="border-none bg-gradient-to-br from-[hsl(150,35%,96%)] to-card shadow-md hover:shadow-lg transition-all">
                    <CardContent className="p-8">
                      <div className="w-14 h-14 mx-auto mb-4 bg-gradient-to-br from-[hsl(150,35%,85%)] to-[hsl(150,30%,75%)] rounded-2xl flex items-center justify-center shadow-sm">
                        <HandHeart className="h-7 w-7 text-[hsl(150,45%,35%)]" />
                      </div>
                      <h3 className="font-playfair text-lg font-semibold text-foreground text-center mb-2">Your Role as a Supporter</h3>
                      <p className="text-sm text-muted-foreground/90 font-light text-center leading-relaxed mb-4">
                        Help the family by completing tasks, adding information, or sharing memories
                      </p>
                      <Button variant="ghost" className="w-full justify-center group hover:bg-[hsl(150,20%,90%)]" onClick={() => navigate('/dashboard')}>
                        <span className="text-sm">View Your Tasks</span>
                        <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {!hasPreplanCases && userType !== 'support' && (
                  <Card className="border-none bg-gradient-to-br from-[hsl(210,35%,96%)] to-card shadow-md hover:shadow-lg transition-all cursor-pointer" onClick={() => setShowPlanningOnboarding(true)}>
                    <CardContent className="p-8">
                      <div className="w-14 h-14 mx-auto mb-4 bg-gradient-to-br from-primary/25 to-primary/15 rounded-2xl flex items-center justify-center shadow-sm">
                        <Sparkles className="h-7 w-7 text-primary" />
                      </div>
                      <h3 className="font-playfair text-lg font-semibold text-foreground text-center mb-2">Start Planning</h3>
                      <p className="text-sm text-muted-foreground/90 font-light text-center leading-relaxed mb-4">
                        Plan ahead for yourself or another loved one
                      </p>
                      <Button variant="ghost" className="w-full justify-center group hover:bg-primary/5" onClick={(e) => { e.stopPropagation(); setShowPlanningOnboarding(true); }} aria-label="Start pre-planning">
                        <span className="text-sm">Begin</span>
                        <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </CardContent>
                  </Card>
                )}

                <Card 
                  className="border-none bg-gradient-to-br from-[hsl(340,30%,96%)] to-card shadow-md hover:shadow-lg transition-all cursor-pointer" 
                  onClick={() => {
                    if (cases.length > 0) {
                      navigate(`/cases/${cases[0].id}`);
                    } else if (supportedLovedOnes.length > 0) {
                      navigate(`/cases/${supportedLovedOnes[0].loved_ones.id}`);
                    }
                  }}
                >
                  <CardContent className="p-8">
                    <div className="w-14 h-14 mx-auto mb-4 bg-gradient-to-br from-[hsl(340,35%,85%)] to-[hsl(340,30%,75%)] rounded-2xl flex items-center justify-center shadow-sm">
                      <CheckCircle2 className="h-7 w-7 text-[hsl(340,45%,45%)]" />
                    </div>
                    <h3 className="font-playfair text-lg font-semibold text-foreground text-center mb-2">Keep Going</h3>
                    <p className="text-sm text-muted-foreground/90 font-light text-center leading-relaxed mb-4">
                      Continue with your tasks and planning
                    </p>
                    <Button variant="ghost" className="w-full justify-center group hover:bg-[hsl(340,20%,90%)]">
                      <span className="text-sm">See Next Steps</span>
                      <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}

        {/* Empty State - Only show if no cases at all and not a support member */}
        {cases.length === 0 && supportedLovedOnes.length === 0 && !loading && (
          <div className="max-w-xl mx-auto mb-12">
            <Card className="border-none bg-gradient-to-br from-card/80 via-card/60 to-muted/30 backdrop-blur-sm shadow-xl">
              <CardContent className="py-20 px-8 text-center">
                <div className="space-y-6">
                  <div className="relative w-24 h-24 mx-auto mb-8">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full blur-2xl" />
                    <div className="relative bg-gradient-to-br from-card to-muted rounded-full w-24 h-24 flex items-center justify-center shadow-lg">
                      <Heart className="h-12 w-12 text-primary/70" />
                    </div>
                  </div>
                  
                  <h3 className="text-3xl font-playfair font-light mb-4 text-foreground">This is your family space</h3>
                  <p className="text-muted-foreground text-lg leading-relaxed mb-8 font-light">
                    Add a loved one to begin planning or remembering with care and compassion
                  </p>
                  
                  <div className="space-y-3">
                    <Button 
                      onClick={() => navigate('/add-loved-one')} 
                      size="lg" 
                      className="gap-2.5 text-base px-8 py-6 shadow-lg hover:shadow-xl transition-all"
                    >
                      <Plus className="h-5 w-5" />
                      Add a Loved One
                    </Button>
                    <p className="text-sm text-muted-foreground font-light">
                      Create a profile to plan ahead or honor someone you love
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Continue Your Journey Section - Only for primary users */}
        {cases.length > 0 && userType !== 'support' && (
          <div className="mb-20">
            <h2 className="text-2xl font-playfair font-light mb-8 text-foreground">
              Continue Your Journey
            </h2>
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="border border-border/40 bg-gradient-to-br from-card to-[hsl(40,20%,98%)] hover:shadow-md transition-all cursor-pointer" onClick={() => setShowPlanningOnboarding(true)}>
                <CardContent className="p-10">
                  <div className="flex items-start gap-6">
                    <div className="p-4 rounded-2xl bg-primary/8 flex-shrink-0">
                      <Sparkles className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-playfair text-xl font-semibold mb-3">Plan Ahead</h3>
                      <p className="text-sm text-muted-foreground/90 font-light leading-relaxed mb-4">
                        Begin pre-planning with personalized guidance
                      </p>
                      <Button variant="ghost" className="group hover:bg-primary/5 -ml-4" onClick={(e) => { e.stopPropagation(); setShowPlanningOnboarding(true); }} aria-label="Start pre-planning">
                        <span className="text-sm">Get Started</span>
                        <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-border/40 bg-gradient-to-br from-card to-[hsl(210,20%,98%)] hover:shadow-md transition-all cursor-pointer" onClick={() => navigate('/dashboard')}>
                <CardContent className="p-10">
                  <div className="flex items-start gap-6">
                    <div className="p-4 rounded-2xl bg-primary/8 flex-shrink-0">
                      <FileText className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-playfair text-xl font-semibold mb-3">Your Checklists</h3>
                      <p className="text-sm text-muted-foreground/90 font-light leading-relaxed mb-4">
                        Personalized tasks tailored to your journey
                      </p>
                      <Button variant="ghost" className="group hover:bg-primary/5 -ml-4">
                        <span className="text-sm">View Tasks</span>
                        <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {user && (
          <OnboardingModal
            open={showPlanningOnboarding}
            onClose={() => setShowPlanningOnboarding(false)}
            path={'planning-ahead'}
            userId={user.id}
            onComplete={(caseId: string) => {
              setShowPlanningOnboarding(false);
              navigate(`/cases/${caseId}?showProfile=1`);
            }}
          />
        )}

      </div>
    </div>
  );
}

