import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Heart, Scale, DollarSign, CreditCard, MessageCircle, Moon, Settings, LogOut, ArrowRight, FileText, Share2, HandHeart, Lock, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useCurrentCase } from '@/contexts/CurrentCaseContext';
import { LovedOneDetails } from '@/components/LovedOneDetails';
import { InviteSupportMember } from '@/components/InviteSupportMember';


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

interface Task {
  id: string;
  title: string;
  category: string;
  status: string;
  estimated_time?: number;
  due_date?: string;
}

export default function MainDashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentCase, loading: caseLoading } = useCurrentCase();
  const [loading, setLoading] = useState(true);
  const [lovedOne, setLovedOne] = useState<LovedOne | null>(null);
  const [memorialSlug, setMemorialSlug] = useState<string | null>(null);
const [tasks, setTasks] = useState<Task[]>([]);

  const [searchParams] = useSearchParams();
  const showProfile = searchParams.get('showProfile') === '1';

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    if (currentCase && currentCase.loved_ones) {
      fetchLovedOneData();
      fetchMemorialPage(currentCase.loved_one_id);
      fetchTasks(currentCase.id, currentCase.loved_one_id);
    }
  }, [user, currentCase, navigate]);

  const fetchLovedOneData = async () => {
    if (!currentCase || !currentCase.loved_ones) return;

    try {
      setLoading(true);
      
      // Loved one data comes from currentCase
      const lovedOneData = {
        id: currentCase.loved_one_id,
        first_name: currentCase.loved_ones.first_name,
        last_name: currentCase.loved_ones.last_name,
        date_of_birth: currentCase.loved_ones.date_of_birth,
        date_of_death: currentCase.loved_ones.date_of_death,
        photo_url: currentCase.loved_ones.photo_url,
        relationship_to_user: null,
        admin_user_id: currentCase.user_id,
      };
      
      setLovedOne(lovedOneData);
    } catch (error) {
      console.error('MainDashboard: Error fetching loved one data:', error);
      toast({
        title: "Error loading dashboard",
        description: "Please try refreshing the page",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchMemorialPage = async (lovedOneId: string) => {
    try {
      const { data } = await supabase
        .from('memorial_pages')
        .select('slug')
        .eq('loved_one_id', lovedOneId)
        .maybeSingle();
      
      setMemorialSlug(data?.slug || null);
    } catch (error) {
      console.error('Error fetching memorial page:', error);
    }
  };

  const fetchTasks = async (caseId: string, lovedOneId: string) => {
    try {
      const { data, error } = await supabase
        .from('tasks' as any)
        .select('id, title, category, status, due_date')
        .eq('case_id', caseId)
        .eq('loved_one_id', lovedOneId)
        .order('due_date', { ascending: true, nullsFirst: false }) as any;

      if (error) throw error;
      
      const tasksWithTime = (data || []).map((task: any) => ({
        ...task,
        estimated_time: Math.floor(Math.random() * 15) + 3 // Mock estimation
      }));
      
      setTasks(tasksWithTime);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };


  const handlePhotoUpdate = async (photoUrl: string) => {
    if (!lovedOne) return;

    try {
      const { error } = await supabase
        .from('loved_ones')
        .update({ photo_url: photoUrl })
        .eq('id', lovedOne.id);

      if (error) throw error;

      setLovedOne({ ...lovedOne, photo_url: photoUrl });
      toast({
        title: "Photo updated",
        description: "Profile photo has been updated successfully"
      });
    } catch (error) {
      console.error('Error updating photo:', error);
      toast({
        title: "Error",
        description: "Failed to update photo",
        variant: "destructive"
      });
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
      const { error } = await supabase
        .from('tasks')
        .update({ status: newStatus })
        .eq('id', taskId);

      if (error) throw error;

      // Optimistic update
      setTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t));

      toast({
        title: newStatus === 'completed' ? 'Task completed' : 'Task reopened',
        description: task.title
      });
    } catch (error) {
      console.error('Error updating task:', error);
      toast({
        title: 'Error',
        description: 'Failed to update task',
        variant: 'destructive'
      });
    }
  };

  const todayTasks = tasks
    .filter(t => t.status === 'pending')
    .slice(0, 4);
  const dueThisWeek = tasks.filter(t => {
    if (!t.due_date || t.status === 'completed') return false;
    const dueDate = new Date(t.due_date);
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    return dueDate >= today && dueDate <= nextWeek;
  }).length;

  const categories = [
    {
      id: 'memorial',
      icon: Heart,
      title: 'Memorial',
      progress: Math.floor(Math.random() * 8) + 1,
      total: 8,
      nextAction: memorialSlug ? 'View memorial' : 'Create tribute',
      onClick: () => memorialSlug ? navigate(`/memorial/${memorialSlug}`) : navigate(`/hub/memorial/${lovedOne?.id}`),
      description: `Create a beautiful space to celebrate ${lovedOne?.first_name}'s life`
    },
    {
      id: 'support',
      icon: HandHeart,
      title: 'Support & Grief',
      progress: 0,
      total: 0,
      nextAction: 'Find resources',
      onClick: () => lovedOne && navigate(`/hub/support/${lovedOne.id}`),
      description: 'Find counseling, support groups, and guidance for this journey'
    },
    {
      id: 'legal',
      icon: Scale,
      title: 'Legal',
      progress: Math.floor(Math.random() * 12) + 1,
      total: 12,
      nextAction: 'Continue documents',
      onClick: () => lovedOne && navigate(`/hub/legal/${lovedOne.id}`),
      description: 'Step-by-step help with wills, estates, and legal requirements'
    },
    {
      id: 'financial',
      icon: DollarSign,
      title: 'Financial',
      progress: Math.floor(Math.random() * 10) + 1,
      total: 10,
      nextAction: 'Track accounts',
      onClick: () => lovedOne && navigate(`/hub/financial/${lovedOne.id}`),
      description: 'Organize bank accounts, insurance, and financial matters'
    },
    {
      id: 'accounts',
      icon: CreditCard,
      title: 'Accounts',
      progress: Math.floor(Math.random() * 15) + 1,
      total: 15,
      nextAction: 'Manage services',
      onClick: () => lovedOne && navigate(`/hub/accounts/${lovedOne.id}`),
      description: 'Close or transfer utilities, subscriptions, and services'
    }
  ];


  if (loading || caseLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!currentCase || !lovedOne) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Case Not Found</h2>
          <p className="text-muted-foreground mb-4">This case doesn't exist or you don't have access.</p>
          <Button onClick={() => navigate('/dashboard')}>Return to Dashboard</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
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
            <>
              {/* Hero Section with Photo */}
              <Card className="border-border/50 overflow-hidden bg-gradient-to-br from-card to-card/50">
                <CardContent className="p-8 md:p-10">
                  <div className="flex flex-col md:flex-row items-start gap-8">
                    {/* Photo */}
                    <div className="shrink-0">
                      <Avatar className="h-32 w-32 md:h-40 md:w-40 ring-4 ring-background shadow-lg">
                        <AvatarImage src={lovedOne.photo_url || ''} alt={`${lovedOne.first_name} ${lovedOne.last_name}`} />
                        <AvatarFallback className="text-3xl font-playfair bg-primary/10 text-primary">
                          {lovedOne.first_name?.[0]}{lovedOne.last_name?.[0]}
                        </AvatarFallback>
                      </Avatar>
                    </div>

                    {/* Content */}
                    <div className="flex-1 space-y-4">
                      <div>
                        <h1 className="text-3xl md:text-4xl font-playfair font-normal text-foreground mb-2">
                          Honoring {lovedOne.first_name}
                        </h1>
                        <p className="text-lg text-muted-foreground font-light">
                          {lovedOne.date_of_birth && lovedOne.date_of_death && (
                            <span className="block mb-2">
                              {new Date(lovedOne.date_of_birth).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} - {new Date(lovedOne.date_of_death).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                            </span>
                          )}
                          You don't have to navigate this journey alone. We're here to guide you through each step, at your own pace.
                        </p>
                      </div>

                      <div className="rounded-lg p-4 bg-amber-500/5 border border-amber-500/20">
                        <div className="flex items-start gap-3">
                          <Moon className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                          <p className="text-sm text-foreground font-light">
                            Take your time. There's no rush. Everything here will be waiting when you're ready.
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
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
                          Show me what's next
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                        <InviteSupportMember
                          lovedOneId={lovedOne.id}
                          lovedOneName={`${lovedOne.first_name} ${lovedOne.last_name}`}
                          trigger={
                            <Button 
                              size="lg"
                              variant="outline"
                              className="rounded-full"
                            >
                              <Share2 className="h-4 w-4 mr-2" />
                              Invite support
                            </Button>
                          }
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* How We'll Help You Section */}
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="text-2xl font-playfair font-normal">How we'll support you</CardTitle>
                  <p className="text-sm text-muted-foreground font-light mt-1">
                    We've organized everything into clear areas, so you know where to focus when you're ready
                  </p>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid gap-3">
                    <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                      <Heart className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                      <div>
                        <h4 className="font-medium text-foreground mb-1">Creating a memorial</h4>
                        <p className="text-sm text-muted-foreground font-light">
                          A beautiful space to celebrate {lovedOne.first_name}'s life and share memories with others
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                      <HandHeart className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                      <div>
                        <h4 className="font-medium text-foreground mb-1">Finding support</h4>
                        <p className="text-sm text-muted-foreground font-light">
                          Resources for grief counseling, support groups, and guidance through this difficult time
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                      <FileText className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                      <div>
                        <h4 className="font-medium text-foreground mb-1">Handling practical matters</h4>
                        <p className="text-sm text-muted-foreground font-light">
                          Step-by-step help with legal documents, financial accounts, and administrative tasks
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {showProfile && lovedOne && (
                <div className="mt-6">
                  <LovedOneDetails
                    lovedOneId={lovedOne.id}
                    lovedOne={{
                      first_name: lovedOne.first_name,
                      last_name: lovedOne.last_name,
                      photo_url: lovedOne.photo_url,
                      relationship_to_user: lovedOne.relationship_to_user,
                      date_of_death: lovedOne.date_of_death,
                    }}
                  />
                </div>
              )}

              {/* Today's Focus - Just One Thing */}
              {todayTasks.length > 0 && (
                <Card className="border-border/50 bg-gradient-to-br from-primary/5 to-transparent">
                  <CardHeader>
                    <CardTitle className="text-xl font-playfair font-normal">Today's focus</CardTitle>
                    <p className="text-sm text-muted-foreground font-light mt-1">
                      You don't need to do everything at once. Here's one small step you can take when you're ready.
                    </p>
                  </CardHeader>
                  <CardContent>
                    {/* Highlight just the first task */}
                    <div className="bg-card rounded-lg p-5 border border-border shadow-sm">
                      <div className="flex items-start gap-4">
                        <Checkbox
                          checked={todayTasks[0].status === 'completed'}
                          onCheckedChange={() => handleTaskToggle(todayTasks[0].id)}
                          className="mt-1"
                        />
                        <div className="flex-1 space-y-2">
                          <p className="text-base font-medium text-foreground">
                            {todayTasks[0].title}
                          </p>
                          {todayTasks[0].estimated_time && (
                            <p className="text-sm text-muted-foreground font-light">
                              Estimated time: ~{todayTasks[0].estimated_time} minutes
                            </p>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => navigate(`/task/${todayTasks[0].id}`)}
                            className="mt-2"
                          >
                            Start this task
                            <ArrowRight className="h-3 w-3 ml-2" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    {todayTasks.length > 1 && (
                      <div className="mt-4 pt-4 border-t border-border">
                        <p className="text-sm text-muted-foreground font-light mb-2">
                          {todayTasks.length - 1} more {todayTasks.length - 1 === 1 ? 'task' : 'tasks'} when you're ready
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="font-light"
                          onClick={() => currentCase && navigate(`/vault/${currentCase.loved_one_id}`)}
                        >
                          View all tasks
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Explore Resources */}
              <div className="space-y-4">
                <div>
                  <h2 className="text-xl font-playfair font-normal text-foreground mb-1">
                    When you're ready to explore
                  </h2>
                  <p className="text-sm text-muted-foreground font-light">
                    These are the ways we can help. No pressure — just here when you need them.
                  </p>
                </div>
                <div className="space-y-2">
                  {categories.map((category) => {
                    const Icon = category.icon;
                    return (
                      <div
                        key={category.id}
                        className="group flex items-center gap-4 p-4 rounded-lg border border-border/50 hover:border-primary/30 hover:bg-muted/20 transition-all cursor-pointer"
                        onClick={category.onClick}
                      >
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-foreground text-sm mb-0.5">{category.title}</h4>
                          <p className="text-sm text-muted-foreground font-light">
                            {category.description}
                          </p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0" />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Support Card */}
              <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-card to-card shadow-sm">
                <CardContent className="p-8">
                  <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                    <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <MessageCircle className="h-7 w-7 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-playfair font-normal text-foreground mb-2">
                        You don't have to do this alone
                      </h3>
                      <p className="text-muted-foreground font-light">
                        Whether you need someone to talk to, have questions about what to do next, or just need a moment of support — we're here for you, anytime.
                      </p>
                    </div>
                    <Button 
                      size="lg"
                      onClick={() => lovedOne && navigate(`/chat/${lovedOne.id}`)}
                      className="shrink-0"
                    >
                      Talk to us
                      <MessageCircle className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </>
          </div>
        </main>
      </div>
    </div>
  );
}
