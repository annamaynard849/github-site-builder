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
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <span className="text-xl font-playfair font-normal text-foreground tracking-widest">HONORLY</span>
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

      <main className="max-w-4xl mx-auto px-6 py-8 space-y-8">
        {/* Simple Welcome */}
        <div className="flex items-center gap-5">
          <Avatar className="h-16 w-16 ring-2 ring-border">
            <AvatarImage src={lovedOne.photo_url || ''} alt={lovedOne.first_name} />
            <AvatarFallback className="text-lg font-playfair bg-primary/10 text-primary">
              {lovedOne.first_name?.[0]}{lovedOne.last_name?.[0]}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-playfair font-normal text-foreground">
              Honoring {lovedOne.first_name}
            </h1>
            <p className="text-muted-foreground text-sm">
              Take things one step at a time. We're here to help.
            </p>
          </div>
        </div>

        {/* Today's Focus - Primary Action */}
        {todayTasks.length > 0 && (
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <Checkbox
                  checked={todayTasks[0].status === 'completed'}
                  onCheckedChange={() => handleTaskToggle(todayTasks[0].id)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                    Next step
                  </p>
                  <p className="text-base font-medium text-foreground mb-3">
                    {todayTasks[0].title}
                  </p>
                  <div className="flex items-center gap-3">
                    <Button
                      size="sm"
                      onClick={() => navigate(`/task/${todayTasks[0].id}`)}
                    >
                      Start this
                      <ArrowRight className="h-3 w-3 ml-2" />
                    </Button>
                    {todayTasks.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => currentCase && navigate(`/vault/${currentCase.loved_one_id}`)}
                      >
                        See all {tasks.filter(t => t.status === 'pending').length} tasks
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Areas - Clean List */}
        <div className="space-y-2">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide px-1">
            Areas to explore
          </h2>
          
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <button
                key={category.id}
                className="w-full flex items-center gap-4 p-4 rounded-lg border border-border hover:border-primary/30 hover:bg-muted/30 transition-all text-left group"
                onClick={category.onClick}
              >
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center shrink-0 group-hover:bg-primary/10 transition-colors">
                  <Icon className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground">{category.title}</p>
                  <p className="text-sm text-muted-foreground line-clamp-1">{category.description}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground/50 group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0" />
              </button>
            );
          })}
        </div>

        {/* Invite Support - Subtle */}
        <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border">
          <div className="flex items-center gap-3">
            <Share2 className="h-5 w-5 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Need help? Invite family or friends to assist.
            </p>
          </div>
          <InviteSupportMember
            lovedOneId={lovedOne.id}
            lovedOneName={`${lovedOne.first_name} ${lovedOne.last_name}`}
            trigger={
              <Button variant="outline" size="sm">
                Invite
              </Button>
            }
          />
        </div>

        {/* Help Link */}
        <div className="text-center pt-4">
          <Button
            variant="ghost"
            className="text-muted-foreground"
            onClick={() => lovedOne && navigate(`/chat/${lovedOne.id}`)}
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            Need to talk? We're here for you.
          </Button>
        </div>
      </main>
    </div>
  );
}
