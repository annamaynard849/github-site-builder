import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Scale, DollarSign, CreditCard, Moon, Settings, LogOut, ArrowRight, Sparkles, FileText, Building, Share2, HandHeart, Upload, Calendar, Shield, Smartphone, UserPlus, ArrowLeft } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Lock } from 'lucide-react';

interface LovedOne {
  id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string | null;
  date_of_death: string | null;
  photo_url: string | null;
  relationship_to_user: string | null;
  admin_user_id: string;
}

interface Profile {
  first_name: string | null;
  last_name: string | null;
}

interface Task {
  id: string;
  title: string;
  category: string;
  status: string;
  estimated_time?: number;
  due_date?: string;
}

export default function PlanningDashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [lovedOnes, setLovedOnes] = useState<LovedOne[]>([]);
  const [selectedLovedOne, setSelectedLovedOne] = useState<LovedOne | null>(null);
  const [userProfile, setUserProfile] = useState<Profile | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [lastReviewed, setLastReviewed] = useState<Date | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchData();
  }, [user, navigate]);

  useEffect(() => {
    const lovedOneId = searchParams.get('lovedOne');
    if (lovedOneId && lovedOnes.length > 0) {
      const loved = lovedOnes.find(lo => lo.id === lovedOneId);
      if (loved) {
        setSelectedLovedOne(loved);
      }
    } else if (lovedOnes.length > 0 && !selectedLovedOne) {
      setSelectedLovedOne(lovedOnes[0]);
    }
  }, [searchParams, lovedOnes]);

  useEffect(() => {
    if (selectedLovedOne) {
      fetchTasks(selectedLovedOne.id);
    }
  }, [selectedLovedOne]);

  const fetchData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      const { data: profileData } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (profileData) {
        setUserProfile(profileData);
      }

      const { data: ownedLovedOnes } = await supabase
        .from('loved_ones')
        .select('*')
        .eq('admin_user_id', user.id);

      const { data: accessData } = await supabase
        .from('loved_one_access')
        .select('loved_one_id')
        .eq('user_id', user.id);

      const accessLovedOneIds = accessData?.map(a => a.loved_one_id) || [];

      let sharedLovedOnes: LovedOne[] = [];
      if (accessLovedOneIds.length > 0) {
        const { data: sharedData } = await supabase
          .from('loved_ones')
          .select('*')
          .in('id', accessLovedOneIds);

        sharedLovedOnes = sharedData || [];
      }

      const allLovedOnes = [...(ownedLovedOnes || []), ...sharedLovedOnes];
      const uniqueLovedOnes = Array.from(
        new Map(allLovedOnes.map(lo => [lo.id, lo])).values()
      );

      setLovedOnes(uniqueLovedOnes);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error loading dashboard",
        description: "Please try refreshing the page",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchTasks = async (lovedOneId: string) => {
    try {
      const { data } = await supabase
        .from('tasks')
        .select('id, title, category, status, due_date')
        .eq('loved_one_id', lovedOneId)
        .order('due_date', { ascending: true, nullsFirst: false });
      
      const tasksWithTime = (data || []).map((task: any) => ({
        ...task,
        estimated_time: Math.floor(Math.random() * 15) + 3
      }));
      
      // Filter out death-related tasks for planning
      const deathRelatedKeywords = [
        'death certificate', 'funeral', 'crematory', 'burial',
        'service details', 'programs', 'flowers', 'reception',
        'obituary', 'memorial page'
      ];
      
      const filteredTasks = tasksWithTime.filter((task: Task) => {
        const taskLower = task.title.toLowerCase();
        return !deathRelatedKeywords.some(keyword => taskLower.includes(keyword));
      });
      
      setTasks(filteredTasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const handleLovedOneChange = (lovedOneId: string) => {
    const loved = lovedOnes.find(lo => lo.id === lovedOneId);
    if (loved) {
      setSelectedLovedOne(loved);
      setSearchParams({ lovedOne: lovedOneId });
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

  const handleTaskToggle = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    
    try {
      await supabase
        .from('tasks')
        .update({ status: newStatus })
        .eq('id', taskId);

      setTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t));

      toast({
        title: newStatus === 'completed' ? 'Task completed' : 'Task reopened',
        description: task.title
      });
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const todayTasks = tasks
    .filter(t => t.status === 'pending')
    .slice(0, 4);

  const categories = [
    {
      id: 'legal',
      icon: Scale,
      title: 'Legal & Estate Planning',
      progress: Math.floor(Math.random() * 12) + 1,
      total: 12,
      nextAction: 'Continue planning',
      onClick: () => selectedLovedOne && navigate(`/hub/legal/${selectedLovedOne.id}`)
    },
    {
      id: 'financial',
      icon: DollarSign,
      title: 'Financial Planning',
      progress: Math.floor(Math.random() * 10) + 1,
      total: 10,
      nextAction: 'Review accounts',
      onClick: () => selectedLovedOne && navigate(`/hub/financial/${selectedLovedOne.id}`)
    },
    {
      id: 'accounts',
      icon: CreditCard,
      title: 'Accounts & Access',
      progress: Math.floor(Math.random() * 15) + 1,
      total: 15,
      nextAction: 'Document credentials',
      onClick: () => selectedLovedOne && navigate(`/hub/accounts/${selectedLovedOne.id}`)
    }
  ];

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
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => navigate('/dashboard')}
                className="mr-2"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <span className="text-2xl font-playfair font-normal text-foreground tracking-widest">HONORLY</span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={() => navigate('/settings')}>
                <Settings className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={handleSignOut}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto">
        <main className="p-6 md:p-8 lg:p-10">
          <div className="max-w-5xl mx-auto space-y-6">
            {lovedOnes.length > 1 && selectedLovedOne && (
              <div className="flex items-center justify-between pb-2">
                <Select value={selectedLovedOne?.id} onValueChange={handleLovedOneChange}>
                  <SelectTrigger className="w-64">
                    <SelectValue placeholder="Select loved one" />
                  </SelectTrigger>
                  <SelectContent>
                    {lovedOnes.map(lo => (
                      <SelectItem key={lo.id} value={lo.id}>
                        {lo.first_name} {lo.last_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {selectedLovedOne ? (
              <>
                <div className="rounded-lg p-4 bg-blue-500/5 border border-blue-500/20">
                  <div className="flex items-center gap-3">
                    <Moon className="h-4 w-4 text-blue-600" />
                    <p className="text-sm text-foreground">
                      Take your time—planning ahead is a gift. Work through this at your own pace.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h1 className="text-3xl font-playfair font-normal text-foreground mb-2">
                      My Plans
                    </h1>
                    <p className="text-muted-foreground font-light">
                      We're here to help you organize your affairs, at your own pace.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <Button 
                      size="lg"
                      className="rounded-full"
                      onClick={() => {
                        const nextTask = todayTasks[0];
                        if (nextTask) {
                          navigate(`/task/${nextTask.id}`);
                        }
                      }}
                    >
                      What's next
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                    <Button 
                      size="lg"
                      variant="outline" 
                      className="rounded-full"
                      onClick={() => selectedLovedOne && navigate(`/vault/${selectedLovedOne.id}`)}
                    >
                      <Lock className="h-4 w-4 mr-2" />
                      My Vault
                    </Button>
                    <Button 
                      size="lg"
                      variant="outline"
                      className="rounded-full"
                      onClick={() => {
                        toast({
                          title: 'Share link copied',
                          description: 'Invite family to help with planning'
                        });
                      }}
                    >
                      <Share2 className="h-4 w-4 mr-2" />
                      Share plans
                    </Button>
                  </div>
                </div>

                <Card className="border-blue-500/20 bg-blue-500/5">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                          <Calendar className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="space-y-1">
                          <h4 className="font-medium text-foreground">Annual Review</h4>
                          <p className="text-sm text-muted-foreground font-light">
                            {lastReviewed 
                              ? `Last reviewed: ${lastReviewed.toLocaleDateString()}`
                              : 'Not yet reviewed this year'
                            }
                          </p>
                          <p className="text-xs text-muted-foreground font-light mt-2">
                            Review annually or after major life changes
                          </p>
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setLastReviewed(new Date());
                          toast({
                            title: 'Plan marked as reviewed',
                            description: 'Great job keeping your plans up to date!'
                          });
                        }}
                      >
                        Mark reviewed
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {todayTasks.length > 0 && (
                  <div className="space-y-3">
                    <div>
                      <h2 className="text-xl font-playfair font-normal text-foreground mb-1">
                        Next steps
                      </h2>
                      <p className="text-sm text-muted-foreground font-light">
                        Key actions to organize your affairs
                      </p>
                    </div>
                    <Card>
                      <CardContent className="p-5">
                        <div className="space-y-3">
                          {todayTasks.map((task) => (
                            <div key={task.id} className="flex items-start gap-3 group py-1">
                              <Checkbox
                                checked={task.status === 'completed'}
                                onCheckedChange={() => handleTaskToggle(task.id)}
                                className="mt-1"
                              />
                              <div className="flex-1 cursor-pointer" onClick={() => navigate(`/task/${task.id}`)}>
                                <div className="flex items-start justify-between gap-2">
                                  <p className={`text-sm font-light ${task.status === 'completed' ? 'line-through text-muted-foreground' : 'text-foreground group-hover:text-primary'}`}>
                                    {task.title}
                                  </p>
                                  {task.estimated_time && (
                                    <span className="text-xs text-muted-foreground whitespace-nowrap font-light">
                                      ~{task.estimated_time} min
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                          <Separator className="my-2" />
                            <Button
                              variant="ghost"
                              size="sm"
                              className="w-full font-light"
                              onClick={() => selectedLovedOne && navigate(`/vault/${selectedLovedOne.id}`)}
                            >
                              View all tasks
                              <ArrowRight className="h-4 w-4 ml-2" />
                            </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                <div className="space-y-3">
                  <div>
                    <h2 className="text-xl font-playfair font-normal text-foreground mb-1">Essential Documents</h2>
                    <p className="text-sm text-muted-foreground font-light">Keep important documents organized and accessible</p>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {[
                      { name: 'Will or Trust', icon: FileText },
                      { name: 'Healthcare Directive', icon: HandHeart },
                      { name: 'Power of Attorney', icon: Shield },
                      { name: 'Life Insurance', icon: FileText },
                      { name: 'Property Deeds', icon: Building },
                      { name: 'Account Info', icon: CreditCard }
                    ].map((doc, i) => {
                      const Icon = doc.icon;
                      return (
                        <Card key={i} className="hover:shadow-md transition-all cursor-pointer border-border/50">
                          <CardContent className="p-4">
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                  <Icon className="h-4 w-4 text-primary" />
                                </div>
                                <Upload className="h-3.5 w-3.5 text-muted-foreground" />
                              </div>
                              <span className="text-xs font-medium block">{doc.name}</span>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <Card className="border-border/50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Smartphone className="h-4 w-4 text-primary" />
                        Digital Legacy
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 pt-0">
                      <p className="text-xs text-muted-foreground font-light mb-3">
                        Document online accounts and digital wishes
                      </p>
                      <div className="space-y-0.5">
                        {['Social media', 'Email & cloud', 'Online banking', 'Cryptocurrency'].map((item, i) => (
                          <div key={i} className="flex items-center justify-between py-2 px-1 hover:bg-muted/50 rounded">
                            <span className="text-sm">{item}</span>
                            <Button variant="ghost" size="sm" className="h-7 text-xs">
                              Add
                            </Button>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-border/50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <UserPlus className="h-4 w-4 text-primary" />
                        Emergency Contacts
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 pt-0">
                      <p className="text-xs text-muted-foreground font-light mb-3">
                        Key people who should be notified
                      </p>
                      <div className="space-y-0.5">
                        {['Estate attorney', 'Financial advisor', 'Healthcare proxy', 'Executor'].map((role, i) => (
                          <div key={i} className="flex items-center justify-between py-2 px-1 hover:bg-muted/50 rounded">
                            <span className="text-sm">{role}</span>
                            <Button variant="ghost" size="sm" className="h-7 text-xs">
                              Add
                            </Button>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card className="border-primary/20 bg-primary/5">
                  <CardContent className="p-5">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <Share2 className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 space-y-2">
                        <div>
                          <h4 className="font-medium text-foreground">Share Your Plans</h4>
                          <p className="text-sm text-muted-foreground font-light mt-1">
                            Grant view-only access to trusted family members
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="default" size="sm">
                            <UserPlus className="h-4 w-4 mr-2" />
                            Invite family
                          </Button>
                          <Button variant="outline" size="sm">
                            Manage access
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="space-y-3">
                  <div>
                    <h2 className="text-xl font-playfair font-normal text-foreground mb-1">
                      What we're organizing
                    </h2>
                    <p className="text-sm text-muted-foreground font-light">
                      Organize your affairs across these key areas
                    </p>
                  </div>
                  <div className="grid md:grid-cols-2 gap-3">
                    {categories.map((category) => {
                      const Icon = category.icon;
                      return (
                        <Card 
                          key={category.id} 
                          className="hover:shadow-md transition-all cursor-pointer border-border/50"
                          onClick={category.onClick}
                        >
                          <CardContent className="p-5">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                  <Icon className="h-4 w-4 text-primary" />
                                </div>
                                <div>
                                  <h4 className="font-medium text-foreground text-sm">{category.title}</h4>
                                  <p className="text-xs text-muted-foreground font-light">
                                    {category.progress} of {category.total} steps
                                  </p>
                                </div>
                              </div>
                              <ArrowRight className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <Progress value={(category.progress / category.total) * 100} className="h-1" />
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              </>
            ) : (
              <Card className="p-12 text-center border-border/50">
                <div className="space-y-4">
                  <h2 className="text-2xl font-playfair font-normal text-foreground">
                    Welcome, {userProfile?.first_name || 'there'}
                  </h2>
                  <p className="text-muted-foreground font-light leading-relaxed max-w-md mx-auto">
                    We're here to help you plan ahead. When you're ready, we'll guide you through organizing your affairs.
                  </p>
                  <Button onClick={() => navigate('/home')} className="rounded-full">
                    I'm ready to begin
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </Card>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
